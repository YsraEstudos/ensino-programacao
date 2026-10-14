import { lerInscricao } from './form.js';

function fill({nome = ' Ana ', quantidade = '2', interesses = ['JS', 'TS']} = {}) {
  const form = document.querySelector('#inscricao');
  form.elements.namedItem('nome').value = nome;
  form.elements.namedItem('quantidade').value = quantidade;
  for (const checkbox of form.querySelectorAll('[name=interesse]')) checkbox.checked = interesses.includes(checkbox.value);
  return form;
}

describe('lerInscricao com formulário e FormData nativos', () => {
  test('lê campo simples e valores repetidos dos checkboxes', () => {
    const form = fill();
    /*@case 11.04.le-campo-simples-e-valores-r-0b7e57f0*/expect(lerInscricao(form)).toEqual({ok: true, nome: 'Ana', quantidade: 2, interesses: ['JS', 'TS']});
  });
  test('ausência de opções selecionadas mantém array vazio', () => {
    /*@case 11.04.ausencia-de-opcoes-seleciona-d6030db4*/expect(lerInscricao(fill({interesses: []})).interesses).toEqual([]);
  });
  test('quantidade inválida mantém o valor cru no resultado e no form', () => {
    const form = fill({quantidade: '2x'});
    const result = lerInscricao(form);
    /*@case 11.04.quantidade-invalida-mantem-o-6190c064*/expect(result.ok).toBe(false);
    /*@case 11.04.quantidade-invalida-mantem-o-7e7a7b3c*/expect(result.erros.quantidade).toBeTruthy();
    /*@case 11.04.quantidade-invalida-mantem-o-6c7afc49*/expect(result.valores.quantidade).toBe('2x');
    /*@case 11.04.quantidade-invalida-mantem-o-a57d94f2*/expect(form.elements.namedItem('quantidade').value).toBe('2x');
  });
  test('FormData nativo devolve strings e não converte quantidade', () => {
    const data = new FormData(fill());
    /*@case 11.04.formdata-nativo-devolve-stri-8e07e6da*/expect(typeof data.get('quantidade')).toBe('string');
    /*@case 11.04.formdata-nativo-devolve-stri-3e607834*/expect(data.getAll('interesse')).toEqual(['JS', 'TS']);
  });
});
