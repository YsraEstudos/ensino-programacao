# Documentação do DevPath

## Guias atuais

- [Desenvolvimento, requisitos e comandos](../README.md).
- [Organização do projeto e fontes canônicas](organizacao-projeto.md).
- [Como adicionar um exercício](guia-adicionar-exercicio.md).

## Escopo da carga horária — revisão de 14/10/2026

O catálogo publicado nesta revisão tem 265 atividades e a soma de seus campos `duration` é 6.722 minutos (112 h 02 min). Esse total representa somente a estimativa de trabalho guiado cadastrada nas atividades; não é uma medição de quanto estudantes levam.

A faixa declarada de 370–500 horas é tratada aqui como uma faixa provisória de planejamento que pode incluir, além das atividades guiadas, leitura da documentação oficial, prática externa, retomadas e retakes, e projetos. Esta revisão explicita esse escopo agora; não há evidência de uma decomposição histórica dessas horas em cada componente. A diferença entre os totais não foi alocada matematicamente e não se deriva um multiplicador. A faixa ainda não foi calibrada com dados de estudantes.

O medidor opcional do site registra tempo local com foco por atividade e apresenta separadamente a estimativa guiada. Sessões controladas de QA verificam o funcionamento técnico, mas não validam a faixa de planejamento nem substituem observação de estudantes.

Toda manutenção ocorre em `devpath-publish/`. O comando `npm.cmd run build:curriculum` substitui os geradores antigos de sincronização entre distribuições, incluindo `build-stage01.mjs` e `build-stage03.mjs`.

## Planejamento atual

- [Análise curricular — 05/10/2026](analise-curricular-2026-10-05.md): pré-requisitos ocultos, erros de conteúdo, lacunas até o nível sênior e plano priorizado.

- [Execução de módulos locais](especificacoes/executor-modulos.md).
- [Persistência e sincronização](especificacoes/persistencia-progresso.md).
- [Interface e carregamento](especificacoes/interface-e-carregamento.md).

## Registros históricos

Estes documentos preservam as decisões e verificações de cada revisão. As instruções e referências aos antigos checkouts descrevem a época da auditoria; use os guias acima para trabalhar na estrutura atual.

- [Revisão da Etapa 00](etapa00-revisao.md).
- [Auditoria da Etapa 01 — 02/10/2026](etapa01-auditoria-2026-10-02.md).
- [Melhorias do diagnóstico e Etapa 01 — 02/10/2026](diagnostico-etapa01-melhorias-2026-10-02.md).
- [Auditoria da Etapa 02 — 02/10/2026](etapa02-auditoria-2026-10-02.md).
- [Correções da Etapa 02](etapa02-correcoes.md).
- [Auditoria da Etapa 03 — 02/10/2026](etapa03-auditoria-2026-10-02.md).
- [Planos anteriores](planos/) e [especificações anteriores](especificacoes/).

## Nomes

Os nomes dos documentos são em português: `etapaNN-auditoria`, `etapaNN-revisao` e `organizacao-projeto`. Relatórios datados conservam a data em `AAAA-MM-DD`. Código e nomes dos módulos usam inglês, conforme a convenção descrita no README principal.
