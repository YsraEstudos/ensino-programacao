# B-25 — manutenção numa base alheia

Base fornecida: `maintenance/report.mjs`, escrita pela equipe. Uma lista vazia não significa projeto concluído. Novo contrato: status `empty` para nenhuma tarefa, `done` quando todas têm `done:true`, `active` quando alguma está pendente. A função não altera a entrada. A suíte antiga só considerava projetos com tarefas; mantenha os casos antigos e execute `npm run test:maintenance` antes e depois. Registre regra rastreada, reprodução, patch localizado, alcance e resposta técnica à revisão: "basta converter todo array vazio em done, porque every retorna true".

Entregue um uso do relatório com o projeto retornado pela API; não altere o contrato público de HTTP para resolver o ticket. A solução interna do relatório não sai no ZIP. Evidência é local-declared. O caso de transferência independente e a revisão de patch IA continuam sendo os de 24.01; reutilize a rubrica comum com arquivos identificados.
