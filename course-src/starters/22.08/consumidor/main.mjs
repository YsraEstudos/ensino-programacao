// Consumidor fora do workspace. Passos, sem publicar nada na rede:
// 1. Na pasta do pacote: npm run build && npm pack   (gera curso-centavos-0.1.0.tgz)
// 2. Nesta pasta: npm init -y && npm install ../curso-centavos-0.1.0.tgz
// 3. node main.mjs   e, num main.ts equivalente, npx tsc --noEmit
import { centavosParaTexto, somarCentavos } from "@curso/centavos";

console.log(centavosParaTexto(somarCentavos([100, 250])));
