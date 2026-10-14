export function tracarEscopo() {
  const fora = 1;
  let bloco;
  let dentro;
  {
    bloco = 2;
    function f() {
      dentro = 3;
      return fora + bloco + dentro;
    }
    f();
  }
  return {fora, bloco, dentro, soma: fora + bloco + dentro};
}

console.log(JSON.stringify(tracarEscopo()));
