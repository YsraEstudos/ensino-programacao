(function (global) {
  "use strict";

  const day = 24 * 60 * 60 * 1000;
  const intervals = Object.freeze([7, 14, 30, 60]);

  function initial(now = Date.now()) {
    return { intervalIndex: 0, dueAt: now + intervals[0] * day };
  }

  function next(previous, correct, now = Date.now()) {
    const stored = Number(previous?.intervalIndex);
    const priorIndex = Number.isFinite(stored) ? Math.trunc(stored) : 0;
    const intervalIndex = correct ? Math.max(0, Math.min(priorIndex + 1, intervals.length - 1)) : -1;
    return {
      ...previous,
      intervalIndex,
      dueAt: now + (correct ? intervals[intervalIndex] : 1) * day,
      lastReviewedAt: new Date(now).toISOString()
    };
  }

  global.DevPathReviewSchedule = Object.freeze({ initial, next });
})(globalThis);
