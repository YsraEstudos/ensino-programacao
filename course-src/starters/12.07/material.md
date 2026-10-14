Requisito 1: esperar todas as operações obrigatórias (`Promise.all`).
Requisito 2: conservar sucessos parciais (`Promise.allSettled`).
Requisito 3: primeiro término (`Promise.race`).
Requisito 4: primeiro sucesso (`Promise.any`).
Requisito 5: timeout com limpeza explícita; um race sozinho não cancela o trabalho perdedor.
Requisito 6: consultar réplicas e aceitar o primeiro sucesso; cancelar/limpar as demais só se a API oferecer essa operação.
