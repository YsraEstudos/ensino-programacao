import {totalPedido} from './main.js';

test('renomeação preserva a API pública e o comportamento do pedido', () => {
  /*@case 04.10.renomeacao-preserva-a-api-pu-bc46d0de*/expect(totalPedido(10, 2, 3)).toBe(17);
  /*@case 04.10.renomeacao-preserva-a-api-pu-d8008f2e*/expect(totalPedido(0, 4, 0)).toBe(0);
  /*@case 04.10.renomeacao-preserva-a-api-pu-003baa8c*/expect(totalPedido(4, 3, 20)).toBe(0);
  /*@case 04.10.renomeacao-preserva-a-api-pu-f981567a*/expect(totalPedido(4, 3, 0)).toBe(12);
});
