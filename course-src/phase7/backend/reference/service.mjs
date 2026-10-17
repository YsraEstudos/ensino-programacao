import {randomBytes, createHash} from 'node:crypto';
import {openStore} from './store.mjs';
import {verifyPassword, hashPassword} from './passwords.mjs';
import {parseLogin, parseProject, parseTask} from './schema.mjs';
const digest = token => createHash('sha256').update(token).digest('hex');
const titles = {400: 'Bad Request', 401: 'Unauthorized', 403: 'Forbidden', 404: 'Not Found', 405: 'Method Not Allowed', 409: 'Conflict', 413: 'Content Too Large', 415: 'Unsupported Media Type', 500: 'Internal Server Error'};
class HttpError extends Error { constructor(status) { super(titles[status]); this.status = status; } }
const fail = status => { throw new HttpError(status); };
export function createApplication({dbPath, users, clock = Date.now, log = () => {}}) {
  const store = openStore(dbPath, users);
  const db = store.db;
  // Fixed-cost password verification for unknown identities. No plaintext stored.
  const dummy = hashPassword('unused-demo-dummy-password');
  const query = (sql, ...params) => db.prepare(sql).get(...params);
  function identity(headers) {
    const match = /^Bearer ([A-Za-z0-9_-]{43})$/.exec(headers.authorization || '');
    if (!match) fail(401);
    const tokenHash = digest(match[1]);
    const session = query('SELECT user_id,expires_at FROM sessions WHERE token_hash=?', tokenHash);
    if (!session || session.expires_at <= clock()) fail(401);
    return {user: session.user_id, tokenHash};
  }
  function input(request, parse) {
    if (request.tooLarge) fail(413);
    if (!/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(request.headers['content-type'] || '')) fail(415);
    try { return parse(JSON.parse(request.raw || '')); } catch { fail(400); }
  }
  function owned(id, user) {
    const row = query('SELECT id,name,owner_id FROM projects WHERE id=? AND owner_id=?', Number(id), user);
    if (!row) fail(404);
    return row;
  }
  async function handle(request) {
    const {method, path, headers} = request;
    let status = 200, body;
    let responseHeaders = {'content-type': 'application/json', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff'};
    try {
      // This API is loopback bearer-only. Browser-originated calls are deliberately refused.
      if (headers.origin) fail(403);
      if (request.tooLarge) fail(413);
      const projectPath = /^\/projects\/([1-9]\d{0,8})(\/tasks)?$/.exec(path);
      if (path === '/sessions') {
        if (method !== 'POST') fail(405);
        const login = input(request, parseLogin);
        const user = query('SELECT id,password_hash FROM users WHERE id=?', login.username);
        const valid = verifyPassword(login.password, user?.password_hash || dummy);
        if (!user || !valid) fail(401);
        const token = randomBytes(32).toString('base64url');
        db.prepare('DELETE FROM sessions WHERE expires_at<=?').run(clock());
        db.prepare('INSERT INTO sessions VALUES (?,?,?)').run(digest(token), user.id, clock() + 900000);
        status = 201; body = {token, expiresIn: 900};
      } else if (path === '/sessions/current') {
        const auth = identity(headers);
        if (method !== 'DELETE') fail(405);
        db.prepare('DELETE FROM sessions WHERE token_hash=?').run(auth.tokenHash);
        body = {ended: true};
      } else if (path === '/projects' || projectPath) {
        const auth = identity(headers);
        if (path === '/projects') {
          if (method === 'GET') body = db.prepare('SELECT id,name FROM projects WHERE owner_id=? ORDER BY id').all(auth.user);
          else if (method === 'POST') {
            const project = input(request, parseProject);
            const id = store.transaction(() => {
              const result = db.prepare('INSERT INTO projects(owner_id,name) VALUES (?,?)').run(auth.user, project.name);
              const projectId = Number(result.lastInsertRowid);
              for (const title of project.tasks) db.prepare('INSERT INTO tasks(project_id,title) VALUES (?,?)').run(projectId, title);
              return projectId;
            });
            status = 201; body = {id};
          } else fail(405);
        } else {
          const project = owned(projectPath[1], auth.user);
          if (!projectPath[2] && method === 'GET') body = {id: project.id, name: project.name, tasks: db.prepare('SELECT id,title FROM tasks WHERE project_id=? ORDER BY id').all(project.id)};
          else if (projectPath[2] && method === 'POST') {
            const task = input(request, parseTask);
            const result = db.prepare('INSERT INTO tasks(project_id,title) VALUES (?,?)').run(project.id, task.title);
            status = 201; body = {id: Number(result.lastInsertRowid)};
          } else fail(405);
        }
      } else fail(404);
    } catch (error) {
      status = error instanceof HttpError ? error.status : /UNIQUE constraint failed/.test(error.message) ? 409 : 500;
      body = {type: 'about:blank', title: titles[status], status, instance: path};
      responseHeaders = {...responseHeaders, 'content-type': 'application/problem+json'};
    }
    // Metadata is selected, never serialized from an untrusted request/error object.
    log({event: 'request', method, path, status});
    return {status, body, headers: responseHeaders};
  }
  return {store, handle, close: () => store.close()};
}
