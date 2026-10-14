# 22.10 — Referência de avaliação

## Contrato observado

Avalie este ID com o ambiente rubric e as verificações declaradas: rubric. Os arquivos de referência são: material de rubrica e evidência local. A referência preserva o contrato authored indicado nos arquivos e no enunciado.

## Transferência independente

# Transfer 22.10

Add a third report package consuming core and app; draw references graph, compare a paths alias with build references, capture first build, no-op incremental build and dependent rebuild after core change. Then introduce one cycle in a temporary copy and record the compiler error.

## Critérios observáveis da avaliação

- Graph and emitted JS/declarations/build-info show core is built before each consumer.
- Repeated build is incremental and changing core rebuilds dependents; cycle diagnosis comes from compiler.
- Document tradeoff and keep this extension optional; paths aliases alone are not described as build ordering.

## Verificação

A evidência depende do executor rubric; erros de infraestrutura, suíte vazia ou timeout não aprovam a tentativa.

## Transferência independente

# Transfer 22.10

Adicione um terceiro pacote de relatório que consome core e app; desenhe o grafo de referências, compare aliases de paths com references de build, registre o primeiro build, um build incremental sem alterações e a recompilação de dependentes após mudar core. Depois introduza um ciclo em uma cópia temporária e registre o erro do compilador.
