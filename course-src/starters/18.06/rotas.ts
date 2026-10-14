// 18.06 · satisfies versus anotação.
// Derive RouteName nas duas versões e compare.

type Rota = { path: string };

export const rotasAnotadas: Record<string, Rota> = {
  home: { path: "/" },
  about: { path: "/about" },
};

export const rotas = {
  home: { path: "/" },
  about: { path: "/about" },
} as const satisfies Record<string, Rota>;

export type RouteNameAnotada = keyof typeof rotasAnotadas; // previsão: ___
export type RouteName = keyof typeof rotas;                // previsão: ___

export function dispatch(nome: RouteName): string {
  return rotas[nome].path;
}

// Experimentos (descomente um por vez):
// dispatch("home");                                           // ___
// dispatch("missing");                                        // ___
// const ruim = { home: { path: 1 } } as const satisfies Record<string, Rota>; // ___
