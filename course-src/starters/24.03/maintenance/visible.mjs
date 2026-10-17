// Base alheia F-33: preserve alphabetical order while adding hideDone.
export function selectVisible(tasks,options={}) {return [...tasks].sort((a,b)=>a.title.localeCompare(b.title));}
