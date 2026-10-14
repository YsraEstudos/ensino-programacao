# Plano de migração

`tsconfig.json` de partida: `allowJs: true`, `checkJs: false`, `strict: true`, `noEmit: true`. Ligue a verificação arquivo por arquivo com `// @ts-check`.

| Passo | Módulo | O que muda | Critério para avançar |
|-------|--------|------------|-----------------------|
| 1 | c.js | | `tsc --noEmit` limpo, `node a.js` imprime 15 |
| 2 | | | |
| 3 | | | |

Regras: o número de `any` não cresce entre passos; o JSON de `lerPedido` passa a ser validado; os consumidores continuam rodando a cada passo.

Por que começar pela folha (C) e não pela entrada (A)?
