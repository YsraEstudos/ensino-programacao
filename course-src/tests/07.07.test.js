import { frequencias, porCategoria } from "./main.js";

describe("frequencias", () => {
  test("conta cada palavra (exemplo público)", () => {
    const mapa = frequencias(["a", "b", "a"]);
    /*@case 07.07.conta-cada-palavra-exemplo-p-fd6a35c0*/expect(mapa).toBeInstanceOf(Map);
    /*@case 07.07.conta-cada-palavra-exemplo-p-ccfee017*/expect(mapa.get("a")).toBe(2);
    /*@case 07.07.conta-cada-palavra-exemplo-p-3c609fad*/expect(mapa.get("b")).toBe(1);
  });
  test("ordem da primeira aparição", () => {
    /*@case 07.07.ordem-da-primeira-aparicao-b94b2bdd*/expect([...frequencias(["z", "a", "z", "m", "a"]).keys()]).toEqual(["z", "a", "m"]);
  });
  test("lista vazia produz Map vazio", () => {
    /*@case 07.07.lista-vazia-produz-map-vazio-4fb876c3*/expect(frequencias([]).size).toBe(0);
  });
  test("palavra ausente não aparece", () => {
    /*@case 07.07.palavra-ausente-nao-aparece-1fa01488*/expect(frequencias(["a"]).has("b")).toBe(false);
  });
});

describe("porCategoria", () => {
  const registros = [
    { categoria: "A", id: 1 },
    { categoria: "B", id: 2 },
    { categoria: "A", id: 3 },
  ];
  test("ids agrupados por categoria (exemplo público)", () => {
    const grupos = porCategoria(registros);
    /*@case 07.07.ids-agrupados-por-categoria--b643d87e*/expect(grupos).toBeInstanceOf(Map);
    /*@case 07.07.ids-agrupados-por-categoria--f8fb65d1*/expect(grupos.get("A")).toEqual([1, 3]);
    /*@case 07.07.ids-agrupados-por-categoria--1e55b565*/expect(grupos.get("B")).toEqual([2]);
  });
  test("chaves repetidas acumulam no mesmo grupo e a ordem é a da primeira aparição", () => {
    /*@case 07.07.chaves-repetidas-acumulam-no-164eb70d*/expect([...porCategoria(registros).keys()]).toEqual(["A", "B"]);
  });
  test("lista vazia produz Map vazio", () => {
    /*@case 07.07.lista-vazia-produz-map-vazio-abfd1cab*/expect(porCategoria([]).size).toBe(0);
  });
  test("não altera a entrada", () => {
    const entrada = Object.freeze(registros.map((r) => Object.freeze({ ...r })));
    porCategoria(entrada);
    /*@case 07.07.nao-altera-a-entrada-fe682de8*/expect(entrada.length).toBe(3);
  });
});

test("o valor guardado tem tipo diferente: número em uma função, array na outra", () => {
  /*@case 07.07.o-valor-guardado-tem-tipo-di-8e0f4d76*/expect(typeof frequencias(["a"]).get("a")).toBe("number");
  /*@case 07.07.o-valor-guardado-tem-tipo-di-f24490b5*/expect(Array.isArray(porCategoria([{ categoria: "A", id: 1 }]).get("A"))).toBe(true);
});
