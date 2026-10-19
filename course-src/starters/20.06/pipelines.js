// Contrato visível 20.06:
// Exporte manualPipeline(iteravel): generator; take(iteravel,count): array; run(): {values:number[],pulls:number,zero:number[]}.
// run usa [1,2,3,4,5], filtra pares, dobra e pega dois: values=[4,8], pulls=4, zero=[]. take(iteravel,0) não consome a fonte.

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
export function* manualPipeline(iteravel) {
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


// API pública visível 20.06
export function take(iteravel, count) { /* TODO: retornar no máximo count valores sem consumir quando count é zero. */ return []; }
export function run() { /* TODO: usar a fonte descrita acima. */ return {values: [], pulls: 0, zero: []}; }
