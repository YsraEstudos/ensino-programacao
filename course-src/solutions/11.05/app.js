const lista = document.querySelector('#lista');
let acoes = 0;
let cleanup = null;
export function render(itens) {
  cleanup?.();
  lista.replaceChildren();
  for (const item of itens) { const botao = document.createElement('button'); botao.textContent = item; lista.append(botao); }
  const aoClicar = event => { if (event.target.closest('button')) acoes += 1; };
  lista.addEventListener('click', aoClicar);
  cleanup = () => lista.removeEventListener('click', aoClicar);
}
export function destroy() { cleanup?.(); cleanup = null; lista.replaceChildren(); }
export const getAcoes = () => acoes;
