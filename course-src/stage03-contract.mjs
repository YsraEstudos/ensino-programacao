// Only Stage 03 contracts. Inputs are injected into top-level declarations;
// learner code never needs arrays, functions, imports or a testing framework.
import { stage03Preparation } from './stage03-preparation.mjs';
const fixture = (input, ...logs) => ({ input, logs });
const table = (caption, columns, rows) => ({ caption, columns, rows: rows.map(([label, ...expected]) => ({ label, expected: expected.map(String) })) });
const tables = {
  '03.04': table('Decisões nas fronteiras: escreva a faixa (E, D, C, B, A ou inválida).', ['Faixa prevista'], [[-1,'inválida'],[0,'E'],[20,'D'],[40,'C'],[80,'A'],[100,'A'],[101,'inválida']]),
  '03.05': table('Abaixo, no corte e acima: escreva true ou false para cada resultado.', ['Abaixo','No corte','Acima'], [['total >= 100: 99 / 100 / 101','false','true','true'],['idade >= 18: 17 / 18 / 19','false','true','true'],['peso <= 5: 4 / 5 / 6','true','true','false'],['x > 0: -1 / 0 / 1','false','false','true']]),
  '03.01': table('Uma linha por passagem; registre total antes e depois da soma.', ['Total antes','Total depois'], [[1,0,1],[2,1,3],[3,3,6],[4,6,10],['Próximo i (sem corpo)',10,10]]),
  '03.02': table('Em cada passagem: soma ou pula? Qual soma fica armazenada?', ['soma ou pula','Soma depois'], [[1,'soma',1],[2,'pula',1],[3,'soma',4],[4,'pula',4],[5,'soma',9]]),
  '03.06': table('Starter com erro: observe o estado antes e depois de cada passagem.', ['Fila antes','Fila depois'], [['Passagem 1',3,2],['Passagem 2',2,2],['Passagem 3',2,2]]),
  '03.07': table('Candidatos-chave: ambas as regras são verdadeiras? Escreva sim ou não.', ['Contado?'], [[4,'não'],[6,'sim'],[8,'sim'],[10,'sim']]),
  '03.08': table('Cenário-base, quatro primeiros ticks: chegada antes de atendimento.', ['Fila final','Atendidos'], [[1,1,0],[2,1,1],[3,2,1],[4,2,2]]),
  '03.09': table('Cenário-base: estado após cada turno completo.', ['HP herói','HP monstro'], [[1,10,6],[2,8,3],[3,8,0]]),
};
tables['03.01'].rows[4].label = 'i = 5: condição falsa, corpo não executado';
const fixtures = {
  '03.01': [fixture({},[1,1],[2,3],[3,6],[4,10])],
  '03.02': [fixture({},[9])],
  '03.03': [fixture({}, ...Array.from({length:30}, (_,j) => { const i=j+1;return [i%15===0?'FizzBuzz':i%3===0?'Fizz':i%5===0?'Buzz':i]; }))],
  '03.04': [-1,0,19,20,39,40,59,60,79,80,100,101].map(nota => fixture({nota}, [nota<0 || nota>100?'inválida':nota<20?'E':nota<40?'D':nota<60?'C':nota<80?'B':'A'])),
  '03.06': [0,1,3,4].map(fila => ({input:{fila}, variables:{fila:0}, logs: fila>=2?[['pausa'],[0]]:[[0]]})),
  '03.07': [fixture({n:10,limite:4,divisor:2},[3]),fixture({n:10,limite:5,divisor:2},[3]),fixture({n:10,limite:6,divisor:2},[2]),fixture({n:0,limite:0,divisor:2},[0]),fixture({n:10,limite:10,divisor:2},[0]),fixture({n:15,limite:8,divisor:5},[2]),fixture({n:6,limite:3,divisor:3},[1])],
  '03.08': [fixture({ticks:4},[2,2]),fixture({ticks:20},[10,10]),fixture({ticks:0},[0,0]),fixture({ticks:1},[1,0]),fixture({ticks:4,chegadasPorTick:0},[0,0])],
  '03.09': [fixture({},[8,0,3,'heroi']),fixture({heroi:2},[0,6,1,'monstro']),fixture({danoHeroi:0,danoMonstro:0},[12,9,20,'empate']),fixture({monstro:1,danoHeroi:5},[12,0,1,'heroi']),fixture({heroi:1,danoMonstro:5},[0,6,1,'monstro']),fixture({maxTurnos:1},[10,6,1,'empate'])],
};
export const stage03Contracts = Object.fromEntries(Object.entries(stage03Preparation).map(([id, preparation]) => [id, {
  ...preparation, ...(tables[id] ? {table:tables[id]} : {}), fixtures:fixtures[id] || [],
  readonly: ['03.01','03.02'].includes(id),
}]));
