(function (global) {
    'use strict';
    function create(entries, fallback, itemEntries = []) {
        if (typeof fallback?.render !== 'function')
            throw new TypeError('Fallback requires render');
        const stages = new Map();
        const items = new Map();
        for (const [stage, adapter] of entries) {
            if (stages.has(stage))
                throw new TypeError(`Duplicate stage ${stage}`);
            if (typeof adapter?.render !== 'function')
                throw new TypeError(`Stage ${stage} requires render`);
            stages.set(stage, Object.freeze(adapter));
        }
        for (const [id, adapter] of itemEntries) {
            if (typeof id !== 'string' || !id.trim())
                throw new TypeError('Item adapter requires an ID');
            if (items.has(id))
                throw new TypeError(`Duplicate item ${id}`);
            if (typeof adapter?.render !== 'function')
                throw new TypeError(`Item ${id} requires render`);
            items.set(id, Object.freeze(adapter));
        }
        return Object.freeze({ resolve: item => items.get(item?.id) ?? stages.get(item?.stage) ?? fallback });
    }
    global.DevPathStageRegistry = Object.freeze({ create });
})(window);
