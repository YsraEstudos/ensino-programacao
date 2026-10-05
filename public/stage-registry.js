(function (global) {
    'use strict';
    function create(entries, fallback) {
        if (typeof fallback?.render !== 'function')
            throw new TypeError('Fallback requires render');
        const stages = new Map();
        for (const [stage, adapter] of entries) {
            if (stages.has(stage))
                throw new TypeError(`Duplicate stage ${stage}`);
            if (typeof adapter?.render !== 'function')
                throw new TypeError(`Stage ${stage} requires render`);
            stages.set(stage, Object.freeze(adapter));
        }
        return Object.freeze({ resolve: item => stages.get(item?.stage) ?? fallback });
    }
    global.DevPathStageRegistry = Object.freeze({ create });
})(window);
