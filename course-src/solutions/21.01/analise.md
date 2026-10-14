# Diagnóstico por evidência

| Caso | hipótese inicial | medição adequada | decisão depois da medição |
|---|---|---|---|
| loop 50M | CPU local | profiler CPU / flame graph | worker apenas se perfil confirmar bloqueio |
| fetch 2,4s; servidor 80ms | rede/espera | Resource Timing + spans servidor | investigar latência restante antes de cache |
| leitura/escrita layout | layout thrashing | Performance panel, recálculo de estilo e Long Tasks | agrupar leituras e escritas |
| listeners acumulam | retenção de memória | heap snapshots e contagem de listeners | corrigir cleanup confirmado |
| CSV 2GB inteiro | memória/I/O | heap + throughput de leitura | stream incremental |
| JSON 40MB após rede pronta | CPU parse | profile do parse e long task | parse em worker só se medido |

