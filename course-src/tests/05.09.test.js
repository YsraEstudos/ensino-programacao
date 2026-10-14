import { aplicar } from "./main.js";

describe("aplicar executa as operações em ordem", () => {
  test("adicionar e listar (exemplo público)", () => {
    /*@case 05.09.adicionar-e-listar-exemplo-p-19223c77*/expect(aplicar(["adicionar espada", "adicionar poção", "listar"])).toEqual([true, true, "espada\npoção"]);
  });
  test("remover e listar (exemplo público)", () => {
    /*@case 05.09.remover-e-listar-exemplo-pub-eb118f39*/expect(aplicar(["adicionar espada", "adicionar poção", "remover espada", "listar"])).toEqual([true, true, true, "poção"]);
  });
  test("cada listar mostra o estado daquele momento", () => {
    /*@case 05.09.cada-listar-mostra-o-estado--ccb1f7a5*/expect(aplicar(["listar", "adicionar a", "listar", "adicionar b", "listar"])).toEqual(["", true, "a", true, "a\nb"]);
  });
});

describe("política de repetidos e ausentes", () => {
  test("adicionar duas vezes mantém duas linhas", () => {
    /*@case 05.09.adicionar-duas-vezes-mantem--71abbbb9*/expect(aplicar(["adicionar espada", "adicionar espada", "listar"])).toEqual([true, true, "espada\nespada"]);
  });
  test("remover ausente devolve false e não altera o estado", () => {
    /*@case 05.09.remover-ausente-devolve-fals-dddea0c5*/expect(aplicar(["adicionar espada", "remover escudo", "listar"])).toEqual([true, false, "espada"]);
  });
  test("remover tira só a primeira ocorrência", () => {
    /*@case 05.09.remover-tira-so-a-primeira-o-baa4b4e5*/expect(aplicar(["adicionar a", "adicionar a", "remover a", "listar"])).toEqual([true, true, true, "a"]);
  });
  test("lista vazia lista texto vazio", () => {
    /*@case 05.09.lista-vazia-lista-texto-vazi-22de1f62*/expect(aplicar(["listar"])).toEqual([""]);
    /*@case 05.09.lista-vazia-lista-texto-vazi-f934159f*/expect(aplicar([])).toEqual([]);
  });
});

describe("nomes com espaço", () => {
  test("o nome é o restante da operação", () => {
    /*@case 05.09.o-nome-e-o-restante-da-opera-b2e24a80*/expect(aplicar(["adicionar poção grande", "listar", "remover poção grande", "listar"])).toEqual([true, "poção grande", true, ""]);
  });
});

test("cada chamada começa com inventário vazio", () => {
  aplicar(["adicionar x"]);
  /*@case 05.09.cada-chamada-comeca-com-inve-bf0e0c28*/expect(aplicar(["listar"])).toEqual([""]);
});
