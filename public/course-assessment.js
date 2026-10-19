(function (global) {
  'use strict';
  const ENVIRONMENTS = new Set(['javascript', 'typescript', 'dom', 'network', 'node-simulated', 'local', 'rubric']);
  const CHECKS = new Set(['types', 'behavior', 'mutation', 'rubric', 'local']);
  const EXECUTABLE = new Set(['javascript', 'typescript']);
  const DOM_EXECUTABLE = new Set(['dom', 'network']);
  const NODE_EXECUTABLE = new Set(['node-simulated']);
  const KINDS = new Set(['passed', 'failed', 'type-error', 'error', 'unsupported', 'timeout', 'cancelled']);
  const relative = value => typeof value === 'string' && value.length > 0 && !value.startsWith('/') && !value.includes('\\') && !/^[a-z]+:/i.test(value) && !/(^|\/)\.\.(\/|$)/.test(value);
  const hasBehaviorDeclaration = assessment => Boolean((typeof assessment.testPath === 'string' && assessment.testPath.trim()) || (typeof assessment.tests === 'string' && assessment.tests.trim()) || (Array.isArray(assessment.tests) && assessment.tests.length) || (Array.isArray(assessment.local?.commands) && assessment.local.commands.length));
  function validateManifest(manifest, { ids, fileExists = () => true } = {}) {
    if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) throw new Error('Manifesto de assessments inválido.');
    const seen = new Set();
    for (const [id, assessment] of Object.entries(manifest)) {
      if (id === '_comment') continue;
      if (!/^(?:D|\d{2})\.\d{2}$/.test(id) || (ids && !ids.has(id))) throw new Error(`Assessment para atividade desconhecida: ${id}`);
      if (seen.has(id) || !assessment || !ENVIRONMENTS.has(assessment.environment) || !Number.isInteger(assessment.version) || assessment.version < 1) throw new Error(`Assessment inválido: ${id}`);
      if (!Array.isArray(assessment.checks) || !assessment.checks.length || assessment.checks.some(check => !CHECKS.has(check))) throw new Error(`Checks inválidos: ${id}`);
      if (assessment.studentSuiteKind !== undefined && !['runtime', 'types'].includes(assessment.studentSuiteKind)) throw new Error(`Tipo de suíte inválido: ${id}`);
      if (assessment.typecheckMutants !== undefined && typeof assessment.typecheckMutants !== 'boolean') throw new Error(`Flag de typecheck de mutantes inválida: ${id}`);
      if (assessment.typeContractMutants !== undefined && (!Array.isArray(assessment.typeContractMutants) || assessment.typeContractMutants.some(mutant => !mutant || !Array.isArray(mutant.files) || !mutant.files.length || mutant.files.some(file => !file || !relative(file.path) || typeof file.content !== 'string')))) throw new Error(`Mutantes de contrato TypeScript inválidos: ${id}`);
      for (const key of ['testPath', 'referenceDir', 'entryPath', 'typeEntryPath', 'tsconfigPath', 'fixturesPath']) if (assessment[key] !== undefined && !relative(assessment[key])) throw new Error(`Caminho inválido em ${id}: ${key}`);
      if (assessment.testPath && !fileExists(assessment.testPath)) throw new Error(`Teste ausente em ${id}: ${assessment.testPath}`);
      if (assessment.testPaths !== undefined && (!Array.isArray(assessment.testPaths) || !assessment.testPaths.length || assessment.testPaths.some(path => !relative(path) || !fileExists(path)))) throw new Error(`Entradas de teste inválidas em ${id}`);
      if (assessment.referenceDir && !fileExists(assessment.referenceDir)) throw new Error(`Referência ausente em ${id}: ${assessment.referenceDir}`);
      if ((assessment.environment === 'javascript' || assessment.environment === 'typescript') && assessment.checks.includes('behavior') && !hasBehaviorDeclaration(assessment)) throw new Error(`Behavior sem testes em ${id}`);
      if (assessment.environment === 'typescript' && assessment.checks.includes('behavior') && !assessment.checks.includes('types')) throw new Error(`Behavior TypeScript exige typecheck: ${id}`);
      if (assessment.environment === 'typescript' && assessment.checks.includes('types') && !assessment.entryPath && !assessment.tsconfigPath) throw new Error(`Typecheck sem entry/config em ${id}`);
      if (assessment.expectedDiagnostics && (!Array.isArray(assessment.expectedDiagnostics) || assessment.expectedDiagnostics.some(d => !Number.isInteger(d.code) || !relative(d.file) || !Number.isInteger(d.line)))) throw new Error(`Diagnóstico esperado inválido: ${id}`);
      if (assessment.contractTypeFiles !== undefined && (!Array.isArray(assessment.contractTypeFiles) || assessment.contractTypeFiles.some(file => !file || !relative(file.path) || !file.path.endsWith('.ts') || typeof file.content !== 'string' || !file.content.trim()))) throw new Error(`Assertivas de contrato inválidas: ${id}`);
      if (assessment.expectedDiagnostics && (assessment.environment !== 'typescript' || !assessment.checks.includes('types'))) throw new Error(`Diagnósticos esperados exigem typecheck: ${id}`);
      if (assessment.local && (!Array.isArray(assessment.local.commands) || !assessment.local.commands.length || assessment.local.commands.some(command => !Array.isArray(command) || !command.length))) throw new Error(`Comandos locais inválidos: ${id}`);
      if (assessment.rubric && (!Array.isArray(assessment.rubric) || !assessment.rubric.length || assessment.rubric.some(line => typeof line !== 'string' || !line.trim()))) throw new Error(`Rubrica inválida: ${id}`);
      seen.add(id);
    }
    if (ids) for (const id of ids) if (!manifest[id]) throw new Error(`Assessment ausente: ${id}`);
    return true;
  }
  // Identidade de execução (FINGERPRINT_SCHEMA 2).
  // Allowlist explícita: só campos lidos pelo executor entram no hash. Título, enunciado (prompt),
  // descrições e chaves desconhecidas são editoriais e não invalidam resultados. Ao acrescentar um
  // campo que o executor passe a ler, inclua-o em FINGERPRINT_FIELDS e no teste de cobertura.
  const FINGERPRINT_SCHEMA = 'devpath-assessment-fingerprint/2';
  const FINGERPRINT_FIELDS = Object.freeze(['environment', 'version', 'checks', 'entryPath', 'typeEntryPath', 'testPath', 'testPaths', 'tests', 'sourceTestPath', 'referenceDir', 'tsconfigPath', 'fixturesPath', 'fixtures', 'inlinefixtures', 'timeoutMs', 'argv', 'env', 'virtualCwd', 'runtime', 'studentSuite', 'studentSuiteKind', 'behaviorTestPath', 'typecheckMutants', 'expectedDiagnostics', 'local', 'rubric', 'transfer', 'correctFiles', 'mutantDirs', 'contractTypeFiles', 'typeContractMutants', 'predictionTable']);
  const EDITORIAL_FIELDS = Object.freeze(['prompt', 'title', 'description', 'evidenceLabel', 'evidenceNote', 'assertionCases']);
  const byCodePoint = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
  // Regras de forma: propriedade ausente (undefined) é omitida; null, '', [] e {} são valores presentes e
  // geram hashes diferentes (invalidação conservadora). Objetos têm chaves ordenadas por código Unicode.
  // Arrays mantêm a ordem, exceto as listas de arquivos e checks/expectedDiagnostics (ver abaixo).
  function canonicalValue(value) {
    if (value === undefined || typeof value === 'function' || typeof value === 'symbol') return undefined;
    if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
    if (typeof value === 'number') return Number.isFinite(value) ? value : {$nonfinite: String(value)};
    if (typeof value === 'bigint') return {$bigint: value.toString()};
    if (Array.isArray(value)) return value.map(item => { const canonical = canonicalValue(item); return canonical === undefined ? null : canonical; });
    if (typeof value === 'object') {
      const out = {};
      for (const key of Object.keys(value).sort(byCodePoint)) {
        const canonical = canonicalValue(value[key]);
        if (canonical !== undefined) out[key] = canonical;
      }
      return out;
    }
    return undefined;
  }
  // Listas de arquivos são conjuntos endereçados por caminho: ordenadas por path. Caminhos repetidos
  // mantêm a ordem de entrada (sort é estável), porque no executor o último arquivo com o mesmo caminho vence.
  function stripCaseMarkers(source) {
    try { return global.DevPathCaseMarkers?.strip(source) ?? source; }
    catch { return source; }
  }
  function testSuitePaths(assessment) {
    const paths = new Set();
    for (const value of [assessment?.testPath, assessment?.sourceTestPath, assessment?.behaviorTestPath, ...(Array.isArray(assessment?.testPaths) ? assessment.testPaths : [])]) {
      if (typeof value === 'string') paths.add(value.replace(/\\/g, '/').replace(/^\.\//, ''));
    }
    return paths;
  }
  function canonicalFiles(list, suitePaths = new Set()) {
    if (list === undefined) return undefined;
    if (!Array.isArray(list)) return canonicalValue(list);
    return list.map(file => {
      const filePath = typeof file?.path === 'string' ? file.path.replace(/\\/g, '/').replace(/^\.\//, '') : file?.path;
      return {path: filePath, content: typeof file?.content === 'string' && suitePaths.has(filePath) ? stripCaseMarkers(file.content) : file?.content};
    }).sort((a, b) => byCodePoint(String(a.path ?? ''), String(b.path ?? '')));
  }
  // Mutantes mantêm a ordem declarada (ela define a ordem de relatório). Forma aceita: {id, files} ou files direto.
  function canonicalMutants(list) {
    if (list === undefined) return undefined;
    if (!Array.isArray(list)) return canonicalValue(list);
    return list.map(mutant => Array.isArray(mutant) ? {files: canonicalFiles(mutant)} : {id: mutant?.id, files: canonicalFiles(mutant?.files)});
  }
  function transferIdentity(transfer) {
    if (!transfer || typeof transfer !== 'object' || Array.isArray(transfer)) return canonicalValue(transfer);
    return {id: transfer.id, files: canonicalFiles(transfer.files), testPath: transfer.testPath, rubric: transfer.rubric};
  }
  function executionIdentity(assessment) {
    const identity = {};
    for (const field of FINGERPRINT_FIELDS) identity[field] = assessment[field];
    identity.checks = Array.isArray(assessment.checks) ? [...assessment.checks].sort(byCodePoint) : assessment.checks;
    identity.expectedDiagnostics = Array.isArray(assessment.expectedDiagnostics)
      ? assessment.expectedDiagnostics.map(canonicalValue).sort((a, b) => byCodePoint(JSON.stringify(a), JSON.stringify(b)))
      : assessment.expectedDiagnostics;
    identity.correctFiles = canonicalFiles(assessment.correctFiles);
    identity.contractTypeFiles = canonicalFiles(assessment.contractTypeFiles);
    identity.mutantDirs = canonicalMutants(assessment.mutantDirs);
    identity.typeContractMutants = canonicalMutants(assessment.typeContractMutants);
    identity.transfer = transferIdentity(assessment.transfer);
    if (typeof assessment.tests === 'string') identity.tests = stripCaseMarkers(assessment.tests);
    else if (Array.isArray(assessment.tests)) identity.tests = assessment.tests.map(test => typeof test === 'string' ? stripCaseMarkers(test) : test);
    return identity;
  }
  async function canonicalFingerprint({ activityId, contentVersion = 1, assessmentVersion = 1, files, assessment, variantId } = {}) {
    const fileList = files ?? [];
    if (!Array.isArray(fileList)) throw new TypeError('Arquivos da tentativa devem ser uma lista.');
    const suitePaths = testSuitePaths(assessment);
    const hasAnnotatedSuite = (typeof assessment?.tests === 'string' && assessment.tests.includes('/*@case'))
      || (Array.isArray(assessment?.tests) && assessment.tests.some(test => typeof test === 'string' && test.includes('/*@case')))
      || fileList.some(file => {
        const filePath = typeof file?.path === 'string' ? file.path.replace(/\\/g, '/').replace(/^\.\//, '') : '';
        return suitePaths.has(filePath) && typeof file?.content === 'string' && file.content.includes('/*@case');
      });
    if (hasAnnotatedSuite) await global.DevPathCaseMarkers?.prepare?.();
    const payload = {
      schema: FINGERPRINT_SCHEMA,
      activityId,
      contentVersion,
      assessmentVersion,
      variantId: variantId ?? null,
      evaluation: assessment && typeof assessment === 'object' ? executionIdentity(assessment) : null,
      files: canonicalFiles(fileList, suitePaths),
    };
    const text = JSON.stringify(canonicalValue(payload));
    if (!global.crypto?.subtle) throw new Error('SHA-256 indisponível neste ambiente.');
    const bytes = await global.crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return [...new Uint8Array(bytes)].map(byte => byte.toString(16).padStart(2, '0')).join('');
  }
  const textFor = (kind, result) => result?.text || ({ passed: 'Avaliação concluída.', failed: 'Há testes falhando.', 'type-error': 'Há erros de TypeScript.', unsupported: 'Este ambiente não é suportado no navegador.', timeout: 'A avaliação excedeu o tempo limite.', cancelled: 'A avaliação foi cancelada.', error: 'A avaliação falhou.' }[kind] || 'A avaliação falhou.');
  const safeFailureValue = (value, depth = 0) => {
    if (value === null || typeof value === 'boolean' || typeof value === 'number') return value;
    if (typeof value === 'string') return value.slice(0, 240);
    if (Array.isArray(value)) return value.slice(0, 8).map(item => safeFailureValue(item, depth + 1));
    if (value && typeof value === 'object' && depth < 3) {
      const output = {};
      for (const key of Object.keys(value).sort().slice(0, 8)) output[key.slice(0, 60)] = safeFailureValue(value[key], depth + 1);
      return output;
    }
    return {type: 'unavailable'};
  };
  function safeFirstFailure(value) {
    if (!value || typeof value !== 'object' || typeof value.caseId !== 'string' || !/^\d{2}\.\d{2}\.[A-Za-z0-9._-]+$/.test(value.caseId) || typeof value.matcher !== 'string' || typeof value.negated !== 'boolean') return null;
    return {
      caseId: value.caseId.slice(0, 100),
      ...(typeof value.testName === 'string' ? {testName: value.testName.slice(0, 160)} : {}),
      matcher: value.matcher.slice(0, 80),
      negated: value.negated,
      ...(typeof value.inputExpression === 'string' ? {inputExpression: value.inputExpression.slice(0, 320)} : {}),
      ...(value.inputRuntime !== undefined ? {inputRuntime: safeFailureValue(value.inputRuntime)} : {}),
      expected: safeFailureValue(value.expected),
      observed: safeFailureValue(value.observed),
      contractRule: String(value.contractRule || '').slice(0, 360),
      investigation: String(value.investigation || '').slice(0, 360),
      sourceTestPath: String(value.sourceTestPath || '').slice(0, 160),
    };
  }
  function failureText(value) {
    const display = item => typeof item === 'string' ? item : JSON.stringify(item);
    const matcherParts = String(value.matcher || '(não declarado)').split('.');
    if (value.negated && matcherParts.length > 1) matcherParts.splice(matcherParts.length - 1, 0, 'not');
    else if (value.negated) matcherParts.unshift('not');
    const matcher = matcherParts.join('.');
    const input = value.inputRuntime !== undefined
      ? `Entrada observada: ${display(value.inputRuntime)}`
      : `Expressão de entrada: ${value.inputExpression || '(não declarada)'}\nO valor executado não foi capturado.`;
    return `\n\nPrimeira divergência · ${value.caseId}${value.testName ? ` · ${value.testName}` : ''}\n${value.contractRule}\nMatcher: ${matcher}\n${input}\nEsperado: ${display(value.expected)}\nObservado: ${display(value.observed)}\nPróxima investigação: ${value.investigation}`;
  }
  function normalized(base, kind, text, result = {}) {
    const safeKind = KINDS.has(kind) ? kind : 'error';
    const safeText = typeof text === 'string' && text.trim() ? text : textFor(safeKind);
    const output = { kind: safeKind, text: safeText, diagnostics: Array.isArray(result.diagnostics) ? result.diagnostics : [], source: base.source, fingerprint: base.fingerprint };
    const firstFailure = safeKind === 'failed' ? safeFirstFailure(result.firstFailure) : null;
    if (firstFailure) { output.firstFailure = firstFailure; output.text += failureText(firstFailure); }
    if (result.tests && Number.isFinite(result.tests.total) && Number.isFinite(result.tests.passed) && Number.isFinite(result.tests.failed)) output.tests = { passed: result.tests.passed, failed: result.tests.failed, total: result.tests.total, ...(firstFailure ? {firstFailure} : {}) };
    return output;
  }
  const validVirtualFile = file => file && relative(file.path) && typeof file.content === 'string';
  const runtimeVirtualFile = file => validVirtualFile(file) && !/\.d\.ts$/i.test(file.path);
  const suiteFilesFor = (files, assessment) => {
    const candidates = Array.isArray(files) ? files.filter(runtimeVirtualFile) : [];
    if (assessment?.testPath || Array.isArray(assessment?.testPaths)) return candidates;
    const likely = candidates.filter(file => /(?:^|\/)(?:test|tests)\//i.test(file.path) || /\.(?:test|spec)\.[cm]?[jt]sx?$/i.test(file.path));
    return likely.length ? likely : candidates;
  };
  async function runStudentSuite({files = [], correctFiles = [], mutantDirs = [], assessment = {}, signal, fingerprint} = {}) {
    const base = {source: 'browser', fingerprint, diagnostics: []};
    const suppliedFiles = Array.isArray(files) ? files : [];
    const allInputs = [...suppliedFiles, ...correctFiles, ...(Array.isArray(mutantDirs) ? mutantDirs.flatMap(mutant => Array.isArray(mutant) ? mutant : mutant?.files || []) : [])];
    if (allInputs.some(file => !validVirtualFile(file))) return normalized(base, 'failed', 'Há um caminho ou conteúdo virtual inválido na avaliação.');
    if (assessment.typeContractMutants) {
      if (!global.DevPathTypeChecker?.check) return normalized(base, 'unsupported', textFor('unsupported'));
      if (!Array.isArray(assessment.contractTypeFiles) || !assessment.contractTypeFiles.length) return normalized(base, 'failed', 'Assertivas protegidas de contrato TypeScript ausentes.');
      const evaluate = async overrides => {
        const merged = new Map(suppliedFiles.filter(runtimeVirtualFile).map(file => [file.path, file]));
        for (const file of overrides) merged.set(file.path, file);
        for (const file of assessment.contractTypeFiles) merged.set(file.path, file);
        try { return await global.DevPathTypeChecker.check({files: [...merged.values()], entryPaths: [assessment.entryPath, ...assessment.contractTypeFiles.map(file => file.path)].filter(Boolean), tsconfigPath: assessment.tsconfigPath}, {signal, timeoutMs: assessment.timeoutMs}); }
        catch (error) { return {kind: 'error', supported: false, text: error instanceof Error ? error.message : String(error)}; }
      };
      const reference = await evaluate([]);
      if (reference.kind === 'cancelled') return normalized(base, 'cancelled', textFor('cancelled'), reference);
      if (reference.kind !== 'passed' || reference.supported === false) return normalized(base, reference.kind === 'unsupported' ? 'unsupported' : reference.kind === 'type-error' ? 'type-error' : 'failed', `As assertivas protegidas devem passar na implementação enviada.${reference.text ? `\n${reference.text}` : ''}`, reference);
      let typeContractResults = 0;
      for (const mutant of assessment.typeContractMutants) {
        const result = await evaluate(mutant.files);
        if (result.kind === 'cancelled') return normalized(base, 'cancelled', textFor('cancelled'), result);
        const diagnostics = result.diagnostics || [];
        const protectedPaths = new Set(assessment.contractTypeFiles.map(file => file.path));
        const infrastructureFailure = result.supported === false || ['unsupported', 'timeout', 'error'].includes(result.kind)
          || diagnostics.some(diagnostic => {
            const code = Number(diagnostic.code);
            return diagnostic.category === 'error' && ((code >= 1000 && code < 2000)
              || [18002, 18003, 18004, 18005, 18006, 18007, 18008, 18009, 18010, 18011, 18012, 18013, 18014, 18015, 18016, 18017, 18018, 18019, 18020, 18021, 18022, 2305, 2307, 2688, 5058, 5060, 5083, 5095, 6046, 6053, 6307].includes(code)
              || /(?:^|\/)(?:tsconfig\.json|package\.json)$/.test(diagnostic.file || ''));
          });
        const semanticFailure = result.kind === 'type-error' && diagnostics.some(diagnostic => diagnostic.category === 'error'
          && protectedPaths.has(diagnostic.file)
          && [2322, 2344, 2345, 2349, 2353, 2367, 2540, 2578, 2769].includes(Number(diagnostic.code)));
        if (infrastructureFailure || !semanticFailure) return normalized(base, 'failed', `Mutante de contrato ${mutant.id || 'sem nome'} sobreviveu semanticamente ou não pôde ser avaliado.`, result);
        typeContractResults++;
      }
      if (!assessment.checks.includes('behavior') && assessment.studentSuite !== true) return normalized(base, 'passed', 'As assertivas TypeScript protegidas passaram na implementação e rejeitaram todos os mutantes de contrato.', {tests: {passed: typeContractResults + 1, failed: 0, total: typeContractResults + 1}});
    }
    if (!Array.isArray(correctFiles) || !correctFiles.length) return normalized(base, 'failed', 'Referência correta ausente para a suíte do aluno.');
    const suiteFiles = suiteFilesFor(files, assessment);
    const testPath = assessment.testPath || '__devpath_student_tests__.js';
    const inferredTestPaths = suiteFiles.filter(file => /(?:^|\/)(?:test|tests)\//i.test(file.path) || /\.(?:test|spec)\.[cm]?[jt]sx?$/i.test(file.path)).map(file => file.path);
    const declaredPaths = assessment.studentSuite !== true && typeof assessment.tests === 'string' && assessment.tests.trim() ? [testPath] : Array.isArray(assessment.testPaths) ? assessment.testPaths : assessment.testPath ? [...new Set([assessment.testPath, ...inferredTestPaths])] : inferredTestPaths;
    if (declaredPaths.some(path => !relative(path))) return normalized(base, 'failed', 'Há uma entrada de teste com caminho inválido.');
    const inlineTestSource = typeof assessment.tests === 'string' && assessment.tests.trim() ? [{path: testPath, content: assessment.tests}] : [];
    const studentTestFiles = suiteFiles.filter(file => declaredPaths.includes(file.path) || /(?:^|\/)(?:test|tests)\//i.test(file.path) || /\.(?:test|spec)\.[cm]?[jt]sx?$/i.test(file.path));
    if (assessment.studentSuite === true && !studentTestFiles.length) return normalized(base, 'failed', 'A suíte do aluno está vazia.');
    const testSource = assessment.studentSuite === true && studentTestFiles.length ? suiteFiles : inlineTestSource.length ? inlineTestSource : suiteFiles;
    if (!testSource.length) return normalized(base, 'failed', 'A suíte do aluno está vazia.');
    if (!(typeof assessment.tests === 'string' && assessment.tests.trim()) && declaredPaths.some(path => !testSource.some(file => file.path === path))) return normalized(base, 'failed', 'Uma entrada de teste declarada está ausente.');
    if (assessment.studentSuiteKind === 'types') {
      if (!global.DevPathTypeChecker?.check) return normalized(base, 'unsupported', textFor('unsupported'));
      const suitePaths = Array.isArray(assessment.testPaths) ? assessment.testPaths : declaredPaths;
      const typedTests = studentTestFiles.filter(file => suitePaths.includes(file.path) && /\.tsx?$/i.test(file.path));
      if (!typedTests.length || typedTests.some(file => !file.content.trim())) return normalized(base, 'failed', 'A suíte TypeScript está vazia.');
      const evaluateTypes = async overrides => {
        const merged = new Map(studentTestFiles.filter(file => suitePaths.includes(file.path) && validVirtualFile(file)).map(file => [file.path, file]));
        for (const file of correctFiles) if (validVirtualFile(file)) merged.set(file.path, file);
        for (const file of overrides) if (validVirtualFile(file)) merged.set(file.path, file);
        try { return await global.DevPathTypeChecker.check({files: [...merged.values()], entryPaths: suitePaths, tsconfigPath: assessment.tsconfigPath}, {signal, timeoutMs: assessment.timeoutMs}); }
        catch (error) { return {kind: 'error', supported: false, diagnostics: [], text: error instanceof Error ? error.message : String(error)}; }
      };
      const correct = await evaluateTypes([]);
      if (correct.kind === 'cancelled') return normalized(base, 'cancelled', textFor('cancelled'), correct);
      if (correct.kind !== 'passed' || correct.supported === false || correct.diagnostics?.some(diagnostic => diagnostic.category === 'error')) return normalized(base, correct.kind === 'unsupported' ? 'unsupported' : 'failed', `A suíte de tipos deve passar na referência correta.${correct.text ? `\n${correct.text}` : ''}`, correct);
      const mutants = Array.isArray(mutantDirs) ? mutantDirs : [];
      if (!mutants.length) return normalized(base, 'failed', 'Nenhum mutante semântico foi declarado para a suíte de tipos.', correct);
      for (let index = 0; index < mutants.length; index++) {
        const mutant = mutants[index];
        const overrides = Array.isArray(mutant) ? mutant : Array.isArray(mutant?.files) ? mutant.files : [];
        const result = await evaluateTypes(overrides);
        if (result.kind === 'cancelled') return normalized(base, 'cancelled', textFor('cancelled'), result);
        const infrastructure = result.supported === false || ['unsupported','timeout','error'].includes(result.kind)
          || (result.diagnostics || []).some(diagnostic => [2307,2305,2688,6053].includes(Number(diagnostic.code)));
        const semanticMismatch = result.kind === 'type-error' && (result.diagnostics || []).some(diagnostic => diagnostic.category === 'error' && suitePaths.includes(diagnostic.file) && [2322,2344,2345,2349,2353,2367,2578,2769].includes(Number(diagnostic.code)));
        if (infrastructure || !semanticMismatch) return normalized(base, 'failed', `Mutante TypeScript ${mutant?.id || index + 1} não foi morto semanticamente pela suíte.`, result);
      }
      return normalized(base, 'passed', 'A suíte TypeScript passou na referência e matou todos os mutantes semânticos.', {tests: {passed: mutants.length + 1, failed: 0, total: mutants.length + 1}});
    }
    const execute = async implementation => {
      if (signal?.aborted) return {kind: 'cancelled', text: textFor('cancelled')};
      if (NODE_EXECUTABLE.has(assessment.environment)) {
        if (!global.DevPathNodeRuntime?.createNodeRuntime || !global.DevPathModuleGraph?.buildModuleGraph || !global.DevPathCourseRunner?.run) return {kind: 'unsupported', text: textFor('unsupported')};
        const implementationByPath = new Map(implementation.filter(file => runtimeVirtualFile(file) && /\.(?:m?js|jsx|ts|tsx|json)$/i.test(file.path)).map(file => [file.path, file]));
        for (const file of suppliedFiles) if (!implementationByPath.has(file.path) || declaredPaths.includes(file.path)) implementationByPath.set(file.path, file);
        for (const file of testSource) if (declaredPaths.includes(file.path) || !implementationByPath.has(file.path)) implementationByPath.set(file.path, file);
        // The module graph only accepts code and JSON; Markdown such as ISSUE.md stays in the editor but never reaches the runner.
        const nodeFiles = [...implementationByPath.values()].filter(file => /\.(?:m?js|jsx|ts|tsx|json)$/i.test(file.path));
        const paths = declaredPaths.filter(path => nodeFiles.some(file => file.path === path));
        const nodeEntry = paths.length > 1 ? '__devpath_node_tests__.js' : paths[0] || testSource[0]?.path;
        if (!nodeEntry) return {kind: 'error', text: 'Entrada da suíte ausente.'};
        if (paths.length > 1) nodeFiles.push({path: nodeEntry, content: paths.map(path => `import ${JSON.stringify(`./${path}`)};`).join('\n')});
        try {
          const graph = await global.DevPathModuleGraph.buildModuleGraph({files: nodeFiles, entryPath: nodeEntry, runtime: 'node-simulated', assertionCases: assessment.assertionCases || []});
          return await new Promise(resolve => {
            let stop;
            let settled = false;
            const finish = result => { if (settled) return; settled = true; signal?.removeEventListener?.('abort', onAbort); resolve(result); };
            const onAbort = () => { stop?.(); finish({kind: 'cancelled', text: textFor('cancelled')}); };
            signal?.addEventListener?.('abort', onAbort, {once: true});
            try {
              stop = global.DevPathCourseRunner.run({module: graph.code, nodeRuntime: {files: nodeFiles, argv: ['node-simulated', nodeEntry], env: {}, virtualCwd: ''}}, (kind, text, tests, node) => {
                if (kind !== 'result') return finish({kind, text, tests, node});
                if (node?.exitCode && node.exitCode !== 0) return finish({kind: 'failed', text: text || 'Node simulado terminou com erro.', tests, node});
                finish({kind, text, tests, node});
            }, {signal, timeoutMs: assessment.timeoutMs, caseRecords: assessment.assertionCases || []});
            } catch (error) { finish({kind: error?.code === 'UNSUPPORTED' ? 'unsupported' : 'error', text: error instanceof Error ? error.message : String(error)}); }
            if (signal?.aborted) onAbort();
          });
        } catch (error) { return {kind: error?.code === 'UNSUPPORTED' ? 'unsupported' : 'error', text: error instanceof Error ? error.message : String(error)}; }
      }
      if (DOM_EXECUTABLE.has(assessment.environment)) {
        if (!global.DevPathDomRunner?.run) return {kind: 'unsupported', text: textFor('unsupported')};
        const inlineTests = typeof assessment.tests === 'string' && assessment.tests.trim();
        const hasStudentSuite = studentTestFiles.length > 0;
        const testPaths = hasStudentSuite ? (declaredPaths.length ? declaredPaths : studentTestFiles.map(file => file.path)) : inlineTests ? testSource.map(file => file.path) : (declaredPaths.length ? declaredPaths : testSource.map(file => file.path));
        const implementationByPath = new Map(implementation.map(file => [file.path, file]));
        for (const file of suppliedFiles) {
          if (!implementationByPath.has(file.path) || testPaths.includes(file.path)) implementationByPath.set(file.path, file);
        }
        for (const file of testSource) {
          if (testPaths.includes(file.path) || !implementationByPath.has(file.path)) implementationByPath.set(file.path, file);
        }
        const domFiles = [...implementationByPath.values()];
        const entryPath = assessment.entryPath || domFiles.find(file => /\.(?:m?js|jsx|ts|tsx)$/i.test(file.path))?.path;
        const testCode = testPaths.length ? testPaths.map(path => `import ${JSON.stringify(`./${path}`)};`).join('\n') : '';
        const domResult = await global.DevPathDomRunner.run({files: domFiles, entryPath, testCode, testPaths, fixtures: assessment.fixtures || {}}, {signal, timeoutMs: assessment.timeoutMs, assertionCases: assessment.assertionCases || []});
        return {kind: domResult.kind === 'passed' || domResult.kind === 'failed' ? 'result' : domResult.kind, text: domResult.text, tests: domResult.tests};
      }
      const byPath = new Map(implementation.filter(runtimeVirtualFile).map(file => [file.path, file]));
      for (const file of testSource) {
        if (!runtimeVirtualFile(file)) continue;
        // Correct/reference implementation paths are protected from accidental
        // replacement by a learner helper with the same virtual path.
        if (!byPath.has(file.path)) byPath.set(file.path, file);
      }
      const entryPaths = declaredPaths.filter(path => byPath.has(path));
      let entryPath = entryPaths[0] || testSource[0]?.path;
      if (entryPaths.length > 1) {
        entryPath = '__devpath_test_aggregate__.js';
        byPath.set(entryPath, {path: entryPath, content: entryPaths.map(path => `import ${JSON.stringify(`./${path}`)};`).join('\n')});
      }
      if (!entryPath) return {kind: 'error', text: 'Entrada da suíte ausente.'};
      const graph = await global.DevPathModuleGraph.buildModuleGraph({files: [...byPath.values()], entryPath, assertionCases: assessment.assertionCases || []});
      return await new Promise(resolve => {
        let stop;
        let settled = false;
        const finish = result => { if (settled) return; settled = true; signal?.removeEventListener?.('abort', onAbort); resolve(result); };
        const onAbort = () => { stop?.(); finish({kind: 'cancelled', text: textFor('cancelled')}); };
        signal?.addEventListener?.('abort', onAbort, {once: true});
        try { stop = global.DevPathCourseRunner.run({module: graph.code}, (kind, text, tests) => finish({kind, text, tests}), {signal, caseRecords: assessment.assertionCases || []}); }
        catch (error) { finish({kind: 'error', text: error instanceof Error ? error.message : String(error)}); }
        if (signal?.aborted) onAbort();
      });
    };
    let correct;
      try { correct = await execute(correctFiles); }
    catch (error) { return normalized(base, 'error', error instanceof Error ? error.message : String(error)); }
    if (correct.kind !== 'result' || !correct.tests || correct.tests.total < 1 || correct.tests.failed > 0) {
      return normalized(base, correct.kind === 'cancelled' ? 'cancelled' : 'failed', `A suíte não aprova a implementação correta.${correct.text ? `\n${correct.text}` : ''}`, correct);
    }
    const mutants = Array.isArray(mutantDirs) ? mutantDirs : [];
    if (!mutants.length) return normalized(base, 'failed', 'Nenhum mutante foi declarado para esta avaliação.', correct);
    for (let index = 0; index < mutants.length; index++) {
      const mutant = mutants[index];
      const mutantFiles = Array.isArray(mutant) ? mutant : Array.isArray(mutant?.files) ? mutant.files : [];
      const mutantByPath = new Map(correctFiles.map(file => [file.path, file]));
      for (const file of mutantFiles) mutantByPath.set(file.path, file);
      if (assessment.typecheckMutants === true) {
        if (!global.DevPathTypeChecker?.check) return normalized(base, 'unsupported', textFor('unsupported'));
        const checkedFiles = new Map([...mutantByPath.values()].map(file => [file.path, file]));
        let typedMutant;
        try { typedMutant = await global.DevPathTypeChecker.check({files: [...checkedFiles.values()], entryPaths: [assessment.entryPath].filter(Boolean), tsconfigPath: assessment.tsconfigPath}, {signal, timeoutMs: assessment.timeoutMs}); }
        catch (error) { return normalized(base, 'failed', `Mutante ${mutant?.id || index + 1} não pôde ser typechecked: ${error instanceof Error ? error.message : String(error)}`); }
        if (typedMutant.kind !== 'passed' || typedMutant.supported === false) return normalized(base, 'failed', `Mutante ${mutant?.id || index + 1} não compila segundo o TypeScript declarado; não conta como mutante morto. ${typedMutant.text || ''}`, typedMutant);
      }
      let result;
      try { result = await execute([...mutantByPath.values()]); }
      catch (error) { return normalized(base, 'failed', `Mutante ${mutant?.id || index + 1} não pôde ser executado: ${error instanceof Error ? error.message : String(error)}`, correct); }
      if (result.kind === 'cancelled') return normalized(base, 'cancelled', textFor('cancelled'), result);
      if (result.kind !== 'result' || !result.tests || result.tests.total < 1) return normalized(base, 'failed', `Mutante ${mutant?.id || index + 1} terminou com erro; isso não conta como mutante morto.`, result);
      if (result.tests.failed === 0) return normalized(base, 'failed', `Mutante sobrevivente: ${mutant?.id || index + 1}.`, result);
    }
    return normalized(base, 'passed', 'A implementação correta passou e todos os mutantes falharam.', correct);
  }
  async function run({ item, assessment, files, signal, fingerprint }) {
    const source = assessment.environment === 'rubric' || assessment.environment === 'local' ? `${assessment.environment}-declared` : 'browser';
    const base = { source, fingerprint, diagnostics: [] };
    if (signal?.aborted) return { ...base, kind: 'cancelled', text: textFor('cancelled') };
    if (!assessment || !ENVIRONMENTS.has(assessment.environment)) return { ...base, kind: 'unsupported', text: textFor('unsupported') };
    if (assessment.checks.includes('behavior') && !EXECUTABLE.has(assessment.environment) && !DOM_EXECUTABLE.has(assessment.environment) && !NODE_EXECUTABLE.has(assessment.environment)) return { ...base, kind: 'unsupported', text: textFor('unsupported') };
    if (assessment.checks.includes('behavior') && files.some(file => /\.(?:ts|tsx)$/i.test(file.path)) && !assessment.checks.includes('types')) return normalized(base, 'unsupported', 'Arquivos TypeScript exigem a checagem de tipos antes da execução.');
    if (assessment.environment === 'typescript' && assessment.checks.includes('behavior') && !assessment.checks.includes('types')) return normalized(base, 'unsupported', 'Behavior TypeScript exige typecheck.');
    if (assessment.checks.includes('types')) {
      if (!global.DevPathTypeChecker?.check) return { ...base, kind: 'unsupported', text: textFor('unsupported') };
      let typed;
      try {
        const filesByPath = new Map(files.map(file => [file.path, file]));
        for (const file of assessment.contractTypeFiles || []) filesByPath.set(file.path, file);
        typed = await global.DevPathTypeChecker.check({ files: [...filesByPath.values()], entryPaths: [assessment.typeEntryPath || assessment.entryPath || files[0]?.path, ...(assessment.contractTypeFiles || []).map(file => file.path)].filter(Boolean), tsconfigPath: assessment.tsconfigPath }, { signal });
      }
      catch (error) { return { ...base, kind: 'error', text: error instanceof Error ? error.message : String(error) }; }
      if (assessment.expectedDiagnostics) {
        const actual = (typed.diagnostics || []).map(d => ({ code: Number(d.code), file: d.file || '', line: Number(d.line || 0) })).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
        const expected = assessment.expectedDiagnostics.map(d => ({ code: Number(d.code), file: d.file || '', line: Number(d.line || 0) })).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
        if (typed.kind !== 'type-error' || JSON.stringify(actual) !== JSON.stringify(expected)) return normalized(base, 'type-error', textFor('type-error', typed), typed);
        if (!assessment.checks.includes('behavior')) return normalized(base, 'passed', 'Os diagnósticos esperados foram encontrados.', typed);
        return normalized(base, 'failed', 'A investigação encontrou os diagnósticos esperados; ela não aprova uma implementação executável.', typed);
      }
      if (typed.kind !== 'passed') return normalized(base, typed.kind, textFor(typed.kind, typed), typed);
    }
    if (assessment.behaviorTestPath) {
      const behaviorPath = assessment.behaviorTestPath;
      const inlineBehaviorFile = typeof assessment.tests === 'string' && assessment.tests.trim() ? {path: behaviorPath, content: assessment.tests} : null;
      const behaviorFile = assessment.studentSuite === true ? files.find(file => file.path === behaviorPath) || inlineBehaviorFile : inlineBehaviorFile || files.find(file => file.path === behaviorPath);
      if (!behaviorFile) return normalized(base, 'failed', `O teste comportamental exigido está ausente: ${behaviorPath}.`);
      if (DOM_EXECUTABLE.has(assessment.environment)) {
        if (!global.DevPathDomRunner?.run) return normalized(base, 'unsupported', textFor('unsupported'));
        try {
          const domFiles = [...files.filter(file => file.path !== behaviorPath), behaviorFile];
        const result = await global.DevPathDomRunner.run({files: domFiles, entryPath: assessment.entryPath || files.find(file => /\.html?$/i.test(file.path))?.path, testCode: behaviorFile.content, fixtures: assessment.fixtures || {}}, {signal, timeoutMs: assessment.timeoutMs, assertionCases: assessment.assertionCases || []});
          if (result.kind !== 'passed' || !result.tests || result.tests.total < 1 || result.tests.failed > 0) {
            const kind = result.kind === 'cancelled' || result.kind === 'timeout' || result.kind === 'unsupported' || result.kind === 'error' ? result.kind : 'failed';
            return normalized(base, kind, `A implementação enviada não passa seus testes comportamentais.${result.text ? `\n${result.text}` : ''}`, {...result, firstFailure: kind === 'failed' ? result.tests?.firstFailure : undefined});
          }
          if (!assessment.checks.includes('mutation') && assessment.studentSuite !== true) return normalized(base, 'passed', result.text || 'A avaliação comportamental passou.', result);
        } catch (error) {
          return normalized(base, error?.code === 'UNSUPPORTED' ? 'unsupported' : 'error', error instanceof Error ? error.message : String(error));
        }
      } else {
      if (!global.DevPathModuleGraph?.buildModuleGraph || !global.DevPathCourseRunner?.run) return normalized(base, 'unsupported', textFor('unsupported'));
      try {
        const nodeSimulation = NODE_EXECUTABLE.has(assessment.environment);
        const runtimeFiles = files.filter(file => file.path !== behaviorPath && runtimeVirtualFile(file) && (!nodeSimulation || /\.(?:m?js|jsx|ts|tsx|json)$/i.test(file.path)));
        runtimeFiles.push(behaviorFile);
        if (nodeSimulation && !global.DevPathNodeRuntime?.createNodeRuntime) return normalized(base, 'unsupported', textFor('unsupported'));
        const graph = await global.DevPathModuleGraph.buildModuleGraph({files: runtimeFiles, entryPath: behaviorPath, assertionCases: assessment.assertionCases || [], ...(nodeSimulation ? {runtime: 'node-simulated'} : {})});
        const behavior = await new Promise(resolve => {
          let stop;
          let settled = false;
          const finish = result => { if (settled) return; settled = true; signal?.removeEventListener?.('abort', onAbort); resolve(result); };
          const onAbort = () => { stop?.(); finish({kind: 'cancelled', text: textFor('cancelled')}); };
          signal?.addEventListener?.('abort', onAbort, {once: true});
          try { stop = global.DevPathCourseRunner.run({module: graph.code, ...(nodeSimulation ? {nodeRuntime: {files: runtimeFiles, argv: ['node-simulated', behaviorPath], env: {}, virtualCwd: ''}} : {})}, (kind, text, tests, node) => finish({kind, text, tests, node}), {signal, timeoutMs: assessment.timeoutMs, caseRecords: assessment.assertionCases || []}); }
          catch (error) { finish({kind: 'error', text: error instanceof Error ? error.message : String(error)}); }
          if (signal?.aborted) onAbort();
        });
        if (behavior.kind !== 'result' || !behavior.tests || behavior.tests.total < 1 || behavior.tests.failed > 0 || (behavior.node?.exitCode && behavior.node.exitCode !== 0)) {
          const kind = ['cancelled', 'timeout', 'unsupported', 'error', 'type-error'].includes(behavior.kind) ? behavior.kind : 'failed';
          return normalized(base, kind, `A implementação enviada não passa seus testes comportamentais.${behavior.text ? `\n${behavior.text}` : ''}`, {...behavior, firstFailure: kind === 'failed' && !behavior.node?.exitCode ? behavior.tests?.firstFailure : undefined});
        }
        // Behavior-only activities end here: the generic runner below would receive every starter file, including the
        // Markdown files that the module graph refuses (node-simulated and javascript runners only accept code).
        if (!assessment.checks.includes('mutation') && assessment.studentSuite !== true) return normalized(base, 'passed', textFor('passed', behavior), behavior);
      } catch (error) {
        return normalized(base, error?.code === 'UNSUPPORTED' ? 'unsupported' : 'error', error instanceof Error ? error.message : String(error));
      }
      }
    }
    if (assessment.checks.includes('mutation') || assessment.studentSuite === true) {
      if (!global.DevPathAssessment.runStudentSuite) return { ...base, kind: 'unsupported', text: textFor('unsupported') };
      return global.DevPathAssessment.runStudentSuite({item, assessment, files, correctFiles: assessment.correctFiles || [], mutantDirs: assessment.mutantDirs || [], signal, fingerprint});
    }
    if (assessment.environment === 'node-simulated' && assessment.checks.includes('behavior')) {
      if (!global.DevPathNodeRuntime?.createNodeRuntime || !global.DevPathModuleGraph?.buildModuleGraph || !global.DevPathCourseRunner?.run) return { ...base, kind: 'unsupported', text: 'Node simulado indisponível neste navegador.' };
      const testSource = assessment.tests || item?.assessmentTests;
      const testPath = assessment.testPath || '__devpath_node_tests__.js';
      const runtimeFiles = files.filter(file => !/\.d\.ts$/i.test(file.path));
      const allFiles = testSource ? [...runtimeFiles, { path: testPath, content: testSource }] : runtimeFiles;
      const entryPath = testSource ? testPath : assessment.entryPath || runtimeFiles.find(file => /\.(?:m?js|jsx|ts|tsx)$/i.test(file.path))?.path;
      if (!entryPath) return { ...base, kind: 'error', text: textFor('error') };
      try {
        const graph = await global.DevPathModuleGraph.buildModuleGraph({ files: allFiles, entryPath, runtime: 'node-simulated', assertionCases: assessment.assertionCases || [] });
        const nodeOptions = { files: runtimeFiles, argv: assessment.argv || ['node-simulated', entryPath], env: assessment.env || {}, virtualCwd: assessment.virtualCwd || '' };
        const result = await new Promise(resolve => {
          let stop;
          let settled = false;
          const finish = value => { if (settled) return; settled = true; signal?.removeEventListener?.('abort', onAbort); resolve(value); };
          const onAbort = () => { stop?.(); finish({ kind: 'cancelled', text: textFor('cancelled') }); };
          signal?.addEventListener?.('abort', onAbort, { once: true });
          try { stop = global.DevPathCourseRunner.run({ module: graph.code, nodeRuntime: nodeOptions }, (kind, text, tests, node) => finish({ kind, text, tests, node }), { signal, caseRecords: assessment.assertionCases || [] }); }
          catch (error) { finish({ kind: 'error', text: error instanceof Error ? error.message : String(error) }); }
          if (signal?.aborted) onAbort();
        });
        if (result.kind === 'timeout' || result.kind === 'cancelled' || result.kind === 'error') return normalized(base, result.kind, result.text, result);
        const tests = result.tests;
        if (result.node?.exitCode && result.node.exitCode !== 0) return normalized(base, 'failed', `${result.text || 'O processo terminou com código diferente de zero.'}\nNode simulado · subset virtual`, result);
        if (!tests || tests.total < 1 || tests.failed > 0) return normalized(base, 'failed', `${result.text || 'A suíte falhou.'}\nNode simulado · subset virtual`, {...result, firstFailure: tests?.firstFailure});
        return normalized(base, 'passed', `${result.text || 'Avaliação concluída.'}\nNode simulado · subset virtual`, result);
      } catch (error) {
        if (error?.code === 'UNSUPPORTED' || /módulo Node não suportado|unsupported/i.test(String(error?.message || ''))) return normalized(base, 'unsupported', error instanceof Error ? error.message : String(error));
        return normalized(base, 'error', error instanceof Error ? error.message : String(error));
      }
    }
    if (assessment.checks.includes('behavior')) {
      if (!hasBehaviorDeclaration(assessment)) return { ...base, kind: 'unsupported', text: textFor('unsupported') };
      if (DOM_EXECUTABLE.has(assessment.environment)) {
        if (!global.DevPathDomRunner?.run) return { ...base, kind: 'unsupported', text: textFor('unsupported') };
        const entryPath = assessment.entryPath || files.find(file => /\.(?:m?js|jsx|ts|tsx)$/i.test(file.path))?.path;
        if (!entryPath) return { ...base, kind: 'error', text: textFor('error') };
        const domResult = await global.DevPathDomRunner.run({files, entryPath, testCode: typeof assessment.tests === 'string' ? assessment.tests : '', fixtures: assessment.fixtures || {}}, {signal, timeoutMs: assessment.timeoutMs, assertionCases: assessment.assertionCases || []});
        return normalized(base, domResult.kind, domResult.text, domResult);
      }
      if (!global.DevPathModuleGraph?.buildModuleGraph || !global.DevPathCourseRunner?.run) return { ...base, kind: 'unsupported', text: textFor('unsupported') };
      const testSource = assessment.tests || item?.assessmentTests;
      const testPath = assessment.testPath || '__devpath_tests__.js';
      const allFiles = testSource ? [...files, { path: testPath, content: testSource }] : files;
      const runtimeFiles = allFiles.filter(file => !/\.d\.ts$/i.test(file.path));
      const entryPath = testSource ? testPath : assessment.entryPath || files[0]?.path;
      if (!entryPath) return { ...base, kind: 'error', text: textFor('error') };
      const ext = /\.(?:m?js|jsx|ts|tsx)$/i.test(entryPath);
      if (!ext) return { ...base, kind: 'unsupported', text: textFor('unsupported') };
      try {
      const graph = await global.DevPathModuleGraph.buildModuleGraph({ files: runtimeFiles, entryPath, assertionCases: assessment.assertionCases || [] });
        if (signal?.aborted) return { ...base, kind: 'cancelled', text: textFor('cancelled') };
        const result = await new Promise(resolve => {
          let stop;
          let settled = false;
          const finish = value => { if (settled) return; settled = true; signal?.removeEventListener?.('abort', onAbort); resolve(value); };
          const onAbort = () => { stop?.(); finish({ kind: 'cancelled', text: textFor('cancelled') }); };
          signal?.addEventListener?.('abort', onAbort, { once: true });
          try { stop = global.DevPathCourseRunner.run({ module: graph.code }, (kind, text, tests) => finish({ kind, text, tests }), { signal, caseRecords: assessment.assertionCases || [] }); }
          catch (error) { finish({ kind: 'error', text: error instanceof Error ? error.message : String(error) }); }
          if (signal?.aborted) onAbort();
        });
        if (result.kind !== 'result') return normalized(base, result.kind === 'error' ? 'error' : result.kind, textFor(result.kind, result), result);
        const tests = result.tests;
        if (!tests || tests.total < 1 || tests.failed > 0) return normalized(base, 'failed', textFor('failed', result), {...result, firstFailure: tests?.firstFailure});
        return normalized(base, 'passed', textFor('passed', result), result);
      } catch (error) { return normalized(base, 'error', error instanceof Error ? error.message : String(error)); }
    }
    return { ...base, kind: 'unsupported', text: textFor('unsupported') };
  }
  global.DevPathAssessment = Object.freeze({ run, runStudentSuite, validateManifest, canonicalFingerprint, fingerprintFields: FINGERPRINT_FIELDS, editorialFields: EDITORIAL_FIELDS, fingerprintSchema: FINGERPRINT_SCHEMA, environments: [...ENVIRONMENTS], executableEnvironments: [...EXECUTABLE, ...NODE_EXECUTABLE] });
})(window);
