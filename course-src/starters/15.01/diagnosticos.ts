// 15.01 · Formulário de reserva: seis diagnósticos para classificar.
// Configuração: strict (padrão desde o TypeScript 6) + noUncheckedIndexedAccess.
// Numa pasta sem tsconfig.json, rode `npx tsc --noEmit --strict --noUncheckedIndexedAccess diagnosticos.ts`
// (com tsconfig.json presente, o TypeScript 6+ exige `--ignoreConfig`). Depois preencha matriz.md.

type Reserva = { readonly id: string; nome: string; noites: number };
type EntradaFormulario = { nome: string; noites: string };

const reservas: Reserva[] = [{ id: "r1", nome: "Ana", noites: 2 }];

// 1. Leitura de posição de array
export const primeiroNome = reservas[0].nome;

// 2. Valor do formulário usado como número
export function noitesDoFormulario(entrada: EntradaFormulario): number {
  const noites: number = entrada.noites;
  return noites;
}

// 3. JSON recebido
export function checkIn(texto: string): string {
  const dados: unknown = JSON.parse(texto);
  return dados.checkIn;
}

// 4. Alteração de identificador
export function renomear(reserva: Reserva): void {
  reserva.id = "r2";
}

// 5. Objeto literal com campo a mais
export const nova: Reserva = { id: "r3", nome: "Bia", noites: 1, cafe: true };

// 6. Função com caminho sem retorno
export function preco(noites: number): number {
  if (noites > 0) {
    return noites * 200;
  }
}
