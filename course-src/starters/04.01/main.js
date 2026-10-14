export function preverRetornos() {
  function a() { return 2; }
  function b() { 2; }
  function c(x) { return x * 2; }
  function d(x) { if (x > 0) return x; }
  function e() { return null; }
  function f() { return; }
  const g = x => x + 1;
  const h = x => { x + 1; };
  return {a: a(), b: b(), c: c(3), dPositivo: d(4), dNegativo: d(-1), e: e(), f: f(), g: g(1), h: h(1)};
}

const resultado = preverRetornos();
console.log(JSON.stringify(Object.fromEntries(Object.entries(resultado).map(([chave, valor]) => [chave, valor === undefined ? "undefined" : valor]))));
