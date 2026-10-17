# Revisão do patch didático fornecido

O patch `broken.mjs` não deve ser aceito. As três funções têm falhas reproduzíveis: `canRead` permite qualquer pessoa autenticada acessar recurso privado; `renderComment` interpreta texto do usuário como HTML; `allowOrigin` aceita subdomínios controlados por terceiros e confunde CORS com autorização.

Antes de aceitar uma correção, consulte documentação oficial:

- Node HTTP e cabeçalhos: https://nodejs.org/api/http.html
- MDN `textContent` e `innerHTML`: https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent e https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML
- MDN CORS: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
- OWASP ASVS 5.0.0: https://owasp.org/www-project-application-security-verification-standard/

Escreva primeiro testes que reproduzam os três casos. Rejeite a justificativa gerada quando ela contrariar o contrato ou a documentação. Não envie ticket, código privado, credenciais ou dados pessoais a qualquer serviço externo; este exercício funciona com o patch fornecido e documentação pública.
