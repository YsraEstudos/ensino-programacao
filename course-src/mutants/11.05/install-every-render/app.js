let lista = null; let acoes = 0;
export function mount(root = document) { lista = root.querySelector('#lista'); acoes = 0; }
export function render(itens) { lista.replaceChildren(); for (const item of itens) { const b = document.createElement('button'); b.textContent = item; lista.append(b); } lista.addEventListener('click', e => { if (e.target.closest('button')) acoes += 1; }); }
export function destroy() { lista?.replaceChildren(); lista = null; }
export const getAcoes = () => acoes;
