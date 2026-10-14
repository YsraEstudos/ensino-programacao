# 21.01 — Referência de avaliação

## Contrato observado

Avalie este ID com o ambiente rubric e as verificações declaradas: rubric. Os arquivos de referência são: material de rubrica e evidência local. A referência preserva o contrato authored indicado nos arquivos e no enunciado.

## Transferência independente

# Transfer 21.01

Caso novo: tela trava por 180 ms após carregar 12 mil linhas mas servidor responde em 45 ms. Escolha perfil que separa parse, layout e render; registre hipótese, métrica observada e decisão, inclusive o que a medição refutou.

## Critérios observáveis da avaliação

- Cada um dos seis casos tem hipótese falsificável e instrumento que mede a camada correta.
- Decisão depende do resultado da medição; fetch separa servidor de rede e JSON parse após rede é CPU.
- Transferência apresenta instrumento, observação numérica e mudança escolhida, sem recomendar cache/worker por reflexo.

## Verificação

A evidência depende do executor rubric; erros de infraestrutura, suíte vazia ou timeout não aprovam a tentativa.
