// Depois de empacotar, instale o tarball neste consumidor e execute `node main.mjs`.
// Compile `main.ts` com `tsc --noEmit --strict --module NodeNext --moduleResolution NodeNext main.ts`.
import { centavosParaTexto, somarCentavos } from "@curso/centavos";

console.log(centavosParaTexto(somarCentavos([100, 250])));
