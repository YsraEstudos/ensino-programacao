export function custoPeso(kg) { return kg * 2; }
export function custoDistancia(km) { return km * 0.1; }
export function frete(kg, km) { return custoPeso(kg) + custoDistancia(km); }
