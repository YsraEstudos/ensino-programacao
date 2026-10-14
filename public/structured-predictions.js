(function (global) {
  'use strict';
  const utils = global.DevPathTeachingUtils || {};
  const esc = value => utils.escapeHTML ? utils.escapeHTML(String(value ?? '')) : String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function parse(saved, table) {
    if (!saved) return {version: null, answers: {}, state: 'empty', compatible: false, legacyText: ''};
    let value;
    try { value = typeof saved === 'string' ? JSON.parse(saved) : saved; }
    catch { return {version: null, answers: {}, state: 'legacy', compatible: false, legacyText: String(saved)}; }
    if (!value || typeof value !== 'object' || !value.answers || typeof value.answers !== 'object' || !Number.isFinite(Number(value.version)))
      return {version: null, answers: {}, state: 'legacy', compatible: false, legacyText: String(saved)};
    const version = Number(value.version);
    const compatible = !table || version === (Number(table.version) || 1);
    return {version, answers: value.answers, state: compatible ? 'current' : 'version-mismatch', compatible, legacyText: String(saved)};
  }
  function serialize(table, answers) {
    return JSON.stringify({version: Number(table?.version) || 1, answers: Object.fromEntries((table?.fields || []).map(field => [field.id, String(answers?.[field.id] ?? '').trim()]))});
  }
  function renderForm(table, saved) {
    const parsed = parse(saved, table);
    const answers = parsed.compatible ? parsed.answers : {};
    const fields = (table?.fields || []).map(field => {
      const id = String(field.id || '');
      const controlId = `prediction-${id.replace(/[^a-zA-Z0-9_-]/g, '-')}`;
      return `<label class="prediction-field" for="${esc(controlId)}"><span>${esc(field.label || id)}</span><input id="${esc(controlId)}" type="text" maxlength="500" autocomplete="off" data-prediction-field="${esc(id)}" value="${esc(answers[id] || '')}"></label>`;
    }).join('');
    return `<section class="structured-prediction" data-structured-prediction="${esc(table?.version || 1)}"><p>${esc(table?.instructions || 'Registre sua previsão antes de executar.')}</p><div class="prediction-fields">${fields}</div></section>`;
  }
  function renderSaved(table, saved) {
    const parsed = parse(saved, table);
    if (!parsed.compatible) {
      const heading = parsed.state === 'version-mismatch' ? `Sua previsão usa a versão ${parsed.version}; este exercício agora usa a versão ${Number(table?.version) || 1}.` : 'Sua resposta foi registrada em formato livre e foi preservada.';
      return `<div class="prediction-legacy" role="status"><strong>Resposta anterior preservada</strong><p>${esc(heading)}</p><pre>${esc(parsed.legacyText)}</pre></div>`;
    }
    const answers = parsed.answers;
    return `<dl class="structured-prediction-saved">${(table?.fields || []).map(field => `<div><dt>${esc(field.label || field.id)}</dt><dd>${esc(answers[field.id] || '')}</dd></div>`).join('')}</dl>`;
  }
  function read(root) {
    if (!root?.querySelectorAll) return null;
    const answers = {};
    for (const input of root.querySelectorAll('[data-prediction-field]')) answers[input.dataset.predictionField] = input.value;
    return Object.values(answers).some(value => String(value).trim()) ? answers : null;
  }
  function lookup(value, path) {
    const parts = String(path).match(/\[\*\]|[^.[\]]+/g) || [];
    return parts.reduce((current, part) => {
      if (current == null) return undefined;
      if (part === '[*]') return Array.isArray(current) ? current : undefined;
      return Array.isArray(current) ? current.map(entry => entry?.[part]) : current[part];
    }, value);
  }
  function parseOutput(table, text) {
    if (table?.outputFormat === 'lines' && (table.fields || []).length === 1) {
      const lines = String(text || '').split(/\r?\n/).map(line => line.trim()).filter(Boolean);
      return {[table.fields[0].id]: lines.join(',')};
    }
    const candidates = String(text || '').split(/\r?\n/).map(line => line.trim()).filter(line => line.startsWith('{') || line.startsWith('['));
    const fields = table?.fields || [];
    let best = null;
    let bestScore = -1;
    for (const candidate of candidates) {
      try {
        const value = JSON.parse(candidate);
        const score = fields.reduce((total, field) => total + (Array.isArray(value) && fields.length === 1 && !field.path || lookup(value, field.path || field.id) !== undefined ? 1 : 0), 0);
        if (score > bestScore) { best = value; bestScore = score; }
      } catch { /* try the next structured output line */ }
    }
    return best;
  }
  function normalize(value) {
    if (value === undefined) return 'undefined';
    if (typeof value === 'string') return value.trim();
    return JSON.stringify(value);
  }
  function compare(table, saved, output) {
    const parsed = parse(saved, table);
    if (!parsed.compatible) return {matched: 0, total: (table?.fields || []).length, answered: 0, complete: false, compatible: false, rows: []};
    const answers = parsed.answers;
    const actual = parseOutput(table, output);
    const rows = (table?.fields || []).map(field => {
      const expected = String(answers[field.id] ?? '').trim();
      const path = field.path || field.id;
      const observed = actual == null ? '(saída estruturada não encontrada)' : normalize(Array.isArray(actual) && (table?.fields || []).length === 1 && !field.path ? actual : lookup(actual, path));
      return {id: field.id, label: field.label || field.id, expected, observed, matched: expected !== '' && expected === observed};
    });
    const answered = rows.filter(row => row.expected !== '').length;
    return {matched: rows.filter(row => row.matched).length, total: rows.length, answered, complete: answered === rows.length, compatible: true, rows};
  }
  global.DevPathStructuredPredictions = Object.freeze({parse, serialize, renderForm, renderSaved, read, compare});
})(window);
