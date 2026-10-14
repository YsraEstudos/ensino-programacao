// @ts-check
// c.js · folha do grafo A -> B -> C. Primeiro módulo a migrar.
// Com @ts-check (ou checkJs no tsconfig), o TypeScript já verifica este arquivo usando JSDoc.

/**
 * @param {string} texto
 * @returns {{ id: string, total: number }}
 */
export function lerPedido(texto) {
  const dados = JSON.parse(texto); // any: JSON ainda não validado
  return { id: dados.id, total: dados.total };
}
