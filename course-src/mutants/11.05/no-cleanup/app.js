let lista = null; let acoes = 0; let cleanup;
export function mount(root = document) { lista = root.querySelector('#lista'); acoes = 0; cleanup = null; }
export function render(itens) { cleanup?.(); lista.replaceChildren(); for (const item of itens) { const b = document.createElement('button'); b.textContent = item; lista.append(b); } const fn = e => { if (e.target.closest('button')) acoes += 1; }; lista.addEventListener('click', fn); cleanup = () => {}; }
export function destroy() { lista?.replaceChildren(); lista = null; }
export const getAcoes = () => acoes;
