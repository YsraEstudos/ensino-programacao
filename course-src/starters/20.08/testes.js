// 20.08 · Testes da pipeline lazy. Escreva primeiro sua hipótese e o teste; depois implemente pipeline.js.
import { pipeline } from "./pipeline.js";

function verificar(nome, obtido, esperado) {
  const ok = JSON.stringify(obtido) === JSON.stringify(esperado);
  console.log(`${ok ? "ok  " : "FALHOU"} ${nome}: ${JSON.stringify(obtido)}${ok ? "" : ` (esperado ${JSON.stringify(esperado)})`}`);
}

// Coleta no máximo `limite` valores: protege os testes de um take ainda não implementado sobre fonte infinita.
function coletar(iteravel, limite = 50) {
  const saida = [];
  for (const valor of iteravel) {
    saida.push(valor);
    if (saida.length >= limite) break;
  }
  return saida;
}

function contarPulls(iteravel) {
  const contador = { pulls: 0 };
  function* instrumentada() {
    for (const valor of iteravel) {
      contador.pulls++;
      yield valor;
    }
  }
  return { contador, fonte: instrumentada() };
}

function* naturais() {
  for (let n = 1; ; n++) yield n;
}

// Hipótese: quantos pulls para o primeiro teste? ___
const a = contarPulls(naturais());
verificar("fonte infinita", coletar(pipeline(a.fonte).map((x) => x * 2).filter((x) => x > 3).take(2)), [4, 6]);
verificar("pulls do primeiro teste", a.contador.pulls, 3);

const b = contarPulls(naturais());
verificar("take(0)", coletar(pipeline(b.fonte).take(0)), []);
verificar("take(0) não lê a fonte", b.contador.pulls, 0);

function* falhaNoSexto() {
  for (let n = 1; n <= 5; n++) yield n;
  throw new Error("fonte falhou");
}
let antesDaFalha;
try {
  antesDaFalha = coletar(pipeline(falhaNoSexto()).take(2));
} catch (erro) {
  antesDaFalha = `lançou: ${erro.message}`;
}
verificar("termina antes da falha", antesDaFalha, [1, 2]);

// Seu teste autoral (por exemplo: duas iterações da mesma pipeline criam cursores independentes?):
