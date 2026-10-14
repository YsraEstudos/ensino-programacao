import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
const projectRoot = new URL('../', import.meta.url);
export function createNetworkServer() {
  return createServer(async (request, response) => {
    if (request.url === '/') { response.setHeader('content-type', 'text/html; charset=utf-8'); response.end(await readFile(new URL('index.html', projectRoot))); return; }
    if (request.url === '/src/app.js') { response.setHeader('content-type', 'text/javascript; charset=utf-8'); response.end(await readFile(new URL('src/app.js', projectRoot))); return; }
    if (request.url === '/api/items') { response.setHeader('content-type', 'application/json'); response.end('[{"id":1}]'); return; }
    if (request.url === '/api/slow') { setTimeout(() => response.end('slow'), 80); return; }
    response.statusCode = 404; response.end('not found');
  });
}
if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  createNetworkServer().listen(Number(process.env.PORT || 4173), '127.0.0.1', () => console.log('Network lab: http://127.0.0.1:4173'));
}
