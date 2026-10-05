# Etapa 01 — plano de correções autorizado

> Registro histórico. Os caminhos, comandos e distribuições abaixo descrevem a estrutura da época; não devem orientar a manutenção atual. Consulte [a organização atual](../organizacao-projeto.md) e execute `npm.cmd run build:curriculum` dentro de `devpath-publish/`.

Pedido: implementar as correções do diagnóstico consolidado, sem publicar. Preservar IDs e todo progresso histórico; novas evidências usam versão 3.

## Resultado

Uma pessoa iniciante encontra explicação, vocabulário, exemplo paralelo e contrato antes de responder. Registra previsões estruturadas, pratica com controles reais, executa o subconjunto ensinado e recebe comparação dos casos públicos. Conclusão requer código atual aprovado e explicação; a etapa termina com duas transferências independentes. Catálogos de 217 e 254 itens compartilham o mesmo conteúdo da Etapa 01.

## Responsabilidades e interfaces

- Conteúdo: `course-src/recipes/01.py` é o contrato canônico; `course-src/stage01-preparation.mjs` contém preparação, perguntas documentais, modelos de resposta e transferências. Gerar distribuição pública sem soluções das transferências.
- Executor: `DevPathStage01Runner.run(source, fixtures)` interpreta declarações, atribuições, logs, typeof, soma e templates; retorna valores, AST e trace. Sem execução arbitrária de código do aluno.
- Conferência: `DevPathStage01Checks.check(id, code, orders)` compara saída/estado e estrutura em casos visíveis. `checkTransfer(id, code)` verifica as transferências. Erro ou edição invalida aprovação.
- Interface: `DevPathStage01UI` usa estado `progress.stage01`, versão 3, preservando os campos antigos. Teoria acessível, campos rotulados, ordenação por botões, tabelas, lacunas e navegação entre seções. Simulação de bindings em 01.02; prévia histórica de fichas em 01.09.
- Integração: carregar módulos, roteamento, persistência local somente em localhost e persistência por conta nos demais hosts. Sanitizar estado novo sem apagar os registros antigos. Gerador sincroniza 01 em ambos os catálogos.

## Verificação

- [x] Testes RED→GREEN do executor: valores, TDZ, const, parse/runtime, templates, fixtures e rejeição de sintaxe fora da etapa.
- [x] Testes RED→GREEN da conferência: soluções alternativas corretas, hardcoding, estados, ordem dos blocos e duas transferências.
- [x] Testes DOM: teoria antes da resposta, campos reais, erros, conclusão, invalidação e recarga.
- [x] Sanitização: limites, estado malformado, versões e preservação de histórico.
- [x] Gerar e comparar os nove cartões em ambos os catálogos; não alterar cartões autorados das outras etapas.
- [x] Rodar testes existentes de 00/02, typecheck e builds dos dois projetos.
- [x] Browser: percurso real de execução e conclusão, largura móvel e foco. Não afirmar teste de leitor de tela sem realizá-lo.

## Revisão de bordas

Previsão errada não bloqueia a aprendizagem; previsão vazia não autoriza execução. Texto colado deve aparecer como texto. Resultado aprovado perde validade após editar código, ordem ou transferência. String derivada é fotografia do cálculo, não ligação viva com variável. Dados históricos não equivalem a domínio das novas atividades.

## Registro

- Início: auditoria e plano aprovados pelo pedido “corrija tudo isso”. Checkouts existentes com mudanças locais preservados; trabalho local sem commits/publicação.
- Pré-flight: conteúdo→UI usa `DevPathStage01Preparation`; executor→conferência retorna AST/trace; conferência→UI retorna `ok/message/results/run`.

## Resultado verificado

- Compilador editorial: 254 contratos prontos. Geração específica: node course-src/build-public-curriculum.mjs --stage01 (e --full --stage01). Esta opção preserva os cartões existentes das outras etapas.
- Etapa 01: 53 testes reportados por distribuição; inclui conteúdo, executor, conferência, sanitização e fluxo completo das nove atividades. Algumas verificações do checker também são executadas pelo teste de fluxo.
- Regressão: Etapa 00 completa no app e recarga de conta simulada; Etapa 02: 39 testes de UI/executor e 2 de sanitização.
- Ambos os builds e ambos os typechecks passaram.
- Browser real local: 01.02 executada e concluída, conclusão preservada após recarga; rastreamento de bindings e foco no destino da seção; largura 390px sem transbordamento da página; 01.09 gerou fichas de vida 10, 6 e 0 a partir do código digitado.
- Não houve publicação, commit, exclusão de conteúdo ou alteração no progresso remoto. Persistência de conta foi verificada com resposta simulada e sanitização; D1 de produção e leitor de tela não foram testados.
- Na distribuição completa, a rotação das alternativas de revisão em 00 foi recomposta para manter a verificação existente de posições equilibradas; texto, resposta correta e IDs foram preservados.
- Revisão independente: evidência restaurada é reconferida na UI; transferências exigem as reatribuições e reconciliam estado por ID. O progresso armazenado é uma autodeclaração do cliente, não uma certificação de avaliação inviolável.
- Captura: output/etapa01-verificacao.png.


- Conferência posterior: removida a exigência indevida de declarar perfil em 01.06. A expressão interpolada diretamente em console.log é aceita, conforme o enunciado. Regressão reproduzida antes da correção e adicionada à suíte.
