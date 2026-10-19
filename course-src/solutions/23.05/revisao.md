# Revisão PR: evidência e prioridade

1. P1 retry recursivo sem limite: falha persistente pode recursar sem fim; exigir teto e backoff com relógio injetado.
2. P1 payload any: validação não restringe resposta externa; parser unknown antes de regra.
3. P2 sort muta entrada apesar de contrato imutável/toSorted; fixture congelada reproduz mutação.
4. P2 timer real no teste: flake sob carga; fake clock.

Não comentar preferência de nomes como bug. Verificar linha/diff e reprodução; rejeitar hipótese que não tem fluxo de dados que a sustente.
5. Compare a sugestão da IA com os quatro achados: aponte qual risco ela trata e qual requisito/caso verificável ainda falta.
