import { fileURLToPath } from 'node:url';

// Node.js 20.11+ e 21.2+: import.meta.dirname e import.meta.filename chegam prontos ao módulo.
export function pastaDoModulo() {
  return import.meta.dirname;
}

export function arquivoDoModulo() {
  return import.meta.filename;
}

// Alternativa para runtimes sem essas propriedades: derive o caminho de import.meta.url.
export function arquivoPorUrl() {
  return fileURLToPath(import.meta.url);
}
