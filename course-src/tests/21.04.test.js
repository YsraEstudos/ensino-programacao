import {memoizeLRU} from './memo.js';

test('hit refreshes recency before the least recent key is evicted', () => {
  let calls = 0;
  const memoized = memoizeLRU(key => { calls += 1; return key; }, 2);
  memoized('A');
  memoized('B');
  memoized('A');
  memoized('C');
  /*@case 21.04.lru-refresh-eviction*/ expect(memoized('B')).toBe('B');
  /*@case 21.04.lru-refresh-eviction*/ expect(calls).toBe(4);
});

test('omitted capacity uses the default of two', () => {
  let calls = 0;
  const memoized = memoizeLRU(key => { calls += 1; return key; });
  memoized('A');
  memoized('B');
  memoized('A');
  memoized('C');
  memoized('B');
  /*@case 21.04.default-capacity*/ expect(calls).toBe(4);
});

test('falsy values are cached while zero capacity recalculates every time', () => {
  let calls = 0;
  const falsy = memoizeLRU(() => { calls += 1; return 0; }, 1);
  /*@case 21.04.falsy-and-zero-capacity*/ expect(falsy('zero')).toBe(0);
  /*@case 21.04.falsy-and-zero-capacity*/ expect(falsy('zero')).toBe(0);
  /*@case 21.04.falsy-and-zero-capacity*/ expect(calls).toBe(1);

  const uncached = memoizeLRU(() => { calls += 1; return false; }, 0);
  /*@case 21.04.falsy-and-zero-capacity*/ expect(uncached('x')).toBe(false);
  /*@case 21.04.falsy-and-zero-capacity*/ expect(uncached('x')).toBe(false);
  /*@case 21.04.falsy-and-zero-capacity*/ expect(calls).toBe(3);
});

test('a thrown calculation propagates and the same key can be retried', () => {
  let calls = 0;
  const failure = new Error('falha ao calcular X');
  const memoized = memoizeLRU(() => {
    calls += 1;
    if (calls === 1) throw failure;
    return false;
  });
  let observed;
  try { memoized('X'); } catch (error) { observed = error; }
  /*@case 21.04.throw-propagates-and-retries*/ expect(observed).toBe(failure);
  /*@case 21.04.throw-propagates-and-retries*/ expect(memoized('X')).toBe(false);
  /*@case 21.04.throw-propagates-and-retries*/ expect(memoized('X')).toBe(false);
  /*@case 21.04.throw-propagates-and-retries*/ expect(calls).toBe(2);
});

test('capacity three preserves adversarial object keys without collisions', () => {
  let calls = 0;
  const memoized = memoizeLRU(value => { calls += 1; return value.label; }, 3);
  const first = {tenant: 'a|b', locale: 'c', label: 'first'};
  const second = {tenant: 'a', locale: 'b|c', label: 'second'};
  const third = {tenant: 'other', locale: 'en', label: 'third'};
  const fourth = {tenant: 'last', locale: 'pt', label: 'fourth'};
  /*@case 21.04.composite-keys-capacity-three*/ expect(memoized(first)).toBe('first');
  /*@case 21.04.composite-keys-capacity-three*/ expect(memoized(second)).toBe('second');
  /*@case 21.04.composite-keys-capacity-three*/ expect(memoized(third)).toBe('third');
  /*@case 21.04.composite-keys-capacity-three*/ expect(memoized(first)).toBe('first');
  memoized(fourth);
  /*@case 21.04.composite-keys-capacity-three*/ expect(memoized(third)).toBe('third');
  /*@case 21.04.composite-keys-capacity-three*/ expect(memoized(second)).toBe('second');
  /*@case 21.04.composite-keys-capacity-three*/ expect(calls).toBe(5);
});
