import assert from 'node:assert/strict';
import {test} from 'node:test';
import {pathToFileURL} from 'node:url';
import {createAppServer} from '../src/server.mjs';
const securityModuleUrl = process.env.PHASE7_SECURITY_MODULE
  ? pathToFileURL(process.env.PHASE7_SECURITY_MODULE).href
  : new URL('../src/security.mjs', import.meta.url).href;
const securityModule = await import(securityModuleUrl);
async function fetchOrSkip(t, url, options) {
  try { return await fetch(url, options); }
  catch (error) { if (error?.cause?.code === 'EACCES' || error?.cause?.code === 'EPERM') { t.skip(`loopback connect blocked by environment: ${error.cause.code}`); return null; } throw error; }
}
function closeServer(server) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('HTTP contract server did not close within 5 seconds')), 5000);
    server.closeAllConnections?.();
    server.close(error => {
      clearTimeout(timer);
      if (error) reject(error);
      else resolve();
    });
  });
}

test('HTTP session rejects guessed cookies and redacts real cookie/token sentinels', async t => {
  const logs = [];
  const server = createAppServer({security: securityModule.createSecurity(), logger: entry => logs.push(JSON.stringify(entry))});
  try {
    await new Promise((resolve, reject) => {
      server.once('error', reject);
      server.listen(0, '127.0.0.1', resolve);
    });
  } catch (error) {
    if (error?.code === 'EACCES' || error?.code === 'EPERM') { t.skip(`socket blocked by environment: ${error.code}`); return; }
    throw error;
  }
  t.after(() => closeServer(server));
  const address = server.address();
  const base = `http://127.0.0.1:${address.port}`;
  const call = async promise => {
    try { return await promise; }
    catch (error) {
      if (error?.cause?.code === 'EACCES' || error?.cause?.code === 'EPERM') { t.skip(`loopback connect blocked by environment: ${error.cause.code}`); return null; }
      throw error;
    }
  };
  const getPrivate = cookie => call(fetch(`${base}/api/private/ana`, {headers: {cookie}}));
  const guessed = await getPrivate('session=s-ana'); if (!guessed) return;
  assert.equal(guessed.status, 401);
  assert.equal((await getPrivate('session=fabricated-cookie-sentinel')).status, 401);
  const login = await call(fetch(`${base}/api/session`, {method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify({username: 'ana', password: 'demo-ana'})}));
  if (!login) return;
  assert.equal(login.status, 200);
  const cookie = login.headers.get('set-cookie').split(';')[0];
  const cookieHeader = login.headers.get('set-cookie');
  assert.match(cookieHeader, /HttpOnly/i);
  assert.match(cookieHeader, /SameSite=Strict/i);
  const csrf = (await login.json()).csrf;
  assert.notEqual(cookie, 'session=s-ana');
  assert.ok(cookie.slice('session='.length).length >= 40);
  const textSentinel = 'approved comment';
  const success = await call(fetch(`${base}/api/private/ana`, {method: 'POST', headers: {cookie, 'content-type': 'application/json', 'x-csrf-token': csrf}, body: JSON.stringify({text: textSentinel})}));
  if (!success) return;
  assert.equal(success.status, 201);
  const commentSentinel = 'comment-secret-sentinel';
  const commentSuccess = await call(fetch(`${base}/api/private/ana`, {method: 'POST', headers: {cookie, 'content-type': 'application/json', 'x-csrf-token': csrf}, body: JSON.stringify({text: commentSentinel})}));
  if (!commentSuccess) return;
  assert.equal(commentSuccess.status, 201);
  const deniedSentinel = 'denied-token-sentinel';
  const denied = await call(fetch(`${base}/api/private/ana`, {method: 'POST', headers: {cookie, 'content-type': 'application/json', 'x-csrf-token': deniedSentinel}, body: JSON.stringify({text: 'denied-body-secret-sentinel'})}));
  if (!denied) return;
  assert.equal(denied.status, 403);
  const logoutDenied = await call(fetch(`${base}/api/logout`, {method: 'POST', headers: {cookie}}));
  if (!logoutDenied) return;
  assert.equal(logoutDenied.status, 403);
  const logoutAllowed = await call(fetch(`${base}/api/logout`, {method: 'POST', headers: {cookie, 'x-csrf-token': csrf}}));
  if (!logoutAllowed) return;
  assert.equal(logoutAllowed.status, 204);
  const logText = logs.join('\n');
  for (const sentinel of [cookie.slice('session='.length), csrf, deniedSentinel, commentSentinel, 'denied-body-secret-sentinel']) assert.equal(logText.includes(sentinel), false, `secret sentinel leaked: ${sentinel}`);
});

test('HTTP rejeita JSON inválido e corpos acima do limite com respostas genéricas', async t => {
  const server = createAppServer({security: securityModule.createSecurity()});
  try { await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); }); }
  catch (error) { if (error?.code === 'EACCES' || error?.code === 'EPERM') { t.skip(`socket blocked by environment: ${error.code}`); return; } throw error; }
  t.after(() => closeServer(server));
  const base = `http://127.0.0.1:${server.address().port}`;
  const malformed = await fetchOrSkip(t, `${base}/api/session`, {method:'POST',headers:{'content-type':'application/json'},body:'{'});
  if (!malformed) return;
  assert.equal(malformed.status,400); assert.deepEqual(await malformed.json(),{error:'invalid request'});
  const inherited = await fetchOrSkip(t, `${base}/api/session`, {method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({username:'toString',password:'x'})});
  if (!inherited) return;
  assert.equal(inherited.status,401);
  const tooLarge = await fetchOrSkip(t, `${base}/api/session`, {method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({x:'x'.repeat(20_000)})});
  if (!tooLarge) return;
  assert.equal(tooLarge.status,413); assert.deepEqual(await tooLarge.json(),{error:'invalid request'});
});

test('HTTP permite somente a origem loopback exata desta instância', async t => {
  const server = createAppServer({security: securityModule.createSecurity()});
  try { await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);}); }
  catch(error) { if(error?.code==='EACCES'||error?.code==='EPERM'){t.skip(`socket blocked by environment: ${error.code}`);return;} throw error; }
  t.after(()=>closeServer(server));
  const base=`http://127.0.0.1:${server.address().port}`;
  const allowed=await fetchOrSkip(t, `${base}/`,{headers:{origin:base}});if(!allowed)return;assert.equal(allowed.status,200);assert.equal(allowed.headers.get('access-control-allow-origin'),base);
  const denied=await fetchOrSkip(t, `${base}/`,{headers:{origin:`${base}:4173`}});if(!denied)return;assert.equal(denied.status,403);assert.equal(denied.headers.get('access-control-allow-origin'),null);
});
