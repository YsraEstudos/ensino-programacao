export function loadConfig(env) {
  const rawPort = typeof env.PORT === 'string' && env.PORT.trim() ? env.PORT.trim() : '3000';
  const port = Number(rawPort);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new RangeError('PORT inválida');
  const logLevel = typeof env.LOG_LEVEL === 'string' && env.LOG_LEVEL.trim() ? env.LOG_LEVEL.trim() : 'info';
  if (!['debug', 'info', 'warn', 'error'].includes(logLevel)) throw new RangeError('LOG_LEVEL inválido');
  if (env.NODE_ENV === 'production' && !(typeof env.TOKEN === 'string' && env.TOKEN.trim())) throw new Error('TOKEN obrigatório em produção');
  return { port, logLevel };
}
