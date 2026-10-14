const email = document.querySelector('#email'); const resultado = document.querySelector('#resultado');
document.querySelector('#enviar').addEventListener('click', () => { resultado.textContent = email.value; });
