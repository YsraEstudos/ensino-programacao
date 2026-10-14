export const LIMITE_PADRAO_CENTAVOS=10000;export function dentroDoLimite(totalCentavos,limite=LIMITE_PADRAO_CENTAVOS){return Number.isSafeInteger(totalCentavos)&&totalCentavos<=limite;}
