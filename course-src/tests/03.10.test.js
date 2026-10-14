import { resumirNota } from "./main.js";

describe("resumirNota: uma escolha curta e uma decisão com três faixas", () => {
  test("usa o limite de aprovação sem perder o caso exato de 60", () => {
    /*@case 03.10.usa-o-limite-de-aprovacao-se-b8876d38*/expect(resumirNota(60)).toEqual({ faixa: "aprovar", situacao: "liberada" });
    /*@case 03.10.usa-o-limite-de-aprovacao-se-89c7ca55*/expect(resumirNota(59)).toEqual({ faixa: "revisar", situacao: "em revisão" });
  });

  test("distingue nota inválida, zero, aprovação e limite máximo", () => {
    /*@case 03.10.distingue-nota-invalida-zero-41ead8b6*/expect(resumirNota(-1)).toEqual({ faixa: "revisar", situacao: "inválida" });
    /*@case 03.10.distingue-nota-invalida-zero-fe5cf3a1*/expect(resumirNota(0)).toEqual({ faixa: "revisar", situacao: "em revisão" });
    /*@case 03.10.distingue-nota-invalida-zero-671fd524*/expect(resumirNota(100)).toEqual({ faixa: "aprovar", situacao: "liberada" });
  });
});
