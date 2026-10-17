# 24.04 · slug-kit

Projeto independente de 22.09. Node >=24.0.0 e TypeScript6.0.3. Execute `npm ci`, `npm run build`, `npm test` e `npm run pack:releases` nesta pasta. No Windows use npm.cmd. `artifacts/` contém os dois tarballs locais; nenhuma publicação é necessária. Não instale dependências na raiz do curso. O npm precisa de registry/cache somente para TypeScript; consumidores instalam os tarballs locais com --offline. A limpeza dos testes remove somente pastas temporárias verificadas.

O starter compila e instala, mas falha em asserções semânticas. Implemente src/index.ts e src/v2.ts conforme contract.md e corrija consumers/report/main.ts. `legacy.ts` é o consumidor histórico imutável usado para reproduzir a quebra planejada. O teste compila consumidores externos separados usando imports da raiz @curso/slug-kit, NodeNext/strict e declarações do tarball. Não use aliases, imports de src, casts any ou supressões para contornar a migração.

Leia ticket.md, change-request.md, incident.md, postmortem.md, ADR-001.md e manual-test-plan.md. Registre comandos/saídas antes e depois, decisões SemVer, lista de arquivos do pack, evidência dos dois consumidores, revisão e limites. O uso de 1.1.0/2.0.0 é contrato desta simulação; não há pacote público publicado.

7.5: API/declarations/SemVer/consumidores; 7.4: integração, contrato, regressão e técnica adicional mutação da equipe; 7.6: ticket L-41, manutenção L-43, incidente I-L42 e comunicação. Todos os blocos e quatro rubricas de 24.01 continuam obrigatórios, inclusive 7.2 segurança e 7.7 IA/transferência independente. A equipe executar referência e mutantes não avalia sua submissão. Evidência permanece local-declared, sem demonstrated automático ou credencial de senioridade.

Estimativa de prática: 1200–1800min, não calibrada. Limites: consumidores sintéticos Node ESM, sem CJS/bundlers/browser/registry público, assinatura/CI real, autenticação, rede de produção ou garantia de compatibilidade para entradas fora do contrato.
