const lista = document.querySelector('#lista'); let acoes = 0; let cleanup;
export function render(itens) { cleanup?.(); lista.replaceChildren(); for (const item of itens) { const b = document.createElement('button'); b.textContent = item; lista.append(b); } const fn = e => { if (e.target.closest('button')) acoes += 1; }; lista.addEventListener('click', fn); cleanup = () => {}; }
export function destroy() { lista.replaceChildren(); }
export const getAcoes = () => acoes;
