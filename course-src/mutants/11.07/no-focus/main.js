const form = document.querySelector('#reserva'); const email = document.querySelector('#email'); const erro = document.querySelector('#erro'); const resultado = document.querySelector('#resultado');
form.addEventListener('submit', event => { event.preventDefault(); if (!email.value.includes('@')) { erro.textContent = 'E-mail inválido'; return; } resultado.textContent = email.value; });
