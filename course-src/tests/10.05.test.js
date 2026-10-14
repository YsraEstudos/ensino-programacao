import { Base, Filha } from "./main.js";

describe("Filha", () => {
  test("constrói sem ReferenceError e guarda os dois campos", () => {
    const f = new Filha(2, "A");
    /*@case 10.05.constroi-sem-referenceerror--a69ce81d*/expect(f.x).toBe(2);
    /*@case 10.05.constroi-sem-referenceerror--d08172d1*/expect(f.nome).toBe("A");
  });
  test("descricao compõe a base e o nome (exemplo público)", () => {
    /*@case 10.05.descricao-compoe-a-base-e-o--7f475bd3*/expect(new Filha(2, "A").descricao()).toBe("x=2; A");
  });
  test("outros valores e nome vazio", () => {
    /*@case 10.05.outros-valores-e-nome-vazio-b20acf8f*/expect(new Filha(0, "").descricao()).toBe("x=0; ");
    /*@case 10.05.outros-valores-e-nome-vazio-3f59deb0*/expect(new Filha(7, "Zé").descricao()).toBe("x=7; Zé");
  });
  test("continua sendo uma Base", () => {
    /*@case 10.05.continua-sendo-uma-base-f7cde8b3*/expect(new Filha(1, "n")).toBeInstanceOf(Base);
  });
});

describe("Base preservada", () => {
  test("a descrição da base não muda", () => {
    /*@case 10.05.a-descricao-da-base-nao-muda-c4dee817*/expect(new Base(5).descricao()).toBe("x=5");
  });
  test("a sobrescrita usa super.descricao: mudar a base muda a filha", () => {
    const original = Base.prototype.descricao;
    Base.prototype.descricao = function () { return "base-alterada"; };
    try {
      /*@case 10.05.a-sobrescrita-usa-super-desc-81ffd657*/expect(new Filha(1, "n").descricao()).toBe("base-alterada; n");
    } finally {
      Base.prototype.descricao = original;
    }
  });
});
