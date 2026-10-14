const form = document.querySelector('#reserva');
const email = document.querySelector('#email');
const erro = document.querySelector('#erro');
const resultado = document.querySelector('#resultado');
form.addEventListener('submit', event => {
  event.preventDefault();
  const valid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value);
  if (!valid) { erro.textContent = 'E-mail inválido'; email.focus(); return; }
  erro.textContent = ''; resultado.textContent = `Reserva para ${email.value}`; resultado.focus();
});
