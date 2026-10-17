import type {Task} from './model.mjs';
export function openDatabase(name?:string):Promise<IDBDatabase>;
export function readTasks(db:IDBDatabase):Promise<Task[]>;
export function writeTasks(db:IDBDatabase,tasks:Task[]):Promise<void>;
