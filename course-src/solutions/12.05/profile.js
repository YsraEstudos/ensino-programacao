export async function carregar(fetchProfile) {
  try { return await fetchProfile(); } catch { return { nome: 'offline' }; }
}
