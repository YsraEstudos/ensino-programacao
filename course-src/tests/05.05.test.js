import { contemLiteral } from "./main.js";

describe("busca literal", () => {
  test("ponto é só um ponto (exemplos públicos)", () => {
    /*@case 05.05.ponto-e-so-um-ponto-exemplos-6adfa73f*/expect(contemLiteral("a.b", ".")).toBe(true);
    /*@case 05.05.ponto-e-so-um-ponto-exemplos-11a4e6f4*/expect(contemLiteral("axb", ".")).toBe(false);
  });
  test("termo vazio está em qualquer texto, por contrato", () => {
    /*@case 05.05.termo-vazio-esta-em-qualquer-59b5f2a6*/expect(contemLiteral("qualquer coisa", "")).toBe(true);
    /*@case 05.05.termo-vazio-esta-em-qualquer-273642df*/expect(contemLiteral("", "")).toBe(true);
  });
  test("colchetes não viram classe de caracteres", () => {
    /*@case 05.05.colchetes-nao-viram-classe-d-245c1500*/expect(contemLiteral("a[x]b", "[x]")).toBe(true);
    /*@case 05.05.colchetes-nao-viram-classe-d-b9a9fa36*/expect(contemLiteral("axb", "[x]")).toBe(false);
  });
  test("asterisco isolado não lança SyntaxError e busca o asterisco", () => {
    /*@case 05.05.asterisco-isolado-nao-lanca--74dfe796*/expect(contemLiteral("2*3", "*")).toBe(true);
    /*@case 05.05.asterisco-isolado-nao-lanca--e2beeeb5*/expect(contemLiteral("23", "*")).toBe(false);
  });
});

describe("outros metacaracteres", () => {
  test("parênteses, interrogação, barra vertical e cifrão", () => {
    /*@case 05.05.parenteses-interrogacao-barr-e59e68ad*/expect(contemLiteral("f(x)", "(x)")).toBe(true);
    /*@case 05.05.parenteses-interrogacao-barr-bc0963d9*/expect(contemLiteral("e se?", "se?")).toBe(true);
    /*@case 05.05.parenteses-interrogacao-barr-e39679d0*/expect(contemLiteral("a|b", "a|b")).toBe(true);
    /*@case 05.05.parenteses-interrogacao-barr-b9d4f735*/expect(contemLiteral("ab", "a|b")).toBe(false);
    /*@case 05.05.parenteses-interrogacao-barr-2cd16e21*/expect(contemLiteral("R$ 5", "$ 5")).toBe(true);
  });
  test("barra invertida e mais", () => {
    /*@case 05.05.barra-invertida-e-mais-9fe05888*/expect(contemLiteral("c:\\dir", "\\d")).toBe(true);
    /*@case 05.05.barra-invertida-e-mais-61775bf6*/expect(contemLiteral("1+1", "1+1")).toBe(true);
    /*@case 05.05.barra-invertida-e-mais-e6cfa207*/expect(contemLiteral("11", "1+1")).toBe(false);
  });
});
