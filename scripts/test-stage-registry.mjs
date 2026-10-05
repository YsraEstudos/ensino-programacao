import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const load = () => { const w = {}; w.window = w; vm.runInNewContext(readFileSync('public/stage-registry.js', 'utf8'), w); return w.DevPathStageRegistry; };
test('registry routes supported stages and uses the generic renderer for new stages', () => {
    const api = load(), fallback = { render: () => 'generic' };
    const entries = ['D', '00', '01', '02', '03'].map(stage => [stage, { render: item => item.stage }]);
    const registry = api.create(entries, fallback);
    for (const [stage] of entries)
        assert.equal(registry.resolve({ stage }).render({ stage }), stage);
    assert.equal(registry.resolve({ stage: '04' }), fallback);
    assert.throws(() => api.create([['01', {}]], fallback), /render/);
    assert.throws(() => api.create([['01', fallback], ['01', fallback]], fallback), /duplicate/i);
});
test('handlers receive the same context and a consumed click does not reach fallback', () => {
    const api = load(), calls = [], ctx = { progress: {} }, item = { stage: '02' };
    const registry = api.create([['02', { render: () => '', handleClick: (e, i, c) => { calls.push([e, i, c]); return true; } }]], { render: () => '' });
    const event = { type: 'click' };
    assert.equal(registry.resolve(item).handleClick(event, item, ctx), true);
    assert.deepEqual(calls, [[event, item, ctx]]);
});
