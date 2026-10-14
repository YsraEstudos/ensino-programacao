export async function tentar(operacao,max,esperar,atraso) {
  if(!Number.isInteger(max)||max<1)return Promise.reject(new RangeError('max deve ser inteiro positivo')); let ultima;
  for(let tentativa=0;tentativa<=max;tentativa++){try{return await operacao();}catch(erro){ultima=erro;await esperar(atraso);}}
  return Promise.reject(ultima);
}
