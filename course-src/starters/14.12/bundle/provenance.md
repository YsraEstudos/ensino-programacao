# Artefato real de build para14.12

Gerado em13/10/2026 com Vite8.0.13 e Node26.7.0, já instalados no checkout. Sem instalação ou alteração de dependências.

Comando a partir de devpath-publish:

```powershell
node node_modules/vite/bin/vite.js build output/fase2/bundle-14-12/source --outDir ../built --sourcemap
```

Entradas em source/: index.html, main.js, math.js, details.js e style.css. Saída em built/: HTML, CSS extraído, chunk inicial, chunk de import dinâmico e dois source maps com sourcesContent. O build transformou8 módulos e saiu com código0. O CSS tem arquivo próprio, a função multiplicar não utilizada foi removida e details.js entrou no chunk dinâmico.

O artefato demonstra este projeto e esta configuração. Não prova que todos os bundlers geram nomes, chunks ou transformações iguais, nem que o aluno executou um build local. A interpretação permanece evidência declarada.
