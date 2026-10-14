# Referência 15.02

Em parseConfig, primeiro rejeite raw que não seja objeto (null inclusive). Se a propriedade port estiver ausente, retorne o default 3000. Se estiver presente, aceite apenas string composta por dígitos; converta para number e exija inteiro entre 1 e 65535. Todos os valores de port fora desse domínio, inclusive valores numéricos, geram RangeError. O Config retornado descreve a saída normalizada, não o parser.

## Evidência independente
Implemente parsePageLimit(raw: unknown): { limit:number } com entrada string decimal, default 20, e rejeição de texto inválido/valor fora de 1..100. Inclua as entradas, saídas e exceções num teste independente.
