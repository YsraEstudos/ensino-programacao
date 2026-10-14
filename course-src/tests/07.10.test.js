import { linhas } from "./main.js";

describe("linhas", () => {
  test("ativo gera uma linha por item e cancelado não gera (exemplo público)", () => {
    const pedidos = [
      { id: 1, status: "ativo", itens: ["A", "B"] },
      { id: 2, status: "cancelado", itens: ["C"] },
    ];
    /*@case 07.10.ativo-gera-uma-linha-por-ite-b66775a6*/expect(linhas(pedidos)).toEqual([{ pedido: 1, item: "A" }, { pedido: 1, item: "B" }]);
  });
  test("a ordem de pedidos e itens é preservada", () => {
    const pedidos = [
      { id: 7, status: "ativo", itens: ["z", "y"] },
      { id: 3, status: "ativo", itens: ["x"] },
    ];
    /*@case 07.10.a-ordem-de-pedidos-e-itens-e-97bedb82*/expect(linhas(pedidos)).toEqual([{ pedido: 7, item: "z" }, { pedido: 7, item: "y" }, { pedido: 3, item: "x" }]);
  });
});

describe("zero ou várias linhas", () => {
  test("lista vazia", () => {
    /*@case 07.10.lista-vazia-af92d505*/expect(linhas([])).toEqual([]);
  });
  test("ativo sem itens gera zero linhas", () => {
    /*@case 07.10.ativo-sem-itens-gera-zero-li-21dfa6f9*/expect(linhas([{ id: 1, status: "ativo", itens: [] }])).toEqual([]);
  });
  test("só cancelados", () => {
    /*@case 07.10.so-cancelados-9b2c95d2*/expect(linhas([{ id: 1, status: "cancelado", itens: ["a"] }])).toEqual([]);
  });
});

describe("não achata o conteúdo dos itens", () => {
  test("item que é array continua array", () => {
    const resultado = linhas([{ id: 1, status: "ativo", itens: [["a", "b"]] }]);
    /*@case 07.10.item-que-e-array-continua-ar-a79377f1*/expect(resultado).toEqual([{ pedido: 1, item: ["a", "b"] }]);
  });
  test("a entrada não é alterada", () => {
    const entrada = Object.freeze([Object.freeze({ id: 1, status: "ativo", itens: Object.freeze(["A"]) })]);
    /*@case 07.10.a-entrada-nao-e-alterada-da831c17*/expect(linhas(entrada)).toEqual([{ pedido: 1, item: "A" }]);
    /*@case 07.10.a-entrada-nao-e-alterada-2b69e8ee*/expect(entrada.length).toBe(1);
  });
});
