# Responsabilidades e dependências

## 1. Marque cada linha de pedidos.js

| Responsabilidade | Linhas | Camada de destino |
|------------------|--------|-------------------|
| HTTP | | adapter HTTP |
| Validação de entrada | | |
| Regra de preço | | domínio |
| Storage | | adapter de storage (implementa a porta) |
| DOM / formulário | | UI |

## 2. Desenhe as setas (quem depende de quem)

```text
UI ──> serviço ──> domínio
           └────> porta Repositorio <── adapter localStorage
```

Ajuste o desenho acima e responda:

- O domínio importa algo de DOM, fetch ou localStorage?
- Como testar a regra de preço com um repositório falso, sem navegador?
- Quando o fetch falhar, que contexto o erro precisa carregar ao atravessar as camadas (`cause`)?
