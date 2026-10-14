# 23.03 — Contrato de criação

A tarefa guarda um título trimado não vazio, prazo opcional em data ISO real (YYYY-MM-DD) e status inicial a-fazer. ID é injetável; o default usa UUID. Validação ocorre antes do efeito; falha de persistência vira StorageError preservando cause e não retorna uma tarefa criada.

A suíte de comportamento roda no executor node-simulated do curso (globais test e expect), não em node --test. A transferência usa pedido com total positivo, data de entrega e repositório que falha sem registrar escrita parcial.

## Transferência independente

# Transfer 23.03

Implementar criarPedido para subtotal de itens com quantidade inteira positiva, endereço não vazio e entrega ISO; injetar ID/data; provar pedido de duas linhas válido, quantidade zero e 31 de fevereiro rejeitados antes de chamar persistência, e falha do adapter com cause preservada.

## Critérios observáveis da avaliação

- Contrato nomeia tipos e invariantes com limites observáveis; não inventa estratégia de ID sem documentá-la.
- Teste de prazo distingue forma inválida de data impossível e mostra zero gravações nos erros.
- StorageError mantém cause original, título persistido está normalizado e status inicial é conferido.

## Verificação

A evidência depende do executor node-simulated; erros de infraestrutura, suíte vazia ou timeout não aprovam a tentativa.
