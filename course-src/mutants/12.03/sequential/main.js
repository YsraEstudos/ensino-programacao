export async function carregar(api) { return [await api.produtos(), await api.usuarios(), await api.precos()]; }
