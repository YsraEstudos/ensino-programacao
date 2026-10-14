(function (global) {
    'use strict';
    const escape = value => String(value).replace(/[&<>"']/g, char => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[char]));
    // Historical fields stay under their original keys; opening this panel never migrates a submission.
    function render(item, progress = {}) {
        if (!/^(?:D|\d{2})\.\d{2}$/.test(item?.id || '')) return '';
        const current = Number(item.contentVersion || 1);
        if (!Number.isInteger(current) || current <= 1) return '';
        const fields = [['exerciseDrafts', 'Rascunho salvo'], ['exercisePredictions', 'Previsão salva'], ['exerciseReflections', 'Reflexão salva']];
        const versions = new Map();
        for (const [field, label] of fields) {
            for (const [key, value] of Object.entries(progress[field] || {})) {
                const version = key === item.id ? 1 : key.startsWith(item.id + '@v') && /^\d+$/.test(key.slice(item.id.length + 2)) ? Number(key.slice(item.id.length + 2)) : 0;
                if (version < 1 || version >= current || typeof value !== 'string' || !value) continue;
                const entries = versions.get(version) || [];
                entries.push(`<h4>${label}</h4><pre><code>${escape(value)}</code></pre>`);
                versions.set(version, entries);
            }
        }
        if (!versions.size) return '';
        const rows = [...versions].sort(([a], [b]) => b - a).map(([version, entries]) => `<section><h3>Versão ${version}</h3>${entries.join('')}</section>`).join('');
        return `<details class="course-prior-attempts" data-learning-example><summary>Consultar respostas de versões anteriores</summary><p>Estes registros pertencem a versões anteriores da atividade e estão somente para consulta. A tentativa atual tem seus próprios arquivos, previsão e reflexão.</p>${rows}</details>`;
    }
    global.DevPathPriorAttempts = Object.freeze({render});
})(typeof globalThis !== 'undefined' ? globalThis : window);
