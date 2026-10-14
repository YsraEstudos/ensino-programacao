// 17.06 · Overload, union, generic ou concreto?
// Para cada API, escolha a forma mais simples que preserva o contrato de chamada.
// Escreva a assinatura, uma chamada válida e uma inválida.

type Config = { porta: number; host: string };

// 1. identity: devolve o mesmo valor recebido.
// 2. parse(texto): devolve Config ou lança erro.
// 3. format(valor): aceita string ou number e sempre devolve string.
// 4. get(config, chave): devolve o valor da chave escolhida, com o tipo daquela chave.
// 5. create(): devolve uma Config com valores padrão.
// 6. map(xs, fn): transforma cada item de T em U.
// 7. toJSON(valor): devolve string; a entrada é qualquer valor serializável.
// 8. ler(tipo): ler("numero") devolve number; ler("texto") devolve string.

// Exemplo (8) com overloads: a relação entre o literal e o retorno não cabe numa union simples.
export function ler(tipo: "numero"): number;
export function ler(tipo: "texto"): string;
export function ler(tipo: "numero" | "texto"): number | string {
  return tipo === "numero" ? 0 : "";
}

// Suas assinaturas para 1 a 7:
// ___

// Comparação: quando um generic resolveria a 8? Quando uma union bastaria? ___
export type { Config };
