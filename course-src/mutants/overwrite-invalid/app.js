export function carregar(storage, warn = () => {}) { try { return JSON.parse(storage.getItem('kanban:v1')); } catch { storage.setItem('kanban:v1', JSON.stringify({version: 1, tasks: []})); warn('JSON inválido'); return {version: 1, tasks: []}; } }
export function mover(state, id, status) { return {...state, tasks: state.tasks.map(t => t.id === id ? {...t, status} : t)}; }
export function renderizar(document, state, list) { list.replaceChildren(...state.tasks.map(t => { const item=document.createElement('li'); item.textContent=t.text; return item; })); }
export function salvar(storage, state) { storage.setItem('kanban:v1', JSON.stringify(state)); }
