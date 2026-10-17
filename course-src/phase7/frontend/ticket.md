# F-31 — Retomar o quadro sem perder orientação

Solicitante: "o quadro troca sozinho quando navego rápido e preciso abrir uma tarefa por link". Antes de editar, escreva perguntas, contrato e decomposição estimada.

Respostas fornecidas: lista/detalhe bastam; filtro troca para lista; vazio é sucesso sem tarefas; falha preserva somente snapshot da mesma chave; revalidar a cada retorno/Atualizar; resposta mais recente vence inclusive na mesma chave; escrita offline não é permitida. Campo title tem120caracteres. Sem arrastar obrigatório: teclado+select é a operação acessível. Cache é por quadro e persistência salva apenasall. Link desconhecido explica ausência e oferece voltar.

Aceitação: contract.md, oito testes nativos e sete fluxos E2E reais. Registre incertezas e ajuda. Anexe revisão respondida tecnicamente (por que abort sozinho é insuficiente? por que persistência não é autorização?). Autonomia/transferência/IA e segurança completas continuam vinculadas24.01.
