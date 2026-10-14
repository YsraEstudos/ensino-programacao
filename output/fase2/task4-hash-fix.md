# Task 4 — correção do fingerprint de anotações

## Causa e correção preparada

`output/fase2/check-regex-context.mjs` reproduziu o defeito: Acorn aceita as duas fontes, mas trocar `a` por `b` dentro de `/[/*@case 04.04.a*/]/` depois de `if (true)` mantinha o mesmo fingerprint. O scanner manual tentava decidir sozinho quando `/` inicia uma regex e classificava esse comentário aparente como uma anotação removível.

Adicionei `public/course-case-markers.js`: ele usa o parser Acorn exposto em `DevPathCompilerEngine.parse` para reconhecer os comentários por posição, depois de parsear a fonte inteira. Só remove comentários de bloco cujo conteúdo inteiro corresponde a `@case ID`. Depois da remoção, compara a sequência real de tokens (tipo e lexema) com a original; se houver fusão de tokens ou o parse da versão removida falhar, troca as anotações por espaços, preservando os terminadores de linha. Parse inválido ou parser indisponível preserva a fonte integralmente. O helper e o grafo de módulos compartilham uma promise de carregamento e guardam a mesma instância de engine. O helper pode carregar o bundle JavaScript já gerado em `DevPathCompilerAssets.script`, sem chamar `initialize` e sem buscar o arquivo WASM. `public/course-assessment.js` aguarda essa preparação somente quando encontra uma anotação em uma suite reconhecida e delega a remoção ao helper.

Preservei os campos, schema `/2`, allowlist e regras existentes do fingerprint. Os testes novos demonstram a mudança semântica das regexes após `)` e `}`, a equivalência annotation-only e a preservação de texto em strings, templates e comentários editoriais, além do fallback conservador para JavaScript inválido e parser ausente. Também cobrem `return` seguido de identificador Unicode, operadores de divisão e soma, duas preparações concorrentes com uma única tag, e fingerprint antes de um build real que continua usando o engine capturado mesmo quando o global muda durante a inicialização.

Limite conservador: se uma fonte tiver uma anotação cuja remoção una tokens, a versão usada no hash mantém separadores em todas as anotações daquela suite, então o texto normalizado pode diferir da mesma fonte sem comentários. Isso prioriza preservar o fluxo de tokens e o comportamento; os markers do catálogo atual ficam em separadores seguros e seguem a equivalência annotation-only.

## Verificação

- RED: antes da correção, `node --test scripts/test-course-assessment.mjs` falhou nas regressões de regex após controle/bloco e na exigência de preservar marcadores em JavaScript inválido.
- GREEN: `node --test scripts/test-course-assessment.mjs` passou, 83/83.
- `node output/fase2/check-regex-context.mjs` passou e agora reporta `regexChangeIgnored: false`.
- `node scripts/test-module-graph.mjs`: 7/7, incluindo carregamento concorrente e fingerprint antes de build real sem segunda instância.
- `node scripts/test-phase2-contracts.mjs`: 156 suítes, 1.027 asserts, 995 IDs estáveis na leitura final do checkout (o catálogo compartilhado mudou durante este turno).
- `node scripts/test-phase2-feedback.mjs`: 4/4.
- `node scripts/test-course-controller.mjs`: 13/13.
- `git diff --check`: código de saída 0; Git apenas avisou sobre conversão LF/CRLF em outros arquivos já sujos do checkout.

## Ligação pendente para o root

Não editei `public/devpath.html`, `public/app.js`, controller, nem builders, conforme a restrição desta subtarefa. Para ativar a correção na página, incluir `<script src="/course-case-markers.js" defer></script>` depois de `compiler-assets.js` e antes de `module-graph.js`, `course-assessment.js` e `app.js` em `public/devpath.html`. Ao calcular um fingerprint com anotação, o helper carrega `DevPathCompilerAssets.script` e usa apenas `parse`, sem inicializar esbuild nem buscar WASM. A compilação posterior reutiliza essa mesma instância e inicializa o WASM no fluxo normal do grafo. Depois, regenerar os hashes/cache-busters de HTML conforme o fluxo normal do build e repetir o repro e os gates acima. Até essa ligação ser aplicada, o fallback seguro mantém os marcadores no hash, portanto edições apenas de anotação invalidam a identidade nessa página.

Fonte TypeScript não é parseada por Acorn; como no caso de sintaxe JavaScript inválida, ela permanece intacta no hash. O comportamento é conservador e não tenta fazer remoção lexical aproximada.
