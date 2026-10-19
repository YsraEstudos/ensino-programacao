import {carregar} from './state.js';
import {render} from './view.js';
export function boot(storage, document, list) { const state = carregar(storage); render(document, state, list); return state; }
if (typeof document !== 'undefined' && typeof localStorage !== 'undefined') { const list = document.querySelector('#todo'); if (list) boot(localStorage, document, list); }
