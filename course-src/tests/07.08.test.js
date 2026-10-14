import { resumoDoacoes } from "./main.js";

const doacoes = [
  { campanha: "A", doador: "ana", valor: 5 },
  { campanha: "A", doador: "bia", valor: 7 },
  { campanha: "B", doador: "ana", valor: 0 },
];

describe("exemplo público", () => {
  const resumo = resumoDoacoes(doacoes);
  test("totais por campanha", () => {
    /*@case 07.08.totais-por-campanha-4f1d4940*/expect(resumo.totais).toEqual(new Map([["A", 12], ["B", 0]]));
  });
  test("doadores únicos", () => {
    /*@case 07.08.doadores-unicos-8c2695ff*/expect(resumo.doadores).toEqual(new Set(["ana", "bia"]));
  });
  test("campanha de maior arrecadação", () => {
    /*@case 07.08.campanha-de-maior-arrecadaca-cd9f055b*/expect(resumo.maiorCampanha).toBe("A");
  });
});

describe("bordas", () => {
  test("lista vazia: Map e Set vazios, maiorCampanha null", () => {
    const resumo = resumoDoacoes([]);
    /*@case 07.08.lista-vazia-map-e-set-vazios-c5249757*/expect(resumo.totais.size).toBe(0);
    /*@case 07.08.lista-vazia-map-e-set-vazios-845cd434*/expect(resumo.doadores.size).toBe(0);
    /*@case 07.08.lista-vazia-map-e-set-vazios-79cb465b*/expect(resumo.maiorCampanha).toBeNull();
  });
  test("valor 0 continua válido: a campanha existe", () => {
    const resumo = resumoDoacoes([{ campanha: "Z", doador: "x", valor: 0 }]);
    /*@case 07.08.valor-0-continua-valido-a-ca-d3ceac66*/expect(resumo.totais.get("Z")).toBe(0);
    /*@case 07.08.valor-0-continua-valido-a-ca-6cb4df58*/expect(resumo.maiorCampanha).toBe("Z");
  });
  test("empate de total favorece a campanha vista primeiro", () => {
    const empate = [
      { campanha: "B", doador: "x", valor: 10 },
      { campanha: "A", doador: "y", valor: 10 },
    ];
    /*@case 07.08.empate-de-total-favorece-a-c-6c3e9a9d*/expect(resumoDoacoes(empate).maiorCampanha).toBe("B");
  });
  test("campanha repetida acumula", () => {
    const resumo = resumoDoacoes([
      { campanha: "A", doador: "x", valor: 1 },
      { campanha: "B", doador: "y", valor: 5 },
      { campanha: "A", doador: "z", valor: 9 },
    ]);
    /*@case 07.08.campanha-repetida-acumula-0d76cec3*/expect(resumo.totais.get("A")).toBe(10);
    /*@case 07.08.campanha-repetida-acumula-26efa48c*/expect(resumo.maiorCampanha).toBe("A");
  });
  test("a entrada não é mutada", () => {
    const entrada = Object.freeze(doacoes.map((d) => Object.freeze({ ...d })));
    resumoDoacoes(entrada);
    /*@case 07.08.a-entrada-nao-e-mutada-f46273a7*/expect(entrada.length).toBe(3);
  });
});
