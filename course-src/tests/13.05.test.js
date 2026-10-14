import { manterDefinidos } from './filtro.js';
describe('manterDefinidos', () => {
  test('remove somente undefined preservando falsy e ordem', () => { /*@case 13.05.remove-somente-undefined-pre-9fd1aa28*/expect(manterDefinidos([0, false, null, '', undefined, 'ok'])).toEqual([0, false, null, '', 'ok']); });
  test('não muta entrada', () => { const input = [0, undefined, 2]; manterDefinidos(input); /*@case 13.05.nao-muta-entrada-e8a5d98a*/expect(input).toEqual([0, undefined, 2]); });
  test('vazio permanece vazio', () => { /*@case 13.05.vazio-permanece-vazio-bc1cc762*/expect(manterDefinidos([])).toEqual([]); });
});
