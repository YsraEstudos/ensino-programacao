import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const server = createServer(async (request, response) => { const file = request.url === '/' ? 'index.html' : request.url.slice(1); try { const content = await readFile(new URL(file, root)); response.setHeader('content-type', file.endsWith('.js') ? 'text/javascript' : 'text/html; charset=utf-8'); response.end(content); } catch { response.statusCode = 404; response.end('not found'); } });
server.listen(4180, '127.0.0.1', () => console.log('Performance lab: http://127.0.0.1:4180'));
