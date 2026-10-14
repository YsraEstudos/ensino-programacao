export function rotulo(nome: string): string {
  return nome.trim() || "sem nome";
}
console.log(rotulo(" DevPath "));
