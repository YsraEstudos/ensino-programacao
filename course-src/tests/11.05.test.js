import {mount, render, destroy, getAcoes} from './app.js';
const click = node => node.dispatchEvent(new Event('click', {bubbles: true}));

describe('ciclo de render e cleanup', () => {
  beforeEach(() => { destroy(); mount(); });
  afterEach(() => destroy());

  test('rerender não duplica ação e item novo funciona', () => {
    render(['a']); render(['b']); click(document.querySelector('button'));
    /*@case 11.05.rerender-nao-duplica-acao-e--7d95853f*/expect(getAcoes()).toBe(1);
  });
  test('destroy remove listener', () => {
    render(['a']); const button = document.querySelector('button');
    destroy(); click(button);
    /*@case 11.05.destroy-remove-listener-8ea9a42b*/expect(getAcoes()).toBe(0);
  });
  test('render substitui descendentes', () => {
    render(['a']); render(['b', 'c']);
    /*@case 11.05.render-substitui-descendente-bca30d9a*/expect([...document.querySelectorAll('button')].map(x => x.textContent)).toEqual(['b', 'c']);
  });
});
