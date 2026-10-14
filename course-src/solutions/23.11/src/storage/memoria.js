export function criarRepositorioEmMemoria(iniciais=[]){const entregas=iniciais.map(x=>({...x}));return{listar:()=>entregas.map(x=>({...x})),salvar(x){entregas.push({...x});}};}
