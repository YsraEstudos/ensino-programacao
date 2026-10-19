/** @typedef {'BRL'|'USD'} Moeda */
/** @param {number} centavos @param {Moeda} [moeda] @returns {string} */
export function centavosParaTexto(centavos,moeda='BRL'){if(!Number.isSafeInteger(centavos))throw new RangeError('centavos precisa ser inteiro seguro');return new Intl.NumberFormat('pt-BR',{style:'currency',currency:moeda}).format(centavos/100);}
/** @param {readonly number[]} valores @returns {number} */
export function somarCentavos(valores){let total=0;for(const valor of valores){if(!Number.isSafeInteger(valor)||!Number.isSafeInteger(total+valor))throw new RangeError('centavos precisam ser inteiros seguros');total+=valor;}return total;}
