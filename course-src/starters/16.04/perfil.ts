// 16.04 · Cartão de perfil: o cast promete um User que ninguém verificou.
// Substitua o cast por um parser que valide id (number) e name (string).
// Falhas: forma errada -> erro de validação que diga qual campo falhou;
// JSON inválido -> erro de parse que preserve o erro original em `cause`.

export type User = { id: number; name: string };

// Forma mínima de uma resposta HTTP, para testar sem rede.
// (No navegador, Response.json() devolve Promise<any>; aqui o retorno é unknown de propósito.)
export type RespostaHttp = { json(): Promise<unknown> };

export async function userFromResponse(res: RespostaHttp): Promise<User> {
  return (await res.json()) as User;
}

export function respostaFalsa(corpo: string): RespostaHttp {
  return { json: async () => JSON.parse(corpo) };
}

// Payloads para conferir (crie os seus também):
// await userFromResponse(respostaFalsa('{"id":1,"name":"Ana"}'))   -> User válido
// await userFromResponse(respostaFalsa('{"id":"1","name":"Ana"}')) -> erro de validação em id
// await userFromResponse(respostaFalsa('null'))                    -> erro de validação
// await userFromResponse(respostaFalsa('{'))                       -> erro de parse com cause
