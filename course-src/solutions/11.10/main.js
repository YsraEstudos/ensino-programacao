import {carregar, mover, salvar} from './state.js';
import {render} from './view.js';
export function wire({storage, document, list}) { let state = carregar(storage); render(document, state, list); return (id, status) => { state = mover(state, id, status); salvar(storage, state); render(document, state, list); }; }
