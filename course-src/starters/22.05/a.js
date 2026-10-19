// Contrato visível 22.05:
// Exporte executar(json): número. Para {"quantidade":3,"preco":5}, devolve 15.
// JSON inválido lança SyntaxError; quantidade que não seja inteira lança TypeError antes de produzir resultado.

// a.js · ponto de entrada; consumidor que precisa continuar rodando durante toda a migração.
import { totalDosPedidos } from "./b.js";

console.log(totalDosPedidos(['{"id":"p1","total":10}', '{"id":"p2","total":5}'])); // 15

// Avaliação visível: implementação pendente
export function executar(json) { return totalDosPedidos([json]); }
