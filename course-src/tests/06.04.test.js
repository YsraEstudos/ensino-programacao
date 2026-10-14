import { atualizar } from "./main.js";

describe("atualizar com patch prevalecendo", () => {
  test("volume 0 do patch vence o 5 antigo (exemplo público)", () => {
    /*@case 06.04.volume-0-do-patch-vence-o-5--8ada7477*/expect(atualizar({ tema: "escuro", volume: 5 }, { volume: 0 })).toEqual({ tema: "escuro", volume: 0 });
  });
  test("campos ausentes do patch são mantidos", () => {
    /*@case 06.04.campos-ausentes-do-patch-sao-f5d7ea4a*/expect(atualizar({ a: 1, b: 2 }, { b: 3 })).toEqual({ a: 1, b: 3 });
  });
  test("campos novos do patch entram", () => {
    /*@case 06.04.campos-novos-do-patch-entram-bd9b9a2e*/expect(atualizar({ a: 1 }, { b: 2 })).toEqual({ a: 1, b: 2 });
  });
});

describe("valores falsy do patch", () => {
  test("string vazia substitui e não é ignorada", () => {
    /*@case 06.04.string-vazia-substitui-e-nao-89757e09*/expect(atualizar({ tema: "escuro" }, { tema: "" })).toEqual({ tema: "" });
  });
  test("false e null também substituem", () => {
    /*@case 06.04.false-e-null-tambem-substitu-4dc5d670*/expect(atualizar({ ativo: true, nome: "x" }, { ativo: false, nome: null })).toEqual({ ativo: false, nome: null });
  });
});

describe("sem mutar", () => {
  test("patch vazio devolve uma cópia rasa com os mesmos valores", () => {
    const antiga = { tema: "escuro" };
    const nova = atualizar(antiga, {});
    /*@case 06.04.patch-vazio-devolve-uma-copi-3484bb0b*/expect(nova).toEqual({ tema: "escuro" });
    /*@case 06.04.patch-vazio-devolve-uma-copi-f426b643*/expect(nova === antiga).toBe(false);
  });
  test("os argumentos não são alterados", () => {
    const antiga = Object.freeze({ a: 1 });
    const patch = Object.freeze({ a: 2 });
    /*@case 06.04.os-argumentos-nao-sao-altera-27d25888*/expect(atualizar(antiga, patch)).toEqual({ a: 2 });
    /*@case 06.04.os-argumentos-nao-sao-altera-7a3246cf*/expect(antiga).toEqual({ a: 1 });
    /*@case 06.04.os-argumentos-nao-sao-altera-224ed5c1*/expect(patch).toEqual({ a: 2 });
  });
  test("a cópia é rasa: objetos internos são compartilhados", () => {
    const interno = { x: 1 };
    /*@case 06.04.a-copia-e-rasa-objetos-inter-aceef0da*/expect(atualizar({ interno }, {}).interno === interno).toBe(true);
  });
});
