# Referência 16.07

A união inclui triangle com base e height. `area` trata os três discriminantes, e o ramo final passa o restante a `assertNever`; assim uma variante futura gera diagnóstico. Triangle usa `base * height / 2`; não há retorno silencioso zero.

## Transferência
Acrescente `kind: "ellipse"; rx: number; ry: number` a uma união de figuras com `area`. Registre o erro de exaustividade no ramo `assertNever` antes da correção e depois calcule a área para rx=3 e ry=2. Borda: rx=0 produz zero; não aceite variante sem ry.
