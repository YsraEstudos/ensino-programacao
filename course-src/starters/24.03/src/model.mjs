// TODO F-31: implement stale-while-revalidate, validation and latest-request wins.
export function validateTasks(value) { return Array.isArray(value) ? value : []; }
export function route(hash) { return {name:'list'}; }
export function createModel({request, changed=()=>{}}) {
  const state={status:'idle',tasks:[],error:'',board:'all',source:'network'};
  return {state, async load(board='all'){state.board=board;state.status='error';state.error='Implemente o contrato F-31';changed(state);},invalidate(){}};
}
