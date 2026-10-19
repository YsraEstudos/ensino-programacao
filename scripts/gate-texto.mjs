// Gate de texto (modo aviso). Cada aviso traz `check` para permitir promover checks isolados depois.
//   hint-cortado          hint termina no meio da palavra (heurística: último caractere é letra)
//   titulo-sem-acento     título com grafia sem acento conhecida
//   review-resposta       review.answer fora do intervalo de review.choices
//   feedback-repetido     review.correctFeedback repetido dentro da mesma etapa
//   primeira-resposta     firstResponse.action igual a objective
//   primeira-pergunta     primeira resposta de etapa guiada não é pergunta
//   dica-copia-prompt     primeira dica de etapa guiada repete o enunciado
import { wordRegExp } from "./gate-common.mjs";

export const GATE = "gate-texto";

// Grafias sem acento conhecidas -> forma correta. Casam somente como palavra inteira, sem diferenciar maiúsculas.
export const UNACCENTED_TITLE_WORDS = [
  ["Transferencia", "Transferência"],
  ["Indice", "Índice"],
  ["Mudanca", "Mudança"],
  ["Funcao", "Função"],
  ["Funcoes", "Funções"],
  ["Revisao", "Revisão"],
  ["Excecao", "Exceção"],
  ["Excecoes", "Exceções"],
  ["Validacao", "Validação"],
  ["Pratica", "Prática"],
  ["Analise", "Análise"],
  ["Solucao", "Solução"],
  ["Conexao", "Conexão"],
  ["Implementacao", "Implementação"],
  ["Coercao", "Coerção"],
  ["Metodo", "Método"],
  ["mutacao", "mutação"],
  ["Codigo", "Código"],
  ["Versao", "Versão"],
  ["Configuracao", "Configuração"],
  ["Operacao", "Operação"],
  ["Atualizacao", "Atualização"],
  ["Declaracao", "Declaração"],
  ["Descricao", "Descrição"],
  ["Sequencia", "Sequência"],
  ["Acao", "Ação"],
  ["Opcao", "Opção"],
  ["Historico", "Histórico"],
  ["Relatorio", "Relatório"],
  ["Exercicio", "Exercício"],
  ["Modulo", "Módulo"],
  ["Logica", "Lógica"],
  ["Ultimo", "Último"],
  ["Pagina", "Página"],
  ["Basico", "Básico"],
];

const TITLE_PATTERNS = UNACCENTED_TITLE_WORDS.map(([plain, accented]) => ({
  plain,
  accented,
  re: wordRegExp(plain, "i"),
}));

function normalizeText(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim().toLowerCase();
}

function copiesPrompt(hint, prompt) {
  const source = normalizeText(prompt);
  if (!source) return false;
  const text = normalizeText(hint);
  // Prefixos de dica não tornam uma cópia integral uma pista independente.
  return text.includes(source) || text.startsWith('releia o enunciado e separe entrada, saída e restrições:');
}

function genericObjectiveQuestion(action) {
  return /\b(?:qual (?:é|seria) (?:o |a )?(?:objetivo|tarefa|enunciado)|o que (?:devo|preciso) fazer)\b/i.test(action);
}

export function run({ catalog = [] } = {}) {
  const warnings = [];
  const push = (activityId, check, message) => warnings.push({ activityId, check, message });

  for (const activity of catalog) {
    const id = activity.id;
    const guidedStage = Number(activity.stage) >= 4;

    for (const hint of Array.isArray(activity.hints) ? activity.hints : []) {
      const text = String(hint).trim();
      if (/\p{L}$/u.test(text)) {
        push(id, "hint-cortado", `hint termina no meio da palavra: "...${text.slice(-30)}"`);
      }
    }
    if (guidedStage && Array.isArray(activity.hints) && activity.hints.length) {
      if (copiesPrompt(activity.hints[0], activity.prompt)) {
        push(id, 'dica-copia-prompt', 'primeira dica repete o enunciado em vez de oferecer uma pista própria');
      }
    }

    for (const { plain, accented, re } of TITLE_PATTERNS) {
      if (re.test(activity.title ?? "")) {
        push(id, "titulo-sem-acento", `título com grafia sem acento "${plain}" (use "${accented}")`);
      }
    }

    const review = activity.review;
    if (review && typeof review === "object") {
      const choices = Array.isArray(review.choices) ? review.choices : [];
      const answer = review.answer;
      if (!Number.isInteger(answer) || answer < 0 || answer >= choices.length) {
        push(id, "review-resposta", `review.answer=${JSON.stringify(answer)} fora do intervalo [0, ${choices.length})`);
      }
    }

    if (activity.firstResponse && typeof activity.firstResponse.action === "string") {
      if (normalizeText(activity.firstResponse.action) === normalizeText(activity.objective)) {
        push(id, "primeira-resposta", "firstResponse.action é igual ao objective");
      }
      if (guidedStage && (!activity.firstResponse.action.trim().endsWith('?') ||
          genericObjectiveQuestion(activity.firstResponse.action))) {
        push(id, 'primeira-pergunta', 'firstResponse.action deve pedir uma hipótese inicial concreta, não apenas perguntar pelo objetivo');
      }
    }
  }

  const feedbackGroups = new Map();
  for (const activity of catalog) {
    const feedback = activity.review?.correctFeedback;
    if (typeof feedback !== "string" || !feedback.trim()) continue;
    const key = `${activity.stage}\u0000${normalizeText(feedback)}`;
    if (!feedbackGroups.has(key)) feedbackGroups.set(key, []);
    feedbackGroups.get(key).push(activity.id);
  }
  for (const [key, ids] of feedbackGroups) {
    if (ids.length < 2) continue;
    const stage = key.split("\u0000")[0];
    for (const id of ids) {
      push(id, "feedback-repetido", `correctFeedback repetido em ${ids.length} atividades da etapa ${stage}`);
    }
  }

  return { gate: GATE, warnings };
}
