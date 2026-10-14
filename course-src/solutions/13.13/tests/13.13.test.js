import { montarWidget } from '../app.js';
const submit = () => document.querySelector('#f').dispatchEvent(new Event('submit', {bubbles: true, cancelable: true}));

describe('suíte DOM do widget', () => {
  beforeEach(() => {
    document.body.innerHTML = '<form id="f"><label for="text">Texto</label><input id="text"><button id="add" type="submit">Adicionar</button><ul id="list"></ul><p id="error" aria-live="polite"></p></form>';
  });
  test('submit inválido foca o campo e anuncia o erro', () => {
    montarWidget(document);
    const input = document.querySelector('#text');
    input.value = '';
    submit();
    expect(document.activeElement).toBe(input);
    expect(document.querySelector('#error').textContent).toContain('obrigatório');
  });
  test('texto do usuário permanece literal e o resultado é anunciado', () => {
    montarWidget(document);
    const input = document.querySelector('#text');
    input.value = '<img src=x>';
    submit();
    const item = document.querySelector('#list li');
    expect(item.firstChild.textContent).toBe('<img src=x>');
    expect(item.querySelector('img')).toBe(null);
  });
  test('delegação remove o item quando o clique começa em um descendente', () => {
    montarWidget(document);
    const input = document.querySelector('#text');
    input.value = 'a';
    submit();
    const button = document.querySelector('#list li button');
    const span = document.createElement('span');
    button.append(span);
    span.dispatchEvent(new Event('click', {bubbles: true}));
    expect(document.querySelector('#list li')).toBe(null);
  });
  test('mantém a associação de rótulo e o botão nativo de submit', () => {
    montarWidget(document);
    expect(document.querySelector('label[for=text]')).toBeTruthy();
    expect(document.querySelector('#add[type=submit]')).toBeTruthy();
  });
});
