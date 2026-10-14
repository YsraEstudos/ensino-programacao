# Referência 16.08

Microprojeto - máquina de estados: preserve a assinatura publicada, valide os campos e condições descritos e prove os resultados com casos de sucesso e borda.

## Transferência
Estenda a máquina de upload com estado `cancelled` e ação `cancel` válida durante `uploading`, mas inválida em `success`. Escreva a tabela de transições para uploading 40%, cancel, e para sucesso seguido de cancel. Borda: progresso 100 não deve ser aceito como upload ainda ativo se a regra o reserva ao sucesso.
