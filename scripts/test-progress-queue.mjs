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

test('recovery merges the offline attempt with the account and saves only after explicit resume', async () => {
    const dom = new JSDOM('', {url: 'https://example.com', runScripts: 'outside-only'}), w = dom.window;
    const requests = [];
    const pendingProgress = {exerciseDrafts: {'04.01': 'offline draft'}, exerciseLearning: {'04.01': {
        schemaVersion: 1, contentVersion: 1, assessmentVersion: 1, mode: 'recall', attemptIndependent: true,
        attemptId: 'attempt-a', assisted: false, state: 'demonstrated', currentFingerprint: 'hash-a', currentUpdatedAt: '2026-10-11T12:00:00.000Z',
        verifiedEvidence: {attemptId: 'attempt-a', contentVersion: 1, assessmentVersion: 1, fingerprint: 'hash-a', source: 'browser', at: '2026-10-11T12:00:00.000Z'},
        demonstratedEvidence: {attemptId: 'attempt-a', contentVersion: 1, assessmentVersion: 1, fingerprint: 'hash-a', source: 'browser', at: '2026-10-11T12:00:00.000Z'},
        events: [{id: 'help-a', attemptId: 'attempt-a', kind: 'help', at: '2026-10-11T11:59:00.000Z', fingerprint: 'hash-a', source: 'browser', assisted: false},
            ...Array.from({length: 12}, (_, index) => ({id: `later-${index}`, attemptId: 'attempt-a', kind: 'attempted',
                at: new Date(Date.UTC(2026, 9, 11, 12, 1, index)).toISOString(), fingerprint: 'hash-a', source: 'browser'}))]
    }}};
    w.sessionStorage.setItem('devpath-pending:account-a', JSON.stringify({progress: pendingProgress, revision: 'old'}));
    w.fetch = async (_url, opts) => {
        if (!opts?.method) return {ok: true, json: async () => ({progress: {completed: ['03.01'], exerciseDrafts: {'04.02': 'account draft'},
            exerciseLearning: {'04.01': {schemaVersion: 1, contentVersion: 1, assessmentVersion: 1, mode: 'recall', attemptIndependent: true,
                attemptId: 'attempt-a', assisted: false, state: 'attempted', currentFingerprint: 'hash-a', currentUpdatedAt: '2026-10-11T11:59:00.000Z', events: []}}}, revision: 'fresh', accountKey: 'account-a'})};
        requests.push(opts);
        return {ok: true, json: async () => ({revision: 'saved'})};
    };
    w.eval(readFileSync('public/learning-progress.js', 'utf8'));
    w.eval(readFileSync('public/progress-sync.js', 'utf8'));
    let current = '{}';
    const sync = w.DevPathProgressSync.create({snapshot: () => current, status() {}, issue() {},
        merge: w.DevPathLearningProgress.mergeProgressSnapshots});
    try {
        const merged = await sync.load();
        assert.deepEqual(JSON.parse(JSON.stringify(merged.completed)), ['03.01']);
        assert.equal(merged.exerciseDrafts['04.01'], 'offline draft');
        assert.equal(merged.exerciseDrafts['04.02'], 'account draft');
        assert.equal(merged.exerciseLearning['04.01'].assisted, true);
        assert.equal(merged.exerciseLearning['04.01'].state, 'verified');
        assert.equal(merged.exerciseLearning['04.01'].events.length, 12);
        assert.equal(merged.exerciseLearning['04.01'].events.some(event => event.id === 'help-a'), false);
        assert.notEqual(sync.pending(), null);
        assert.equal(requests.length, 0);

        current = JSON.stringify(merged);
        sync.continueFromAccount();
        await settle();
        assert.equal(requests.length, 1);
        assert.equal(requests[0].headers['If-Match'], 'fresh');
        assert.equal(JSON.stringify(JSON.parse(requests[0].body)), JSON.stringify(merged));
        assert.equal(sync.pending(), null);
    } finally {dom.window.close();}
});

test('recovery requires downloading the combined-attempt backup before saving it', () => {
    const dom = new JSDOM('<main id="view"></main>', {url: 'https://example.com', runScripts: 'outside-only'}), w = dom.window;
    let resumed = 0, rendered = 0;
    w.URL.createObjectURL = () => 'blob:backup';
    w.URL.revokeObjectURL = () => {};
    w.HTMLAnchorElement.prototype.click = () => {};
    w.eval(readFileSync('public/sync-notifications.js', 'utf8'));
    const view = w.document.querySelector('#view');
    const controller = w.DevPathSyncNotifications.create({view, progressSync: {
        pending: () => JSON.stringify({progress: {exerciseLearning: {'04.01': {attemptId: 'attempt-a'}}}}),
        continueFromAccount: () => { resumed++; }
    }, render: () => { rendered++; }});
    controller.showSyncIssue('recovery', 'A tentativa foi combinada; baixe a cópia antes de salvar.');
    const [download, action] = w.document.querySelectorAll('#progress-sync-issue button');
    assert.equal(action.textContent, 'Salvar tentativa combinada');
    assert.equal(action.disabled, true);
    download.click();
    assert.equal(action.disabled, false);
    action.click();
    assert.equal(resumed, 1);
    assert.equal(rendered, 1);
    dom.window.close();
});
