# 24.01 — Fixture comum da Fase 7

## Ambiente local

Requer Node.js `>=24.0.0` e npm. No PowerShell do Windows:

```powershell
npm ci
npx playwright install chromium
npm test
npm run test:properties
npm run test:types
npm run test:http-contract
npm run test:e2e
npm run test:maintenance
npm run test:incident
npm run test:transfer
```

Playwright usa `scripts/run-e2e.mjs` para escolher duas portas loopback exclusivas uma vez por execução e compartilhar portas/origens com a configuração e todos os workers; não reutiliza servidor que já esteja aberto. A configuração concede `local-network-access` somente ao contexto isolado do navegador de teste para as requisições entre portas loopback. Os testes navegam entre duas origens reais em `127.0.0.1` para demonstrar CORS permitido e bloqueado e verificam no Chromium que CSP bloqueia script inline. Os contratos HTTP autorizam somente a origem exata configurada. Para executar manualmente, use `npm start`; por padrão o servidor usa `PORT=4173`, e `PORT=0` escolhe uma porta efêmera.

Se o Chromium já estiver instalado fora do cache associado à versão de Playwright do lockfile, defina `PHASE7_CHROMIUM_EXECUTABLE` com o caminho absoluto para esse executável antes de `npm run test:e2e`; sem essa variável, Playwright usa o Chromium do lockfile.

O primeiro teste deve falhar por asserção: implemente em `src/security.mjs` o contrato de sessão, autorização, CSRF, expiração, logout e comparação de senha. Uma falha de importação ou de dependência não comprova o comportamento esperado.

## Fluxo

1. Leia `ticket.md`, responda às perguntas e registre as hipóteses antes de editar.
2. Reproduza o incidente em `incident.md` com `npm run test:incident`; complete o postmortem com sintoma, investigação, causa, recuperação, prevenção e limites.
3. Faça o change request em `foreign-base/` e rode `npm run test:maintenance` antes/depois.
4. Implemente `transfer/submission.mjs` conforme `transfer/contract.md`; os testes devem falhar antes da implementação.
5. Rode os testes HTTP, de propriedade, tipos e navegador. Consulte as páginas oficiais em `src/ai-patch/docs-review.md`, escreva testes para os defeitos do patch de IA e justifique as decisões sem serviço externo.
6. Complete as quatro rubricas `autonomy`, `maintenance`, `transfer` e `communication` do mapa de competências.

## Evidência

As saídas, capturas, diffs e respostas do aluno são **evidência declarada (`local-declared`)**. A plataforma não executa nem valida esses artefatos e uma execução da equipe não prova que o projeto enviado pelo aluno foi executado.

A carga estimada é de 12–18 horas: 3–4,5 h para segurança, 3–4,5 h para testes, 3–4,5 h para trabalho profissional e 3–4,5 h para transferência e revisão do patch de IA. Registre os comandos que não rodaram por bloqueio de rede, instalação ou navegador como pendentes.
