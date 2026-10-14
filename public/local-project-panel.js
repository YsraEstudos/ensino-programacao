(function attachLocalProjectPanel(root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.DevPathLocalProjectPanel = api;
})(typeof globalThis === 'object' ? globalThis : this, function createLocalProjectPanel(global) {
  'use strict';
  // Environments whose exercises are projects meant to be run on the learner's own machine.
  const LOCAL_ENVIRONMENTS = new Set(['local', 'dom', 'typescript']);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[char]);

  function checkpointFor(id, checkpoints) {
    const source = checkpoints || global.DevPathLocalCheckpoints;
    return source?.byId ? source.byId(id) : undefined;
  }

  // Eligible: local/DOM/TypeScript exercises, multi-file PROJECT activities, and any activity with a declared checkpoint.
  function isEligible(item, assessment, checkpoint) {
    if (!item?.id) return false;
    const environment = assessment?.environment || item.assessmentEnvironment;
    return Boolean(checkpoint) || item.kind === 'PROJECT' || LOCAL_ENVIRONMENTS.has(environment);
  }

  // Git is instructional: the app copies these lines and never runs them.
  function gitBlockFor(checkpoint) {
    const step = checkpoint?.gitStep;
    if (!step) return null;
    if (!step.required) return {required: false, reason: step.reason || 'Git ainda não é necessário nesta atividade.'};
    return {required: true, afterPrimer: Boolean(step.afterPrimer), steps: Array.isArray(step.steps) ? step.steps : []};
  }

  function gitText(steps) {
    return steps.map(step => (/^git\s/.test(step) ? step : `# ${step}`)).join('\n');
  }

  // Exporter messages are English developer text; the learner sees a Portuguese reason instead.
  const EXPORT_ERRORS = [
    [/safe relative path|must be relative|cannot escape|no filename|unsafe to extract/, 'um caminho de arquivo não é permitido neste projeto.'],
    [/Duplicate, colliding|file\/directory-conflicting|Generated project file collides/, 'dois arquivos têm nomes iguais ou em conflito.'],
    [/exceeds|too large|total bytes|at most/, 'o projeto excede o tamanho permitido.'],
    [/package-lock|package\.json|Dependency /, 'o pacote npm declarado está incompleto ou inconsistente.'],
    [/Declared .* is missing|references a missing|missing from the project/, 'um arquivo declarado para o projeto está ausente.'],
    [/Local commands must be/, 'os comandos locais declarados são inválidos.'],
    [/must contain valid JSON/, 'um arquivo JSON do projeto está inválido.'],
    [/Nenhum arquivo|não está disponível/, null]
  ];
  function friendlyExportError(error) {
    const message = error && typeof error.message === 'string' ? error.message : '';
    for (const [pattern, text] of EXPORT_ERRORS) {
      if (pattern.test(message)) return text ?? message;
    }
    return 'ocorreu um erro inesperado ao montar o pacote. Tente novamente.';
  }

  function collectFiles(item, container, loadDraft) {
    const id = String(item.id);
    const editors = container?.querySelectorAll ? [...container.querySelectorAll(`[data-course-editor="${id}"]`)] : [];
    if (editors.length) return editors.map(editor => ({path: editor.dataset.courseFile, content: editor.value}));
    const drafts = (typeof loadDraft === 'function' && loadDraft(item)) || {};
    return (item.starterFiles || []).map(file => ({path: file.path, content: typeof drafts[file.path] === 'string' ? drafts[file.path] : file.content}));
  }

  // Grader-only fields (hidden tests, references, diagnostics, transfer rubrics) never leave the server-side assessment.
  // A declared entry that is not among the learner's files is dropped instead of failing the export.
  const GRADER_ONLY_FIELDS = [
    'testPath', 'testPaths', 'behaviorTestPath', 'sourceTestPath', 'tests',
    'fixturesPath', 'fixtures', 'referenceDir', 'correctFiles', 'mutantDirs',
    'studentSuite', 'studentSuiteKind', 'typecheckMutants', 'typeContractMutants',
    'contractTypeFiles', 'typeEntryPath', 'transfer', 'expectedDiagnostics', 'assertionCases'
  ];
  function exportAssessment(assessment, files) {
    const paths = new Set((files || []).map(file => file.path));
    const result = {...(assessment || {})};
    for (const field of GRADER_ONLY_FIELDS) delete result[field];
    if (result.entryPath && !paths.has(result.entryPath)) delete result.entryPath;
    if (result.tsconfigPath && !paths.has(result.tsconfigPath)) delete result.tsconfigPath;
    return result;
  }

  // Builds the ZIP from the workspace as it is now: visible editors first, saved drafts otherwise.
  async function exportCurrent(item, options = {}) {
    const exporter = options.exporter || global.DevPathCourseProjectExport;
    if (!exporter?.downloadProject) throw new Error('O exportador de projetos não está disponível nesta página.');
    const files = options.files || collectFiles(item, options.container, options.loadDraft);
    if (!files.length) throw new Error('Nenhum arquivo do projeto foi encontrado para exportar.');
    return exporter.downloadProject({
      item: {id: item.id, title: item.title},
      files,
      assessment: exportAssessment(options.assessment, files),
      checkpoint: options.checkpoint || {},
    }, options.downloadOptions || {});
  }

  function renderPanel(item, options = {}) {
    const checkpoint = options.checkpoint !== undefined ? options.checkpoint : checkpointFor(item.id, options.checkpoints);
    if (!isEligible(item, options.assessment, checkpoint)) return '';
    const id = esc(item.id);
    const git = gitBlockFor(checkpoint);
    let gitMarkup = '';
    if (git?.required) {
      gitMarkup = `
        <div class="local-git" data-local-git="${id}">
          <h4>Checkpoints Git (instrucional)</h4>
          <p>${git.afterPrimer ? 'Use depois do primer de Git. ' : ''}O app não executa estes comandos: copie-os e rode no seu terminal, numa cópia do projeto.</p>
          <pre class="local-git-commands" tabindex="0" aria-label="Comandos Git do checkpoint"><code>${esc(gitText(git.steps))}</code></pre>
          <button type="button" class="button-secondary" data-local-copy="${id}">Copiar comandos Git</button>
          <p class="local-status" role="status" aria-live="polite" data-local-copy-status="${id}"></p>
        </div>`;
    } else if (git) {
      gitMarkup = `
        <div class="local-git" data-local-git="${id}">
          <h4>Git nesta etapa</h4>
          <p>${esc(git.reason)}</p>
        </div>`;
    }
    return `
      <section class="local-project-panel" data-local-project="${id}" aria-labelledby="local-project-title-${id}">
        <h3 id="local-project-title-${id}">Projeto para a sua máquina</h3>
        <p id="local-project-desc-${id}">Baixa um ZIP com os arquivos atuais deste exercício, um README com os comandos, a configuração declarada e os testes. O app não executa o projeto: rode-o no seu computador.</p>
        <button type="button" class="button-secondary" data-local-export="${id}" aria-describedby="local-project-desc-${id}">Exportar projeto para máquina local</button>
        <p class="local-status" role="status" aria-live="polite" data-local-export-status="${id}"></p>
        ${gitMarkup}
      </section>`;
  }

  function attachHandlers(node, item, options) {
    const exportButton = node.querySelector(`[data-local-export="${esc(item.id)}"]`);
    const status = node.querySelector(`[data-local-export-status="${esc(item.id)}"]`);
    let busy = false;
    // aria-busy instead of disabled: a disabled control drops keyboard focus, and the status line already announces progress.
    exportButton?.addEventListener('click', async () => {
      if (busy) return;
      busy = true;
      exportButton.setAttribute('aria-busy', 'true');
      if (status) status.textContent = 'Preparando o pacote…';
      try {
        const result = await exportCurrent(item, {...options, container: options.container || node.ownerDocument});
        if (status) status.textContent = `Download preparado: ${result.filename}. Revise o arquivo antes de executar.`;
      } catch (error) {
        const message = `Não foi possível exportar o projeto: ${friendlyExportError(error)}`;
        if (status) status.textContent = message;
        options.toast?.(message);
      } finally {
        busy = false;
        exportButton.removeAttribute('aria-busy');
      }
    });
    const copyButton = node.querySelector(`[data-local-copy="${esc(item.id)}"]`);
    const copyStatus = node.querySelector(`[data-local-copy-status="${esc(item.id)}"]`);
    copyButton?.addEventListener('click', async () => {
      const text = node.querySelector('.local-git-commands')?.textContent || '';
      try {
        await global.navigator.clipboard.writeText(text);
        if (copyStatus) copyStatus.textContent = 'Comandos copiados. Eles não foram executados pelo app.';
      } catch {
        if (copyStatus) copyStatus.textContent = 'Não foi possível copiar automaticamente. Selecione o texto e copie manualmente.';
      }
    });
  }

  // Appended after the lesson markup is decorated, so learning gates cannot hide the export action.
  function enhance(container, item, options = {}) {
    if (!container || !item) return null;
    const markup = renderPanel(item, options);
    if (!markup) return null;
    const doc = global.document || container.ownerDocument;
    const template = doc.createElement('template');
    template.innerHTML = markup.trim();
    const node = template.content.firstElementChild;
    const target = container.querySelector?.('#g-practice') || container.querySelector?.('.course-lesson') || container.firstElementChild || container;
    target.appendChild(node);
    const checkpoint = options.checkpoint !== undefined ? options.checkpoint : checkpointFor(item.id, options.checkpoints);
    attachHandlers(node, item, {...options, container, checkpoint: checkpoint || {}});
    return node;
  }

  return Object.freeze({isEligible, gitBlockFor, gitText, collectFiles, exportAssessment, exportCurrent, renderPanel, enhance});
});
