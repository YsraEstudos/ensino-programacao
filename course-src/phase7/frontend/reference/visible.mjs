export function selectVisible(tasks,{hideDone=false}={}) {return tasks.filter(task=>!hideDone||task.status!=='done').sort((a,b)=>a.title.localeCompare(b.title));}
