import {describe, expect, it} from 'vitest';
import {soma} from '../src/soma.js';

describe('soma', () => {
  it('retorna a soma', () => expect(soma(2, 3)).toBe(5));
});
