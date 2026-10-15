import { CARENCIA_DIAS, TETO_CENTAVOS, multaCentavos, temMulta } from "./src/regras.js";
import { relatorioMultas } from "./src/relatorio.js";

const emprestimo = (id, diasAtraso) => ({ id, diasAtraso });

describe("carência", () => {
  test("dias até a carência, inclusive o último, não têm multa", () => {
    /*@case 07.15.dias-ate-a-carencia-inclusiv-6df8e92e*/expect(temMulta(0)).toBe(false);
    /*@case 07.15.dias-ate-a-carencia-inclusiv-06e3a6c2*/expect(temMulta(1)).toBe(false);
    /*@case 07.15.dias-ate-a-carencia-inclusiv-d3168809*/expect(temMulta(CARENCIA_DIAS)).toBe(false);
    /*@case 07.15.dias-ate-a-carencia-inclusiv-916322ef*/expect(temMulta(CARENCIA_DIAS + 1)).toBe(true);
  });
  test("devolução no último dia da carência não entra no relatório", () => {
    /*@case 07.15.devolucao-no-ultimo-dia-da-c-973f1372*/expect(relatorioMultas([emprestimo("a", CARENCIA_DIAS)]).linhas).toEqual([]);
  });
});

describe("valor da multa", () => {
  test("cobra 50 centavos por dia excedente à carência", () => {
    /*@case 07.15.cobra-50-centavos-por-dia-ex-98bfc069*/expect(multaCentavos(3)).toBe(50);
    /*@case 07.15.cobra-50-centavos-por-dia-ex-0a699582*/expect(multaCentavos(5)).toBe(150);
  });
  test("aplica o teto de 2000 centavos", () => {
    /*@case 07.15.aplica-o-teto-de-2000-centav-2cf6e38a*/expect(multaCentavos(CARENCIA_DIAS + 40)).toBe(TETO_CENTAVOS);
    /*@case 07.15.aplica-o-teto-de-2000-centav-898c8bd3*/expect(multaCentavos(100)).toBe(TETO_CENTAVOS);
  });
});

describe("relatório", () => {
  test("ordena por multa decrescente e desempata por id crescente", () => {
    const linhas = relatorioMultas([emprestimo("b", 5), emprestimo("c", 3), emprestimo("a", 5)]).linhas;
    /*@case 07.15.ordena-por-multa-decrescente-61f3cf84*/expect(linhas.map(linha => linha.id)).toEqual(["a", "b", "c"]);
  });
  test("soma o total das linhas", () => {
    /*@case 07.15.soma-o-total-das-linhas-77fdf933*/expect(relatorioMultas([emprestimo("b", 5), emprestimo("c", 3), emprestimo("a", 5)]).totalCentavos).toBe(350);
  });
  test("não altera a lista de entrada", () => {
    const entrada = [emprestimo("c", 3), emprestimo("a", 5)];
    relatorioMultas(entrada);
    /*@case 07.15.nao-altera-a-lista-de-entrad-faf4a097*/expect(entrada.map(item => item.id)).toEqual(["c", "a"]);
  });
  test("lista vazia produz relatório vazio", () => {
    /*@case 07.15.lista-vazia-produz-relatorio-5bb7aa42*/expect(relatorioMultas([])).toEqual({ linhas: [], totalCentavos: 0 });
  });
});
