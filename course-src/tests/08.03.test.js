import { busca } from "./main.js";

describe("busca binária", () => {
  test("encontra o índice (exemplo público)", () => {
    /*@case 08.03.encontra-o-indice-exemplo-pu-f47ac3e2*/expect(busca([1, 3, 5, 7], 5)).toBe(2);
  });
  test("alvo ausente devolve -1 (exemplo público)", () => {
    /*@case 08.03.alvo-ausente-devolve-1-exemp-1a5883fe*/expect(busca([1, 3, 5, 7], 2)).toBe(-1);
  });
  test("primeiro e último elementos", () => {
    /*@case 08.03.primeiro-e-ultimo-elementos-5e3a59c3*/expect(busca([1, 3, 5, 7], 1)).toBe(0);
    /*@case 08.03.primeiro-e-ultimo-elementos-8ebd78aa*/expect(busca([1, 3, 5, 7], 7)).toBe(3);
  });
  test("lista vazia e lista de um elemento", () => {
    /*@case 08.03.lista-vazia-e-lista-de-um-el-fd3116d6*/expect(busca([], 1)).toBe(-1);
    /*@case 08.03.lista-vazia-e-lista-de-um-el-a10556c3*/expect(busca([4], 4)).toBe(0);
    /*@case 08.03.lista-vazia-e-lista-de-um-el-3868345b*/expect(busca([4], 5)).toBe(-1);
  });
  test("fora do intervalo nos dois lados", () => {
    /*@case 08.03.fora-do-intervalo-nos-dois-l-3e6d7e3b*/expect(busca([10, 20, 30], 5)).toBe(-1);
    /*@case 08.03.fora-do-intervalo-nos-dois-l-07bf5214*/expect(busca([10, 20, 30], 99)).toBe(-1);
  });
  test("duplicatas: qualquer índice com o alvo é aceito", () => {
    const xs = [1, 2, 2, 2, 3];
    /*@case 08.03.duplicatas-qualquer-indice-c-03b99df2*/expect(xs[busca(xs, 2)]).toBe(2);
  });
});

describe("realmente é binária", () => {
  test("em 1024 elementos lê algumas dezenas de posições, não milhares", () => {
    const base = Array.from({ length: 1024 }, (_, i) => i * 2);
    let leituras = 0;
    const observada = new Proxy(base, {
      get(alvo, chave, receptor) {
        if (typeof chave === "string" && /^[0-9]+$/.test(chave)) leituras++;
        return Reflect.get(alvo, chave, receptor);
      },
    });
    /*@case 08.03.em-1024-elementos-le-algumas-19beeeb5*/expect(busca(observada, 2046)).toBe(1023);
    /*@case 08.03.em-1024-elementos-le-algumas-35145b69*/expect(busca(observada, 1)).toBe(-1);
    /*@case 08.03.em-1024-elementos-le-algumas-7b0be5ce*/expect(leituras).toBeLessThan(100);
  });
});
