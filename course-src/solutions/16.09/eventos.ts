export function assertNever(valor:never):never { throw new Error("Evento não tratado: "+JSON.stringify(valor)); }
export type EventoPesquisa={tipo:"digitou";termo:string}|{tipo:"enviou";termo:string}|{tipo:"limpou"};
export function descrever(evento:EventoPesquisa):string { switch(evento.tipo){case "digitou":return "digitando "+JSON.stringify(evento.termo);case "enviou":return "buscando "+JSON.stringify(evento.termo);case "limpou":return "busca limpa";default:return assertNever(evento);} }
