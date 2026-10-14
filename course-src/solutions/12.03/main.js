export async function carregar(api) {
  return Promise.all([api.produtos(), api.usuarios(), api.precos()]);
}
