export type Config = { port: number };
export function parseConfig(raw: unknown): Config {
  if (typeof raw !== 'object' || raw === null) throw new TypeError('Configuração inválida');
  if (!('port' in raw) || raw.port === undefined) return { port: 3000 };
  const value = raw.port;
  if (typeof value !== 'string' || !/^\d+$/.test(value)) throw new RangeError('Porta inválida');
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new RangeError('Porta fora da faixa');
  return { port };
}
