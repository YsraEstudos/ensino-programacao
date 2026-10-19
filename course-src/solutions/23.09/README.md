# 23.09 — Logs sem segredos

Redação profunda percorre objetos e arrays e compara chaves sem diferenciar maiúsculas. Logger grava ID, resultado e duração monotônica; validação é warn e falha técnica error com cause redigida. A resposta pública informa apenas falha e ID de correlação; os logs internos preservam contexto técnico útil com segredos redigidos. redigir() cria cópia, inclusive para objetos e arrays aninhados, e não muta a entrada. Use lerLogs para auditar e limparLogs entre casos.

## Transferência independente

# Transfer 23.09

Instrumentar upload que lê API key de cabeçalho e cookie de sessão: sucesso informa correlation id/status/duração; 422 vira warning, erro de rede gera error com cause profundamente redigida; provar ausência dos segredos em logs JSON e na resposta HTTP simulada.

## Critérios observáveis da avaliação

- Cópia profunda trata Authorization/Cookie/Token em arrays e níveis internos sem alterar objeto original.
- A classe de erro determina warn/error; duration é monotônica não negativa e ID é único não secreto.
- Nenhum segredo aparece no JSON de logs nem na resposta pública, mas causa técnica útil permanece redigida.

## Verificação

A evidência depende do executor javascript; erros de infraestrutura, suíte vazia ou timeout não aprovam a tentativa.
