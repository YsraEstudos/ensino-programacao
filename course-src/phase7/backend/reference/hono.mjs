import {Hono} from 'hono';
export function createHono(app, readBody) {
  const router = new Hono();
  const dispatch = async c => {
    const body = await readBody(c.req.raw);
    const result = await app.handle({method: c.req.method, path: c.req.path, headers: Object.fromEntries(c.req.raw.headers), ...body});
    return new Response(JSON.stringify(result.body), {status: result.status, headers: result.headers});
  };
  // Same domain service/contract, separate framework routing and Request/Response adapter.
  router.post('/sessions', dispatch);
  router.delete('/sessions/current', dispatch);
  router.get('/projects', dispatch);
  router.post('/projects', dispatch);
  router.get('/projects/:id', dispatch);
  router.post('/projects/:id/tasks', dispatch);
  router.all('*', dispatch); // shared RFC9457 404/405 and authorization policy
  return router;
}
