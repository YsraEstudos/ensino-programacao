import { memoize } from "./main.js";

function instrumentada(corpo) {
  const funcao = (x) => { funcao.chamadas++; return corpo(x); };
  funcao.chamadas = 0;
  return funcao;
}

describe("memoize", () => {
  test("f(2), f(2), f(3) chama fn duas vezes (exemplo público)", () => {
    const dobro = instrumentada((x) => x * 2);
    const f = memoize(dobro);
    /*@case 09.06.f-2-f-2-f-3-chama-fn-duas-ve-794df95b*/expect([f(2), f(2), f(3)]).toEqual([4, 4, 6]);
    /*@case 09.06.f-2-f-2-f-3-chama-fn-duas-ve-ccd7caff*/expect(dobro.chamadas).toBe(2);
  });
  test("entrada 0 com resultado 0 é um acerto de cache", () => {
    const zero = instrumentada((x) => x * 5);
    const f = memoize(zero);
    /*@case 09.06.entrada-0-com-resultado-0-e--5e27883c*/expect(f(0)).toBe(0);
    /*@case 09.06.entrada-0-com-resultado-0-e--5e27883c*/expect(f(0)).toBe(0);
    /*@case 09.06.entrada-0-com-resultado-0-e--269c3eb9*/expect(zero.chamadas).toBe(1);
  });
  test("resultado falsy ou undefined não é recalculado", () => {
    const vazio = instrumentada(() => undefined);
    const f = memoize(vazio);
    f("a"); f("a");
    /*@case 09.06.resultado-falsy-ou-undefined-eb6f6952*/expect(vazio.chamadas).toBe(1);
    const falso = instrumentada(() => false);
    const g = memoize(falso);
    g(1); g(1);
    /*@case 09.06.resultado-falsy-ou-undefined-2d10201f*/expect(falso.chamadas).toBe(1);
  });
  test("NaN como chave acerta o cache", () => {
    const identidade = instrumentada((x) => x);
    const f = memoize(identidade);
    f(NaN); f(NaN);
    /*@case 09.06.nan-como-chave-acerta-o-cach-18768994*/expect(identidade.chamadas).toBe(1);
  });
  test("cada memoize tem o próprio cache", () => {
    const corpo = instrumentada((x) => x + 1);
    const a = memoize(corpo);
    const b = memoize(corpo);
    a(1); b(1);
    /*@case 09.06.cada-memoize-tem-o-proprio-c-7413d75a*/expect(corpo.chamadas).toBe(2);
  });
  test("entradas diferentes não se misturam (1 e '1')", () => {
    const f = memoize((x) => typeof x);
    /*@case 09.06.entradas-diferentes-nao-se-m-f4e234f0*/expect(f(1)).toBe("number");
    /*@case 09.06.entradas-diferentes-nao-se-m-2814b958*/expect(f("1")).toBe("string");
  });
});
