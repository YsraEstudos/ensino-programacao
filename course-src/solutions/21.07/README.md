# 21.07 — Referência de avaliação

## Contrato observado

Avalie este ID com o ambiente node-simulated e as verificações declaradas: behavior, mutation. Os arquivos de referência são: tempo.js. A referência preserva o contrato authored indicado nos arquivos e no enunciado.

## Transferência independente

# Transfer 21.07

Build autosave trailing at 300ms for edits t=0,100,299 (only latest saves at599); cancel an edit at t=800 before its t=1100 save. Separately define scroll throttle leading at a 250ms exact boundary; show a timestamped event/output table.

## Critérios observáveis da avaliação

- Timeline tests exact times and latest autosave value; cancellation removes the pending callback.
- Scroll throttle declares and tests the exact boundary policy.
- Explanation distinguishes silence-window debounce from frequency-limited throttle for the two use cases.

## Verificação

A evidência depende do executor node-simulated; erros de infraestrutura, suíte vazia ou timeout não aprovam a tentativa.

## Transferência independente

# Transfer 21.07

Construa um autosave com debounce final de 300 ms para edições em t=0, 100 e 299 (só a última salva em 599); cancele uma edição em t=800 antes do salvamento previsto em t=1100. Separadamente, defina um throttle de rolagem na borda inicial exata de 250 ms e mostre uma tabela de eventos com marcas de tempo.

## Transferência independente

# Transfer 21.07

Execute os dois cronogramas separadamente com relógio falso. Primeiro, acompanhe os quatro eventos do starter em t=0,20,40,160: debounce trailing produz t=140 e t=260; throttle leading produz t=0 e t=160. Depois simule outra rajada de 100 eventos em t=0,10,...,990: debounce trailing salva apenas o evento 99 em t=1090; throttle leading aceita t=0,100,...,900. Declare a regra de borda: o throttle leading aceita exatamente quando t - última chamada >= espera (incluindo t=100); o callback trailing devido no limite executa quando o relógio avança até o prazo. Inclua uma edição cancelada e explique por que a política do debounce e a do throttle são diferentes.
