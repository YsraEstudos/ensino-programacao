import { parseLinhas } from "./main.js";

describe("parseLinhas devolve [validas, rejeitadas]", () => {
  test("duas linhas válidas (exemplo público)", () => {
    const linhas = ["INFO|2026-01-02|ok", "WARN|2026-01-03|lento"];
    /*@case 05.08.duas-linhas-validas-exemplo--0c9a7379*/expect(parseLinhas(linhas)).toEqual([["INFO|2026-01-02|ok", "WARN|2026-01-03|lento"], []]);
  });
  test("sem delimitadores, campo vazio e mensagem vazia são rejeitados", () => {
    const linhas = ["ERRO", "INFO||vazio", "INFO|2026-01-02|"];
    /*@case 05.08.sem-delimitadores-campo-vazi-d53b2555*/expect(parseLinhas(linhas)).toEqual([[], ["ERRO", "INFO||vazio", "INFO|2026-01-02|"]]);
  });
  test("nível vazio também é rejeitado", () => {
    /*@case 05.08.nivel-vazio-tambem-e-rejeita-a701d4e0*/expect(parseLinhas(["|2026-01-02|msg"])).toEqual([[], ["|2026-01-02|msg"]]);
  });
  test("só um delimitador não basta", () => {
    /*@case 05.08.so-um-delimitador-nao-basta-31b67856*/expect(parseLinhas(["INFO|2026-01-02"])).toEqual([[], ["INFO|2026-01-02"]]);
  });
});

describe("a mensagem preserva o restante da linha", () => {
  test("barras verticais dentro da mensagem não rejeitam a linha", () => {
    /*@case 05.08.barras-verticais-dentro-da-m-eaf0081f*/expect(parseLinhas(["INFO|2026-01-02|a|b|c"])).toEqual([["INFO|2026-01-02|a|b|c"], []]);
  });
  test("a ordem original é mantida em cada grupo", () => {
    const linhas = ["B|d|m", "x", "A|d|m", "y"];
    /*@case 05.08.a-ordem-original-e-mantida-e-34b90883*/expect(parseLinhas(linhas)).toEqual([["B|d|m", "A|d|m"], ["x", "y"]]);
  });
});

describe("bordas", () => {
  test("lista vazia", () => {
    /*@case 05.08.lista-vazia-670d15a4*/expect(parseLinhas([])).toEqual([[], []]);
  });
  test("não altera a entrada", () => {
    const linhas = Object.freeze(["INFO|2026-01-02|ok", "ERRO"]);
    /*@case 05.08.nao-altera-a-entrada-f077419d*/expect(parseLinhas(linhas)).toEqual([["INFO|2026-01-02|ok"], ["ERRO"]]);
  });
});
