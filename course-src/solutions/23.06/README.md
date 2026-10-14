# 23.06 — Referência de avaliação

## Contrato observado

Avalie este ID com o ambiente rubric e as verificações declaradas: rubric. Os arquivos de referência são: material de rubrica e evidência local. A referência preserva o contrato authored indicado nos arquivos e no enunciado.

## Transferência independente

# Transfer 23.06

Auditar upload multipart: validar MIME e assinatura dos bytes, tamanho, filename/path, metadados JSON e diretório de destino; mapear parse → validação → domínio → storage e identificar quais erros podem expor cause.

## Critérios observáveis da avaliação

- Cinco fontes indicam parse, validação, tipo de domínio e política de falha em arquivo/camada concreta.
- Detecta que cast não valida, que HTML/texto externo deve usar textContent e que storage precisa migrar versão.
- Transferência de uploads inclui multipart bytes/type/size validation, filename distrust e rollback antes de persistir lote.

## Verificação

A evidência depende do executor rubric; erros de infraestrutura, suíte vazia ou timeout não aprovam a tentativa.
