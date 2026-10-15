# Issue #31 · Importar um módulo do pacote pelo nome falha

Outro projeto da equipe escreveu `import { calcularMedia } from 'oficina-notas/calculo'` e recebeu ERR_PACKAGE_PATH_NOT_EXPORTED. O mesmo projeto importa `oficina-notas/formatar` sem erro, e `oficina-notas` também funciona. O dono do pacote diz que `src/calculo.js` existe e que os testes internos passam.

Antes de propor qualquer mudança, responda com evidência:

1. Qual campo do `package.json` decide quais subcaminhos externos o pacote expõe? Cite o trecho.
2. Preveja o resultado de `oficina-notas`, `oficina-notas/formatar`, `oficina-notas/calculo` e `oficina-notas/src/calculo.js` para um projeto externo, antes de conferir.
3. Por que `main` não basta para expor `/formatar`?
4. Por que `test/calculo.test.js` importa `../src/calculo.js` sem erro, mesmo sem exportação?
5. Qual mudança mínima liberaria `calculo` sem expor a pasta `src/` inteira? Qual parte da API pública muda com ela?
