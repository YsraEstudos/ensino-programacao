export function tracarEscopo() {
  const fora = 1;
  {
    let bloco = 2;
    function f() {
      const dentro = 3;
      return {dentro, soma: fora + bloco + dentro};
    }
    const {dentro, soma} = f();
    return {fora, bloco, dentro, soma};
  }
}

console.log(JSON.stringify(tracarEscopo()));
