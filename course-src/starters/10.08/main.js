// 10.08 · Motor de entidades.
// criarEntidade({ id, vida, posicao: { x, y }, capacidades: [string] }) -> entidade com ESTADO PRÓPRIO:
//   copie posicao e capacidades; duas entidades criadas a partir do mesmo objeto não compartilham estado.
// mover(ent, dx, dy):
//   sem a capacidade "mover" em ent.capacidades -> { status: "unsupported" } e nada muda
//   com a capacidade -> soma dx e dy à posição e devolve { status: "ok" }
// receberDano(ent, n):
//   n precisa ser Number finito >= 0; senão devolve false SEM alterar a entidade
//   caso válido: vida = max(0, vida - n) e devolve true
// Registre os invariantes de vida, posição e capacidades. Depois acrescente cura sem alterar mover.

export function criarEntidade({ id, vida, posicao, capacidades }) {
  // implemente
}

export function mover(ent, dx, dy) {
  // implemente
}

export function receberDano(ent, n) {
  // implemente
}
