import { caminho } from "./main.js";

const grafo = () => new Map([["A", ["B", "C"]], ["B", ["D"]], ["C", ["D"]], ["D", []]]);

describe("caminho (BFS em Map de adjacência)", () => {
  test("A→D pela ordem dos vizinhos (exemplo público)", () => {
    /*@case 08.08.a-d-pela-ordem-dos-vizinhos--e18e9865*/expect(caminho(grafo(), "A", "D")).toEqual(["A", "B", "D"]);
  });
  test("início igual ao fim devolve só o início", () => {
    /*@case 08.08.inicio-igual-ao-fim-devolve--4f59a216*/expect(caminho(grafo(), "A", "A")).toEqual(["A"]);
  });
  test("sem caminho devolve null", () => {
    /*@case 08.08.sem-caminho-devolve-null-ceb9feaf*/expect(caminho(grafo(), "D", "A")).toBeNull();
  });
  test("vértice ausente devolve null", () => {
    /*@case 08.08.vertice-ausente-devolve-null-85a0e897*/expect(caminho(grafo(), "X", "A")).toBeNull();
    /*@case 08.08.vertice-ausente-devolve-null-96aefde9*/expect(caminho(grafo(), "A", "X")).toBeNull();
  });
});

describe("busca em largura de verdade", () => {
  test("devolve o caminho mais curto, não o primeiro encontrado em profundidade", () => {
    const g = new Map([["A", ["B", "C"]], ["B", ["E"]], ["E", ["D"]], ["C", ["D"]], ["D", []]]);
    /*@case 08.08.devolve-o-caminho-mais-curto-b48cf3c8*/expect(caminho(g, "A", "D")).toEqual(["A", "C", "D"]);
  });
  test("ciclo: encerra sem repetir vértice", () => {
    const ciclo = new Map([["A", ["B"]], ["B", ["A"]]]);
    /*@case 08.08.ciclo-encerra-sem-repetir-ve-a252e69d*/expect(caminho(ciclo, "A", "B")).toEqual(["A", "B"]);
    /*@case 08.08.ciclo-encerra-sem-repetir-ve-56f2772f*/expect(caminho(new Map([["A", ["B"]], ["B", ["A"]], ["X", []]]), "A", "X")).toBeNull();
  });
  test("não altera o grafo", () => {
    const g = grafo();
    caminho(g, "A", "D");
    /*@case 08.08.nao-altera-o-grafo-66db1c35*/expect(g.get("A")).toEqual(["B", "C"]);
    /*@case 08.08.nao-altera-o-grafo-d0c0c0d8*/expect(g.size).toBe(4);
  });
});
