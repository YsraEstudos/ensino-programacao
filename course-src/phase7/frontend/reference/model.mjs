const statuses=new Set(['todo','doing','done']);
export function validateTasks(value) {
  if(!Array.isArray(value)) throw new TypeError('Invalid task list');
  const ids=new Set();
  return value.map(task=>{
    if(!task || typeof task.id!=='string'||!task.id||typeof task.title!=='string'||!task.title.trim()||!statuses.has(task.status)||!Number.isFinite(task.updatedAt)||ids.has(task.id)) throw new TypeError('Invalid task');
    ids.add(task.id);return {id:task.id,title:task.title,status:task.status,updatedAt:task.updatedAt};
  });
}
export function route(hash) {
  if(hash===''||hash==='#/'||hash==='#')return {name:'list'};
  const match=/^#\/tasks\/([^/]+)$/.exec(hash);
  if(!match)return {name:'not-found'};
  try {return {name:'detail',id:decodeURIComponent(match[1])};} catch{return {name:'not-found'};}
}
export function createModel({request,changed=()=>{},initialTasks}) {
  const cache=new Map();let generation=0;
  if(initialTasks)cache.set('all',validateTasks(initialTasks));
  const state={status:'idle',tasks:[],error:'',board:'all',source:'network'};
  return {state, invalidate(board='all'){cache.delete(board);},async load(board='all'){
    const current=++generation;
    state.board=board;state.error='';state.tasks=structuredClone(cache.get(board)||[]);
    state.source=cache.has(board)?'cache':'network';state.status=cache.has(board)?'revalidating':'loading';changed(state);
    try{
      const tasks=validateTasks(await request(board));
      if(current!==generation)return;
      cache.set(board,structuredClone(tasks));state.tasks=tasks;state.status=tasks.length?'ready':'empty';state.source='network';
    }catch{if(current!==generation)return;state.status='error';state.error='Não foi possível atualizar. Tente novamente.';}
    changed(state);
  }};
}
