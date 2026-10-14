export function createStore(initial) {
  let estado = initial;
  const assinantes = new Set();
  return {
    getState() {
      return estado;
    },
    setState(proximo) {
      if (Object.is(estado, proximo)) return;
      estado = proximo;
      for (const assinante of [...assinantes]) assinante(estado);
    },
    subscribe(fn) {
      assinantes.add(fn);
      return () => {
        assinantes.delete(fn);
      };
    },
  };
}
