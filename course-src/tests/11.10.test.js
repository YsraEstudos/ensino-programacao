import {carregar, mover, salvar} from './state.js';
import {render} from './view.js';
describe('Kanban dividido por responsabilidades', () => {
  test('state preserva V1 e não muta entrada', () => { const state = {version: 1, tasks: [{id: 'a', text: 'A', status: 'todo'}]}; const next = mover(state, 'a', 'done'); /*@case 11.10.state-preserva-v1-e-nao-muta-f59518dc*/expect(next.tasks[0].status).toBe('done'); /*@case 11.10.state-preserva-v1-e-nao-muta-b486c31d*/expect(state.tasks[0].status).toBe('todo'); });
  test('storage fica em state e JSON inválido não sobrescreve', () => { let raw = '{'; const storage = {getItem: () => raw, setItem: (_, value) => {raw = value;}}; /*@case 11.10.storage-fica-em-state-e-json-c8070cda*/expect(carregar(storage)).toEqual({version: 1, tasks: []}); /*@case 11.10.storage-fica-em-state-e-json-3b47cff6*/expect(raw).toBe('{'); salvar(storage, {version: 1, tasks: []}); /*@case 11.10.storage-fica-em-state-e-json-bd88e1a4*/expect(JSON.parse(raw).version).toBe(1); });
  test('view recebe estado e usa texto literal sem storage', () => { const list = {replaceChildren(...nodes) {this.nodes = nodes;}}; const document = {createElement: () => ({textContent: ''})}; render(document, {version: 1, tasks: [{id: 'a', text: '<img>', status: 'todo'}]}, list); /*@case 11.10.view-recebe-estado-e-usa-tex-7d3551fd*/expect(list.nodes[0].textContent).toBe('<img>'); });
});
