export function migrarV1ParaV2(value) { return { version: 2, tasks: (value.tasks || []).every(task => task.id && task.text && task.status) ? value.tasks.map(task => ({ ...task, priority: 'normal' })) : [] }; }
export function carregar(value) { return migrarV1ParaV2(value); }

