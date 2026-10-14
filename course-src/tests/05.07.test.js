import { metricas } from "./main.js";

describe("metricas devolve [min, max, soma, media]", () => {
  test("exemplo público", () => {
    /*@case 05.07.exemplo-publico-14b778ec*/expect(metricas([2, 4, 6])).toEqual([2, 6, 12, 4]);
  });
  test("um único valor negativo", () => {
    /*@case 05.07.um-unico-valor-negativo-ca98df67*/expect(metricas([-3])).toEqual([-3, -3, -3, -3]);
  });
  test("ordem qualquer, negativos e média fracionária", () => {
    /*@case 05.07.ordem-qualquer-negativos-e-m-0ea45583*/expect(metricas([5, -1, 3])).toEqual([-1, 5, 7, 7 / 3]);
  });
});

describe("bordas do contrato", () => {
  test("lista vazia mantém o retorno publicado", () => {
    /*@case 05.07.lista-vazia-mantem-o-retorno-c8625100*/expect(metricas([])).toEqual([null, null, 0, null]);
  });
  test("valor não finito lança TypeError", () => {
    /*@case 05.07.valor-nao-finito-lanca-typee-74621739*/expect(() => metricas([1, Number.NaN])).toThrow(TypeError);
    /*@case 05.07.valor-nao-finito-lanca-typee-a503c70c*/expect(() => metricas([1, Infinity])).toThrow(TypeError);
    /*@case 05.07.valor-nao-finito-lanca-typee-16de93fc*/expect(() => metricas([-Infinity])).toThrow(TypeError);
  });
  test("texto numérico não é número finito", () => {
    /*@case 05.07.texto-numerico-nao-e-numero--b6f2d73b*/expect(() => metricas([1, "2"])).toThrow(TypeError);
  });
  test("não muta a entrada", () => {
    const entrada = Object.freeze([3, 1, 2]);
    /*@case 05.07.nao-muta-a-entrada-f5b1955c*/expect(metricas(entrada)).toEqual([1, 3, 6, 2]);
    /*@case 05.07.nao-muta-a-entrada-f1bf85b2*/expect(entrada).toEqual([3, 1, 2]);
  });
});
