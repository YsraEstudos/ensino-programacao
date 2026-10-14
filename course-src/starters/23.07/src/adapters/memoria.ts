import { estadoInicial, type Estado } from "../dominio.ts";
import type { Repositorio } from "../portas.ts";

export function criarRepositorioEmMemoria(inicial: Estado = estadoInicial): Repositorio & { falharProximo(): void } {
  let salvo = structuredClone(inicial);
  let falhar = false;
  return {
    async carregar() {
      return structuredClone(salvo);
    },
    async salvar(estado) {
      if (falhar) {
        falhar = false;
        throw new Error("disco indisponível (simulado)");
      }
      salvo = structuredClone(estado);
    },
    falharProximo() {
      falhar = true;
    },
  };
}
