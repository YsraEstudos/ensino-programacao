// 21.02 · Setup e cleanup de timer e listener.
// `alvo` faz o papel de um elemento da página (EventTarget também existe fora do DOM).
// Reordene os blocos em montar() e desmontar(). Um bloco cria uma função nova e quebra a remoção: deixe-o de fora.

const alvo = new EventTarget();
const estado = { timer: null, ativos: 0 };

function aoClicar() {
  console.log("clique tratado");
}

/* Blocos (embaralhados)
[A] alvo.removeEventListener("click", aoClicar);
[B] estado.timer = setInterval(() => {}, 1000);
[C] clearInterval(estado.timer); estado.timer = null;
[D] alvo.addEventListener("click", aoClicar);
[E] alvo.removeEventListener("click", () => aoClicar());
[F] if (estado.timer !== null) return;      // montar duas vezes não duplica
[G] if (estado.timer === null) return;      // desmontar duas vezes é seguro
*/

function montar() {
  // blocos de setup
}

function desmontar() {
  // blocos de cleanup
}

montar();
montar();
alvo.dispatchEvent(new Event("click")); // esperado: um único "clique tratado"
desmontar();
desmontar();
alvo.dispatchEvent(new Event("click")); // esperado: nada
console.log("timer ativo?", estado.timer !== null); // esperado: false
