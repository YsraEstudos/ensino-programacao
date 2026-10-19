import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {guidedPreparation, distinctFirstAction} from '../course-src/guided-preparation.mjs';

const published = JSON.parse(readFileSync(new URL('../public/course-catalog.json', import.meta.url), 'utf8'));

function activity({kind, title, prompt, objective, trap, given}) {
  return {
    id: '04.99', stage: '04', kind, title, prompt, objective,
    firstResponse: {action: objective, timing: 'Antes de executar.'},
    explanation: {
      mental_model: 'Uma regra de exemplo explica o comportamento.',
      worked_example: 'Observe uma entrada e compare a saída.',
      common_trap: trap,
      why_it_matters: 'Verificar o caso evita regressões.',
    },
    examples: [{given, expected: 'resultado esperado'}],
    constraints: [], resources: [],
  };
}

test('a primeira dica aponta um risco da tarefa sem repetir o enunciado', () => {
  const predicting = activity({kind: 'PREDICT', title: 'Retorno de funções',
    objective: 'Preveja a saída de cada chamada.', prompt: 'Preveja o retorno de dobro(2) e explique cada valor.',
    trap: 'Expressão solta em uma função com chaves não vira retorno.', given: 'dobro(2)'});
  const implementing = activity({kind: 'MAKE', title: 'Cache limitado',
    objective: 'Implemente a política de descarte.', prompt: 'Implemente um cache limitado a dois itens.',
    trap: 'Atualizar um item existente não deve descartá-lo.', given: 'cache com dois itens'});
  for (const item of [predicting, implementing]) {
    const hint = guidedPreparation(item).hints[0];
    assert.match(hint, new RegExp(item.explanation.common_trap.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    assert.ok(!hint.includes(item.prompt));
    assert.ok(!hint.includes(item.objective));
    assert.ok(!/Releia o enunciado/i.test(hint));
  }
});

test('a primeira resposta é uma pergunta própria e específica para previsão e implementação', () => {
  const predicting = activity({kind: 'PREDICT', title: 'Retorno de funções',
    objective: 'Preveja a saída de cada chamada.', prompt: 'Preveja o retorno de dobro(2).',
    trap: 'Expressão solta em uma função com chaves não vira retorno.', given: 'dobro(2)'});
  const implementing = activity({kind: 'MAKE', title: 'Cache limitado',
    objective: 'Implemente a política de descarte.', prompt: 'Implemente um cache limitado a dois itens.',
    trap: 'Atualizar um item existente não deve descartá-lo.', given: 'cache com dois itens'});
  for (const item of [predicting, implementing]) {
    const question = distinctFirstAction(item);
    assert.match(question, /\?$/);
    assert.ok(question.includes(item.title));
    assert.notEqual(question, item.objective);
    assert.notEqual(question, item.prompt);
  }
  assert.notEqual(distinctFirstAction(predicting), distinctFirstAction(implementing));
});

test('a geração de perguntas preserva a primeira resposta dos renderizadores D–03', () => {
  const stage03 = activity({kind: 'PREDICT', title: 'Faixas de nota',
    objective: 'Classifique as notas.', prompt: 'Preveja a faixa de 40.',
    trap: 'Confundir os limites pode deslocar a faixa.', given: 'nota 40'});
  stage03.stage = '03';
  stage03.firstResponse.action = 'Registre a faixa prevista para 40.';
  assert.equal(distinctFirstAction(stage03), 'Registre a faixa prevista para 40.');
  assert.match(guidedPreparation(stage03).hints[0], /Preveja a faixa de 40/);
});

test('perguntas de leitura usam a decisão real, mesmo quando o exemplo é só um rótulo', () => {
  const cases = [
    ['13.01', /esperado.*recebido|recebido.*esperado/i, /hip[oó]tese|refut/i],
    ['14.01', /ciclo/i, /apontam|pertencem|aresta/i],
    ['14.12', /origem|sa[ií]da/i, /runtime|transforma/i],
    ['07.01', /cole[cç][aã]o|item|booleano/i, /retorno|resultado|inten[cç][aã]o/i],
  ];
  for (const [id, target, decision] of cases) {
    const item = published.find(activity => activity.id === id);
    const question = distinctFirstAction(item);
    assert.match(question, target, id);
    assert.match(question, decision, id);
    assert.doesNotMatch(question, /que evidência no caso “(?:esperado|ciclo|build|respostas na ordem)”/i, id);
  }
});

test('perguntas não dependem de examples[0].given vazio ou rótulo genérico', () => {
  const source = published.find(item => item.id === '04.02');
  const empty = structuredClone(source);
  empty.examples = [{given: '', expected: ''}];
  const question = distinctFirstAction(empty);
  assert.match(question, /fun[cç][aã]o|retorno|efeito|pureza/i);
  assert.doesNotMatch(question, /primeiro caso p[uú]blico/i);
  assert.match(question, /\?$/);
});

test('perguntas de previsão, projeto e bloco pedem decisões distintas em outras etapas', () => {
  const expectations = [
    ['08.01', /trechos.*somam.*multiplicam/i],
    ['07.11', /comandos Git/i],
    ['23.08', /dom[ií]nio.*persist[eê]ncia.*UI/i],
    ['14.03', /contrato.*parte incompleta/i],
  ];
  for (const [id, target] of expectations) {
    const item = published.find(activity => activity.id === id);
    const question = distinctFirstAction(item);
    assert.match(question, target, id);
    assert.notEqual(question, item.objective, id);
    assert.doesNotMatch(question, /no caso “(?:build|ciclo|esperado)”|primeiro caso p[uú]blico/i, id);
  }
});
