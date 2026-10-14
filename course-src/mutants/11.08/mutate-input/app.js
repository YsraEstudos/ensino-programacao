const STORAGE_KEY = 'kanban:v1';
const STATUSES = ['todo', 'doing', 'done'];
const LABELS = {todo: 'A fazer', doing: 'Em curso', done: 'Feito'};
const empty = () => ({version: 1, tasks: []});

export function carregar(storage, warn = () => {}) {
  const raw = storage.getItem(STORAGE_KEY);
  if (raw == null) return empty();
  try {
    const value = JSON.parse(raw);
    if (value?.version !== 1 || !Array.isArray(value.tasks)) throw new SyntaxError('Formato V1 inválido');
    const tasks = value.tasks.filter(task => task && typeof task.id === 'string' && typeof task.text === 'string' && STATUSES.includes(task.status));
    return {version: 1, tasks};
  } catch {
    warn('Os dados salvos estão inválidos; o quadro começou vazio e o conteúdo original foi preservado.');
    return empty();
  }
}

export function mover(state, id, status) {
  if (!STATUSES.includes(status)) throw new RangeError('status inválido');
  for (const task of state.tasks) if (task.id === id) task.status = status; return state;
}

export function salvar(storage, state) {
  storage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function renderizar(document, state) {
  for (const status of STATUSES) {
    const list = document.querySelector(`[data-status="${status}"]`);
    if (!list) continue;
    const items = state.tasks.filter(task => task.status === status).map(task => {
      const item = document.createElement('li');
      item.dataset.taskId = task.id;
      const label = document.createElement('span');
      label.textContent = task.text;
      item.append(label);
      for (const nextStatus of STATUSES.filter(candidate => candidate !== status)) {
        const button = document.createElement('button');
        button.type = 'button';
        button.dataset.moveTo = nextStatus;
        button.dataset.taskId = task.id;
        button.textContent = `Mover para ${LABELS[nextStatus]}`;
        item.append(button);
      }
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.dataset.removeTask = 'true';
      remove.dataset.taskId = task.id;
      remove.textContent = 'Remover';
      item.append(remove);
      return item;
    });
    list.replaceChildren(...items);
  }
}

export function montarKanban(document, storage) {
  const form = document.querySelector('#nova-tarefa');
  const input = document.querySelector('#texto');
  const notice = document.querySelector('#aviso');
  const board = document.querySelector('.quadro');
  let state = carregar(storage, message => { notice.textContent = message; });
  let nextId = 1;
  const commit = message => {
    salvar(storage, state);
    renderizar(document, state);
    if (message) notice.textContent = message;
  };
  form.addEventListener('submit', event => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) {
      notice.textContent = 'Informe o texto da tarefa.';
      input.focus();
      return;
    }
    const id = `${Date.now()}-${nextId++}`;
    state = {...state, tasks: [...state.tasks, {id, text, status: 'todo'}]};
    input.value = '';
    commit('Tarefa adicionada em A fazer.');
    input.focus();
  });
  board.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button || !board.contains(button)) return;
    const id = button.dataset.taskId;
    if (button.dataset.removeTask) {
      state = {...state, tasks: state.tasks.filter(task => task.id !== id)};
      commit('Tarefa removida.');
      return;
    }
    const status = button.dataset.moveTo;
    if (!status) return;
    state = mover(state, id, status);
    commit(`Tarefa movida para ${LABELS[status]}.`);
    board.querySelector(`button[data-task-id="${id}"]`)?.focus();
  });
  renderizar(document, state);
  return {getState: () => state};
}
