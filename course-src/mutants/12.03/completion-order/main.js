export async function carregar(api) { return Promise.race([api.produtos(), api.usuarios(), api.precos()]); }
