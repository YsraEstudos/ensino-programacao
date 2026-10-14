const obj = {
  x: 2,
  metodo() {return this.x;},
  arrow: () => this?.x,
};
const solto = obj.metodo;

export function compararThis() {
  let soltoResultado;
  try { soltoResultado = solto(); }
  catch (error) { soltoResultado = error.name; }
  return {
    metodo: obj.metodo(),
    call: obj.metodo.call({x: 7}),
    solto: soltoResultado,
    arrowCall: String(obj.arrow.call({x: 7})),
  };
}

console.log(JSON.stringify(compararThis()));
