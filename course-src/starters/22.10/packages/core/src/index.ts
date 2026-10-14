// Trilha opcional · core: biblioteca consumida por app via Project References.
export type Item = { sku: string; preco: number };

export function total(itens: readonly Item[]): number {
  return itens.reduce((soma, item) => soma + item.preco, 0);
}
