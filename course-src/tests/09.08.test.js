import { createStore } from "./main.js";

describe("estado e notificação", () => {
  test("getState devolve o estado atual (exemplo público)", () => {
    const store = createStore(0);
    /*@case 09.08.getstate-devolve-o-estado-at-3e202328*/expect(store.getState()).toBe(0);
    store.setState(1);
    /*@case 09.08.getstate-devolve-o-estado-at-124c7e31*/expect(store.getState()).toBe(1);
  });
  test("assinante recebe o novo estado uma vez (exemplo público)", () => {
    const store = createStore(0);
    const recebidos = [];
    store.subscribe((estado) => recebidos.push(estado));
    store.setState(1);
    /*@case 09.08.assinante-recebe-o-novo-esta-56f2ca9d*/expect(recebidos).toEqual([1]);
  });
  test("depois de cancelar, não recebe mais nada", () => {
    const store = createStore(0);
    const recebidos = [];
    const cancelar = store.subscribe((estado) => recebidos.push(estado));
    store.setState(1);
    cancelar();
    store.setState(2);
    /*@case 09.08.depois-de-cancelar-nao-receb-d424fd8e*/expect(recebidos).toEqual([1]);
    /*@case 09.08.depois-de-cancelar-nao-receb-e593500f*/expect(store.getState()).toBe(2);
  });
  test("cancelar duas vezes é seguro", () => {
    const store = createStore(0);
    const cancelar = store.subscribe(() => {});
    cancelar();
    /*@case 09.08.cancelar-duas-vezes-e-seguro-97e2c83c*/expect(() => cancelar()).not.toThrow();
  });
});

describe("política de notificação", () => {
  test("setState com o mesmo valor (Object.is) não notifica", () => {
    const store = createStore(0);
    let chamadas = 0;
    store.subscribe(() => chamadas++);
    store.setState(0);
    store.setState(Number.NaN);
    store.setState(Number.NaN);
    /*@case 09.08.setstate-com-o-mesmo-valor-o-93ab9b4f*/expect(chamadas).toBe(1);
  });
  test("dois assinantes recebem na ordem de inscrição", () => {
    const store = createStore("a");
    const ordem = [];
    store.subscribe((e) => ordem.push(["um", e]));
    store.subscribe((e) => ordem.push(["dois", e]));
    store.setState("b");
    /*@case 09.08.dois-assinantes-recebem-na-o-cd36cc42*/expect(ordem).toEqual([["um", "b"], ["dois", "b"]]);
  });
  test("assinante que se cancela durante a emissão não quebra a iteração", () => {
    const store = createStore(0);
    const chamados = [];
    const cancelarA = store.subscribe(() => { chamados.push("A"); cancelarA(); });
    store.subscribe(() => chamados.push("B"));
    store.setState(1);
    store.setState(2);
    /*@case 09.08.assinante-que-se-cancela-dur-963f3f53*/expect(chamados).toEqual(["A", "B", "B"]);
  });
});

describe("isolamento", () => {
  test("duas stores não compartilham estado nem assinantes", () => {
    const a = createStore(1);
    const b = createStore(1);
    let notificacoesB = 0;
    b.subscribe(() => notificacoesB++);
    a.setState(2);
    /*@case 09.08.duas-stores-nao-compartilham-799d00d5*/expect(a.getState()).toBe(2);
    /*@case 09.08.duas-stores-nao-compartilham-10388013*/expect(b.getState()).toBe(1);
    /*@case 09.08.duas-stores-nao-compartilham-69e01036*/expect(notificacoesB).toBe(0);
  });
});
