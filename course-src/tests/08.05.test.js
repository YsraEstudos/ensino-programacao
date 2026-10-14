import { visitarTodos, lerTodos } from "./main.js";

function coletar(funcao, lista) {
  const chamadas = [];
  funcao(lista, (valor) => chamadas.push(valor));
  return chamadas;
}

function indicesLidos(lista) {
  const lidos = [];
  const observada = new Proxy(lista, {
    get(alvo, chave, receptor) {
      if (typeof chave === "string" && /^[0-9]+$/.test(chave)) lidos.push(Number(chave));
      return Reflect.get(alvo, chave, receptor);
    },
  });
  lerTodos(observada, () => {});
  return lidos;
}

describe("visitarTodos", () => {
  test("visita A, B, C (exemplo público)", () => {
    /*@case 08.05.visita-a-b-c-exemplo-publico-1dc98445*/expect(coletar(visitarTodos, ["A", "B", "C"])).toEqual(["A", "B", "C"]);
  });
  test("lista de um item visita exatamente uma vez", () => {
    /*@case 08.05.lista-de-um-item-visita-exat-cc0e2435*/expect(coletar(visitarTodos, ["A"])).toEqual(["A"]);
  });
  test("lista vazia não visita nada", () => {
    /*@case 08.05.lista-vazia-nao-visita-nada-7c96dcbb*/expect(coletar(visitarTodos, [])).toEqual([]);
  });
});

describe("lerTodos", () => {
  test("lê os índices 0, 1, 2 sem passar do fim (exemplo público)", () => {
    /*@case 08.05.le-os-indices-0-1-2-sem-pass-4c74e7b6*/expect(indicesLidos(["A", "B", "C"])).toEqual([0, 1, 2]);
  });
  test("nunca entrega undefined por ler além da lista", () => {
    /*@case 08.05.nunca-entrega-undefined-por--c4f080fa*/expect(coletar(lerTodos, ["A", "B", "C"])).toEqual(["A", "B", "C"]);
  });
  test("tamanhos 0 e 1", () => {
    /*@case 08.05.tamanhos-0-e-1-9bd1c328*/expect(indicesLidos([])).toEqual([]);
    /*@case 08.05.tamanhos-0-e-1-5e32f8a6*/expect(indicesLidos(["A"])).toEqual([0]);
    /*@case 08.05.tamanhos-0-e-1-be249ad9*/expect(coletar(lerTodos, ["A"])).toEqual(["A"]);
  });
  test("valores undefined legítimos são entregues, não confundidos com fim", () => {
    /*@case 08.05.valores-undefined-legitimos--42d7bbf7*/expect(coletar(lerTodos, [undefined, 1]).length).toBe(2);
  });
});
