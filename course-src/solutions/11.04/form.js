export function lerInscricao(form) {
  const dados = new FormData(form);
  const nome = dados.get('nome');
  const quantidadeTexto = dados.get('quantidade');
  const interesses = dados.getAll('interesse');
  const nomeNormalizado = typeof nome === 'string' ? nome.trim() : '';
  const numero = Number(quantidadeTexto);
  const erros = {};
  if (!nomeNormalizado) erros.nome = 'Informe o nome.';
  if (!Number.isInteger(numero) || numero <= 0) erros.quantidade = 'Use um inteiro positivo.';
  if (Object.keys(erros).length) return { ok: false, erros, valores: { nome, quantidade: quantidadeTexto, interesses } };
  return { ok: true, nome: nomeNormalizado, quantidade: numero, interesses: [...interesses] };
}
