# F-33 — Manutenção em base alheia

`maintenance/visible.mjs` é um relatório legado escrito por outra equipe: ordena por título sem modificar a entrada. Novo requisito: `selectVisible(tasks,{hideDone:true})` remove statusdone. Default preserva todos; a ordenação e identidades permanecem; arrayoriginal não pode ser alterado. Não reimplemente a base inteira.

Execute `node --test test/maintenance.test.mjs` antes: falha de asserção por tarefa concluída visível. Rastreie a função, aplique patch mínimo e execute novamente. Documente causa, alcance e casos antigos preservados; a solução não está no ZIP. O relatório separado permite reproduzir a mudança em código alheio sem transformar sua própria UI em evidência de manutenção.
