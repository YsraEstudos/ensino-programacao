// 20.06 · Pipeline manual com generators versus iterator helpers.
// Preveja o resultado e quantos itens cada versão pede à fonte antes de executar.

function criarFonte() {
  const contador = { pulls: 0 };
  function* source() {
    for (const value of [1, 2, 3, 4, 5]) {
      contador.pulls++;
      yield value;
    }
  }
  return { contador, source };
}

// Versão manual: filter par, map dobro, take 2, sem materializar arrays.
function* manualPipeline(iteravel) {
  // TODO
}

const manual = criarFonte();
console.log("manual", [...manualPipeline(manual.source())], "pulls", manual.contador.pulls);

// Versão com helpers (confira se o runtime alvo tem Iterator.from antes de recomendar).
if (typeof Iterator !== "undefined" && typeof Iterator.from === "function") {
  const helpers = criarFonte();
  const resultado = Iterator.from(helpers.source()).filter((n) => n % 2 === 0).map((n) => n * 2).take(2);
  console.log("helpers", [...resultado], "pulls", helpers.contador.pulls);
} else {
  console.log("Iterator helpers indisponíveis neste runtime: use a versão manual.");
}

// Compare com arrays (eager):
const ansioso = criarFonte();
console.log("array", [...ansioso.source()].filter((n) => n % 2 === 0).map((n) => n * 2).slice(0, 2), "pulls", ansioso.contador.pulls);
// Previsões: manual ___ pulls, helpers ___ pulls, array ___ pulls. E com take(0)? ___
