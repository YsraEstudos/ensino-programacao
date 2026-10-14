export function resumirPerfil(usuario) {
  const perfil = usuario?.perfil;
  if (perfil !== null && perfil !== undefined && (typeof perfil !== "object" || Array.isArray(perfil))) {
    return null;
  }
  return {
    nome: usuario?.perfil?.nome ?? "Visitante",
    pontos: usuario?.perfil?.pontos ?? 100,
    ativo: usuario?.perfil?.ativo ?? true,
    mensagem: usuario?.perfil?.mensagem ?? "Sem mensagem",
  };
}
