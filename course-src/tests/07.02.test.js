import { agrupar } from "./main.js";

const pedidos = [
  { id: 1, status: "novo" },
  { id: 2, status: "pago" },
  { id: 3, status: "novo" },
];

describe("agrupar devolve um Map status -> pedidos", () => {
  test("é um Map (exemplo público)", () => {
    /*@case 07.02.e-um-map-exemplo-publico-d246c693*/expect(agrupar(pedidos)).toBeInstanceOf(Map);
  });
  test("ids por grupo (exemplo público)", () => {
    const grupos = agrupar(pedidos);
    /*@case 07.02.ids-por-grupo-exemplo-public-fa31cc24*/expect(grupos.get("novo").map((p) => p.id)).toEqual([1, 3]);
    /*@case 07.02.ids-por-grupo-exemplo-public-d2f2ba17*/expect(grupos.get("pago").map((p) => p.id)).toEqual([2]);
  });
  test("os grupos guardam os próprios objetos recebidos", () => {
    /*@case 07.02.os-grupos-guardam-os-proprio-9f3e3e33*/expect(agrupar(pedidos).get("pago")[0] === pedidos[1]).toBe(true);
  });
  test("grupos aparecem na ordem do primeiro status visto", () => {
    /*@case 07.02.grupos-aparecem-na-ordem-do--16816eec*/expect([...agrupar(pedidos).keys()]).toEqual(["novo", "pago"]);
  });
});

describe("bordas", () => {
  test("lista vazia produz Map vazio", () => {
    const grupos = agrupar([]);
    /*@case 07.02.lista-vazia-produz-map-vazio-90be3328*/expect(grupos).toBeInstanceOf(Map);
    /*@case 07.02.lista-vazia-produz-map-vazio-7004153e*/expect(grupos.size).toBe(0);
  });
  test("a ordem dentro de cada grupo é preservada", () => {
    const lista = [{ id: 9, status: "a" }, { id: 4, status: "a" }, { id: 7, status: "a" }];
    /*@case 07.02.a-ordem-dentro-de-cada-grupo-d3d16c41*/expect(agrupar(lista).get("a").map((p) => p.id)).toEqual([9, 4, 7]);
  });
  test("a entrada não é alterada", () => {
    const entrada = Object.freeze(pedidos.map((p) => Object.freeze({ ...p })));
    agrupar(entrada);
    /*@case 07.02.a-entrada-nao-e-alterada-06d132bc*/expect(entrada.map((p) => p.id)).toEqual([1, 2, 3]);
  });
});
