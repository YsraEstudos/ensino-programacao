(function (global) {
    'use strict';
    const KEY = 'devpath-study-time-v1';
    const validId = id => typeof id === 'string' && /^(?:D|\d{2})\.\d{2}$/.test(id);
    function cleanSaved(saved) {
        const result = {version: 1, consent: false, activities: {}};
        if (saved?.version !== 1 || saved.consent !== true) return result;
        result.consent = true;
        for (const [key, value] of Object.entries(saved.activities || {}).slice(0, 500)) {
            if (validId(key) && Number.isFinite(value?.milliseconds) && value.milliseconds >= 0 && value.milliseconds <= Number.MAX_SAFE_INTEGER)
                result.activities[key] = {milliseconds: Math.floor(value.milliseconds)};
        }
        return result;
    }
    function create({storage, now = () => global.performance.now()} = {}) {
        let state = {version: 1, consent: false, activities: {}}, id = null;
        let visible = false, focused = false, started = null;
        let hadConsentRecord = false;
        const pending = new Map();
        function readSaved() {
            try {return {available: true, value: cleanSaved(JSON.parse(storage?.getItem(KEY) || 'null'))};}
            catch {return {available: false};}
        }
        try {
            const saved = readSaved();
            if (saved.available) state = saved.value;
            hadConsentRecord = state.consent;
        } catch { /* A local counter never blocks the activity. */ }
        const active = () => state.consent && validId(id) && visible && focused;
        function close() {
            if (started === null) return;
            const elapsed = Math.max(0, Math.floor(now() - started));
            started = null;
            if (!Number.isFinite(elapsed) || !elapsed) return;
            const previous = state.activities[id]?.milliseconds || 0;
            state.activities[id] = {milliseconds: Math.min(Number.MAX_SAFE_INTEGER, previous + elapsed)};
            pending.set(id, Math.min(Number.MAX_SAFE_INTEGER, (pending.get(id) || 0) + elapsed));
        }
        const start = () => { if (active()) started = now(); };
        function persist(forceConsent = false) {
            if (!storage) return false;
            try {
                if (state.consent) {
                    const latest = readSaved();
                    if (!latest.available) return false;
                    if (hadConsentRecord && !forceConsent && !latest.value.consent) {
                        state = {version: 1, consent: false, activities: {}};
                        pending.clear(); started = null; hadConsentRecord = false;
                        return true;
                    }
                    // Add this page's uncommitted intervals to the latest browser totals.
                    const activities = latest.value.consent ? latest.value.activities : {};
                    for (const [key, elapsed] of pending) activities[key] = {milliseconds: Math.min(Number.MAX_SAFE_INTEGER, (activities[key]?.milliseconds || 0) + elapsed)};
                    state.activities = activities;
                    storage.setItem(KEY, JSON.stringify(state));
                    pending.clear(); hadConsentRecord = true;
                } else {storage.removeItem(KEY); hadConsentRecord = false;}
                return true;
            } catch {
                if (!state.consent) {
                    try { storage.setItem(KEY, JSON.stringify(state)); return true; }
                    catch { /* Stopped in memory even if storage is unavailable. */ }
                }
                return false;
            }
        }
        function flush() { close(); const stored = state.consent ? persist() : true; start(); return stored; }
        function activity(value) { close(); id = validId(value) ? value : null; const stored = state.consent ? persist() : true; start(); return stored; }
        function presence(value = {}) {
            close(); visible = value.visible === true; focused = value.focused === true;
            const stored = state.consent ? persist() : true; start(); return stored;
        }
        function consent(enabled) {
            close(); state.consent = enabled === true;
            if (!state.consent) {state.activities = {}; pending.clear();}
            const stored = persist(state.consent); start(); return stored;
        }
        function snapshot() {
            const result = JSON.parse(JSON.stringify(state));
            if (started !== null) {
                const elapsed = Math.max(0, Math.floor(now() - started));
                if (Number.isFinite(elapsed)) result.activities[id] = {milliseconds: Math.min(Number.MAX_SAFE_INTEGER, (result.activities[id]?.milliseconds || 0) + elapsed)};
            }
            return result;
        }
        return {activity, presence, consent, flush, snapshot};
    }
    global.DevPathStudyTime = {create, storageKey: KEY};
})(globalThis);
