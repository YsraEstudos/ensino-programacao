import {createServer} from 'node:http';
import {once} from 'node:events';
const LIMIT = 16384;
export async function readBody(stream) {
  let size = 0;
  const chunks = [];
  if (!stream) return {raw: ''};
  // Drain oversized bodies without buffering them so an HTTP 413 can still be sent.
  for await (const chunk of stream) {
    const data = Buffer.from(chunk);
    size += data.length;
    if (size <= LIMIT) chunks.push(data);
  }
  return size > LIMIT ? {tooLarge: true} : {raw: Buffer.concat(chunks).toString('utf8')};
}
function lifecycle(server, app) {
  let pending;
  return {url: `http://127.0.0.1:${server.address().port}`, close() {
    return pending ??= new Promise((resolve, reject) => {
      // Stop accepting, drain in-flight requests; force lingering sockets after 3 seconds.
      const timer = setTimeout(() => server.closeAllConnections(), 3000);
      timer.unref();
      server.close(error => {
        clearTimeout(timer);
        try { app.close(); } catch (closeError) { return reject(closeError); }
        error ? reject(error) : resolve();
      });
      server.closeIdleConnections();
    });
  }};
}
export async function startNode(app, {port = 0} = {}) {
  const server = createServer(async (req, res) => {
    try {
      const body = await readBody(req);
      const result = await app.handle({method: req.method, path: new URL(req.url, 'http://localhost').pathname, headers: req.headers, ...body});
      res.writeHead(result.status, result.headers);
      res.end(JSON.stringify(result.body));
    } catch {
      res.writeHead(500, {'content-type': 'application/problem+json'});
      res.end(JSON.stringify({type: 'about:blank', status: 500, title: 'Internal Server Error', instance: '/'}));
    }
  });
  server.requestTimeout = 10000;
  server.headersTimeout = 5000;
  server.maxHeadersCount = 64;
  server.listen(port, '127.0.0.1');
  try { await once(server, 'listening'); } catch (error) { app.close(); throw error; }
  return lifecycle(server, app);
}
export async function startHono(app, {port = 0} = {}) {
  const {serve} = await import('@hono/node-server');
  const {createHono} = await import('./hono.mjs');
  const router = createHono(app, request => readBody(request.body));
  const server = serve({fetch: router.fetch, port, hostname: '127.0.0.1'});
  server.requestTimeout = 10000;
  server.headersTimeout = 5000;
  server.maxHeadersCount = 64;
  try { await once(server, 'listening'); } catch (error) { app.close(); throw error; }
  return lifecycle(server, app);
}
