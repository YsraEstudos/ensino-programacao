# 14.23 — Referência de leitura

1. Campo `exports` no `package.json`. `main` só define a entrada do nome puro (`oficina-notas`); ele não cria subcaminhos externos.
2. Previsões: `oficina-notas` resolve para `./src/index.js`; `oficina-notas/formatar` resolve para `./src/formatar.js`; `oficina-notas/calculo` falha com ERR_PACKAGE_PATH_NOT_EXPORTED, porque não há entrada `./calculo` em `exports`; `oficina-notas/src/calculo.js` também falha, porque `exports` não expõe a pasta inteira.
3. `main` define apenas o ponto de entrada do nome do pacote. Para expor `/formatar`, é preciso uma entrada `./formatar` em `exports`, que existe no arquivo.
4. Imports relativos (`../src/calculo.js`) dentro do próprio pacote seguem o caminho do arquivo e não passam pelo mapa `exports`; por isso os testes internos funcionam.
5. Acrescentar `"./calculo": "./src/calculo.js"` em `exports`. A API pública ganha um subcaminho novo e estável; a pasta `src/` continua fechada.

Critérios: cita o campo `exports`; distingue `main` de `exports`; faz a previsão antes de conferir; explica os imports relativos; propõe a mudança mínima e o efeito na API.
