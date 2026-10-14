export function montarItem(lista, mensagem) {
  const item = document.createElement('li'); item.innerHTML = mensagem;
  const botao = document.createElement('button'); botao.type = 'button'; botao.textContent = 'Remover';
  botao.addEventListener('click', () => lista.remove()); item.append(botao); lista.append(item); return item;
}
