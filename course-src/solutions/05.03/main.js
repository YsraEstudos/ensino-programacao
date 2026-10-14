export function slug(titulo) {
  const limpo = titulo.trim();
  const minusculo = limpo.toLowerCase();
  const partes = minusculo.split(" ");
  const validas = partes.filter(parte => parte !== "");
  return validas.join("-");
}

console.log(slug("Dragão Azul"));
