import {readFile} from 'node:fs/promises';
export async function carregarConfig(){return JSON.parse(await readFile('./data/config.json','utf8'));}
// BUG: o caminho depende do cwd e quebra ao chamar o CLI de outro diretório.
