(function (global) {
  'use strict';
  // Learning events are stamped when they reach the front of the queue, not when the learner acted. Each stamp is
  // strictly later than the previous one in this session (even if the clock goes backwards) and strictly later than
  // the record it lands on (even if that record was written by another device with a fast clock). The reducer therefore
  // never discards a fresh event as stale. A failed task is reported once and never blocks the events queued behind it.
  function create({now = () => new Date().toISOString(), onError = () => {}} = {}) {
    let tail = Promise.resolve();
    let lastMs = null;
    const stampAfter = floor => {
      let candidate = Date.parse(now());
      if (!Number.isFinite(candidate)) candidate = Date.now();
      if (lastMs !== null) candidate = Math.max(candidate, lastMs + 1);
      const floorMs = typeof floor === 'string' ? Date.parse(floor) : NaN;
      if (Number.isFinite(floorMs)) candidate = Math.max(candidate, floorMs + 1);
      lastMs = candidate;
      return new Date(candidate).toISOString();
    };
    return Object.freeze({
      // The task receives stamp(floor): call it inside the task, after reading the record, passing record.currentUpdatedAt.
      run(task) {
        const queued = tail.then(() => task({stamp: stampAfter}));
        tail = queued.catch(() => null);
        return queued.catch(error => {
          onError(error);
          return null;
        });
      }
    });
  }
  global.DevPathLearningEventQueue = Object.freeze({create});
})(window);
