import { clamp } from '../clamp.js';

describe('clamp regression', () => {
  test('lower bound is inclusive', () => { expect(clamp(-5, 0, 10)).toBe(0); });
  test('upper bound is inclusive and interior stays unchanged', () => {
    expect(clamp(15, 0, 10)).toBe(10);
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(0, 0, 10)).toBe(0);
    expect(clamp(10, 0, 10)).toBe(10);
  });
  test('rejects an inverted interval', () => { expect(() => clamp(1, 10, 0)).toThrow(RangeError); });
});
