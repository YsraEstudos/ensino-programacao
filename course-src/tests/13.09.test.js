import { retry } from './retry.js';
import { vi, expect, it } from 'vitest';

it('retries transient failure with bounded attempts', async () => {
  let calls = 0;
  const operation = vi.fn(async () => { calls += 1; if (calls === 1) throw new Error('temporary'); return 'ok'; });
  const delays = []; const timer = (fn, ms) => { delays.push(ms); fn(); return 1; };
  /*@case 13.09.retries-transient-failure-wi-55e5ba48*/expect(await retry(operation, 2, 10, timer)).toBe('ok'); /*@case 13.09.retries-transient-failure-wi-5559b4ed*/expect(operation).toHaveBeenCalledTimes(2); /*@case 13.09.retries-transient-failure-wi-552f1492*/expect(delays).toEqual([10]);
});
it('preserves final error and does not delay after last attempt', async () => {
  const failure = new Error('final'); const operation = vi.fn(() => Promise.reject(failure)); const delays = [];
  await /*@case 13.09.preserves-final-error-and-do-91c15e06*/expect(retry(operation, 2, 10, (fn, ms) => { delays.push(ms); fn(); })).rejects.toBe(failure);
  /*@case 13.09.preserves-final-error-and-do-cad8038e*/expect(operation).toHaveBeenCalledTimes(2); /*@case 13.09.preserves-final-error-and-do-21ebd862*/expect(delays).toEqual([10]);
});
it('accepts injected timer without leaking real time', async () => { const operation = vi.fn(() => Promise.resolve(3)); /*@case 13.09.accepts-injected-timer-witho-626bb13c*/expect(await retry(operation, 1, 50, () => {})).toBe(3); });
