export function rotuloItens(n) {
  const categoria = new Intl.PluralRules('pt-BR').select(n);
  return `${n} ${categoria === 'one' ? 'item' : 'itens'}`;
}

export function tempoRelativo(dias) {
  return new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' }).format(dias, 'day');
}
