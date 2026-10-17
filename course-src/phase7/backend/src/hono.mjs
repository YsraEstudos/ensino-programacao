import {Hono} from 'hono';
export function createHono(app, readBody) {
  const router = new Hono();
  // TODO: port the same sessions/projects/tasks routes; preserve error/body contract.
  // readBody(Request) enforces the shared byte limit before JSON parsing.
  void app; void readBody;
  router.all('*', c => c.json({type: 'about:blank', title: 'Port required', status: 501, instance: c.req.path}, 501));
  return router;
}
