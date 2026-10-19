// Gate: imports das suítes e formatos decisivos devem estar visíveis no starter ou no prompt.
// Base: docs/auditoria-atividades-2026-10-13/contrato-oculto.mjs.
import { indexById, namedImports, starterText, suiteFor, suiteIds, wordRegExp } from "./gate-common.mjs";

export const GATE = "gate-contrato-oculto";

// Contratos de formato que a inspeção de imports nomeados não consegue ver.
// Cada regra descreve uma condição observada na suíte publicada e deve constar
// do enunciado; os testes focais executam referência e regressões comportamentais.
const rule = (label, ...requirements) => [label, requirements];

export const FORMAT_RULES = {
  "11.03": [
    rule("assinatura validar", /validar\s*\(\s*\{\s*nome\s*,\s*quantidade\s*\}\s*\)/),
    rule("retorno de falha com valores originais", /ok\s*:\s*false/, /\berros\b/, /valores\s*:\s*\{\s*nome\s*,\s*quantidade\s*\}/),
  ],
  "11.08": [
    rule("montagem e estado observável", /montarKanban\s*\(\s*document\s*,\s*storage\s*\)/, /getState\s*\(\s*\)/),
    rule("formato V1 e estados", /version\s*:\s*1/, /\btasks\b/, /\bid\b/, /\btext\b/, /\bstatus\b/, /\btodo\b/, /\bdoing\b/, /\bdone\b/),
    rule("status inválido", /(?:status\s+(?:desconhecido|inválido|fora dos estados)[^.!?]{0,80}RangeError|RangeError[^.!?]{0,80}status\s+(?:desconhecido|inválido|fora dos estados))/i),
    rule("persistência e JSON inválido", /kanban:v1/i, /(?:JSON inválido|JSON corrompido)/i, /(?:sem sobrescrever|não sobrescreva|preserve os bytes|sem gravar)/i),
  ],
  "11.13": [
    rule("assinatura do loader e avisos", /carregar\s*\(\s*entrada\s*,\s*avisos\s*=\s*\[\s*\]\s*\)/),
    rule("formato V1 para V2", /version\s*:\s*1/, /\btasks\b/, /version\s*:\s*2/, /\bpriority\b/),
    rule("recuperação parcial e JSON inválido", /(?:descarte|ignore|remova) apenas o registro parcial/i, /(?:JSON inválido|JSON corrompido)/i, /(?:não chama setItem|não grave|sem gravar|preserve os bytes)/i),
  ],
  "14.06": [
    rule("saída e faixa da porta", /loadConfig\s*\(\s*env\s*\)/, /\{\s*port\s*,\s*logLevel\s*\}/, /1 a 65535/),
    rule("níveis e erros", /LOG_LEVEL/i, /(?:debug,?\s*info,?\s*warn\s*(?:ou|,)\s*error)/i, /RangeError/i),
    rule("segredo em produção", /(?:NODE_ENV\s*===\s*['"]production['"]|em produção)/i, /TOKEN obrigatório/i, /(?:Nunca inclua|não inclua|não exponha)[^.!?]{0,50}TOKEN/i),
  ],
  "15.07": [
    rule("assinaturas e lista vazia", /primeiroNome\s*\(\s*lista\s*:\s*string\[\]\s*\)\s*:\s*string/, /primeiroNome\s*\(\s*\[\s*\]\s*\)/, /RangeError/i),
    rule("cópia sem propriedade opcional", /semApelido/, /cópia sem a propriedade apelido/i, /não inclua apelido:\s*undefined/i),
    rule("fallback de rótulo", /\brotulo\b/i,
      /^(?![\s\S]*\bapelido\s+quando\s+(?:estiver\s+)?presente\b[^.;]{0,100}\buse\s+(?:o\s+)?nome\b[^.;]{0,100}[;,.]\s*sem\s+(?:o\s+)?apelido\b[^.;]{0,100}\buse\s+(?:o\s+)?apelido\b)[\s\S]*(?:\bapelido\s+quando\s+(?:estiver\s+)?presente\b[\s\S]{0,80}\bnome\s+como\s+fallback\b|\busa\s+(?:o\s+)?apelido(?:\s+fornecido)?\b[^.;]{0,80}[;,.]\s*sem\s+(?:ele|(?:o\s+)?apelido)\b[^.;]{0,80}\busa\s+(?:o\s+)?nome\b)/i),
  ],
  "16.10": [
    rule("sucesso e falha pública", /salvarPedido\s*\(\s*pedido\s*,\s*falha\?\s*\)/, /Pedido salvo\./, /Não foi possível salvar o pedido\./),
    rule("causa interna e entrada desconhecida", /Error ou qualquer valor não-Error/i, /\bcause\b/, /narrowing de unknown/i, /não exponha e\.message/i),
  ],
  "21.05": [
    rule("entrada inválida", /contarPrimos\s*\(\s*n\s*\)/, /(?:n\s+negativo|negative)/i, /(?:fracionário|fractional)/i, /NaN/i, /Infinity/i, /(?:texto|string)/i, /RangeError/i),
    rule("mensagem de erro exata", /n must be a nonnegative integer/i),
  ],
};

export function run({ catalog = [], assessments = {}, tests = {} } = {}) {
  const byId = indexById(catalog);
  const warnings = [];
  for (const id of suiteIds(assessments, tests)) {
    const suite = suiteFor(id, assessments, tests);
    const activity = byId.get(id);
    if (!suite || !activity) continue;
    const visible = [activity.prompt ?? "", starterText(activity)].join("\n");
    const hidden = new Set();
    for (const { module, names } of namedImports(suite)) {
      for (const name of names) {
        if (!wordRegExp(name).test(visible)) hidden.add(`${module}:${name}`);
      }
    }
    for (const [label, requirements] of FORMAT_RULES[id] ?? []) {
      if (!requirements.every(pattern => pattern.test(activity.prompt ?? ""))) hidden.add(`formato: ${label}`);
    }
    if (hidden.size) {
      warnings.push({
        activityId: id,
        check: [...hidden].some(item => item.startsWith("formato:")) ? "formato-visivel" : "nome-visivel",
        message: `contrato sem fonte visível (starter ou prompt): ${[...hidden].join(", ")}`,
      });
    }
  }
  return { gate: GATE, warnings };
}
