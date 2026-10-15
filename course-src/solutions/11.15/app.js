import { validarInscricao } from './regras.js';

const form = document.querySelector('#inscricao');
const nome = document.querySelector('#nome');
const oficina = document.querySelector('#oficina');
const status = document.querySelector('#status');
const lista = document.querySelector('#lista');

form.addEventListener('submit', event => {
  event.preventDefault();
  const resultado = validarInscricao({ nome: nome.value, oficina: oficina.value });
  if (!resultado.ok) {
    status.textContent = resultado.erros[0];
    nome.focus();
    return;
  }
  const item = document.createElement('li');
  item.textContent = `${resultado.nome} · ${resultado.oficina}`;
  lista.append(item);
  status.textContent = `Inscrição de ${resultado.nome} registrada.`;
  nome.value = '';
  nome.focus();
});
