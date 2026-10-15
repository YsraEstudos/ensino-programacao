# 07.15 — Referência

A causa está em `src/regras.js`, função `temMulta`: a comparação deve ser `>` (passou da carência), não `>=`. Com `>=`, o relatório filtra quem tem 2 dias de atraso e lista essa pessoa com multa 0. `src/relatorio.js` apenas usa `temMulta`; `src/apresentacao.js` só formata e não decide a lista.
