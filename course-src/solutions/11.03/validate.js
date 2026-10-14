export function validar({ nome, quantidade }) {
  const erros = {};
  const nomeNormalizado = typeof nome === 'string' ? nome.trim() : '';
  const textoQuantidade = quantidade == null ? '' : String(quantidade);
  const numero = Number(textoQuantidade);
  if (!nomeNormalizado) erros.nome = 'Informe o nome.';
  if (!Number.isInteger(numero) || numero <= 0) erros.quantidade = 'Use um inteiro positivo.';
  if (Object.keys(erros).length) return { ok: false, erros, valores: { nome, quantidade } };
  return { ok: true, nome: nomeNormalizado, quantidade: numero };
}
