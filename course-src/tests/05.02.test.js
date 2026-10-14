import { identificadorValido } from "./main.js";

describe("aceita identificadores ASCII", () => {
  test("exemplos públicos", () => {
    /*@case 05.02.exemplos-publicos-11e2a771*/expect(identificadorValido("abc_2")).toBe(true);
    /*@case 05.02.exemplos-publicos-3ec13555*/expect(identificadorValido("_x")).toBe(true);
  });
  test("maiúsculas e dígitos depois da primeira posição", () => {
    /*@case 05.02.maiusculas-e-digitos-depois--b52db86c*/expect(identificadorValido("A0")).toBe(true);
    /*@case 05.02.maiusculas-e-digitos-depois--b5c50496*/expect(identificadorValido("temp_1")).toBe(true);
    /*@case 05.02.maiusculas-e-digitos-depois--95c97a2b*/expect(identificadorValido("_")).toBe(true);
  });
});

describe("rejeita o que não é identificador", () => {
  test("começa com dígito", () => {
    /*@case 05.02.comeca-com-digito-2af22686*/expect(identificadorValido("2abc")).toBe(false);
  });
  test("vazio", () => {
    /*@case 05.02.vazio-79354b95*/expect(identificadorValido("")).toBe(false);
  });
  test("caractere fora do contrato ASCII", () => {
    /*@case 05.02.caractere-fora-do-contrato-a-f8cf38a0*/expect(identificadorValido("a-b")).toBe(false);
    /*@case 05.02.caractere-fora-do-contrato-a-f3d60b8e*/expect(identificadorValido("á")).toBe(false);
    /*@case 05.02.caractere-fora-do-contrato-a-0ebe36bb*/expect(identificadorValido("ação")).toBe(false);
  });
});

describe("exige a string inteira", () => {
  test("newline final é rejeitado", () => {
    /*@case 05.02.newline-final-e-rejeitado-1f9a6a19*/expect(identificadorValido("abc_2\n")).toBe(false);
  });
  test("trecho válido no meio de texto inválido", () => {
    /*@case 05.02.trecho-valido-no-meio-de-tex-6eb95e1e*/expect(identificadorValido("ok depois espaço")).toBe(false);
    /*@case 05.02.trecho-valido-no-meio-de-tex-787cf70e*/expect(identificadorValido(" abc")).toBe(false);
    /*@case 05.02.trecho-valido-no-meio-de-tex-c638bb5d*/expect(identificadorValido("abc\nxyz")).toBe(false);
  });
});
