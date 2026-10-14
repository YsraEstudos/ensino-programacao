import { posicoes } from "./main.js";

describe("posicoes", () => {
  test("ocorrências múltiplas (exemplo público)", () => {
    /*@case 05.04.ocorrencias-multiplas-exempl-d9d068f2*/expect(posicoes(["a", "b", "a"], "a")).toEqual({ primeira: 0, ultima: 2 });
  });
  test("uma única ocorrência: primeira e última coincidem", () => {
    /*@case 05.04.uma-unica-ocorrencia-primeir-8739563f*/expect(posicoes(["a"], "a")).toEqual({ primeira: 0, ultima: 0 });
    /*@case 05.04.uma-unica-ocorrencia-primeir-22bf9626*/expect(posicoes(["x", "y", "z"], "y")).toEqual({ primeira: 1, ultima: 1 });
  });
  test("ausência é -1 nas duas posições", () => {
    /*@case 05.04.ausencia-e-1-nas-duas-posico-ba0878a9*/expect(posicoes([], "x")).toEqual({ primeira: -1, ultima: -1 });
    /*@case 05.04.ausencia-e-1-nas-duas-posico-8bd9dac9*/expect(posicoes(["a"], "x")).toEqual({ primeira: -1, ultima: -1 });
  });
  test("zero é posição válida, não ausência", () => {
    /*@case 05.04.zero-e-posicao-valida-nao-au-d6e3b9ee*/expect(posicoes(["sol", "lua", "sol", "mar"], "sol")).toEqual({ primeira: 0, ultima: 2 });
  });
  test("não altera a lista", () => {
    const lista = Object.freeze(["a", "b", "a"]);
    /*@case 05.04.nao-altera-a-lista-3525c2f0*/expect(posicoes(lista, "b")).toEqual({ primeira: 1, ultima: 1 });
  });
});
