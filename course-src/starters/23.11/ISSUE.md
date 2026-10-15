# Issue #87 · Entrega exatamente no raio aparece como "fora"

Relato do suporte: a loja atende até 5 km. Um cliente a exatamente 5.000 m teve a entrega
listada como "fora do raio" no relatório. Clientes a 4.999 m e 5.001 m aparecem corretamente.

Esta issue muda o comportamento da regra. O contrato após a correção é:

- distância menor ou igual ao raio é "dentro"; distância maior é "fora";
- distância negativa, NaN ou infinita lança `RangeError`: não é classificada como "fora";
- raio negativo, NaN ou infinito lança `RangeError`;
- `gerarRelatorio` usa o raio informado e mantém a forma `{ raioMetros, dentro, fora }`.

Tarefa:

1. Escreva primeiro um teste que reproduza o caso de 5.000 m e veja-o falhar.
2. Encontre o módulo dono da regra e corrija só ele.
3. Acrescente regressões: 4.999 m, 5.001 m, raio customizado, distância negativa e raio inválido.
4. Por que mudar apenas a UI (por exemplo, o texto do cabeçalho) não resolve?
