# inscricoes-oficina

Página de inscrição em oficinas. A validação das regras fica em `regras.js`; a ligação com a página fica em `app.js`.

- `index.html`: formulário, área de status e lista de inscritos.
- `app.js`: escuta o envio do formulário e atualiza a página.
- `regras.js`: valida nome e oficina. Não toca no DOM.

Abra `ISSUE.md` antes do código. A avaliação usa a página carregada no navegador: não há `node --test` para esta atividade.
