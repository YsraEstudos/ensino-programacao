# Issue #23 · Envio com nome vazio sai da página

Quem tenta se inscrever sem nome vê a mensagem "Informe o nome.", mas a página recarrega e o texto desaparece. A pessoa só percebe o erro quando o formulário já foi enviado de forma padrão.

Pedido: encontre por que o envio padrão acontece no caso inválido e corrija o arquivo que trata o evento. Preserve o que já funciona: envio válido com texto literal na lista, campo limpo depois do sucesso, foco no nome, mensagem anunciada por leitores de tela e nenhum item criado quando a validação falha.
