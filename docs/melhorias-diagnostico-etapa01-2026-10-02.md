# Diagnóstico inicial e Etapa 01

Escopo autorizado: D.01–D.05 e 01.01–01.09. A Etapa 00 serviu de referência visual e de experiência; seu conteúdo, CSS e interações não foram alterados. Os demais estágios do catálogo foram comparados ao commit anterior e permanecem iguais.

## Prioridades conciliadas antes da implementação

1. **Alta — Diagnóstico genérico:** um único textarea não representava os objetivos diferentes das cinco atividades. Campos estruturados agora distinguem saída, tipo, condição, entrada/retorno e hipótese/ferramenta/evidência. A opção “Ainda não sei” permite começar sem estudo prévio.
2. **Alta — Feedback inadequado ao diagnóstico:** o editor e as exigências genéricas de execução/reflexão foram substituídos por material somente leitura, respostas comparadas e raciocínio resolvido sem nota. Concluir exige conferir e confirmar a leitura, não acertar.
3. **Alta — Organização iniciante na Etapa 01:** o objetivo de aprendizagem abre a página; explicações em pequenos passos precedem exemplo, desafio e previsão. O código inicial está visível antes da previsão, separado do exemplo resolvido. Instruções práticas específicas substituem a repetição de instruções técnicas.
4. **Média — Inconsistência visual:** reutilizamos os componentes visuais existentes da Etapa 00: cabeçalho aberto, verde-lima, fontes, painéis de leitura, código/saída, roteiro numerado e botões. Estilos adicionais estão limitados a D e 01. A documentação oficial ficou em consulta opcional, com orientação para iniciantes.
5. **Média — Acessibilidade e celular:** navegação acompanha a rolagem real da página, ajusta a margem dos destinos e devolve foco ao feedback. Controles têm rótulos e alvos de pelo menos 44px. Resultados de execução são apresentados em cartões em telas estreitas. Movimento respeita a preferência de redução.

## Conteúdo e progresso preservados

Os objetivos, exemplos, contratos, casos públicos e critérios de domínio da Etapa 01 continuam ativos. O Diagnóstico mantém seus cinco temas e prepara o aluno para começar pela Etapa 00. Respostas desconhecidas não bloqueiam a trilha.

Rascunhos e versões anteriores são preservados; uma edição invalida o feedback da tentativa anterior. D usa as estruturas de progresso já aceitas pela API: previsão JSON com menos de 400 caracteres, confiança inteira de 0–100, evidência escrita e confirmação de leitura. A Etapa 01 mantém seu estado próprio. O progresso remoto continua vinculado à conta.

As fontes editoriais canônicas estão neste checkout em `course-src`. `npm run build:lessons` gera somente os materiais D/01 e atualiza apenas a preparação dos nove itens 01 no catálogo. Não distribui soluções das transferências.

## Validação

- Diagnóstico: 8 testes passam, incluindo desconhecimento, limites de confiança, restauração, rascunho anterior, invalidação de feedback e integração da rota real.
- Etapa 01: 60 testes passam, cobrindo contratos, exemplos, execução, seletores, foco, persistência e conclusão.
- Etapas de referência 00 e 02: verificações existentes passam, sem mudança dos materiais dessas etapas.
- Build de produção passa. O validador mantém um aviso já existente de `GRAPH_CONTRACT_MISMATCH` em 01.06; não houve erro de validação.
- Navegador real: leitura e navegação em desktop, 390px e 320px; D.01 com desconhecimento até conclusão; 01.02 com previsão e execução; feedback com foco correto e sem transbordamento horizontal do documento.

Limite: não foi feita uma auditoria formal de WCAG ou avaliação com alunos. A revisão humana dos seis subagentes foi conciliada com o checkout atual; recomendações que antecipavam conceitos das etapas futuras foram descartadas.
