export function render(document, state, list) { list.replaceChildren(...state.tasks.map(task => { const item=document.createElement('li'); item.innerHTML=task.text; return item; })); }
