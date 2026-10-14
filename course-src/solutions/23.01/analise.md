# Revisão do god object

| Responsabilidade observada | camada proposta | fronteira/teste |
|---|---|---|
| HTTP parse e status | adapter web | fake request/response |
| validação de DTO | borda | unknown → parser → tipo domínio |
| regra de preço | domínio puro | fake repository e tabela de preço |
| gravação | porta/adaptador | falha preserva cause técnica |
| formulário/DOM | UI | textContent, nunca innerHTML para texto externo |

Fluxo: UI → serviço → domínio/porta; HTTP e storage entram por adapters. Primeiro extrair teste de preço e seam de repositório, depois separar handlers sem mudar resposta.
