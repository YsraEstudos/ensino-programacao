import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
const settle = async () => { for (let i = 0; i < 8; i++)
    await new Promise(r => setImmediate(r)); };
test('slow saves coalesce pending snapshots and use acknowledged revisions', async () => {
    const dom = new JSDOM('', { url: 'https://example.com', runScripts: 'outside-only' }), w = dom.window, requests = [], responses = [];
    let current = '{"value":1}';
    w.fetch = async (url, opts) => { if (!opts?.method)
        return { ok: true, json: async () => ({ progress: {}, revision: 'r0', accountKey: 'a' }) }; requests.push(opts); return await new Promise(r => responses.push(r)); };
    w.eval(readFileSync('public/progress-sync.js', 'utf8'));
    const sync = w.DevPathProgressSync.create({ snapshot: () => current, status() { }, issue() { } });
    await sync.load();
    sync.save(current);
    await settle();
    current = '{"value":2}';
    sync.save(current);
    current = '{"value":3}';
    sync.save(current);
    responses.shift()({ ok: true, json: async () => ({ revision: 'r1' }) });
    await settle();
    assert.equal(requests.length, 2);
    assert.equal(requests[1].body, current);
    assert.equal(requests[1].headers['If-Match'], 'r1');
    responses.shift()({ ok: true, json: async () => ({ revision: 'r2' }) });
    await settle();
    assert.equal(sync.pending(), null);
    dom.window.close();
});
