import { migrarV1ParaV2, carregar } from './migration.js';

const v1 = { version: 1, tasks: [{ id: 't1', text: 'Ler pauta', status: 'todo' }] };

describe('migração de storage', () => {
  test('V1 ganha prioridade normal', () => {
    /*@case 11.13.v1-ganha-prioridade-normal-f3727e3e*/expect(migrarV1ParaV2(v1)).toEqual({ version: 2, tasks: [{ id: 't1', text: 'Ler pauta', status: 'todo', priority: 'normal' }] });
  });
  test('V2 é idempotente e preserva prioridade', () => {
    const value = { version: 2, tasks: [{ id: 't1', text: 'x', status: 'done', priority: 'high' }] };
    /*@case 11.13.v2-e-idempotente-e-preserva--2627a6e3*/expect(carregar(value)).toEqual(value);
  });
  test('registro parcial não descarta os demais', () => {
    const warnings = []; const value = carregar({ version: 1, tasks: [{ id: 'ok', text: 'x', status: 'todo' }, { id: 'bad' }] }, warnings);
    /*@case 11.13.registro-parcial-nao-descart-df75f4d0*/expect(value.tasks).toHaveLength(1); /*@case 11.13.registro-parcial-nao-descart-ca7eccea*/expect(value.tasks[0].id).toBe('ok'); /*@case 11.13.registro-parcial-nao-descart-14b31814*/expect(warnings.length).toBe(1);
  });
  test('JSON inválido retorna vazio sem storage write', () => {
    let writes = 0; const storage = { getItem: () => '{', setItem: () => { writes++; } };
    const value = carregar(storage);
    /*@case 11.13.json-invalido-retorna-vazio--f167b151*/expect(value.tasks).toHaveLength(0); /*@case 11.13.json-invalido-retorna-vazio--5393e1d6*/expect(writes).toBe(0);
  });
});
