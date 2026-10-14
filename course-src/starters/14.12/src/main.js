import { soma } from './math.js';
import './style.css';
import { mostrarDetalhe } from './details.js';
document.querySelector('#result').textContent = String(soma(2, 3));
document.querySelector('#details').addEventListener('click', mostrarDetalhe);
