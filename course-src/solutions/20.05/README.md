# 20.05 — Referência de avaliação

## Contrato observado

Avalie este ID com o ambiente javascript e as verificações declaradas: behavior, mutation. Os arquivos de referência são: validador.js. A referência preserva o contrato authored indicado nos arquivos e no enunciado.

## Transferência independente

# Transferência 20.05

Escreva `validarPreco` para aceitar apenas centavos inteiros entre 1 e 50.000 em `produto.preco` e numa função `alterarProduto` que cria nova cópia. Compare 1, 50.000, 0, 50.001, 2,5 e uma string; verifique que nenhuma falha grava valor inválido e que alterar propriedade dentro de `produto.detalhes` não passa pelo proxy externo.

## Critérios observáveis da avaliação

- As duas APIs aplicam a mesma faixa e rejeitam zero, limite acima, fração e texto.
- A alternativa explícita retorna novo objeto sem mudar a entrada; o teste descreve visibilidade/contagem.
- A análise reconhece que Proxy externo observa apenas operações no próprio alvo e recomenda com base no caso.

## Verificação

A evidência depende do executor javascript; erros de infraestrutura, suíte vazia ou timeout não aprovam a tentativa.
