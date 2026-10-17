# Ticket 24-001: private comments leak

## Solicitação e critérios de aceitação
Como responsável por privacidade, quero comentários visíveis apenas ao autor, para evitar leitura cruzada. Cada requisição deve autenticar a sessão, autorizar o proprietário no servidor, rejeitar sessão expirada/encerrada, exigir CSRF para gravação e não registrar cookie/token em logs. O texto deve permanecer texto literal no navegador.

## Respostas / roteiro de refinamento
- Quem lê? Somente o proprietário autenticado. Resposta registrada: Ana lê `ana`; Bia não.
- O que acontece sem sessão? HTTP 401, sem conteúdo privado.
- E com sessão válida de outra pessoa? HTTP 403.
- Quando vence? Cinco minutos após login; no limite de expiração já está vencida.
- Como encerra? Logout remove a sessão no servidor; a chamada seguinte recebe 401.
- O que valida CSRF? Cabeçalho `x-csrf-token` comparado no servidor, além de SameSite.
- Dados sensíveis no log? Nunca registrar cookie, senha ou token bruto; teste usa sentinelas reais.

## Plano do implementador
Responder antes de mudar código. Registrar incertezas e decisão aceita. Rodar teste vermelho contra starter; implementar mudança mínima; rodar regressão e revisar diff.
