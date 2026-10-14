export function taxaDeEntrega(tipo) {
  if (typeof tipo !== 'string' || tipo.trim() === '') {
    throw new TypeError('tipo deve ser uma string não vazia');
  }
  if (tipo === 'comum') return 0.1;
  if (tipo === 'expressa') return 0.25;
  return null;
}
