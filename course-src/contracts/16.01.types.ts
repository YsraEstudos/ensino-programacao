import type {SearchState} from '../search.js';
const idle:SearchState<string[]>={kind:'idle'}; const loading:SearchState<string[]>={kind:'loading'}; const success:SearchState<string[]>={kind:'success',data:['x']}; const error:SearchState<string[]>={kind:'error',message:'offline'};
// @ts-expect-error loading não carrega data nem error
const impossible:SearchState<string[]>={kind:'loading',data:['x'],message:'offline'};
