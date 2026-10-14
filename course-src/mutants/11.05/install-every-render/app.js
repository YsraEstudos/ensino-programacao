const lista = document.querySelector('#lista'); let acoes = 0;
export function render(itens) { lista.replaceChildren(); for (const item of itens) { const b = document.createElement('button'); b.textContent = item; lista.append(b); } lista.addEventListener('click', e => { if (e.target.closest('button')) acoes += 1; }); }
export function destroy() { lista.replaceChildren(); }
export const getAcoes = () => acoes;
