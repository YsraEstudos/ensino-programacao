export function parsearLinhaCsv(linha) {
  if (typeof linha !== 'string') throw new TypeError('A linha CSV deve ser texto.');

  const campos = [];
  let campo = '';
  let dentroDeAspas = false;
  let aspasFechadas = false;

  for (let indice = 0; indice < linha.length; indice += 1) {
    const caractere = linha[indice];

    if (dentroDeAspas) {
      if (caractere !== '"') {
        campo += caractere;
      } else if (linha[indice + 1] === '"') {
        campo += '"';
        indice += 1;
      } else {
        dentroDeAspas = false;
        aspasFechadas = true;
      }
      continue;
    }

    if (aspasFechadas) {
      if (caractere !== ',') throw new SyntaxError(`Caractere inesperado após as aspas na posição ${indice}.`);
      campos.push(campo);
      campo = '';
      aspasFechadas = false;
      continue;
    }

    if (caractere === ',') {
      campos.push(campo);
      campo = '';
    } else if (caractere === '"') {
      if (campo.length !== 0) throw new SyntaxError(`Aspas inesperadas na posição ${indice}.`);
      dentroDeAspas = true;
    } else {
      campo += caractere;
    }
  }

  if (dentroDeAspas) throw new SyntaxError(`Campo sem aspas de fechamento na posição ${linha.length}.`);
  campos.push(campo);
  return campos;
}
