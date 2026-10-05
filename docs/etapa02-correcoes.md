# Etapa 02 — revisão de 29/09/2026

> Registro histórico. Os caminhos, comandos e distribuições abaixo descrevem a estrutura da época; não devem orientar a manutenção atual. Consulte [a organização atual](organizacao-projeto.md) e execute `npm.cmd run build:curriculum` dentro de `devpath-publish/`.

Os 12 IDs foram preservados e os contratos foram versionados como 2. A etapa mantém 254 fichas no catálogo completo e 217 no recorte 00–20. Esta revisão é local; não constitui publicação no serviço hospedado nem promoção das fichas para READY.

| Ponto | Correção |
|---|---|
| Ponte para operadores | Ponte 02A ensina aritmética, precedência, comparação, lógica e coerção antes da prática. Ponte 02B aparece também nos recursos de 02.10. |
| 02.01 | Blocos A/B sequenciais, com valores e tipos; comparação curta ==/=== depois dos blocos. ?? fica em 02.02. |
| 02.02 | “Os seis falsy desta tabela”; string vazia explicitamente exibida como `""`. |
| 02.03 | Distrator booleano `suficiente || autorizada` e requisitos de comparação/lógica. |
| 02.04 | A fonte atual já usava `Number.isFinite`; foi preservada e reforçada a distinção para `Number.isNaN`. Starter com texto/flag literais e interface de fixtures publicada. |
| 02.05 | Conversões Number/String explícitas e `entradaValida` observável. Casos inválidos têm saídas diagnósticas publicadas; não se exige rejeição, if, throw ou Boolean. |
| 02.06 | Entrada literal, saída visível, requisito falsy/nullish e instruções de depuração compatíveis com iniciantes. |
| 02.07 | MAKE com apenas entradas e comentário inicial: aluno declara cálculo e saída. Domínio explícito preço >= 0/taxa em [0,1]; removida a validação inexistente. |
| 02.08 | TRANSFER dependente do fallback, com entradas declaradas e preservação de 0/false/string vazia. |
| 02.09 | Checkpoint TRANSFER de 10 minutos, um arquivo, carga reduzida e três decisões próprias (normalizar a/b e somar). Domínio numérico/nullish publicado. |
| 02.10 | Título correto; prática real de min/max/abs e Math.random. Transformação para dado 1–6 com casos determinísticos 0, 0.5 e próximo de 1; saída aleatória avaliada pela faixa. -0 é opcional. |
| 02.11 | Título preciso; blocos decimais/valores especiais e inteiros/BigInt; dificuldade recalibrada. Decimais exatos exemplificados; resultados concretos descritos como determinísticos. |
| 02.12 | TRANSFER: aluno declara o limiar a partir da resolução e política explícita de metade da resolução, inclusive. A política pertence a este exercício, sem promessa de regra universal. |
| Grafo | Competências internas e arestas de dependência, preservando aliases usados por etapas posteriores. |
| Runner | Entradas literais em todos os starters executáveis; fixtures substituem apenas inicializações declaradas. |
| Avaliação | Removido vocabulário prematuro de regressões da rubrica de MODIFY/DEBUG desta etapa. |

## Verificação

`node --test course-src/verify-stage02.mjs` executa 13 verificações dos blocos, soluções e bordas da etapa, incluindo Infinity/NaN/vazio/zero, AND contra o distrator OR, fallbacks, desconto, limites de sorteio, precisão e tolerância. O teste do grafo verifica que as competências requeridas precedem cada atividade na ordem editorial.

Os testes executáveis foram rodados em Node 26.7.0 disponível nesta máquina. O runtime curricular continua Node 24 LTS; não se afirma validação no Node 24. As fichas permanecem `contract_ready`.

## Implementação interativa local

Os exercícios 02.01–02.12 agora possuem fluxo específico: previsão registrada → exemplo e pergunta de compreensão → editor e execução → comparação dos casos públicos → explicação → conclusão e revisão. Em 02.01, 02.10 e 02.11 os blocos posteriores ficam bloqueados até o código atual passar. Alterar código aprovado invalida a aprovação e bloqueia o avanço.

O interpretador executa apenas declarações, atribuições, console.log, expressões e as APIs numéricas desta etapa. Não usa eval ou Function para código do aluno; DOM, rede, loops e funções não estão disponíveis. Saídas incluem tipos, strings entre aspas, NaN, Infinity e signed zero. Todas as fixtures e todos os resultados exigidos são visíveis. O sorteio real é separado dos testes determinísticos de intervalo. O sensor exige declarar o limiar e respeitar a borda inclusiva.

O modo localhost salva blocos, previsões, código, explicações, conclusão e agenda de revisão no navegador, sem chamar as APIs de conta. Fora de localhost, o fluxo preserva a persistência autenticada e o servidor sanitiza o novo campo stage02. Registros antigos não são apagados nem considerados evidência de execução dos blocos novos.

`npm.cmd run test:stage02` em devpath-full-catalog verifica execução e fluxos DOM de todos os 12 exercícios, inclusive recarga, compreensão incorreta, código inicial sem edição, erros conceituais e invalidação após editar código aprovado. Os testes DOM usam jsdom; não são uma inspeção visual em navegador. A tentativa de inspeção no navegador integrado foi bloqueada pela política de acesso, portanto não se afirma validação visual ou de leitor de tela.

Prévia: `python -m http.server 8000 --bind 127.0.0.1 --directory devpath-full-catalog/public`, seguida de `http://localhost:8000/devpath.html#/javascript/02.01`. A compilação e o typecheck dos dois projetos também fazem parte da verificação.

Regeneração no checkout consolidado: `npm run build:curriculum` gera os dados derivados em `.generated/` e as saídas públicas em sequência. A instrução anterior de executar cada gerador manualmente foi substituída pelo orquestrador único.

Referências técnicas: [Number.isFinite](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isFinite), [Math.random](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random) e [Number.EPSILON](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/EPSILON).
