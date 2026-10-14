import { calcularTotal, formatadorBRL, formatadorPercentual, formatadorCompacto } from "./main.js";

// Intl usa espaço sem quebra entre o símbolo e o número; compare com espaço comum.
const normalizar = (texto) => String(texto).replace(/ /g, " ");

describe("calcularTotal", () => {
  test("continua sendo cálculo numérico (exemplo público)", () => {
    /*@case 04.05.continua-sendo-calculo-numer-5dcd0c87*/expect(calcularTotal(10, 2)).toBe(20);
    /*@case 04.05.continua-sendo-calculo-numer-ce36b33b*/expect(typeof calcularTotal(10, 2)).toBe("number");
  });
  test("não formata: zero também é Number", () => {
    /*@case 04.05.nao-formata-zero-tambem-e-nu-e13cb202*/expect(calcularTotal(0, 5)).toBe(0);
  });
});

describe("formatadorBRL", () => {
  test("é um Intl.NumberFormat", () => {
    /*@case 04.05.e-um-intl-numberformat-21a371d7*/expect(formatadorBRL).toBeInstanceOf(Intl.NumberFormat);
  });
  test("formata 20 como R$ 20,00", () => {
    /*@case 04.05.formata-20-como-r-20-00-501b9711*/expect(normalizar(formatadorBRL.format(20))).toBe("R$ 20,00");
  });
  test("separa milhar e decimais no padrão brasileiro", () => {
    /*@case 04.05.separa-milhar-e-decimais-no--d57f0722*/expect(normalizar(formatadorBRL.format(1234.5))).toBe("R$ 1.234,50");
  });
});

describe("formatadorPercentual", () => {
  test("0,25 vira 25%", () => {
    /*@case 04.05.0-25-vira-25-e0f7935b*/expect(normalizar(formatadorPercentual.format(0.25))).toBe("25%");
  });
});

describe("formatadorCompacto", () => {
  test("1200 vira uma forma compacta com 'mil'", () => {
    /*@case 04.05.1200-vira-uma-forma-compacta-1567f3ef*/expect(normalizar(formatadorCompacto.format(1200))).toBe("1,2 mil");
  });
  test("número pequeno continua legível", () => {
    /*@case 04.05.numero-pequeno-continua-legi-f9b4cbc0*/expect(normalizar(formatadorCompacto.format(999))).toBe("999");
  });
});
