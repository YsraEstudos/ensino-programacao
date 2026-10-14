const key = 'kanban:v1';
export function carregar(storage) { try { const value = JSON.parse(storage.getItem(key)); return value?.version === 1 && Array.isArray(value.tasks) ? value : {version: 1, tasks: []}; } catch { return {version: 1, tasks: []}; } }
export function mover(state, id, status) { if (!['todo', 'doing', 'done'].includes(status)) throw new RangeError('status'); return {...state, tasks: state.tasks.map(task => task.id === id ? {...task, status} : task)}; }
export function salvar(storage, state) { storage.setItem(key, JSON.stringify(state)); }
