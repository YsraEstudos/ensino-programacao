# Issue #87 · Entrega exatamente no raio aparece como "fora"

Relato do suporte: a loja atende até 5 km. Um cliente a exatamente 5.000 m teve a entrega
listada como "fora do raio" no relatório. Clientes a 4.999 m e 5.001 m aparecem corretamente.

Tarefa:

1. Escreva primeiro um teste que reproduza o caso de 5.000 m e veja-o falhar.
2. Encontre o módulo dono da regra e corrija só ele.
3. Mantenha os testes de abaixo e acima do raio passando.
4. Por que mudar apenas a UI (por exemplo, o texto do cabeçalho) não resolve?
