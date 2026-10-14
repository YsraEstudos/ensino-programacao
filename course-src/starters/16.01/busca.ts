// 16.01 · Estados de uma busca no catálogo.
// O modelo atual aceita combinações que não podem existir. Leia, liste-as e redesenhe.

type Produto = { id: number; nome: string };

// Modelo atual
type BuscaAntiga = {
  loading: boolean;
  error?: string;
  data?: Produto[];
};

// Isto compila, mas não faz sentido para o produto:
export const contraditoria: BuscaAntiga = { loading: true, error: "timeout", data: [] };

// Redesenhe como union discriminada por `status`: idle, loading, success (com data) e error (com message).
// type Busca =
//   | ___
//   | ___;

// Exemplos válidos escritos por você:
// const inicial: Busca = ___;
// const pronta: Busca = ___;

// Uma combinação que o novo tipo deve rejeitar (deixe comentada e explique o diagnóstico):
// const impossivel: Busca = ___;
