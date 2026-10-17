# Evidência RED antes da referência

2026-10-16, Node26.7.0, Windows. `node --test scripts/test-phase7-libraries.mjs` inicialmente falhou 2/2 por ERR_ASSERTION: lockfile e gate ainda ausentes. Esses dois casos demonstram somente o gate de autoria.

A tentativa inicial de npm offline usou cache vazio e retornou ENOTCACHED; isso foi erro de ambiente e não conta como vermelho pedagógico. O lockfile foi projetado da entrada TypeScript6.0.3 já instalada e fixada em ../frontend/package-lock.json. `npm.cmd ci --ignore-scripts --offline --no-audit --no-fund --cache C:/Users/israe/AppData/Local/npm-cache` então instalou 1 pacote, validando resolução/integridade reais sem modificar a raiz do curso.

Antes de escrever reference/: `npm.cmd test` compilou TSstrict/isolatedDeclarations, executou npm pack --json1.1.0 (7 arquivos) e instalou o tarball em consumidor externo. O teste falhou ERR_ASSERTION `22.09 whitespace semantics preserved`, actual `acao  clara`, expected `acao--clara`; nenhuma falha de import, TS, spawn ou instalação foi aceita como RED.
