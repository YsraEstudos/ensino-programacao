// TODO F-32: IndexedDB v2, migrate v1 cards -> tasks without losing title.
export async function openDatabase(name='devpath-kanban') {
  const request=indexedDB.open(name,2);
  request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains('tasks'))request.result.createObjectStore('tasks',{keyPath:'id'});};
  return new Promise((resolve,reject)=>{request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);request.onblocked=()=>reject(new Error('Feche outra aba do quadro e tente novamente.'));});
}
export async function readTasks(db){return [];}
export async function writeTasks(db,tasks){return;}
