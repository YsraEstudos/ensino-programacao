import { analisarPedidos } from "./main.js";

const pedidos = [
  { ativo: true, total: 5 },
  { ativo: false, total: 99 },
  { ativo: true, total: 20 },
];

describe("analisarPedidos", () => {
  test("totais só dos ativos, na ordem (exemplo público)", () => {
    /*@case 07.04.totais-so-dos-ativos-na-orde-fd3a70d5*/expect(analisarPedidos(pedidos, 10).totais).toEqual([5, 20]);
  });
  test("existeCaro com limite 10 (exemplo público)", () => {
    /*@case 07.04.existecaro-com-limite-10-exe-bc6e8846*/expect(analisarPedidos(pedidos, 10).existeCaro).toBe(true);
  });
  test("um pedido inativo caro não conta", () => {
    /*@case 07.04.um-pedido-inativo-caro-nao-c-5528ebad*/expect(analisarPedidos(pedidos, 50).existeCaro).toBe(false);
  });
  test("limite igual ao total não satisfaz 'maior que'", () => {
    /*@case 07.04.limite-igual-ao-total-nao-sa-4a7ae3ec*/expect(analisarPedidos(pedidos, 20).existeCaro).toBe(false);
    /*@case 07.04.limite-igual-ao-total-nao-sa-14e727cc*/expect(analisarPedidos(pedidos, 19).existeCaro).toBe(true);
  });
});

describe("bordas", () => {
  test("lista vazia", () => {
    /*@case 07.04.lista-vazia-381fbfb9*/expect(analisarPedidos([], 10)).toEqual({ totais: [], existeCaro: false });
  });
  test("nenhum ativo", () => {
    /*@case 07.04.nenhum-ativo-067511b5*/expect(analisarPedidos([{ ativo: false, total: 100 }], 1)).toEqual({ totais: [], existeCaro: false });
  });
  test("total 0 de pedido ativo continua na lista", () => {
    /*@case 07.04.total-0-de-pedido-ativo-cont-1bd55ecd*/expect(analisarPedidos([{ ativo: true, total: 0 }], 10).totais).toEqual([0]);
  });
});
