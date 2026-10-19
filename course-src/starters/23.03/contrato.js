// Contrato visível 23.03:
// Exporte ValidationError(campo,mensagem), StorageError(mensagem,cause) e criarTarefa(entrada,repositorio,criarId): Promise<Tarefa>.
// Tarefa tem ID injetável, título sem espaços externos, prazo opcional em data ISO real e status inicial a-fazer.
// Título vazio e prazo inválido lançam ValidationError antes de salvar; falha do repositório lança StorageError cujo cause é a mesma referência original.
// Exporte ValidationError(campo,mensagem), StorageError(mensagem,cause) e criarTarefa(entrada,repositorio,criarId): Promise<Tarefa>.
// Normalize título, valide prazo ISO real antes de salvar e use status a-fazer. Entrada inválida não chama salvar; falha do repositório vira StorageError com a mesma referência em cause.

// 23.03 · Contrato de criarTarefa antes da implementação.
// Complete os tipos, as invariantes e os erros nos blocos JSDoc. Ainda não implemente o corpo.

/**
 * @typedef {___} StatusTarefa
 */

/**
 * @typedef {Object} Tarefa
 * @property {string} id
 * @property {string} titulo        invariante: ___
 * @property {string} [prazo]       formato: ___ ; regra: ___
 * @property {StatusTarefa} status  status inicial: ___
 */

/**
 * @typedef {Object} NovaTarefa
 * @property {string} titulo
 * @property {string} [prazo]
 */

/**
 * @typedef {Object} RepositorioTarefas
 * @property {(tarefa: Tarefa) => Promise<void>} salvar
 */

export class ValidationError extends Error {
  /**
   * @param {keyof NovaTarefa} campo
   * @param {string} mensagem
   */
  constructor(campo, mensagem) {
    super(mensagem);
    this.campo = campo;
  }
}

/**
 * Cria e persiste uma tarefa.
 * @param {NovaTarefa} entrada
 * @param {RepositorioTarefas} repositorio
 * @returns {Promise<___>}
 * @throws {ValidationError} quando ___
 * @throws {Error} com `cause` quando ___
 * Garantia sobre mutação parcial: ___
 */

// Casos que o contrato precisa responder:
// criarTarefa({ titulo: "  Estudar  " })       -> ___
// criarTarefa({ titulo: "   " })               -> ___
// criarTarefa({ titulo: "A", prazo: "ontem" }) -> ___
// repositório lança ao salvar                   -> ___

// Avaliação visível: implementação pendente
export class StorageError extends Error { constructor(mensagem, cause) { super(mensagem, {cause}); this.name = "StorageError"; } }
export async function criarTarefa(entrada, repositorio, criarId = () => crypto.randomUUID()) { /* TODO: validar antes da escrita; preservar cause em StorageError. */ }
