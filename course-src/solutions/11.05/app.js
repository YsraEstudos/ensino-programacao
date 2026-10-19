let lista = null;
let acoes = 0;
let cleanup = null;

export function mount(root = document) {
  destroy();
  lista = root.querySelector('#lista');
  if (!lista) throw new Error('Lista ausente.');
  acoes = 0;
  const aoClicar = event => {
    if (event.target.closest('button') && lista.contains(event.target)) acoes += 1;
  };
  lista.addEventListener('click', aoClicar);
  cleanup = () => lista.removeEventListener('click', aoClicar);
}

export function render(itens) {
  if (!lista) throw new Error('Monte a lista antes de renderizar.');
  lista.replaceChildren();
  for (const item of itens) {
    const botao = document.createElement('button');
    botao.textContent = item;
    lista.append(botao);
  }
}

export function destroy() {
  cleanup?.();
  cleanup = null;
  lista?.replaceChildren();
  lista = null;
}

export const getAcoes = () => acoes;
