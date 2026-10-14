export function instalar(menu,item,{modo='none',cancelar=false}={}) {
 const log=[],fora=menu.parentElement;
 fora.addEventListener('click',()=>log.push('fora-capture'),{capture:true});
 menu.addEventListener('click',()=>log.push('menu-capture'),{capture:true});
 item.addEventListener('click',()=>log.push('item-1'));
 item.addEventListener('click',event=>{log.push('item-controle');if(cancelar)event.preventDefault();if(modo==='stop')event.stopPropagation();if(modo==='immediate')event.stopImmediatePropagation();});
 item.addEventListener('click',()=>log.push('item-3'));
 menu.addEventListener('click',()=>log.push('menu-bubble'));
 fora.addEventListener('click',()=>log.push('fora-bubble'));
 return {log};
}
