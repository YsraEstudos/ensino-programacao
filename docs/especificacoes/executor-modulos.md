# Executor de módulos locais

O executor genérico aceita arquivos JavaScript .js/.mjs presentes no exercício. Acorn valida a sintaxe e os imports dinâmicos; esbuild-wasm compila o grafo local sem executar o código. O resultado ESM executa em Worker criado dentro de iframe com origem opaca, CSP sem rede e limite de dois segundos.

Suporte comprovado: imports relativos, export nomeado/default, reexports, import dinâmico com caminho literal e ciclos com referências usadas depois da inicialização. A compilação combina módulos; não afirmar equivalência irrestrita a todos os detalhes de ciclos/TDZ e import.meta do carregador nativo. Pacotes externos, caminhos fora do exercício, módulos ausentes e imports dinâmicos calculados são rejeitados.

A escolha entre script simples e compilação pode reconhecer palavras import/export; isso apenas seleciona o carregador e não transforma código nem interpreta a gramática. A antiga remoção de export por regex foi eliminada.

Não há DOM, acesso ao armazenamento da conta, rede, APIs do Node.js, TypeScript ou Vitest neste ambiente. O modo de análise escrita continua disponível nas atividades genéricas. A execução registra uma tentativa; a rubrica é uma autoavaliação.

Inventário reproduzível em `scripts/measure-engineering.mjs`: runtimes declarados e atividades JavaScript com indicação textual de import/export. Essa indicação é uma triagem, não uma análise semântica de cada exercício. Existem atividades com ferramentas e ambientes externos; ESM local não provisiona esses ambientes.

`scripts/browser-engineering-check.js` contém a prova executada pelo conector Playwright contra servidor local na porta 8017. Ela testa grafo com reexport/ciclo/import dinâmico, bloqueio de fetch e armazenamento, loop em módulo, cancelamento de await pendente e recuperação. Os testes Node também cobrem fonte/token forjados, mensagens tardias, excesso de saída e criação de Worker indisponível.

Mensagens iframe → pai usam a origem conhecida da aplicação. Pai → iframe opaco conserva targetOrigin *, com source, origem do pai e token verificados no bootstrap. Um MessageChannel não trouxe simplificação necessária nesta entrega. Não é uma promessa de proteção contra vulnerabilidades do próprio navegador.
