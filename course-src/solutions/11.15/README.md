# 11.15 — Referência

A causa está em `app.js`: o `event.preventDefault()` só roda depois da validação, então o caminho inválido deixa o envio padrão acontecer. A correção move `preventDefault` para o início do tratador. `regras.js` valida corretamente e não precisa mudar; `index.html` mantém `aria-live`.
