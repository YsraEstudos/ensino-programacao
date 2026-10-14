export async function inspecionar(resposta) {
  const antes=resposta.bodyUsed; const status=resposta.status; const tipo=resposta.headers.get('Content-Type'); let corpo;
  try { corpo=await resposta.json(); } catch(erro) { return {status,tipo,antes,depois:resposta.bodyUsed,erro:erro.name}; }
  return {status,tipo,antes,depois:resposta.bodyUsed,corpo};
}
