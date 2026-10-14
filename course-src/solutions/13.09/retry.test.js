import { retry } from './retry.js';
import { vi, expect, it } from 'vitest';

it('retries a transient failure with bounded attempts and the injected delay', async () => {
  let calls = 0;
  const operation = vi.fn(async () => { calls += 1; if (calls === 1) throw new Error('temporary'); return 'ok'; });
  const delays = [];
  const timer = (fn, ms) => { delays.push(ms); fn(); return 1; };
  expect(await retry(operation, 2, 10, timer)).toBe('ok');
  expect(operation).toHaveBeenCalledTimes(2);
  expect(delays).toEqual([10]);
});

it('preserves the final error and never waits after the final attempt', async () => {
  const failure = new Error('final');
  const operation = vi.fn(() => Promise.reject(failure));
  const delays = [];
  await expect(retry(operation, 2, 10, (fn, ms) => { delays.push(ms); fn(); })).rejects.toBe(failure);
  expect(operation).toHaveBeenCalledTimes(2);
  expect(delays).toEqual([10]);
});

it('does not create a real delay when an injected timer is used', async () => {
  const operation = vi.fn(() => Promise.resolve(3));
  expect(await retry(operation, 1, 50, () => { throw new Error('unexpected delay'); })).toBe(3);
  expect(operation).toHaveBeenCalledTimes(1);
});
