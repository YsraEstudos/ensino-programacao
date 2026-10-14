# 23.04 — Refatoração guiada por caracterização

A exported API recebe repositório injetado: listar, salvar, atualizar, registrar. Etapa 1 extrai validação mantendo coerção e mensagens; etapa 2 separa I/O e escreve só depois das validações/duplicidade; etapa 3 remove coerções implícitas não intencionais, com testes explícitos. Rode node --test course-src/solutions/23.04/legado.test.js. A transferência refatora um importador legado em três checkpoints com contador de chamadas e rollback em entrada inválida.

## Transferência independente

# Transfer 23.04

Refatore um importador de clientes CSV que hoje consulta arquivo dentro do loop: primeiro caracterize linha vazia/duplicada com 0 gravações; depois injete leitor/repositório e normalize email; por fim substitua igualdade frouxa após registrar quais valores numéricos/string eram aceitos. Guarde resultado, log e chamadas em cada checkpoint.

## Critérios observáveis da avaliação

- Cada checkpoint mantém mensagens, normalização e formato de retorno demonstrados pela suíte; mudanças intencionais têm teste separado.
- Repositório é injetado e entradas inválidas ou cliente ausente produzem zero chamadas de escrita/log.
- Diff conta apenas uma responsabilidade por etapa e registra compatibilidade de coerção de idade/email.

## Verificação

A evidência depende do executor javascript; erros de infraestrutura, suíte vazia ou timeout não aprovam a tentativa.
