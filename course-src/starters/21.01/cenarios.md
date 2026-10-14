# Qual é o gargalo?

Para cada cenário, escreva o gargalo provável (CPU, I/O, rede, DOM ou memória) e a medição que confirmaria a hipótese antes de propor uma solução.

1. Relatório soma 50 milhões de números num `for` e a aba trava por 3 s.
   ```js
   let total = 0; for (let i = 0; i < 5e7; i++) total += i % 7;
   ```
2. Tela de pedidos espera 2,4 s por `await fetch("/api/pedidos")`; o servidor responde em 80 ms nos logs.
3. Lista de 500 cards ajusta a altura de cada um num laço que lê e escreve layout:
   ```js
   for (const card of cards) card.style.height = card.offsetWidth / 2 + "px";
   ```
4. Depois de 1 hora aberta, a aba passa de 80 MB para 900 MB; cada navegação acrescenta listeners que nunca são removidos.
5. Script de importação lê um CSV de 2 GB do disco com `readFile` antes de processar a primeira linha.
6. Dashboard faz `JSON.parse` de uma resposta de 40 MB e a interface congela logo depois que a rede termina.

| Nº | Gargalo provável | Evidência/medição (ferramenta) | Solução só depois da medição |
|----|------------------|--------------------------------|------------------------------|
| 1 | | | |
| 2 | | | |
| 3 | | | |
| 4 | | | |
| 5 | | | |
| 6 | | | |

Algum cenário combina mais de uma fonte? Qual?
