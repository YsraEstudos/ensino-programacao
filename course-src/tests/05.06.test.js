import { ordenarSemMutar, ordenarSemMutarModerno } from "./main.js";

const versoes = { "cópia explícita": ordenarSemMutar, "métodos modernos": ordenarSemMutarModerno };

for (const [nome, ordenar] of Object.entries(versoes)) {
  describe(nome, () => {
    test("ordem numérica decrescente (exemplo público)", () => {
      /*@case 05.06.ordem-numerica-decrescente-e-330c8059*/expect(ordenar([3, 1, 2])).toEqual([3, 2, 1]);
    });
    test("compara números, não texto", () => {
      /*@case 05.06.compara-numeros-nao-texto-0fcef145*/expect(ordenar([10, 9, 100])).toEqual([100, 10, 9]);
    });
    test("não altera a entrada", () => {
      const entrada = [3, 1, 2];
      ordenar(entrada);
      /*@case 05.06.nao-altera-a-entrada-d9586f23*/expect(entrada).toEqual([3, 1, 2]);
    });
    test("entrada congelada funciona sem erro", () => {
      /*@case 05.06.entrada-congelada-funciona-s-935e8423*/expect(ordenar(Object.freeze([2, 1]))).toEqual([2, 1]);
      /*@case 05.06.entrada-congelada-funciona-s-897e9d99*/expect(ordenar(Object.freeze([1, 2]))).toEqual([2, 1]);
    });
    test("lista vazia", () => {
      /*@case 05.06.lista-vazia-27b413ab*/expect(ordenar([])).toEqual([]);
    });
    test("devolve uma lista nova", () => {
      const entrada = [1];
      /*@case 05.06.devolve-uma-lista-nova-4a84ff83*/expect(ordenar(entrada) === entrada).toBe(false);
    });
  });
}
