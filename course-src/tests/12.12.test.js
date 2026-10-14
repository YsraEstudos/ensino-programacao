import {isFresh, parseIsoDate} from './dates.js';
describe('TTL em epoch', () => {
  test('59s é fresh e 60s é stale', () => { const saved = Date.parse('2026-01-01T00:00:00.000Z'); /*@case 12.12.59s-e-fresh-e-60s-e-stale-ce624122*/expect(isFresh(saved, saved + 59000, 60000)).toBe(true); /*@case 12.12.59s-e-fresh-e-60s-e-stale-7e082e36*/expect(isFresh(saved, saved + 60000, 60000)).toBe(false); });
  test('ISO inválido é stale e TTL negativo rejeita', () => { /*@case 12.12.iso-invalido-e-stale-e-ttl-n-789cbc87*/expect(isFresh(NaN, 0, 60)).toBe(false); /*@case 12.12.iso-invalido-e-stale-e-ttl-n-7003bf73*/expect(() => isFresh(0, 0, -1)).toThrow(RangeError); });
  test('instante ISO não depende do fuso de exibição', () => { /*@case 12.12.instante-iso-nao-depende-do--f6dd8f2b*/expect(parseIsoDate('2026-01-01T00:00:00.000Z')).toBe(1767225600000); });
});
