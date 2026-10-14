import { salvar, restaurar } from "./main.js";

const padrao = { nome: "Aventureiro", vida: 10, itens: [] };

describe("salvar", () => {
  test("produz JSON V2 (exemplo público)", () => {
    const texto = salvar({ nome: "Ana", vida: 5, itens: ["chave"] });
    /*@case 06.09.produz-json-v2-exemplo-publi-677d5f66*/expect(JSON.parse(texto)).toEqual({ version: 2, nome: "Ana", vida: 5, itens: ["chave"] });
  });
});

describe("restaurar", () => {
  test("round-trip mantém os mesmos campos e valores", () => {
    const estado = { nome: "Ana", vida: 5, itens: ["chave"] };
    /*@case 06.09.round-trip-mantem-os-mesmos--883a6806*/expect(restaurar(salvar(estado))).toEqual(estado);
  });
  test("vida 0 e lista vazia são válidos", () => {
    /*@case 06.09.vida-0-e-lista-vazia-sao-val-23dd2d52*/expect(restaurar(salvar({ nome: "Bo", vida: 0, itens: [] }))).toEqual({ nome: "Bo", vida: 0, itens: [] });
  });
  test("V1 sem itens migra para itens vazio", () => {
    /*@case 06.09.v1-sem-itens-migra-para-iten-21711f45*/expect(restaurar('{"version":1,"nome":"Lia","vida":7}')).toEqual({ nome: "Lia", vida: 7, itens: [] });
  });
  test("campo extra é ignorado", () => {
    /*@case 06.09.campo-extra-e-ignorado-892682ff*/expect(restaurar('{"version":2,"nome":"Ana","vida":5,"itens":["a"],"extra":true}')).toEqual({ nome: "Ana", vida: 5, itens: ["a"] });
  });
  test("vida negativa não é aceita como estado", () => {
    /*@case 06.09.vida-negativa-nao-e-aceita-c-a11fb33a*/expect(restaurar('{"version":2,"nome":"Ana","vida":-1,"itens":[]}')).toEqual({ status: "invalid" });
  });
  test("texto inválido restaura os defaults V2", () => {
    /*@case 06.09.texto-invalido-restaura-os-d-7e5e39be*/expect(restaurar("{quebrado")).toEqual(padrao);
    /*@case 06.09.texto-invalido-restaura-os-d-6aabad3a*/expect(restaurar("")).toEqual(padrao);
  });
  test("cada restauração de defaults devolve uma lista nova", () => {
    const a = restaurar("x");
    a.itens.push("lixo");
    /*@case 06.09.cada-restauracao-de-defaults-217c83ad*/expect(restaurar("y").itens).toEqual([]);
  });
});
