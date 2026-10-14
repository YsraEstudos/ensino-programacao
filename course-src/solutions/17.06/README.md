# Referência 17.06

Para Overload, union ou generic?, inspecione assinaturas.ts e registre o comportamento previsto com entradas concretas, evidência da relação entre os dados/tipos e um limite relevante. A decisão deve distinguir saída observada, diagnóstico estático e hipótese; valide também uma borda independente e explique por que ela sustenta a conclusão.

## Transferência
Escolha assinaturas para estas três APIs: `lerId` sempre recebe string; `normalizar` aceita string ou number e sempre retorna string; `primeiro` retorna o mesmo tipo dos elementos ou undefined. Para cada uma, compare concreta, union e generic/overload, dando uma chamada válida e uma que deve falhar. Borda: explique por que generic sem dependência entrada/saída não agrega informação em lerId.
