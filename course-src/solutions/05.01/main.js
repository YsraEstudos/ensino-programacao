export function observarReferencias() {
  const a = [1, 2];
  const b = a;
  const c = a.slice();
  a.push(3);
  b.pop();
  return {a, b, c, mesmaRaiz: a === b, copiaIndependente: a !== c};
}

console.log(JSON.stringify(observarReferencias()));
