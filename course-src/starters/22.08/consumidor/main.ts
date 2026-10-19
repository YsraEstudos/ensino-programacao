import {centavosParaTexto, somarCentavos} from '@curso/centavos';

const total: number = somarCentavos([100, 250] as const);
const texto: string = centavosParaTexto(total);
const usd: string = centavosParaTexto(100, 'USD');

// @ts-expect-error centavos precisam ser números
somarCentavos(['100']);
// @ts-expect-error a API aceita somente BRL e USD
centavosParaTexto(100, 'EUR');

void [texto, usd];
