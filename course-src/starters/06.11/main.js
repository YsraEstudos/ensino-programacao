export function resumirPerfil(usuario) {
  const perfil = usuario?.perfil;
  if (perfil !== null && perfil !== undefined && (typeof perfil !== "object" || Array.isArray(perfil))) {
    // Retorne null para um contêiner presente que não seja um registro.
  }
  return {
    nome: "",
    pontos: 0,
    ativo: false,
    mensagem: "",
  };
}
