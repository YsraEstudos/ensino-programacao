export async function salvar(pedido:{id:string},falha:unknown):Promise<void>{if(falha!==undefined)throw falha;console.log("salvo",pedido.id);}
export async function salvarPedido(pedido:{id:string},falha?:unknown):Promise<string>{try{await salvar(pedido,falha);return "Pedido salvo.";}catch(e){throw new Error("Não foi possível salvar o pedido.",{cause:e});}}
