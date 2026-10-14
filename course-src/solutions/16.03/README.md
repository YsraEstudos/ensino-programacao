# Referência 16.03

Complete a união: preserve a assinatura publicada, valide os campos e condições descritos e prove os resultados com casos de sucesso e borda.

## Transferência
Modele uma união `Entrega` para retirada (`lojaId`), entrega expressa (`endereco`, `janela`) e envio postal (`cep`, `codigoRastreio`). Escreva um `switch` que gere a descrição de cada modalidade e acrescente uma quarta variante `armario` para prever o diagnóstico antes de atualizar o handler. Borda: uma retirada não pode carregar `codigoRastreio`.
