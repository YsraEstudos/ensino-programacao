import { indexar } from "./main.js";

describe("indexar por id", () => {
  test("cada id aponta para seu registro (exemplo público)", () => {
    const indice = indexar([{ id: "a", v: 1 }, { id: "b", v: 2 }]);
    /*@case 06.07.cada-id-aponta-para-seu-regi-dd558a24*/expect(indice.a.v).toBe(1);
    /*@case 06.07.cada-id-aponta-para-seu-regi-de01822c*/expect(indice.b.v).toBe(2);
  });
  test("o último registro de um id duplicado vence", () => {
    const indice = indexar([{ id: "a", v: 1 }, { id: "a", v: 3 }]);
    /*@case 06.07.o-ultimo-registro-de-um-id-d-96fb1024*/expect(indice.a.v).toBe(3);
  });
  test("lista vazia produz objeto vazio", () => {
    /*@case 06.07.lista-vazia-produz-objeto-va-cdb76868*/expect(Object.keys(indexar([]))).toEqual([]);
  });
});

describe("id __proto__", () => {
  test("é uma chave própria comum com o registro", () => {
    const indice = indexar([{ id: "__proto__", v: 1 }]);
    /*@case 06.07.e-uma-chave-propria-comum-co-f39e17ee*/expect(Object.hasOwn(indice, "__proto__")).toBe(true);
    /*@case 06.07.e-uma-chave-propria-comum-co-898ea363*/expect(Object.getOwnPropertyDescriptor(indice, "__proto__").value.v).toBe(1);
  });
  test("não altera o protótipo do índice nem polui Object.prototype", () => {
    const indice = indexar([{ id: "__proto__", v: 1 }, { id: "toString", v: 2 }]);
    const proto = Object.getPrototypeOf(indice);
    /*@case 06.07.nao-altera-o-prototipo-do-in-e0df5e32*/expect(proto === Object.prototype || proto === null).toBe(true);
    /*@case 06.07.nao-altera-o-prototipo-do-in-ee8acd66*/expect(Object.hasOwn(Object.prototype, "v")).toBe(false);
    /*@case 06.07.nao-altera-o-prototipo-do-in-6fabb3b3*/expect({}.v).toBeUndefined();
    /*@case 06.07.nao-altera-o-prototipo-do-in-4bdebb22*/expect(Object.hasOwn(indice, "toString")).toBe(true);
  });
});

describe("sem mutar os itens", () => {
  test("registros recebidos ficam intactos", () => {
    const entidades = Object.freeze([Object.freeze({ id: "a", v: 1 })]);
    const indice = indexar(entidades);
    /*@case 06.07.registros-recebidos-ficam-in-8d890baf*/expect(indice.a).toEqual({ id: "a", v: 1 });
    /*@case 06.07.registros-recebidos-ficam-in-91eb7ec5*/expect(entidades[0]).toEqual({ id: "a", v: 1 });
  });
});
