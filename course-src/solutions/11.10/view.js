export function render(document, state, list) { list.replaceChildren(...state.tasks.map(task => { const item = document.createElement('li'); item.textContent = task.text; return item; })); }
