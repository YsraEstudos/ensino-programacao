# @curso/centavos 0.1.0

Pacote ESM com licença MIT e sem dependências de runtime. Requer Node.js 24 ou posterior.

- `centavosParaTexto(centavos, moeda = "BRL")`: formata centavos inteiros seguros em BRL ou USD.
- `somarCentavos(valores: readonly number[])`: soma centavos inteiros seguros e lança RangeError para frações ou overflow.

Valide com `npm test`, `npm run build` e `npm pack`. Instale o tarball em um consumidor ESM/TypeScript isolado para conferir runtime e declarations.

## Transferência independente

# Transfer 22.08

Em um consumidor temporário isolado, instale o tarball do pacote autoral @curso/centavos@0.1.0. Importe centavosParaTexto e somarCentavos pela raiz do pacote em ESM, compile chamadas com readonly number[] e os dois literais de moeda, e inspecione exports e licença do pacote empacotado.

## Critérios observáveis da avaliação

- Nome, versão, licença MIT, mínimo Node 24 e as duas assinaturas autorais permanecem inalterados.
- O consumidor limpo resolve tipos e default a partir dos arquivos dist entregues e executa as duas funções públicas.
- O tarball exclui fonte e scripts de build, contém a declaração gerada, e não há publicação no registro nem redesenho de API.

## Verificação local

npm test

npm run build

npm pack --dry-run

Limite: esta evidência é local/contida e não representa aprovação de navegador nem publicação.
