export function criarContadores() {
  function make() {
    let n = 0;
    return {inc() {n++;}, read() {return n;}};
  }
  const a = make();
  const b = make();
  a.inc();
  return {a: a.read(), b: b.read()};
}

console.log(JSON.stringify(criarContadores()));
