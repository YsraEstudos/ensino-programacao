import { multiplicador } from "./main.js";

describe("multiplicador", () => {
  test("multiplicador(3)(4) é 12 (exemplo público)", () => {
    /*@case 09.03.multiplicador-3-4-e-12-exemp-990dc288*/expect(multiplicador(3)(4)).toBe(12);
  });
  test("a função devolvida guarda o fator escolhido", () => {
    const triplo = multiplicador(3);
    /*@case 09.03.a-funcao-devolvida-guarda-o--e9cac17c*/expect(triplo(-2)).toBe(-6);
    /*@case 09.03.a-funcao-devolvida-guarda-o--93ec9d59*/expect(triplo(5)).toBe(15);
  });
  test("fator zero", () => {
    /*@case 09.03.fator-zero-4e032066*/expect(multiplicador(0)(99)).toBe(0);
  });
  test("dois fatores distintos geram funções independentes", () => {
    const dobro = multiplicador(2);
    const triplo = multiplicador(3);
    /*@case 09.03.dois-fatores-distintos-geram-7c77a32c*/expect(dobro(10)).toBe(20);
    /*@case 09.03.dois-fatores-distintos-geram-d031fefa*/expect(triplo(10)).toBe(30);
    /*@case 09.03.dois-fatores-distintos-geram-7c77a32c*/expect(dobro(10)).toBe(20);
  });
  test("devolve uma função", () => {
    /*@case 09.03.devolve-uma-funcao-687d2d7a*/expect(typeof multiplicador(2)).toBe("function");
  });
});
