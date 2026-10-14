export async function tentar(operacao,max,esperar,atraso){for(let tentativa=0;tentativa<max;tentativa++){try{return await operacao();}catch(erro){if(tentativa===max-1)throw erro;}}}
