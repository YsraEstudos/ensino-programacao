export async function carregar(fetchProfile) { try { return fetchProfile(); } catch { return { nome: 'offline' }; } }
