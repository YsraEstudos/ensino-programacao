// Top-level await torna o módulo assíncrono: require() não o carrega.
await Promise.resolve();

export const valor = 1;
