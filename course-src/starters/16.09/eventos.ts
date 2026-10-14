// 16.09 · Handler de eventos da pesquisa com verificação de exaustividade.

export function assertNever(valor: never): never {
  throw new Error(`Evento não tratado: ${JSON.stringify(valor)}`);
}

export type EventoPesquisa =
  | { tipo: "digitou"; termo: string }
  | { tipo: "enviou"; termo: string }
  | { tipo: "limpou" };

export function descrever(evento: EventoPesquisa): string {
  switch (evento.tipo) {
    case "digitou":
      return `digitando "${evento.termo}"`;
    case "enviou":
      return `buscando "${evento.termo}"`;
    case "limpou":
      return "busca limpa";
    default:
      // complete: o compilador deve provar que nenhum evento sobrou aqui
  }
}

// Depois de completar, invente um evento novo (por exemplo { tipo: "filtrou"; filtro: string }),
// acrescente-o à union sem mexer no switch e registre o diagnóstico que aparece.
