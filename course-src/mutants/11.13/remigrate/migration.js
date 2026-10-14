export function migrarV1ParaV2(value) { return { version: 2, tasks: (value.tasks || []).map(task => ({ ...task, priority: 'normal' })) }; }
export function carregar(value) { return migrarV1ParaV2(value); }
