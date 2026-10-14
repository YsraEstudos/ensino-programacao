export type Produto={nome:string; apelido?:string};
export function primeiroNome(lista: string[]): string { const primeiro=lista[0]; if (primeiro === undefined) throw new RangeError('Catálogo vazio'); return primeiro.toUpperCase(); }
export function semApelido(produto: Produto): Produto { const {apelido: _apelido, ...sem}=produto; return sem; }
export function rotulo(produto:Produto):string { return (produto.apelido ?? produto.nome).trim(); }
