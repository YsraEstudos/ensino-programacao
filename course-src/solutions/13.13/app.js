export function montarWidget(document) {
  const form = document.querySelector('#f'); const input = document.querySelector('#text'); const list = document.querySelector('#list'); const error = document.querySelector('#error');
  form.addEventListener('submit', event => { event.preventDefault(); if (!input.value.trim()) { error.textContent = 'Campo obrigatório'; input.focus(); return; } error.textContent = ''; const li = document.createElement('li'); li.textContent = input.value; const remove = document.createElement('button'); remove.type = 'button'; remove.textContent = 'Remover'; li.append(remove); list.append(li); input.value = ''; });
  list.addEventListener('click', event => { const button = event.target.closest('button'); if (button && list.contains(button)) button.closest('li')?.remove(); });
}
