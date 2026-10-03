// Stage 03 behavior checks run through the bounded teaching interpreter.
(function(global) {
  'use strict';
  function checkFixtures(code, fixtures) {
    for (let index = 0; index < fixtures.length; index++) {
      const test = fixtures[index];
      const result = global.DevPathStage03Runner.run(code, test.input || {});
      const label = Object.entries(test.input || {}).map(([k,v]) => `${k}=${v}`).join(', ') || 'cenário-base';
      if (!result.ok) return {ok:false,message:`Caso ${index+1} (${label}): ${result.error}`};
      const logs = result.lines.map(line => line.values);
      if (test.logs && JSON.stringify(logs) !== JSON.stringify(test.logs)) return {ok:false,message:`Caso ${index+1} (${label}): esperado ${JSON.stringify(test.logs)}; obtido ${JSON.stringify(logs)}. Confira a primeira transição diferente.`};
      for (const [name, value] of Object.entries(test.variables || {})) if (result.variables[name] !== value) return {ok:false,message:`Caso ${index+1} (${label}): ${name} deveria terminar em ${value}; terminou em ${result.variables[name]}.`};
    }
    return {ok:true,message:`Os ${fixtures.length} casos conferidos passaram. Explique a regra que os faz funcionar.`};
  }
  function check(id, code) { return checkFixtures(code, global.DevPathStage03Preparation[id].fixtures); }
  const normalize = value => String(value ?? '').trim().toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  function checkTable(id, cells) {
    const table = global.DevPathStage03Preparation[id].table;
    if (!table) return {ok:true,message:'Sem tabela nesta atividade.'};
    const flat = Array.isArray(cells?.[0]) ? cells.flat() : (cells || []);
    let cell = 0;
    for (const row of table.rows) for (let column=0; column<row.expected.length; column++) {
      if (normalize(flat[cell++]) !== normalize(row.expected[column])) return {ok:false,message:`Primeira divergência: ${row.label}, coluna ${table.columns[column]}. Releia o exemplo e acompanhe o estado nessa passagem.`};
    }
    return {ok:true,message:'Tabela conferida: estados e fronteiras correspondem às regras.'};
  }
  global.DevPathStage03Checks = {check,checkFixtures,checkTable};
})(globalThis);
