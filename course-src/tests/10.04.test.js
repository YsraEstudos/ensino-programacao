import { executar } from "./main.js";

describe("receptor do método extraído", () => {
  test("com os valores do exemplo público: antes [5,5], depois [5,9]", () => {
    /*@case 10.04.com-os-valores-do-exemplo-pu-7f0cc7e4*/expect(executar(4, 5, 9)).toEqual({ antes: [5, 5], depois: [5, 9] });
  });
  test("valores padrão são os do exemplo", () => {
    /*@case 10.04.valores-padrao-sao-os-do-exe-541cb8b5*/expect(executar()).toEqual({ antes: [5, 5], depois: [5, 9] });
  });
  test("o fixo acompanha o objeto original, não uma cópia: outros números", () => {
    /*@case 10.04.o-fixo-acompanha-o-objeto-or-017269bb*/expect(executar(1, 2, 3)).toEqual({ antes: [2, 2], depois: [2, 3] });
    /*@case 10.04.o-fixo-acompanha-o-objeto-or-398f4ea8*/expect(executar(0, 0, 7)).toEqual({ antes: [0, 0], depois: [0, 7] });
  });
  test("fixo e wrapper só divergem depois da troca de obj", () => {
    const { antes, depois } = executar(10, 20, 30);
    /*@case 10.04.fixo-e-wrapper-so-divergem-d-4b1e9b63*/expect(antes[0]).toBe(antes[1]);
    /*@case 10.04.fixo-e-wrapper-so-divergem-d-6e315e67*/expect(depois[0] === depois[1]).toBe(false);
    /*@case 10.04.fixo-e-wrapper-so-divergem-d-9666a865*/expect(depois).toEqual([20, 30]);
  });
});
