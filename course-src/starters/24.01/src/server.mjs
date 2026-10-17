import {createServer as httpServer} from 'node:http';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createSecurity, redactLogFields, securityHeaders} from './security.mjs';

const MAX_BODY_BYTES = 16 * 1024;
const page = `<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Comentários privados</title><main><h1>Comentários</h1><form id="login"><label for="username">Usuário</label><input id="username" value="ana" autocomplete="username"><label for="password">Senha</label><input id="password" type="password" value="demo-ana" autocomplete="current-password"><button>Entrar</button></form><section id="private" hidden><label for="comment">Comentário</label><input id="comment"><button id="add">Adicionar</button><ul id="comments"></ul></section><p id="status" role="status"></p></main><script type="module" src="/app.mjs"></script></html>`;
const app = `let csrf;const form=document.querySelector('#login');form.addEventListener('submit',async event=>{event.preventDefault();const response=await fetch('/api/session',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({username:document.querySelector('#username').value,password:document.querySelector('#password').value})});if(!response.ok){document.querySelector('#status').textContent='Falha no acesso';return;}csrf=(await response.json()).csrf;document.querySelector('#private').hidden=false;document.querySelector('#status').textContent='Sessão local iniciada';});document.querySelector('#add').addEventListener('click',async()=>{const text=document.querySelector('#comment').value;const response=await fetch('/api/private/ana',{method:'POST',headers:{'content-type':'application/json','x-csrf-token':csrf},body:JSON.stringify({text})});if(response.ok){const li=document.createElement('li');li.textContent=text;document.querySelector('#comments').append(li);}});`;
const BAD_JSON = Symbol('bad-json');
const TOO_LARGE = Symbol('too-large');

async function readJson(request) {
  const declaredSize = Number(request.headers['content-length'] || 0);
  if (declaredSize > MAX_BODY_BYTES) { request.resume(); return TOO_LARGE; }
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) { request.resume(); return TOO_LARGE; }
    chunks.push(chunk);
  }
  try {
    const value = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    return value && typeof value === 'object' && !Array.isArray(value) ? value : BAD_JSON;
  } catch { return BAD_JSON; }
}

function bodyError(response, result) {
  if (result !== BAD_JSON && result !== TOO_LARGE) return false;
  const status = result === TOO_LARGE ? 413 : 400;
  response.writeHead(status, {'content-type': 'application/json; charset=utf-8'}).end(JSON.stringify({error: 'invalid request'}));
  return true;
}

export function createAppServer({now, logger = () => {}, security = createSecurity({now}), allowedOrigin} = {}) {
  let activeOrigin = allowedOrigin;
  const server = httpServer(async (request, response) => {
    Object.entries(securityHeaders()).forEach(([key, value]) => response.setHeader(key, value));
    const url = new URL(request.url, 'http://127.0.0.1');
    const requestOrigin = request.headers.origin;
    if (requestOrigin) {
      if (requestOrigin !== activeOrigin) { response.writeHead(403).end('origin denied'); return; }
      response.setHeader('access-control-allow-origin', activeOrigin);
      response.setHeader('vary', 'Origin');
    }
    if (request.method === 'OPTIONS') { response.writeHead(204, {'access-control-allow-methods': 'GET,POST', 'access-control-allow-headers': 'content-type,x-csrf-token'}).end(); return; }
    logger(redactLogFields({event: 'request', method: request.method, path: url.pathname}));
    const cookie = request.headers.cookie || '';
    const sessionId = /(?:^|;\s*)session=([^;]+)/.exec(cookie)?.[1];
    if (request.method === 'GET' && url.pathname === '/') { response.writeHead(200, {'content-type': 'text/html; charset=utf-8'}).end(page); return; }
    if (request.method === 'GET' && url.pathname === '/app.mjs') { response.writeHead(200, {'content-type': 'text/javascript; charset=utf-8'}).end(app); return; }
    if (request.method === 'POST' && url.pathname === '/api/session') {
      const input = await readJson(request);
      if (bodyError(response, input)) return;
      const id = security.login(input.username, input.password);
      if (!id) { response.writeHead(401).end('invalid credentials'); return; }
      response.writeHead(200, {'set-cookie': `session=${id}; HttpOnly; SameSite=Strict; Path=/`, 'content-type': 'application/json'}).end(JSON.stringify({csrf: security.csrfFor(id)})); return;
    }
    if (request.method === 'POST' && url.pathname === '/api/logout') {
      if (!security.userFor(sessionId)) { response.writeHead(401).end('unauthenticated'); return; }
      if (!security.canLogout(sessionId, request.headers['x-csrf-token'])) { response.writeHead(403).end('forbidden'); return; }
      security.logout(sessionId, request.headers['x-csrf-token']);
      response.writeHead(204, {'set-cookie': 'session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0'}).end(); return;
    }
    const match = /^\/api\/private\/([a-z]+)$/.exec(url.pathname);
    if (match && request.method === 'GET') {
      const userId = security.userFor(sessionId);
      if (!userId) { response.writeHead(401).end('unauthenticated'); return; }
      if (!security.canRead(sessionId, match[1])) { response.writeHead(403).end('forbidden'); return; }
      response.writeHead(200, {'content-type': 'application/json'}).end(JSON.stringify({owner: match[1], comments: []})); return;
    }
    if (match && request.method === 'POST') {
      const userId = security.userFor(sessionId);
      if (!userId) { response.writeHead(401).end('unauthenticated'); return; }
      if (!security.canWrite(sessionId, match[1], request.headers['x-csrf-token'])) { response.writeHead(403).end('forbidden'); return; }
      const input = await readJson(request);
      if (bodyError(response, input)) return;
      if (typeof input.text !== 'string' || input.text.length > 500) { response.writeHead(400, {'content-type': 'application/json; charset=utf-8'}).end(JSON.stringify({error: 'invalid request'})); return; }
      logger(redactLogFields({event: 'comment.created', userId, path: url.pathname}));
      response.writeHead(201, {'content-type': 'application/json'}).end(JSON.stringify({owner: match[1], text: input.text})); return;
    }
    response.writeHead(404).end('not found');
  });
  server.on('listening', () => {
    if (!activeOrigin) activeOrigin = `http://127.0.0.1:${server.address().port}`;
  });
  return server;
}

export function resolveServerConfig(env = process.env) {
  const rawPort = env.PORT ?? '4173';
  if (!/^(0|[1-9]\d*)$/.test(String(rawPort))) throw new Error('PORT must be an integer from 0 through 65535.');
  const port = Number(rawPort);
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('PORT must be an integer from 0 through 65535.');
  const allowedOrigin = env.APP_ORIGIN;
  return Object.freeze({host: '127.0.0.1', port, allowedOrigin});
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const {host, port, allowedOrigin} = resolveServerConfig();
  const server = createAppServer({allowedOrigin, logger: value => process.stdout.write(`${JSON.stringify(value)}\n`)});
  server.listen(port, host, () => process.stdout.write(`ready http://${host}:${server.address().port}\n`));
}
