// 18.09 · O que roda e o que some.
// Compile com `npx tsc consumidor.ts --outDir saida --target es2024 --module nodenext --verbatimModuleSyntax --rewriteRelativeImportExtensions`
// (package.json com "type": "module") e compare consumidor.ts com saida/consumidor.js.
// O Node.js 24 também roda o .ts direto: compare `node consumidor.ts` com `node saida/consumidor.js`.

import type { Schema } from "./side.ts";
import { init } from "./side.ts";

const schema: Schema = { campos: ["nome"] };
init(schema);

// Perguntas:
// 1. Quais imports aparecem em saida/consumidor.js? ___
// 2. Quantas vezes "side carregado" aparece ao rodar `node saida/consumidor.js`? ___
// 3. Troque `import type { Schema }` por `import { Schema }`. O que verbatimModuleSyntax diz? ___
// 4. Se um módulo só tivesse tipos e efeito colateral, como manter o efeito? (dica: `import "./side.ts"`) ___
