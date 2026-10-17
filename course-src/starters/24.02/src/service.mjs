import {openStore} from './store.mjs';
export function createApplication({dbPath, users, clock = Date.now, log = () => {}}) {
  const store = openStore(dbPath, users);
  // TODO: implement route matching, schema, identity/session, authorization,
  // project/task queries, error conversion and metadata-only logging. See contract.md.
  return {store, close: () => store.close(), async handle(request) {
    void clock; void log; void request;
    return {status: 501, body: {type: 'about:blank', title: 'Implement this contract', status: 501, instance: '/'}, headers: {'content-type': 'application/problem+json'}};
  }};
}
