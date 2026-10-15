const form = () => document.querySelector('#inscricao');
const campo = () => document.querySelector('#nome');
const status = () => document.querySelector('#status');
const itens = () => document.querySelectorAll('#lista li').length;
const enviar = (nome, oficina = 'ceramica') => {
  campo().value = nome;
  document.querySelector('#oficina').value = oficina;
  const evento = new Event('submit', { cancelable: true, bubbles: true });
  form().dispatchEvent(evento);
  return evento;
};

describe('envio inválido', () => {
  test('impede o envio padrão quando o nome está vazio', () => {
    const evento = enviar('   ');
    /*@case 11.15.impede-o-envio-padrao-quando-8eeeef57*/expect(evento.defaultPrevented).toBe(true);
  });
  test('chama foco no nome e anuncia o erro', () => {
    const nomeEl = campo();
    let focos = 0;
    const focoOriginal = nomeEl.focus.bind(nomeEl);
    nomeEl.focus = () => { focos += 1; focoOriginal(); };
    enviar('');
    delete nomeEl.focus;
    /*@case 11.15.chama-foco-no-nome-e-anuncia-56ccc0be*/expect(focos).toBeGreaterThan(0);
    /*@case 11.15.chama-foco-no-nome-e-anuncia-e04423c1*/expect(status().textContent).toBe('Informe o nome.');
  });
  test('preserva o que foi digitado e não cria item', () => {
    const antes = itens();
    enviar('   ');
    /*@case 11.15.preserva-o-que-foi-digitado--1cf41778*/expect(campo().value).toBe('   ');
    /*@case 11.15.preserva-o-que-foi-digitado--f83ac7c1*/expect(itens()).toBe(antes);
  });
});

describe('envio válido', () => {
  test('registra o nome como texto literal', () => {
    const antes = itens();
    enviar('<b>Ana</b>');
    const li = document.querySelectorAll('#lista li')[antes];
    /*@case 11.15.registra-o-nome-como-texto-l-d6c2ae5a*/expect(li.textContent).toBe('<b>Ana</b> · ceramica');
    /*@case 11.15.registra-o-nome-como-texto-l-08e26208*/expect(li.querySelector('b')).toBe(null);
  });
  test('limpa o campo, chama foco no nome e confirma', () => {
    const nomeEl = campo();
    let focos = 0;
    const focoOriginal = nomeEl.focus.bind(nomeEl);
    nomeEl.focus = () => { focos += 1; focoOriginal(); };
    enviar('Bruno');
    delete nomeEl.focus;
    /*@case 11.15.limpa-o-campo-chama-foco-no--ec3a698a*/expect(campo().value).toBe('');
    /*@case 11.15.limpa-o-campo-chama-foco-no--284e10a1*/expect(focos).toBeGreaterThan(0);
    /*@case 11.15.limpa-o-campo-chama-foco-no--4a9c1d86*/expect(status().textContent).toBe('Inscrição de Bruno registrada.');
  });
});

describe('acessibilidade', () => {
  test('a área de status anuncia mudanças de forma não intrusiva', () => {
    /*@case 11.15.a-area-de-status-anuncia-mud-57e9dbd4*/expect(status().getAttribute('aria-live')).toBe('polite');
  });
});
