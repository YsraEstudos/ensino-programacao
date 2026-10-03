/* Public behavioural cases for the introductory Stage 01 interpreter. */
(function (global) {
  'use strict';
  const configs = {
    '01.01': { cases: [{ label: 'Cinco valores do arquivo', fixtures: {}, expected: ['number','string','boolean','undefined','object'] }], typeofCount:5 },
    '01.02': { kinds:{base:'const',total:'let'}, assignments:['total'], cases:[
      {label:'base = 2',fixtures:{},expected:['2 5']},
      {label:'base = 4',fixtures:{base:4},expected:['4 7']},
    ] },
    '01.03': { kinds:{nome:'const',idade:'const',ativo:'const'}, cases:[
      {label:'Perfil Lia',fixtures:{},expected:['Lia 20 true']},
      {label:'Perfil Rui',fixtures:{nome:'Rui',idade:0,ativo:false},expected:['Rui 0 false']},
    ] },
    '01.04': { kinds:{nome:'const',pontos:'let',ativo:'const',volume:'let',idioma:'const',tentativas:'let'}, assignments:['pontos','volume','tentativas'], cases:[
      {label:'Preferências Ana',fixtures:{},expected:['Ana 5 false 7 pt-BR 2']},
      {label:'Preferências Bia',fixtures:{nome:'Bia',idioma:'en'},expected:['Bia 5 false 7 en 2']},
    ] },
    '01.05': { cases:[{label:'Valores especiais',fixtures:{},expected:['number','number','bigint','object']}],typeofCount:4 },
    '01.06': { kinds:{nome:'const',nivel:'const'}, template:true, cases:[
      {label:'Nara, nível 3',fixtures:{},expected:['Nara: nível 3']},
      {label:'Ivo, nível 0',fixtures:{nome:'Ivo',nivel:0},expected:['Ivo: nível 0']},
    ] },
    '01.07': { kinds:{horas:'const',minutos:'const',resumo:'const'}, template:true, cases:[
      {label:'2 horas e 15 minutos',fixtures:{},expected:['2h15']},
      {label:'Zero nos dois campos',fixtures:{horas:0,minutos:0},expected:['0h0']},
      {label:'4 horas e zero minutos',fixtures:{horas:4,minutos:0},expected:['4h0']},
    ] },
    '01.08': { kinds:{jogo:'const',volume:'let',dificuldade:'const',legendas:'const',idioma:'const'}, assignments:['volume'],template:true, cases:[
      {label:'Arena, volume 0 → 7',fixtures:{},expected:['Arena | volume 0 | normal | legendas false | pt-BR','Arena | volume 7 | normal | legendas false | pt-BR']},
      {label:'Mar, dificuldade leve',fixtures:{jogo:'Mar',dificuldade:'leve',idioma:'pt'},expected:['Mar | volume 0 | leve | legendas false | pt','Mar | volume 7 | leve | legendas false | pt']},
    ] },
    '01.09': { kinds:{nome:'const',nivel:'const',vida:'let',status:'const'}, assignments:['vida','vida'],template:true,cases:[
      {label:'Iris: vida 10 → 6 → 0',fixtures:{},expected:['Iris | nível 1 | vida 10 | ativa','Iris | nível 1 | vida 6 | ativa','Iris | nível 1 | vida 0 | ativa']},
      {label:'Nara, nível 4, pausada',fixtures:{nome:'Nara',nivel:4,status:'pausada'},expected:['Nara | nível 4 | vida 10 | pausada','Nara | nível 4 | vida 6 | pausada','Nara | nível 4 | vida 0 | pausada']},
    ] },
  };
  const display = value => typeof value==='string' ? value : global.DevPathStage01Runner.format(value);
  const output = run => (run.lines || []).map(line => line.values.map(display).join(' '));
  function walk(node, predicate) {
    if (!node || typeof node!=='object') return false;
    if (predicate(node)) return true;
    return Object.values(node).some(value => Array.isArray(value) ? value.some(child=>walk(child,predicate)) : walk(value,predicate));
  }
  function parseOrder(value) {
    return Array.isArray(value) ? value : String(value||'').trim().toUpperCase().split(/[\s,;→-]+/).filter(Boolean);
  }
  function orderValid(value) {
    const order=parseOrder(value);
    return order.length===4 && new Set(order).size===4 && order.at(-1)==='D' && ['A','B','C'].every(letter=>order.includes(letter));
  }
  function structural(id, run, orders) {
    const config=configs[id];
    for (const [name,kind] of Object.entries(config.kinds||{})) if (run.kinds?.[name]!==kind) return `Declare ${name} com ${kind}, conforme as mudanças previstas e a convenção da atividade.`;
    if (config.assignments) {
      const names=(run.statements||[]).filter(stmt=>stmt.type==='assign').map(stmt=>stmt.name);
      if (names.join(',')!==config.assignments.join(',')) return `Confira as reatribuições pedidas: ${config.assignments.join(', ')}. Atualize somente esses nomes, na ordem indicada.`;
    }
    if (config.template && !walk(run.statements,node=>node.type==='template')) return 'Construa o texto com uma template literal: use crases e ${nomeDoBinding}, sem colar a saída como texto fixo.';
    if (config.typeofCount) {
      const logs=(run.statements||[]).filter(stmt=>stmt.type==='log');
      if (logs.length!==config.typeofCount || logs.some(stmt=>stmt.args.length!==1 || stmt.args[0].type!=='unary' || stmt.args[0].op!=='typeof')) return 'Mantenha uma chamada console.log(typeof valor) para cada valor do arquivo.';
    }
    if (id==='01.03') {
      const first=parseOrder(orders?.order), second=parseOrder(orders?.secondOrder);
      if (!orderValid(first) || !orderValid(second)) return 'Use A, B e C antes de D nas duas ordens; exclua E. Separe os rótulos com espaços.';
      if (first.join('')===second.join('')) return 'Registre uma segunda ordem diferente: A, B e C são independentes, mas D precisa vir depois deles.';
    }
    return '';
  }
  function check(id, code, orders) {
    const config=configs[id];
    if (!config) return {ok:false,message:'Atividade não disponível.',results:[]};
    const results=config.cases.map(entry=>{
      const run=global.DevPathStage01Runner.run(code,entry.fixtures), actual=output(run);
      const passed=run.ok && actual.length===entry.expected.length && actual.every((value,index)=>value===entry.expected[index]);
      return {...entry,actual,error:run.ok?'':run.error,passed,run};
    });
    const run=results[0].run;
    const problem=run.ok ? structural(id,run,orders) : run.error;
    const first=results.find(row=>!row.passed);
    const ok=!problem && !first;
    const message=ok ? 'Todos os casos públicos passaram. Compare sua previsão e explique a regra com suas palavras.' : problem || first.error || `No caso “${first.label}”, a primeira divergência está na linha ${first.actual.findIndex((value,index)=>value!==first.expected[index])+1 || 1}. Compare esperado e obtido; confira os bindings usados no texto.`;
    return {ok,message,results,run};
  }
  function checkTransfer(id,code) {
    const config=global.DevPathStage01Preparation?.['01.09']?.masteryTransfers?.find(entry=>entry.id===id);
    if (!config) return {ok:false,message:'Transferência não disponível.',results:[]};
    const cases=config.cases || [{label:config.title,fixtures:{},expected:config.expected}];
    const results=cases.map(entry=>{
      const run=global.DevPathStage01Runner.run(code,entry.fixtures||{}),actual=output(run);
      return {...entry,actual,error:run.ok?'':run.error,run,passed:run.ok && actual.length===entry.expected.length && actual.every((value,index)=>value===entry.expected[index])};
    });
    const run=results[0].run;
    const required=config.requiredKinds||{};
    const wrongKind=Object.entries(required).find(([name,kind])=>run.kinds?.[name]!==kind);
    const template=walk(run.statements,node=>node.type==='template');
    const assignments=(run.statements||[]).filter(stmt=>stmt.type==='assign').map(stmt=>stmt.name);
    const assignmentOk=assignments.join(',')===(id==='config'?'duracao':'horas');
    const ok=results.every(row=>row.passed) && !wrongKind && template && assignmentOk;
    return {ok,results,run,message:ok?'Transferência conferida sem dica. Explique por que os valores mudaram ou permaneceram.':wrongKind?`Confira a declaração ${wrongKind[0]}: use ${wrongKind[1]}.`:!assignmentOk?`Reatribua somente ${id==='config'?'duracao':'horas'} uma vez; não copie o segundo valor direto na saída.`:!template?'Use template literal para ler os dados atuais.':results.find(row=>!row.passed)?.error || 'Compare a saída com o contrato; derive o texto dos bindings, sem copiar valores fixos.'};
  }
  global.DevPathStage01Checks={check,checkTransfer,cases:configs,output};
})(globalThis);
