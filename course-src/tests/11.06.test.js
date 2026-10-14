import { montarDelegacao } from './app.js';

describe('delegação real no DOM', () => {
  beforeEach(() => { document.body.innerHTML = '<ul id="lista"><li><button type="button" data-id="7"><span>Remover</span></button></li><li><span id="plain">Sem ação</span></li></ul><button id="fora" type="button" data-id="99">Fora</button>'; });
  test('remove botão e span descendente usando o ancestral mais próximo', () => {
    const list = document.querySelector('#lista');
    const calls = [];
    montarDelegacao(list, id => calls.push(id));
    list.querySelector('span').dispatchEvent(new Event('click', {bubbles: true, cancelable: true}));
    /*@case 11.06.remove-botao-e-span-descende-65323520*/expect(calls).toEqual(['7']);
  });
  test('aceita um botão adicionado depois da montagem', () => {
    const list = document.querySelector('#lista');
    const calls = [];
    montarDelegacao(list, id => calls.push(id));
    const button = document.createElement('button');
    button.type = 'button'; button.dataset.id = '9';
    const child = document.createElement('span'); child.textContent = 'Remover'; button.append(child);
    list.append(button);
    child.dispatchEvent(new Event('click', {bubbles: true}));
    /*@case 11.06.aceita-um-botao-adicionado-d-97083d2b*/expect(calls).toEqual(['9']);
  });
  test('ignora alvo sem botão com id e botão fora da lista', () => {
    const list = document.querySelector('#lista');
    const calls = [];
    montarDelegacao(list, id => calls.push(id));
    document.querySelector('#fora').dispatchEvent(new Event('click', {bubbles: true}));
    document.querySelector('#plain').dispatchEvent(new Event('click', {bubbles: true}));
    /*@case 11.06.ignora-alvo-sem-botao-com-id-03265b22*/expect(calls).toEqual([]);
  });
});

