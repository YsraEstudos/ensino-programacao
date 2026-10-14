// 15.11 · O código compila, mas a tela de perfil quebra.
// Reproduza a falha, remova o cast e valide o JSON na fronteira.

type User = { name: string };

export function nomeEmCaixaAlta(texto: string): string {
  const user = JSON.parse(texto) as User;
  return user.name.toUpperCase();
}

// Reprodução (descomente e rode `node perfil.ts`):
// console.log(nomeEmCaixaAlta('{"name":"Ana"}')); // esperado: ANA
// console.log(nomeEmCaixaAlta('{"name":42}'));    // observado: ___
// console.log(nomeEmCaixaAlta('{'));              // observado: ___
// Seus payloads: ___
