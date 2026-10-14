export function formatarLimite(centavos){return new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(centavos/100);}
