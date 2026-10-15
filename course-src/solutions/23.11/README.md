# 23.11 — Fronteira inclusiva do raio

A regra é distância <= raio em src/domain/raio.js; formatação da UI não classifica entregas. Teste primeiro com 5.000 m para reproduzir o bug, então altere só o operador e preserve validação. A suíte inclui 4.999/5.000/5.001, raio customizado, distâncias negativas/não finitas e raios inválidos (RangeError), e o relatório com raio de 4.999 m.
