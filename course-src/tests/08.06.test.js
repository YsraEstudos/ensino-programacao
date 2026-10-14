import { unicosLento, unicosSet } from "./main.js";

const versoes = { "com laço e includes": unicosLento, "com Set": unicosSet };

for (const [nome, unicos] of Object.entries(versoes)) {
  describe(nome, () => {
    test("preserva a primeira ocorrência (exemplo público)", () => {
      /*@case 08.06.preserva-a-primeira-ocorrenc-3095bac6*/expect(unicos(["a", "b", "a", "c"])).toEqual(["a", "b", "c"]);
    });
    test("lista vazia", () => {
      /*@case 08.06.lista-vazia-599f9778*/expect(unicos([])).toEqual([]);
    });
    test("NaN repetido vira um só (SameValueZero)", () => {
      const saida = unicos([NaN, NaN]);
      /*@case 08.06.nan-repetido-vira-um-so-same-fa245461*/expect(saida.length).toBe(1);
      /*@case 08.06.nan-repetido-vira-um-so-same-c4b5a59a*/expect(Number.isNaN(saida[0])).toBe(true);
    });
    test("objetos distintos com a mesma forma continuam distintos", () => {
      const a = { id: 1 };
      const b = { id: 1 };
      const saida = unicos([a, b, a]);
      /*@case 08.06.objetos-distintos-com-a-mesm-db559a23*/expect(saida.length).toBe(2);
      /*@case 08.06.objetos-distintos-com-a-mesm-a4d46513*/expect(saida[0] === a && saida[1] === b).toBe(true);
    });
    test("não altera a entrada e devolve uma lista nova", () => {
      const entrada = Object.freeze([1, 1, 2]);
      const saida = unicos(entrada);
      /*@case 08.06.nao-altera-a-entrada-e-devol-686850d2*/expect(saida).toEqual([1, 2]);
      /*@case 08.06.nao-altera-a-entrada-e-devol-ff94a7f1*/expect(saida === entrada).toBe(false);
    });
    test("1 e '1' são diferentes", () => {
      /*@case 08.06.1-e-1-sao-diferentes-af34f973*/expect(unicos([1, "1", 1])).toEqual([1, "1"]);
    });
  });
}
