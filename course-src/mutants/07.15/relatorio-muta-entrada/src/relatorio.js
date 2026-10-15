import { multaCentavos, temMulta } from './regras.js';

// Entrada: [{ id, diasAtraso }]. Saída: linhas com multa, da maior para a menor; empates por id.
export function relatorioMultas(emprestimos) {
  emprestimos.sort((a, b) => a.id.localeCompare(b.id));
  const linhas = emprestimos
    .filter(emprestimo => temMulta(emprestimo.diasAtraso))
    .map(emprestimo => ({ id: emprestimo.id, diasAtraso: emprestimo.diasAtraso, multaCentavos: multaCentavos(emprestimo.diasAtraso) }))
    .sort((a, b) => b.multaCentavos - a.multaCentavos || a.id.localeCompare(b.id));
  const totalCentavos = linhas.reduce((soma, linha) => soma + linha.multaCentavos, 0);
  return { linhas, totalCentavos };
}
