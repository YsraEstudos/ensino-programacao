export function loadConfig(env) { const port = Number(env.PORT || '3000'); return { port, logLevel: env.LOG_LEVEL || 'info' }; }
