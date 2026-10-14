// 17.07 · Preservar literais na chamada com `const` no parâmetro de tipo (TypeScript 5.0 ou posterior).

export function defineRoutesComum<T extends Record<string, string>>(rotas: T): T {
  return rotas;
}

// Implemente: mesmo corpo, mas com `<const T extends ...>`.
// export function defineRoutes___

// Compare os tipos inferidos no editor:
export const comum = defineRoutesComum({ home: "/", sobre: "/sobre" });
// const preciso = defineRoutes({ home: "/", sobre: "/sobre" });     // esperado: home: "/"
// const noCallSite = defineRoutesComum({ home: "/" } as const);     // alternativa no call site
// const jaAlargada = { home: "/" };
// const tarde = defineRoutes(jaAlargada);                            // literais voltam? ___

// Que garantia existe no tipo e qual não existe em runtime (o objeto fica congelado?) ___
