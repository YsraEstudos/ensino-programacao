# 23.10 — Referência de leitura

Avalie este ID com o ambiente rubric e evidência declarada. O item é de leitura: não há código de referência a comparar e src/ não deve ser alterado.

## Respostas de referência

1. Dono da regra: src/domain/limite.js, função dentroDoLimite(valorCentavos, limiteCentavos). O valor padrão LIMITE_PADRAO_CENTAVOS = 10000 é declarado no mesmo arquivo.
2. Caminho: src/main.js chama gerarRelatorio (src/service/relatorio.js), que chama dentroDoLimite para cada pedido; src/ui/tabela.js só recebe o relatório pronto e o renderiza.
3. Previsões esperadas: dentroDoLimite(10000) = true; dentroDoLimite(10001) = false; dentroDoLimite(-1) = true, porque a regra compara apenas com o limite e não rejeita negativos. Nenhum teste existente fixa o caso -1. A fronteira está em test/limite.test.js, "abaixo, no limite e acima".
4. src/ui/formatar-limite.js não é dono: só converte centavos em texto para o cabeçalho e não classifica pedidos.

## Critérios observáveis

- Nomeia limite.js como dono e traça UI -> service -> domain com função e linha.
- Registra previsão antes da execução e confere com test/investigacao.test.js, explicando a observação sobre -1.
- Não altera código; a mudança de requisito e a política de valores inválidos pertencem a 23.11.
