export function observarAliasing() {
  const base = {pontos: 1, meta: {ativo: true}};
  const alias = base;
  const copia = {...base};
  alias.pontos = 2;
  copia.meta.ativo = false;
  return {pontos: base.pontos, ativo: base.meta.ativo, mesmaRaiz: base === copia, mesmoMeta: base.meta === copia.meta};
}

console.log(JSON.stringify(observarAliasing()));
