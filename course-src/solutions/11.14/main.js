export function instalar({botao,rolagem,painel,copiarTexto,observarRolagem,atualizarPainel,controller=new AbortController()}) {
  botao.addEventListener('click',copiarTexto,{once:true}); rolagem.addEventListener('wheel',observarRolagem,{passive:true}); painel.addEventListener('click',atualizarPainel,{signal:controller.signal}); return controller;
}
