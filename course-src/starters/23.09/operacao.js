// 23.09 · Falha observável sem segredo.
// Complete o redator e a instrumentação. O token NUNCA pode aparecer em nenhuma linha de log.

const logs = [];
const logger = {
  info: (evento) => logs.push({ nivel: "info", ...evento }),
  warn: (evento) => logs.push({ nivel: "warn", ...evento }),
  error: (evento) => logs.push({ nivel: "error", ...evento }),
};

const CHAVES_SENSIVEIS = ["authorization", "token", "cookie"];

// Implemente: cópia profunda que troca o valor de chaves sensíveis (em qualquer nível) por "[REDACTED]".
export function redigir(valor) {
  return valor;
}

class ValidationError extends Error {}

async function salvarNoServidor(pedido, contexto) {
  if (!pedido.id) throw new ValidationError("pedido sem id");
  if (pedido.lento) throw new Error("timeout depois de 5000 ms", { cause: { headers: contexto.headers } });
}

// Injeção de id e relógio: os testes e a demonstração passam valores fixos.
export async function salvar(pedido, contexto, { id = () => crypto.randomUUID(), now = () => performance.now() } = {}) {
  const operacaoId = id(); // ID de correlação: não é segredo
  const inicio = now();    // relógio monotônico
  try {
    await salvarNoServidor(pedido, contexto);
    // Versão ingênua: loga o contexto inteiro e não mede duração. Corrija.
    logger.info({ operacaoId, status: "ok", contexto });
    return { ok: true, operacaoId };
  } catch (erro) {
    // Versão ingênua: um nível só e cause sem redação. Corrija:
    // ValidationError -> warn; demais -> error com cause redigida e duração.
    logger.error({ operacaoId, mensagem: erro.message, cause: erro.cause });
    // A mensagem pública não revela detalhes técnicos.
    return { ok: false, operacaoId, mensagem: "Não foi possível salvar. Informe o código " + operacaoId };
  }
}

const contexto = { headers: { Authorization: "Bearer segredo-123", Cookie: "s=abc" }, usuario: { token: "t-999" } };
console.log(await salvar({ id: "p1" }, contexto, { id: () => "demo-1" }));
console.log(await salvar({}, contexto, { id: () => "demo-2" }));
console.log(await salvar({ id: "p2", lento: true }, contexto, { id: () => "demo-3" }));
const saida = JSON.stringify(logs);
console.log(saida);
console.log("vazou segredo?", /segredo-123|s=abc|t-999/.test(saida)); // esperado: false
