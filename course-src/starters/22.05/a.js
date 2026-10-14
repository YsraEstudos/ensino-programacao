// a.js · ponto de entrada; consumidor que precisa continuar rodando durante toda a migração.
import { totalDosPedidos } from "./b.js";

console.log(totalDosPedidos(['{"id":"p1","total":10}', '{"id":"p2","total":5}'])); // 15
