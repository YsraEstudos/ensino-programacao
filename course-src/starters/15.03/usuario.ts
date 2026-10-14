// 15.03 · API exportada da tela de perfil.
// Anote só o contrato público: os parâmetros e o retorno de criarUsuario.
// A constante local pode continuar inferida; explique por quê.

export type Usuario = { nome: string; idade: number; criadoEm: string };

const IDADE_MINIMA = 13;

export function criarUsuario(nome /* : ___ */, idade /* : ___ */) /* : ___ */ {
  const limpo = nome.trim();
  if (idade < IDADE_MINIMA) {
    throw new RangeError("idade abaixo do mínimo");
  }
  return { nome: limpo, idade, criadoEm: new Date().toISOString() };
}

// Uma chamada válida:
// criarUsuario(___);
// Uma chamada que deve falhar no compilador (por exemplo, idade como texto):
// criarUsuario(___);
