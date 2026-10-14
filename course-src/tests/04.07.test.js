import { adicionarTaxa, aplicarCupom, totalFinal } from "./main.js";

describe("adicionarTaxa", () => {
  test("exemplo público: 10000 com 10% vira 11000", () => {
    /*@case 04.07.exemplo-publico-10000-com-10-6386cb76*/expect(adicionarTaxa(10000, 0.1)).toBe(11000);
  });
  test("meio centavo arredonda para cima", () => {
    /*@case 04.07.meio-centavo-arredonda-para--3708a273*/expect(adicionarTaxa(105, 0.1)).toBe(116);
    /*@case 04.07.meio-centavo-arredonda-para--74b2d9bb*/expect(adicionarTaxa(5, 0.1)).toBe(6);
  });
  test("zeros", () => {
    /*@case 04.07.zeros-45d18eb5*/expect(adicionarTaxa(0, 0)).toBe(0);
    /*@case 04.07.zeros-2712a93e*/expect(adicionarTaxa(0, 0.5)).toBe(0);
    /*@case 04.07.zeros-11df2160*/expect(adicionarTaxa(300, 0)).toBe(300);
  });
});

describe("aplicarCupom", () => {
  test("subtrai o desconto fixo", () => {
    /*@case 04.07.subtrai-o-desconto-fixo-00c67c96*/expect(aplicarCupom(11000, 500)).toBe(10500);
  });
  test("piso em zero quando o desconto é maior que o valor", () => {
    /*@case 04.07.piso-em-zero-quando-o-descon-e4f0adbd*/expect(aplicarCupom(300, 500)).toBe(0);
    /*@case 04.07.piso-em-zero-quando-o-descon-e59ba5c9*/expect(aplicarCupom(500, 500)).toBe(0);
  });
});

describe("totalFinal", () => {
  test("exemplo público", () => {
    /*@case 04.07.exemplo-publico-d02d7988*/expect(totalFinal(10000, 0.1, 500)).toBe(10500);
  });
  test("a taxa vem antes do desconto: 105, 10%, desconto 11", () => {
    /*@case 04.07.a-taxa-vem-antes-do-desconto-48c8b7c0*/expect(totalFinal(105, 0.1, 11)).toBe(105);
  });
  test("tudo zero e desconto maior que o total", () => {
    /*@case 04.07.tudo-zero-e-desconto-maior-q-5560c12b*/expect(totalFinal(0, 0, 0)).toBe(0);
    /*@case 04.07.tudo-zero-e-desconto-maior-q-a3ab1fad*/expect(totalFinal(100, 0.1, 99999)).toBe(0);
  });
  test("resultados continuam inteiros", () => {
    /*@case 04.07.resultados-continuam-inteiro-e8888963*/expect(Number.isInteger(totalFinal(333, 0.07, 1))).toBe(true);
  });
});
