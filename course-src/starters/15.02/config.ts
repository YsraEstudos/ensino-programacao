// 15.02 · Fronteira de configuração da página de catálogo.
// Contrato: port ausente -> 3000 (default documentado); texto com inteiro de 1 a 65535 -> number;
// qualquer outro valor -> RangeError. Config é o resultado; não é o parser.
// Monte parseConfig com os blocos abaixo. Um bloco não deve ser usado.

export type Config = { port: number };

export function parseConfig(raw: unknown): Config {
  // cole aqui os blocos, na ordem escolhida
}

/* Blocos (embaralhados)
[P] const texto = "port" in raw ? raw.port : undefined;
[Q] return { port };
[R] if (typeof raw !== "object" || raw === null) throw new TypeError("config precisa ser um objeto");
[S] return raw as Config;
[T] if (!Number.isInteger(port) || port < 1 || port > 65535) throw new RangeError(`porta inválida: ${String(texto)}`);
[U] if (texto === undefined) return { port: 3000 };
[V] const port = typeof texto === "string" && /^\d+$/.test(texto) ? Number(texto) : Number.NaN;
*/

// Casos para conferir depois de montar:
// parseConfig({ port: "8080" }) -> { port: 8080 }
// parseConfig({})               -> { port: 3000 }
// parseConfig({ port: "abc" })  -> RangeError
// Seu caso inválido: ___  ->  resultado observado: ___
