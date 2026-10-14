import { compararPermissoes } from "./main.js";

const set = (...itens) => new Set(itens);

describe("exemplo público: a={ler,editar}, b={ler}", () => {
  const resultado = compararPermissoes(set("ler", "editar"), set("ler"));
  test("interseção", () => {
    /*@case 07.05.intersecao-49bc5f32*/expect(resultado.intersecao).toEqual(set("ler"));
  });
  test("diferença a − b", () => {
    /*@case 07.05.diferenca-a-b-59c28c02*/expect(resultado.diferenca).toEqual(set("editar"));
  });
  test("b é subconjunto de a", () => {
    /*@case 07.05.b-e-subconjunto-de-a-3a8d3588*/expect(resultado.subconjunto).toBe(true);
  });
});

describe("a diferença é direcional", () => {
  test("b − a seria outro conjunto", () => {
    const r = compararPermissoes(set("ler"), set("ler", "editar"));
    /*@case 07.05.b-a-seria-outro-conjunto-08b5e5b1*/expect(r.diferenca).toEqual(set());
    /*@case 07.05.b-a-seria-outro-conjunto-837be6b1*/expect(r.subconjunto).toBe(false);
  });
  test("conjuntos disjuntos", () => {
    const r = compararPermissoes(set(1, 2), set(3));
    /*@case 07.05.conjuntos-disjuntos-757bdcd0*/expect(r.intersecao).toEqual(set());
    /*@case 07.05.conjuntos-disjuntos-7ea99c22*/expect(r.diferenca).toEqual(set(1, 2));
    /*@case 07.05.conjuntos-disjuntos-41ed7451*/expect(r.subconjunto).toBe(false);
  });
});

describe("entradas vazias", () => {
  test("a vazio: interseção e diferença vazias", () => {
    const r = compararPermissoes(set(), set("x"));
    /*@case 07.05.a-vazio-intersecao-e-diferen-3a0881f3*/expect(r.intersecao).toEqual(set());
    /*@case 07.05.a-vazio-intersecao-e-diferen-b6f74eab*/expect(r.diferenca).toEqual(set());
    /*@case 07.05.a-vazio-intersecao-e-diferen-130632e8*/expect(r.subconjunto).toBe(false);
  });
  test("b vazio é subconjunto de qualquer a", () => {
    /*@case 07.05.b-vazio-e-subconjunto-de-qua-0e4996e8*/expect(compararPermissoes(set("x"), set()).subconjunto).toBe(true);
    /*@case 07.05.b-vazio-e-subconjunto-de-qua-4f1d22c3*/expect(compararPermissoes(set(), set()).subconjunto).toBe(true);
  });
});

describe("conjuntos novos e entradas preservadas", () => {
  test("não altera a nem b e devolve outros objetos", () => {
    const a = set("ler", "editar");
    const b = set("ler");
    const r = compararPermissoes(a, b);
    /*@case 07.05.nao-altera-a-nem-b-e-devolve-586726c6*/expect(a).toEqual(set("ler", "editar"));
    /*@case 07.05.nao-altera-a-nem-b-e-devolve-5ffedde7*/expect(b).toEqual(set("ler"));
    /*@case 07.05.nao-altera-a-nem-b-e-devolve-c71406b1*/expect(r.intersecao === a || r.intersecao === b || r.diferenca === a).toBe(false);
  });
});
