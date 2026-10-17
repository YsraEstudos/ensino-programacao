export type Task = {id:string;title:string;status:'todo'|'doing'|'done';updatedAt:number};
export type State = {status:string;tasks:Task[];error:string;board:string;source:string};
export function validateTasks(value:unknown):Task[];
export function route(hash:string):{name:'list'|'detail'|'not-found';id?:string};
export function createModel(options:{request:(board:string)=>Promise<unknown>;changed?:(state:State)=>void;initialTasks?:Task[]}):{state:State;load(board?:string):Promise<void>;invalidate(board?:string):void};
