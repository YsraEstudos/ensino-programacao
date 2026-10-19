import {analises} from './main.js';

test('ordens de crescimento são associadas aos trechos na ordem publicada', () => {
  /*@case 08.01.ordens-de-crescimento-sao-as-c0cd2fe0*/expect(analises.map(item => item.crescimento)).toEqual(['O(1)', 'O(n)', 'O(n²)', 'O(log n)', 'O(n log n)', 'O(log n)', 'O(1) médio', 'O(n)']);
});
