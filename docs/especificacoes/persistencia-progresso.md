# Persistência do progresso — decisão de engenharia

Verificação local em 05/10/2026. Reproduzir com `node scripts/measure-engineering.mjs`. Usa somente dados sintéticos: vinte linhas de tentativa por atividade, reflexão curta e três tentativas. As médias têm 30 repetições por cenário.

| Atividades | Bytes UTF-8 | Serialização ms | Sanitização ms | SQLite em memória ms |
|---|---:|---:|---:|---:|
| 10 | 9748 | 0.016 | 0.099 | 0.040 |
| 127 | 120547 | 0.163 | 0.181 | 0.352 |
| 254 | 240816 | 0.313 | 0.264 | 0.508 |

SQLite em memória mede a operação local e serialização do registro saneado; não mede latência, autenticação ou custo de D1 remoto. Estes cenários não representam rascunhos de tamanho máximo nem todas as transferências das etapas. Frequência real de alunos, latência remota e sessões offline prolongadas não foram instrumentadas. Não coletamos código ou dados de alunos.

## Fila e recuperação

O teste de resposta lenta confirmou snapshots obsoletos: antes, três edições enviavam 1, 2 e 3; agora enviam 1 e 3 quando a primeira gravação continua em andamento. Cada PUT usa a revisão confirmada anterior. A primeira requisição não é cancelada e o backup só é removido quando o snapshot confirmado coincide com o atual.

Falha de transporte pausa a sincronização e preserva a tentativa atual. Tentar novamente envia o último estado. Conflito 409/428 mantém o bloqueio de sobrescrita. A recuperação de uma cópia de outra sessão permanece explícita; carregamento inicial inválido não dispara gravação de progresso vazio. Testes: `test-progress-queue.mjs`, `test-progress-client.mjs` e `test-progress-api.mjs`.

## Integridade da conclusão

- Diagnóstico e etapa 00 registram respostas e reflexão de acordo com seus controles locais.
- Etapa 01 exige previsão, código aprovado atual, reflexão e transferências nos controles do cliente. O servidor saneia o estado e exige consistência entre código e aprovação, mas não executa novamente a solução.
- Etapa 02 exige blocos com previsão, entendimento e código aprovado atual; o servidor também exige consistência desses campos.
- Etapa 03 usa rascunho e evidência versionados; o cliente verifica os casos e transferências. O servidor limita e saneia esses dados, sem repetir o interpretador da etapa.
- Etapas genéricas registram execução ou análise escrita, reflexão e rubrica. Uma execução com erro ou timeout ainda é uma tentativa, não uma aprovação automática da solução.

Flags e evidências produzidas no navegador são registros de aprendizagem e autoavaliação. Não são comprovação independente de domínio ou uma nota inviolável. Se o produto precisar de certificação, deverá haver avaliação no servidor em ambiente isolado e um modelo próprio de evidências.

## Decisão

Manter o registro JSON e o controle de concorrência por revisão. O problema comprovado era a fila; foi corrigido sem migração de banco. Os custos locais medidos não justificam tabelas por exercício. Reavaliar se surgirem necessidade de consultas analíticas, limites agregados de tamanho ou latência de produção relevante. Uma eventual migração exige plano separado com backup, rollback e revisão por registro.
