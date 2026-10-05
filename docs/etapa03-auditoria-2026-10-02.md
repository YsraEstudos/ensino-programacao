# Auditoria e revisão da Etapa 03 — 2 de outubro de 2026

> Registro histórico. Os caminhos, comandos e distribuições abaixo descrevem a estrutura da época; não devem orientar a manutenção atual. Consulte [a organização atual](organizacao-projeto.md) e execute `npm.cmd run build:curriculum` dentro de `devpath-publish/`.

Foram analisadas as nove atividades da Etapa 03, suas fontes editoriais e a experiência efetivamente renderizada nos dois checkouts. Seis subagentes analisaram conteúdo/progressão, pré-requisitos, explicações/exemplos, exercícios/interações, design/acessibilidade e organização do código. As conclusões foram conciliadas com os arquivos reais antes da implementação.

A Etapa 02 foi consultada para operadores e comparações; a Etapa 04, para a passagem a funções. A Etapa 00 serviu como referência de clareza, prática, feedback e navegação. O conteúdo das demais etapas foi preservado.

## Problemas prioritários e mudanças

| Prioridade | Evidência anterior | Efeito no aprendizado | Melhoria implementada |
|---|---|---|---|
| Alta | `renderCurriculumLesson` em `public/app.js` exigia a primeira resposta para abrir `explanation`. | O iniciante precisava prever construções novas antes de estudá-las. | Ensino e exemplo resolvido aparecem primeiro, com execução do exemplo; a previsão continua anterior à tentativa própria. |
| Alta | As receitas e os cartões anunciavam tabelas, matriz e Parsons; o renderer entregava textareas genéricos. | Não havia instrumento para registrar e conferir estados ou ordenação. | Tabelas rotuladas, matriz booleana e blocos de FizzBuzz com botões de movimentação por teclado. |
| Alta | Qualquer execução, erro ou timeout podia gerar evidência; a conclusão dependia principalmente de texto e checkboxes. | Uma tentativa incorreta podia ser registrada como atividade concluída. | Casos comportamentais, conferência da tabela, revalidação na conclusão e invalidação após alterações; reflexão e autoavaliação complementam a prática. |
| Alta | `03.07` declarava `n=10, limite=5, divisor=2 → 2 (6,8)`. | Contradizia o intervalo inclusivo e penalizaria uma solução correta. | Resultado corrigido para 3: 6, 8 e 10. Casos detectam troca de `>` por `>=`, perda de `n` e troca de `&&` por `||`. |
| Alta | O starter de `03.04` dependia de `entrada` não declarada. | Introduzia um erro de ambiente antes do problema de classificação. | Entrada numérica explícita e casos injetados pelo avaliador, incluindo notas inválidas e todos os cortes. |
| Média | `switch` e `break` eram prometidos sem prática própria. | A cobertura declarada não era demonstrável. | Miniprática obrigatória de `switch` em 03.04 e de busca com `break` em 03.06, com ensino prévio e casos. |
| Média | Exemplos de while, fila e batalha eram curtos ou pouco próximos do raciocínio cobrado. | Saltos entre descrição, estado, ordem de eventos e projeto final. | Exemplos executáveis com estados explicados, tabela do caminho sem progresso, sequência de chegada/serviço e batalha com reavaliação entre ataques. |
| Média | O plano citava duas transferências sem dica, mas o renderer não as materializava. | A conclusão não demonstrava adaptação para outro cenário. | Transferências obrigatórias em 03.08 e 03.09, com previsão, código próprio, casos e sem botão de dicas nessa seção. |
| Média | Campos sem foco consistente; controles Parsons inexistentes; fonte e artefatos divergiam. | Dificuldade de navegação e manutenção do conteúdo realmente exibido. | CSS restrito a `.s03-lesson`, controles de pelo menos 44 px, foco visível e geração exclusiva da Etapa 03. |

## Progressão preservada e esclarecida

O percurso existente foi mantido: **03.04 → 03.05 → 03.01 → 03.02 → 03.03 → 03.06 → 03.07 → 03.08 → 03.09**. Essa ordem introduz decisões antes de usá-las dentro de loops; em seguida, trabalha rastreamento, sobreposição de regras, progresso, contagem e simulações. A interface distingue o passo pedagógico do ID da atividade e o breadcrumb da etapa abre 03.04.

`for...of` continua reservado à etapa de coleções, como já determinava a explicação do plano. A promessa contraditória de ensiná-lo aqui foi corrigida somente no documento da Etapa 03. Arrays e funções não passaram a ser pré-requisitos ocultos.

O fechamento de fila e batalha pede identificar entradas, estado, regra e saída, preparando a Etapa 04 sem cobrar sintaxe de funções antes de ensiná-la. O tema da batalha por turnos foi mantido.

## Fontes e manutenção

- Fonte de ensino: `course-src/stage03-preparation.mjs`.
- Tabelas e casos: `course-src/stage03-contract.mjs`.
- Na época desta auditoria, a distribuição usava `course-src/build-stage03.mjs` na raiz RPG. Esse gerador foi substituído na consolidação.
- Atualmente, execute `npm.cmd run build:curriculum` dentro de `devpath-publish/`. `build:stage03` é um alias da geração completa; não limita a atualização à Etapa 03.
- UI, avaliação e interpretador estão em módulos `stage03-*`; o `app.js` só delega atividades da Etapa 03 a esses módulos.
- IDs, ordem geral dos catálogos e formato da API de progresso foram preservados. A versão 2 usa chaves como `03.09@v2`; os registros antigos continuam armazenados e não aprovam automaticamente o novo conteúdo.

O gerador atual incorpora a camada de ensino da Etapa 03 na mesma compilação das receitas e cartões. Não há etapa posterior de sincronização entre checkouts.

## Verificação

- Testes da Etapa 03 nos dois checkouts: interpretador, exemplos, casos, mutações incorretas, tabelas, Parsons, conclusão, revalidação, rascunhos e preservação do progresso pela API existente.
- Comparação com snapshots anteriores: todos os cartões e IDs fora da Etapa 03 permaneceram iguais; em `course-src/.generated/resolved_preview.json`, todos os objetos fora da Etapa 03 permaneceram iguais.
- Validação dos catálogos de 217 e 254 atividades.
- Regressões existentes das etapas 00, 01 e 02 no catálogo completo.
- ESLint dos módulos e gerador da Etapa 03 e verificação de sintaxe.
- Compilação dos dois checkouts.
- Navegador real: exemplo, tabela, execução, miniprática, conclusão e recarregamento de 03.04; movimentação de Parsons e conferência de 03.03 em viewport móvel. Sem ampliação horizontal da página no cenário conferido.

Os testes de UI cobrem os nove cartões; a inspeção visual manual no navegador foi amostral. O interpretador executa o subconjunto ensinado nesta etapa, com orçamento determinístico, e não é um ambiente completo de Node.js. Os casos são evidência de comportamento nos cenários definidos, não uma prova de todo programa possível. A qualidade da explicação escrita continua sendo autoavaliada; nenhum avaliador semântico ou IA atribui nota ao texto.

As alterações ficaram locais. Não houve publicação, commit ou alteração de conteúdo das etapas vizinhas.
