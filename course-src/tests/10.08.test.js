import { criarEntidade, mover, receberDano } from "./main.js";

const nova = (id, vida = 10, capacidades = ["mover"]) => criarEntidade({ id, vida, posicao: { x: 0, y: 0 }, capacidades });

describe("cenários públicos", () => {
  test("A move (1,2) e recebe dano 3: posição (1,2), vida 7", () => {
    const a = nova("A");
    /*@case 10.08.a-move-1-2-e-recebe-dano-3-p-0741bad3*/expect(mover(a, 1, 2)).toEqual({ status: "ok" });
    /*@case 10.08.a-move-1-2-e-recebe-dano-3-p-0854152d*/expect(receberDano(a, 3)).toBe(true);
    /*@case 10.08.a-move-1-2-e-recebe-dano-3-p-22a6eba5*/expect(a.posicao).toEqual({ x: 1, y: 2 });
    /*@case 10.08.a-move-1-2-e-recebe-dano-3-p-38d99263*/expect(a.vida).toBe(7);
  });
  test("B recebe dano negativo: retorno false e nenhuma mutação", () => {
    const b = nova("B");
    /*@case 10.08.b-recebe-dano-negativo-retor-827e5e84*/expect(receberDano(b, -1)).toBe(false);
    /*@case 10.08.b-recebe-dano-negativo-retor-e1fbfbbd*/expect(b.vida).toBe(10);
  });
  test("C sem a capacidade declarada: { status: 'unsupported' } e posição intacta", () => {
    const c = nova("C", 10, []);
    /*@case 10.08.c-sem-a-capacidade-declarada-edd01f17*/expect(mover(c, 5, 5)).toEqual({ status: "unsupported" });
    /*@case 10.08.c-sem-a-capacidade-declarada-f48bc76b*/expect(c.posicao).toEqual({ x: 0, y: 0 });
  });
  test("D com vida 4 recebe dano 9: vida 0", () => {
    const d = nova("D", 4);
    /*@case 10.08.d-com-vida-4-recebe-dano-9-v-bfc439c8*/expect(receberDano(d, 9)).toBe(true);
    /*@case 10.08.d-com-vida-4-recebe-dano-9-v-64315bf5*/expect(d.vida).toBe(0);
  });
});

describe("validação do dano", () => {
  test("NaN, Infinity e texto são rejeitados sem mutar", () => {
    const e = nova("E");
    /*@case 10.08.nan-infinity-e-texto-sao-rej-2a5f9542*/expect(receberDano(e, Number.NaN)).toBe(false);
    /*@case 10.08.nan-infinity-e-texto-sao-rej-144dfe5f*/expect(receberDano(e, Infinity)).toBe(false);
    /*@case 10.08.nan-infinity-e-texto-sao-rej-2d239149*/expect(receberDano(e, "3")).toBe(false);
    /*@case 10.08.nan-infinity-e-texto-sao-rej-c4a173b7*/expect(e.vida).toBe(10);
  });
  test("dano zero é válido", () => {
    const e = nova("E");
    /*@case 10.08.dano-zero-e-valido-ce1ed46e*/expect(receberDano(e, 0)).toBe(true);
    /*@case 10.08.dano-zero-e-valido-205cd2e3*/expect(e.vida).toBe(10);
  });
});

describe("estado por entidade", () => {
  test("A e B criadas do mesmo objeto de posição não compartilham estado", () => {
    const posicao = { x: 0, y: 0 };
    const capacidades = ["mover"];
    const a = criarEntidade({ id: "A", vida: 10, posicao, capacidades });
    const b = criarEntidade({ id: "B", vida: 10, posicao, capacidades });
    mover(a, 1, 0);
    /*@case 10.08.a-e-b-criadas-do-mesmo-objet-23a974df*/expect(a.posicao).toEqual({ x: 1, y: 0 });
    /*@case 10.08.a-e-b-criadas-do-mesmo-objet-ccf76a59*/expect(b.posicao).toEqual({ x: 0, y: 0 });
    /*@case 10.08.a-e-b-criadas-do-mesmo-objet-1fbeee76*/expect(posicao).toEqual({ x: 0, y: 0 });
  });
  test("mudar o array de capacidades original não muda a entidade", () => {
    const capacidades = ["mover"];
    const e = criarEntidade({ id: "E", vida: 10, posicao: { x: 0, y: 0 }, capacidades });
    capacidades.length = 0;
    /*@case 10.08.mudar-o-array-de-capacidades-52601b94*/expect(mover(e, 1, 1)).toEqual({ status: "ok" });
  });
  test("a entidade guarda id e vida iniciais", () => {
    const e = nova("Z", 3);
    /*@case 10.08.a-entidade-guarda-id-e-vida--005e75b2*/expect(e.id).toBe("Z");
    /*@case 10.08.a-entidade-guarda-id-e-vida--5ab075a8*/expect(e.vida).toBe(3);
  });
});
