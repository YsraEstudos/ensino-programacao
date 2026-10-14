import { analisar } from "./main.js";

const ev = (tempo, acao, resultado) => ({ tempo, acao, resultado });

describe("exemplo público", () => {
  const resultado = analisar([ev(10, "ataque", "sucesso"), ev(20, "ataque", "falha"), ev(25, "cura", "sucesso")]);
  test("duração, únicas e top", () => {
    /*@case 07.09.duracao-unicas-e-top-952aa15c*/expect(resultado.duracao).toBe(15);
    /*@case 07.09.duracao-unicas-e-top-b4da99d4*/expect(resultado.unicas).toBe(2);
    /*@case 07.09.duracao-unicas-e-top-7f23d4cc*/expect(resultado.top).toBe("ataque");
  });
  test("taxa de sucesso 2/3", () => {
    /*@case 07.09.taxa-de-sucesso-2-3-60b3ccbf*/expect(resultado.taxa).toBeCloseTo(2 / 3, 5);
  });
});

describe("bordas", () => {
  test("lista vazia", () => {
    /*@case 07.09.lista-vazia-aa15b1c0*/expect(analisar([])).toEqual({ duracao: 0, unicas: 0, top: null, taxa: 0 });
  });
  test("empate de frequência fica com a primeira ação vista na entrada original", () => {
    const r = analisar([ev(5, "abrir", "sucesso"), ev(6, "fechar", "sucesso"), ev(7, "fechar", "falha"), ev(8, "abrir", "falha")]);
    /*@case 07.09.empate-de-frequencia-fica-co-51a2f4b4*/expect(r.duracao).toBe(3);
    /*@case 07.09.empate-de-frequencia-fica-co-18cda91b*/expect(r.unicas).toBe(2);
    /*@case 07.09.empate-de-frequencia-fica-co-6fe2a6d8*/expect(r.top).toBe("abrir");
    /*@case 07.09.empate-de-frequencia-fica-co-7963a0f1*/expect(r.taxa).toBe(0.5);
  });
  test("empate: a primeira vista é a do array, não a do menor tempo", () => {
    const r = analisar([ev(50, "x", "sucesso"), ev(1, "y", "sucesso")]);
    /*@case 07.09.empate-a-primeira-vista-e-a--6ee00ef8*/expect(r.top).toBe("x");
  });
});

describe("tempos fora de ordem", () => {
  test("a duração não depende da ordem de chegada", () => {
    const r = analisar([ev(30, "a", "sucesso"), ev(10, "a", "sucesso"), ev(20, "a", "falha")]);
    /*@case 07.09.a-duracao-nao-depende-da-ord-9b697912*/expect(r.duracao).toBe(20);
  });
  test("um único evento tem duração 0", () => {
    /*@case 07.09.um-unico-evento-tem-duracao--c0b8b87a*/expect(analisar([ev(99, "a", "falha")])).toEqual({ duracao: 0, unicas: 1, top: "a", taxa: 0 });
  });
  test("a entrada não é mutada (nem reordenada)", () => {
    const entrada = Object.freeze([Object.freeze(ev(30, "a", "sucesso")), Object.freeze(ev(10, "b", "falha"))]);
    analisar(entrada);
    /*@case 07.09.a-entrada-nao-e-mutada-nem-r-a675e0b4*/expect(entrada[0].tempo).toBe(30);
    /*@case 07.09.a-entrada-nao-e-mutada-nem-r-5b49e4a0*/expect(entrada[1].tempo).toBe(10);
  });
});
