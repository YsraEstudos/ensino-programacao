export function observarClique(root) {
  const log = [];
  for (const id of ['pai', 'filho', 'alvo']) root.querySelector('#'+id).addEventListener('click', event => log.push({target:event.target.id,currentTarget:event.currentTarget.id}));
  return log;
}
export function observarControles(root, modo) {
  const alvo=root.querySelector('#alvo'),log=[];
  root.addEventListener('click',()=>log.push('capture'),{capture:true});
  alvo.addEventListener('click',()=>log.push('target-1'));
  alvo.addEventListener('click',event=>{log.push('target-controle');if(modo==='stop')event.stopPropagation();if(modo==='immediate')event.stopImmediatePropagation();});
  alvo.addEventListener('click',()=>log.push('target-3'));
  root.addEventListener('click',()=>log.push('bubble'));
  return log;
}
