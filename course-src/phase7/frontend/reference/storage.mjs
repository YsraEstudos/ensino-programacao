export async function openDatabase(name='devpath-kanban') {
  let blocked=false;
  const request=indexedDB.open(name,2);
  request.onupgradeneeded=event=>{
    const db=request.result,transaction=request.transaction;
    const tasks=db.objectStoreNames.contains('tasks')?transaction.objectStore('tasks'):db.createObjectStore('tasks',{keyPath:'id'});
    if(event.oldVersion===1&&db.objectStoreNames.contains('cards')){
      const cursor=transaction.objectStore('cards').openCursor();
      cursor.onsuccess=()=>{const item=cursor.result;if(!item)return;const old=item.value;tasks.put({id:old.id,title:old.title,status:old.completed?'done':'todo',updatedAt:old.updatedAt||0});item.continue();};
    }
  };
  return new Promise((resolve,reject)=>{
    request.onsuccess=()=>{const db=request.result;if(blocked){db.close();return;}db.onversionchange=()=>db.close();resolve(db);};
    request.onerror=()=>reject(request.error);
    request.onblocked=()=>{blocked=true;reject(new Error('Feche outra aba do quadro e tente novamente.'));};
  });
}
export function readTasks(db){return new Promise((resolve,reject)=>{const tx=db.transaction('tasks','readonly'),request=tx.objectStore('tasks').getAll();tx.oncomplete=()=>resolve(request.result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||new Error('Read aborted'));});}
export function writeTasks(db,tasks){return new Promise((resolve,reject)=>{
  const tx=db.transaction('tasks','readwrite'),store=tx.objectStore('tasks');
  tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||new Error('Write aborted'));
  try{store.clear();for(const task of tasks)store.put(task);}catch(error){tx.abort();reject(error);}
});}
