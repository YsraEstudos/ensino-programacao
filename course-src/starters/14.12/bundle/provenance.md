# Artefato real de build para 14.12

Gerado em 13/10/2026 com Vite 8.0.13 e Node 26.7.0, sem instalação ou alteração de dependências. O bundle e os source maps foram produzidos a partir de `output/fase2/bundle-14-12/source/`; os mesmos cinco arquivos de origem estão disponíveis nesta atividade em `src/`.

Na revisão foi confirmado um defeito anterior de coerência: o `src/` que acompanhava o starter não era a origem desse bundle. Ele declarava `soma` em vez de `somar`, usava `result` em vez de `resultado`, e carregava os detalhes de modo estático, enquanto o bundle exercita o clique e o `import()` dinâmico. Os cinco arquivos atuais em `src/` foram alinhados ao `sourcesContent` do build existente, para que a comparação seja entre a fonte que explica o exemplo e sua saída correspondente.

Comando usado a partir da raiz `devpath-publish`:

```powershell
node node_modules/vite/bin/vite.js build output/fase2/bundle-14-12/source --outDir ../built --sourcemap
```

A saída inclui HTML, CSS extraído, chunk inicial, chunk de import dinâmico e dois source maps com `sourcesContent`. Para caber nos sete caminhos de leitura declarados pelo starter, os nomes dos arquivos foram normalizados de forma consistente (por exemplo, o chunk dinâmico é `details.js`); os comentários `sourceMappingURL`, os campos `file` e os caminhos `sources` dos mapas apontam para esses nomes e para `src/`. Os conteúdos dos mapas correspondem às fontes fornecidas. O CSS é emitido separadamente, `multiplicar` não é usado, e o clique em “Carregar detalhes” importa o chunk dinamicamente.

Este exemplo demonstra apenas o projeto e a configuração registrados. Não prova que outros bundlers emitam os mesmos nomes, chunks ou transformações, nem que o aluno tenha executado um build local. Compare os arquivos e declare o limite da evidência.
