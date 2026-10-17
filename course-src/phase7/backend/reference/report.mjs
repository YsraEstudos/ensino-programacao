export function summarizeProject(project) {
  return project.tasks.length === 0 ? 'empty' : project.tasks.every(task => task.done) ? 'done' : 'active';
}
