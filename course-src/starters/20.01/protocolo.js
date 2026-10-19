// Contrato visível 20.01:
// Exporte percorrer(): {primeira:number[], depois:number, segunda:number[], chamadas:number}.
// A coleta produz primeira=[1,2], depois=3, segunda=[], chamadas=4; o mesmo iterador é consumível uma vez e done:true encerra a coleta.

// 20.01 · Protocolo iterável passo a passo.
// Antes de executar, preencha a tabela: quantas chamadas a next(), o par {done, value} de cada uma
// e quais valores chegam ao corpo do for...of.

const resultados = [
  { value: 1, done: false },
  { value: 2, done: false },
  { value: "fim", done: true },
];

let chamadas = 0;
const iterador = {
  next() {
    const resultado = resultados[chamadas] ?? { value: undefined, done: true };
    chamadas++;
    console.log(`next #${chamadas}`, JSON.stringify(resultado));
    return resultado;
  },
  [Symbol.iterator]() {
    return this;
  },
};

for (const valor of iterador) {
  console.log("corpo recebeu", valor);
}
console.log("total de chamadas", chamadas);

// Previsão para um segundo for...of sobre o MESMO iterador já consumido: ___
for (const valor of iterador) {
  console.log("segunda volta recebeu", valor);
}

// Tabela prevista:
// chamada | done | value | chega ao corpo?
// 1       | ___  | ___   | ___
// 2       | ___  | ___   | ___
// 3       | ___  | ___   | ___

// Instrumento de observação para registrar a sequência descrita.
export function percorrer() {
  const itens = [{value:1,done:false},{value:2,done:false},{value:"fim",done:true}];
  let chamadas = 0;
  const iterador = {next() { const resultado = itens[chamadas] ?? {value:undefined,done:true}; chamadas++; return resultado; }, [Symbol.iterator]() { return this; }};
  const primeira = [...iterador];
  const depois = chamadas;
  const segunda = [...iterador];
  return {primeira,depois,segunda,chamadas};
}
