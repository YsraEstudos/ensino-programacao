import {createServer} from 'node:http';
import {createReadStream, statSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicRoot = path.join(root, 'public');
const host = '127.0.0.1';
const port = Number(process.env.DEVPATH_BROWSER_PORT || 8018);
const solutionPaths = new Map([
  ['11.06', new Set(['app.js'])],
  ['11.12', new Set(['render.js'])],
  ['11.04', new Set(['form.js'])],
  ['11.05', new Set(['app.js'])],
  ['11.08', new Set(['app.js'])],
  ['11.10', new Set(['main.js', 'state.js', 'view.js'])],
  ['13.13', new Set(['app.js', 'tests/13.13.test.js'])],
  ['21.05', new Set(['main.js', 'primos.js', 'worker.js'])],
  ['21.09', new Set(['lab.js', 'index.html'])],
]);
const mime = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
]);

function sendFile(response, filename) {
  try {
    if (!statSync(filename).isFile()) throw new Error('Not a file');
    response.writeHead(200, {
      'Cache-Control': 'no-store',
      'Content-Type': mime.get(path.extname(filename)) || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff',
    });
    createReadStream(filename).pipe(response);
  } catch {
    response.writeHead(404, {'Cache-Control': 'no-store'}).end('Not found');
  }
}

const server = createServer((request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, {Allow: 'GET, HEAD'}).end();
    return;
  }
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url || '/', `http://${host}`).pathname);
  } catch {
    response.writeHead(400).end('Invalid path');
    return;
  }
  const solutionMatch = pathname.match(/^\/__gate\/solutions\/(\d{2}\.\d{2})\/(.+)$/);
  if (solutionMatch) {
    const [, id, relative] = solutionMatch;
    if (!solutionPaths.get(id)?.has(relative)) {
      response.writeHead(404).end('Not found');
      return;
    }
    sendFile(response, path.join(root, 'course-src', 'solutions', id, relative));
    return;
  }
  const relative = pathname === '/' ? 'devpath.html' : pathname.slice(1);
  const filename = path.resolve(publicRoot, relative);
  if (filename !== publicRoot && !filename.startsWith(`${publicRoot}${path.sep}`)) {
    response.writeHead(404).end('Not found');
    return;
  }
  sendFile(response, filename);
});

server.listen(port, host, () => process.stdout.write(`Master phases 4–6 browser gate: http://${host}:${port}/devpath.html\n`));
function close() { server.close(() => process.exit(0)); }
process.on('SIGINT', close);
process.on('SIGTERM', close);
