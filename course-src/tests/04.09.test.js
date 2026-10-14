import { ataque, defesa, resumo } from "./main.js";

describe("ataque", () => {
  test("base + nível (exemplo público)", () => {
    /*@case 04.09.base-nivel-exemplo-publico-b099833a*/expect(ataque(3, 2)).toBe(5);
  });
  test("zeros", () => {
    /*@case 04.09.zeros-3ad56b9d*/expect(ataque(0, 0)).toBe(0);
  });
});

describe("defesa", () => {
  test("armadura + metade do nível arredondada para baixo (exemplo público)", () => {
    /*@case 04.09.armadura-metade-do-nivel-arr-2ddca003*/expect(defesa(4, 2)).toBe(5);
  });
  test("nível ímpar usa Math.floor", () => {
    /*@case 04.09.nivel-impar-usa-math-floor-1f57acdc*/expect(defesa(0, 1)).toBe(0);
    /*@case 04.09.nivel-impar-usa-math-floor-6ee1a762*/expect(defesa(0, 3)).toBe(1);
    /*@case 04.09.nivel-impar-usa-math-floor-fcd25e9a*/expect(defesa(10, 7)).toBe(13);
  });
  test("zeros", () => {
    /*@case 04.09.zeros-3b928928*/expect(defesa(0, 0)).toBe(0);
  });
});

describe("resumo", () => {
  test("formato exato (exemplo público)", () => {
    /*@case 04.09.formato-exato-exemplo-public-9922539e*/expect(resumo("Lia", 3, 2, 4)).toBe("Lia | ataque 5 | defesa 5");
  });
  test("nome vazio mantém o espaço antes da barra", () => {
    /*@case 04.09.nome-vazio-mantem-o-espaco-a-b0d48ea5*/expect(resumo("", 0, 0, 0)).toBe(" | ataque 0 | defesa 0");
  });
  test("usa as duas fórmulas com outros valores", () => {
    /*@case 04.09.usa-as-duas-formulas-com-out-a1cd9195*/expect(resumo("Bo", 10, 5, 2)).toBe("Bo | ataque 15 | defesa 4");
  });
});
