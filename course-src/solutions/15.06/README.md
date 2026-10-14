# Referência 15.06

Atribuição de interfaces depende dos membros estruturais. Um campo private/protected cria compatibilidade nominal vinculada à declaração de origem. O excesso é checado com mais rigor em literal fresco, não em toda variável. `private` do TypeScript não vira proteção runtime; `#private` é campo privado ECMAScript. `implements` verifica a classe, não cria nominalidade para interfaces.

## Evidência independente
Compare dois DTOs próprios com os mesmos campos públicos, um literal fresco com campo extra e duas classes que declaram private separadamente. Inclua atribuições que o checker aceita/rejeita e diga se a privacidade é estática ou runtime.
