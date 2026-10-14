import { criarPonto } from "./main.js";

describe("protótipo compartilhado", () => {
  test("dois pontos têm o mesmo protótipo (exemplo público)", () => {
    const a = criarPonto(1, 2);
    const b = criarPonto(3, 4);
    /*@case 10.03.dois-pontos-tem-o-mesmo-prot-48f18687*/expect(Object.getPrototypeOf(a) === Object.getPrototypeOf(b)).toBe(true);
    /*@case 10.03.dois-pontos-tem-o-mesmo-prot-0ab63d98*/expect(Object.getPrototypeOf(a) === Object.prototype).toBe(false);
  });
  test("mover é herdado, não propriedade própria", () => {
    const a = criarPonto(1, 2);
    /*@case 10.03.mover-e-herdado-nao-propried-5d8615ed*/expect(a.hasOwnProperty("mover")).toBe(false);
    /*@case 10.03.mover-e-herdado-nao-propried-095d6b17*/expect(typeof a.mover).toBe("function");
    /*@case 10.03.mover-e-herdado-nao-propried-125ff5bb*/expect(Object.hasOwn(a, "x") && Object.hasOwn(a, "y")).toBe(true);
  });
});

describe("dados independentes", () => {
  test("a.mover(2, -1) leva a para (3, 1) e deixa b em (3, 4)", () => {
    const a = criarPonto(1, 2);
    const b = criarPonto(3, 4);
    a.mover(2, -1);
    /*@case 10.03.a-mover-2-1-leva-a-para-3-1--03fbeeb3*/expect([a.x, a.y]).toEqual([3, 1]);
    /*@case 10.03.a-mover-2-1-leva-a-para-3-1--931b2b2f*/expect([b.x, b.y]).toEqual([3, 4]);
  });
  test("mover acumula e aceita zero", () => {
    const p = criarPonto(0, 0);
    p.mover(1, 1);
    p.mover(0, 5);
    /*@case 10.03.mover-acumula-e-aceita-zero-e11b65af*/expect([p.x, p.y]).toEqual([1, 6]);
  });
  test("o método compartilhado é o mesmo para todos", () => {
    /*@case 10.03.o-metodo-compartilhado-e-o-m-7f871d1c*/expect(criarPonto(0, 0).mover === criarPonto(9, 9).mover).toBe(true);
  });
});
