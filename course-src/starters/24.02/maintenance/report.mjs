// Base alheia fornecida, não escrita pelo aluno. Preserve os casos com tarefas.
export function summarizeProject(project) {
  return project.tasks.every(task => task.done) ? 'done' : 'active';
}
