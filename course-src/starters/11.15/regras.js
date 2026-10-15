export const OFICINAS = ['ceramica', 'xadrez'];

// Valida a inscrição. Não lê nem escreve no DOM.
export function validarInscricao({ nome, oficina }) {
  const erros = [];
  const limpo = String(nome ?? '').trim();
  if (limpo === '') erros.push('Informe o nome.');
  if (limpo.length > 40) erros.push('O nome pode ter até 40 caracteres.');
  if (!OFICINAS.includes(oficina)) erros.push('Escolha uma oficina da lista.');
  return erros.length ? { ok: false, erros } : { ok: true, nome: limpo, oficina };
}
