# Plano manual e entrega

1. Pasta limpa/caminho curto: npm ci, build, test, pack:releases. Anote SO/Node/npm/TS, cache ou registry usado e saídas completas. Verifique npm pack --json e inspecione declarações/exports do pacote instalado. Não confunda build local com o conteúdo distribuído.
2. Instale cada tarball em catálogo e relatório externos. Confirme pacote por package.json instalado, compile NodeNext/strict e execute imports da raiz. Teste acentos, bordas, texto curto, tamanho0, default60 e espaços repetidos. Compare IDs/ordem/referências/entrada do relatório.
3. Demonstre1.1 antigo aprovado,2.0 antigo TS2345/TypeError e2.0 migrado aprovado. Guarde reprodução I-L42, diff L-43 e pós-incidente. Reinstale1.1 como rollback e repita catálogo/relatório.
4. Revise mensagens/release notes e exemplos com outro leitor. O pacote não pode conter reference, tests, src, consumers ou scripts internos. Confirmar integração em CJS/bundlers/browser/registry/CI público requer trabalho adicional: marque não executado.
5. Entregue ticket/ADR/revisão, integração/contrato/regressão, técnica adicional e limites, mudança/incident/postmortem e quatro rubricas24.01. Evidência local-declared; terminal/capturas/commits declarados pelo aluno não são avaliação independente.

Segurança7.2 permanece em24.01. Aqui a fronteira é pacote allowlisted e arquivos temporários delimitados; não há autenticação, SQL, upload ou servidor para alegar cobertura desses riscos.
