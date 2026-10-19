import { migrarV2ParaV3, carregar } from './migration.js';

function storageOf(value) {
  const reads = [];
  const storage = {
    getItem(key) { reads.push(key); return JSON.stringify(value); },
    setItem() { throw new Error('A leitura não deve sobrescrever o save.'); },
  };
  return {storage, reads};
}

describe('migração V1 V2 V3', () => {
  test('V1 percorre ambas as versões pelo contrato de storage', () => {
    const {storage, reads} = storageOf({version: 1, tasks: [{id: 't1', text: 'x', status: 'todo'}]});
    const value = carregar(storage);
    /*@case 13.14.v1-percorre-ambas-as-versoes-56d26972*/expect(reads).toEqual(['kanban:v1']);
    /*@case 13.14.v1-percorre-ambas-as-versoes-c38d8c66*/expect(value).toEqual({version: 3, tasks: [{id: 't1', text: 'x', status: 'todo', priority: 'normal', tags: []}]});
  });
  test('V2 preserva priority e V3 é idempotente pelo contrato de storage', () => {
    const v2 = {version: 2, tasks: [{id: 't1', text: 'x', status: 'done', priority: 'high'}]};
    const v3 = migrarV2ParaV3(v2);
    /*@case 13.14.v2-preserva-priority-e-v3-e--684908ec*/expect(v3.tasks[0].priority).toBe('high');
    const {storage, reads} = storageOf(v3);
    /*@case 13.14.v2-preserva-priority-e-v3-e--6215e5de*/expect(carregar(storage)).toEqual(v3);
    /*@case 13.14.v2-preserva-priority-e-v3-e--61103f68*/expect(reads).toEqual(['kanban:v1']);
  });
  test('tags inválidas e registro parcial recuperam itens válidos', () => {
    const warnings = [];
    const value = migrarV2ParaV3({version: 2, tasks: [{id: 'ok', text: 'x', status: 'todo', tags: ['a']}, {id: 'bad'}, {id: 'tag', text: 'y', status: 'todo', tags: ['']}]}, warnings);
    /*@case 13.14.tags-invalidas-e-registro-pa-259bafbb*/expect(value.tasks).toHaveLength(2);
    /*@case 13.14.tags-invalidas-e-registro-pa-4b714436*/expect(value.tasks[1].tags).toEqual([]);
    /*@case 13.14.tags-invalidas-e-registro-pa-c49bfe64*/expect(warnings).toContain('tags inválidas');
  });
  test('V3 com tags inválidas normaliza e avisa mesmo sem mudar a contagem', () => {
    const warnings = [];
    const {storage, reads} = storageOf({version: 3, tasks: [{id: 't1', text: 'x', status: 'todo', tags: ['']}]});
    const value = carregar(storage, warnings);
    /*@case 13.14.v3-com-tags-invalidas-normal-5d647b98*/expect(value.tasks[0].tags).toEqual([]);
    /*@case 13.14.v3-com-tags-invalidas-normal-a4a8ed02*/expect(warnings).toContain('tags inválidas');
    /*@case 13.14.v3-com-tags-invalidas-normal-f3d8fa55*/expect(reads).toEqual(['kanban:v1']);
  });
  test('JSON inválido não escreve de volta', () => {
    let writes = 0;
    const value = carregar({getItem: () => '{', setItem: () => { writes++; }});
    /*@case 13.14.json-invalido-nao-escreve-de-edcd8fc8*/expect(value.tasks).toHaveLength(0);
    /*@case 13.14.json-invalido-nao-escreve-de-b901a9bc*/expect(writes).toBe(0);
  });
});
