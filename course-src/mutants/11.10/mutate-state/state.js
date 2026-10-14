export function carregar(storage) { try { return JSON.parse(storage.getItem('kanban:v1')); } catch { return {version: 1, tasks: []}; } }
export function mover(state, id, status) { const task=state.tasks.find(t=>t.id===id); if(task) task.status=status; return state; }
export function salvar(storage, state) { storage.setItem('kanban:v1', JSON.stringify(state)); }
