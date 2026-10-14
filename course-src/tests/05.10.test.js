import { umNivel } from "./main.js";

describe("umNivel desfaz exatamente um nível", () => {
  test("exemplo público", () => {
    /*@case 05.10.exemplo-publico-4730a035*/expect(umNivel([[1, 2], [3, [4]]])).toEqual([1, 2, 3, [4]]);
  });
  test("níveis mais fundos continuam aninhados", () => {
    /*@case 05.10.niveis-mais-fundos-continuam-5574a252*/expect(umNivel([[[[1]]]])).toEqual([[[1]]]);
  });
  test("grupos vazios somem", () => {
    /*@case 05.10.grupos-vazios-somem-8b48f19d*/expect(umNivel([[], [1]])).toEqual([1]);
    /*@case 05.10.grupos-vazios-somem-d54fedd0*/expect(umNivel([[], []])).toEqual([]);
  });
  test("lista vazia", () => {
    /*@case 05.10.lista-vazia-7d510d2d*/expect(umNivel([])).toEqual([]);
  });
});

describe("sem mutar a entrada", () => {
  test("a entrada permanece igual", () => {
    const entrada = [[1, 2], [3, [4]]];
    umNivel(entrada);
    /*@case 05.10.a-entrada-permanece-igual-e3a19137*/expect(entrada).toEqual([[1, 2], [3, [4]]]);
  });
  test("entrada congelada funciona e o resultado é uma lista nova", () => {
    const entrada = Object.freeze([Object.freeze([1]), Object.freeze([2])]);
    const saida = umNivel(entrada);
    /*@case 05.10.entrada-congelada-funciona-e-0238ad28*/expect(saida).toEqual([1, 2]);
    /*@case 05.10.entrada-congelada-funciona-e-d0e581a1*/expect(saida === entrada).toBe(false);
  });
});
