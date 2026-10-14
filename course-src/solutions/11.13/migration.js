const statuses = new Set(['todo', 'doing', 'done']);
function validTask(task) { return task && typeof task.id === 'string' && typeof task.text === 'string' && statuses.has(task.status); }
function copyTask(task, priority = 'normal') { return { id: task.id, text: task.text, status: task.status, priority: ['low', 'normal', 'high'].includes(task.priority) ? task.priority : priority }; }
export function migrarV1ParaV2(entrada) {
  if (entrada?.version === 2) return { version: 2, tasks: (entrada.tasks || []).filter(validTask).map(task => copyTask(task)) };
  if (entrada?.version !== 1 || !Array.isArray(entrada.tasks)) return { version: 2, tasks: [] };
  return { version: 2, tasks: entrada.tasks.filter(validTask).map(task => copyTask(task)) };
}
export function carregar(entrada, avisos = []) {
  let value = entrada;
  if (entrada && typeof entrada.getItem === 'function') {
    const raw = entrada.getItem('kanban:v1');
    if (raw == null) return { version: 2, tasks: [] };
    try { value = JSON.parse(raw); } catch { avisos.push('JSON inválido'); return { version: 2, tasks: [] }; }
  } else if (typeof entrada === 'string') {
    try { value = JSON.parse(entrada); } catch { avisos.push('JSON inválido'); return { version: 2, tasks: [] }; }
  }
  if (value?.version === 2) return { version: 2, tasks: (value.tasks || []).filter(task => { const ok = validTask(task); if (!ok) avisos.push('registro inválido'); return ok; }).map(task => copyTask(task)) };
  if (value?.version === 1) return { version: 2, tasks: (value.tasks || []).filter(task => { const ok = validTask(task); if (!ok) avisos.push('registro inválido'); return ok; }).map(task => copyTask(task)) };
  avisos.push('versão inválida'); return { version: 2, tasks: [] };
}
