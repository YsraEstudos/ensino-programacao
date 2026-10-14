import { parseLinha } from './parser.js';
describe('parseLinha', () => {
  test('parseia pares e último valor vence', () => { /*@case 13.06.parseia-pares-e-ultimo-valor-143ebc36*/expect(parseLinha('a=1;b=2;a=3')).toEqual({ a: '3', b: '2' }); });
  test('decodifica escapes', () => { /*@case 13.06.decodifica-escapes-805c5f05*/expect(parseLinha('a=x\\;y;b=c\\\\d')).toEqual({ a: 'x;y', b: 'c\\d' }); });
  test('entrada vazia e erro de gramática', () => { /*@case 13.06.entrada-vazia-e-erro-de-gram-b006ec38*/expect(parseLinha('')).toEqual({}); /*@case 13.06.entrada-vazia-e-erro-de-gram-7555978e*/expect(() => parseLinha('sem-igual')).toThrow(SyntaxError); /*@case 13.06.entrada-vazia-e-erro-de-gram-b67ab812*/expect(() => parseLinha('a=x\\')).toThrow(SyntaxError); });
  test('mantém valores como string', () => { /*@case 13.06.mantem-valores-como-string-5d189c68*/expect(typeof parseLinha('n=2').n).toBe('string'); });
});
