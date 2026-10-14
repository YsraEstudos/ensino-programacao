import { montarKanban, mover } from './app.js';

// Preserve the attempt's actual authored HTML. Each test resets state from the
// same submitted page instead of substituting a known-good fixture.
const attemptHtml = document.body.innerHTML;
const storage = initial => {
  let value = initial ?? null;
  return {getItem: key => key === 'kanban:v1' ? value : null, setItem: (key, next) => { if (key === 'kanban:v1') value = next; }, raw: () => value};
};
const submit = () => document.querySelector('#nova-tarefa').dispatchEvent(new Event('submit', {bubbles: true, cancelable: true}));

describe('Kanban V1 ponta a ponta', () => {
  beforeEach(() => { document.body.innerHTML = attemptHtml; });

  test('mantém o formulário, rótulo, três colunas e região de anúncio do HTML enviado', () => {
    const form = document.querySelector('#nova-tarefa');
    const input = document.querySelector('#texto');
    /*@case 11.08.mantem-o-formulario-rotulo-t-0ba34394*/expect(form?.tagName).toBe('FORM');
    /*@case 11.08.mantem-o-formulario-rotulo-t-9a88f177*/expect(document.querySelector('label[for="texto"]')).toBeTruthy();
    /*@case 11.08.mantem-o-formulario-rotulo-t-e7a6da61*/expect(input?.form).toBe(form);
    /*@case 11.08.mantem-o-formulario-rotulo-t-176fe7a2*/expect([...document.querySelectorAll('.quadro ul[data-status]')].map(list => list.dataset.status)).toEqual(['todo', 'doing', 'done']);
    /*@case 11.08.mantem-o-formulario-rotulo-t-47dbdefa*/expect(document.querySelector('#aviso[aria-live="polite"]')).toBeTruthy();
  });

  test('adiciona tarefa validada, persiste V1 e renderiza em A fazer', () => {
    const saved = storage();
    const app = montarKanban(document, saved);
    const input = document.querySelector('#texto');
    input.value = '  Revisar pauta  ';
    submit();
    /*@case 11.08.adiciona-tarefa-validada-per-9b1e539c*/expect(app.getState().tasks).toHaveLength(1);
    /*@case 11.08.adiciona-tarefa-validada-per-c1c87102*/expect(app.getState().tasks[0].text).toBe('Revisar pauta');
    /*@case 11.08.adiciona-tarefa-validada-per-06e6f272*/expect(app.getState().tasks[0].status).toBe('todo');
    /*@case 11.08.adiciona-tarefa-validada-per-0b4b1afd*/expect(document.querySelector('#todo li span').textContent).toBe('Revisar pauta');
    /*@case 11.08.adiciona-tarefa-validada-per-878f3d80*/expect(JSON.parse(saved.raw()).version).toBe(1);
    /*@case 11.08.adiciona-tarefa-validada-per-12f71a50*/expect(document.querySelector('#aviso').textContent).toContain('adicionada');
  });

  test('entrada vazia anuncia erro, mantém o foco e não grava tarefa', () => {
    const saved = storage();
    montarKanban(document, saved);
    document.querySelector('#texto').value = '   ';
    submit();
    /*@case 11.08.entrada-vazia-anuncia-erro-m-b796c328*/expect(document.activeElement).toBe(document.querySelector('#texto'));
    /*@case 11.08.entrada-vazia-anuncia-erro-m-167d7ab5*/expect(document.querySelector('#aviso').textContent).toContain('Informe');
    /*@case 11.08.entrada-vazia-anuncia-erro-m-91e3e1b4*/expect(saved.raw()).toBe(null);
    /*@case 11.08.entrada-vazia-anuncia-erro-m-fab44641*/expect(document.querySelectorAll('.quadro li')).toHaveLength(0);
  });

  test('botão acessível move tarefa, anuncia o estado e grava no storage', () => {
    const saved = storage(JSON.stringify({version: 1, tasks: [{id: 't1', text: 'Ler pauta', status: 'todo'}]}));
    const app = montarKanban(document, saved);
    const previousState = app.getState();
    const move = document.querySelector('#todo button[data-move-to=doing]');
    /*@case 11.08.botao-acessivel-move-tarefa--c90b616c*/expect(move.textContent).toBe('Mover para Em curso');
    move.dispatchEvent(new Event('click', {bubbles: true}));
    /*@case 11.08.botao-acessivel-move-tarefa--4dddd729*/expect(document.querySelector('#todo li')).toBe(null);
    /*@case 11.08.botao-acessivel-move-tarefa--21136e66*/expect(document.querySelector('#doing li span').textContent).toBe('Ler pauta');
    /*@case 11.08.botao-acessivel-move-tarefa--d7491ce7*/expect(app.getState()).not.toBe(previousState);
    /*@case 11.08.botao-acessivel-move-tarefa--b8b6c3ca*/expect(previousState.tasks[0].status).toBe('todo');
    /*@case 11.08.botao-acessivel-move-tarefa--d5758d09*/expect(app.getState().tasks[0].status).toBe('doing');
    /*@case 11.08.botao-acessivel-move-tarefa--07d1c8ff*/expect(JSON.parse(saved.raw()).tasks[0].status).toBe('doing');
    /*@case 11.08.botao-acessivel-move-tarefa--4f96a531*/expect(document.querySelector('#aviso').textContent).toContain('Em curso');
  });

  test('recria o DOM a partir do storage isolado depois de recarregar', () => {
    const saved = storage(JSON.stringify({version: 1, tasks: [{id: 't1', text: 'Ler pauta', status: 'done'}]}));
    montarKanban(document, saved);
    document.body.innerHTML = attemptHtml;
    const restored = montarKanban(document, saved);
    /*@case 11.08.recria-o-dom-a-partir-do-sto-19bcec11*/expect(restored.getState().tasks[0]).toEqual({id: 't1', text: 'Ler pauta', status: 'done'});
    /*@case 11.08.recria-o-dom-a-partir-do-sto-9a0fb20d*/expect(document.querySelector('#done li span').textContent).toBe('Ler pauta');
    /*@case 11.08.recria-o-dom-a-partir-do-sto-b3a7b047*/expect(document.querySelectorAll('.quadro li')).toHaveLength(1);
  });

  test('preserva JSON inválido e insere entrada HTML como texto literal', () => {
    const saved = storage('{');
    const app = montarKanban(document, saved);
    /*@case 11.08.preserva-json-invalido-e-ins-8dee5573*/expect(app.getState().tasks).toHaveLength(0);
    /*@case 11.08.preserva-json-invalido-e-ins-397569dd*/expect(document.querySelector('#aviso').textContent).toContain('inválidos');
    /*@case 11.08.preserva-json-invalido-e-ins-cf9fc01b*/expect(saved.raw()).toBe('{');
    const input = document.querySelector('#texto');
    input.value = '<img src=x>';
    submit();
    /*@case 11.08.preserva-json-invalido-e-ins-c22402e2*/expect(document.querySelector('#todo li span').textContent).toBe('<img src=x>');
    /*@case 11.08.preserva-json-invalido-e-ins-eb3063fb*/expect(document.querySelector('#todo img')).toBe(null);
  });

  test('rejeita status que não pertence ao quadro', () => {
    /*@case 11.08.rejeita-status-que-nao-perte-d156db70*/expect(() => mover({version: 1, tasks: []}, 't1', 'blocked')).toThrow(RangeError);
  });
});
