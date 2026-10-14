import {somar} from './math.js';
import './style.css';
document.querySelector('#resultado').textContent = `Total: ${somar(2, 3)}`;
document.querySelector('#detalhes').addEventListener('click', async () => {
  const {descrever} = await import('./details.js');
  document.querySelector('#resultado').textContent = descrever(5);
});
