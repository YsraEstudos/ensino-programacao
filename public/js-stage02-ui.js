(function(global){
  'use strict';
  const VERSION=1, runner=global.DevPathStage02Runner, lessons=global.DevPathStage02Lessons;
  const html=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const format=runner.format;
  const view=()=>document.querySelector('#view');
  const latest=new Map();
  function inlineText(value){
    return String(value).split(/(`[^`]+`|\*\*[^*]+\*\*)/g).map(part=>{
      if(part.startsWith('`') && part.endsWith('`'))return `<code>${html(part.slice(1,-1))}</code>`;
      if(part.startsWith('**') && part.endsWith('**'))return `<strong>${html(part.slice(2,-2))}</strong>`;
      return html(part);
    }).join('');
  }
  function bridgeMarkup(source){
    const blocks=[];let paragraph=[];
    const flush=()=>{if(paragraph.length){blocks.push(`<p>${paragraph.map(inlineText).join('<br>')}</p>`);paragraph=[];}};
    for(const line of source.split(/\r?\n/)){
      const heading=line.match(/^#{1,4}\s+(.+)$/);
      if(!line.trim()){flush();continue;}
      if(heading){flush();blocks.push(`<h3>${inlineText(heading[1])}</h3>`);continue;}
      paragraph.push(line);
    }
    flush();return blocks.join('');
  }
  function officialDocs(resources=[]){
    const urls=resources.filter(resource=>resource.startsWith('Documentação oficial:')).flatMap(resource=>resource.match(/https:\/\/[^\s;]+/g)||[]);
    if(!urls.length)return '';
    return `<section class="s02-docs" aria-label="Documentação oficial"><h3>Documentação oficial</h3><ul>${urls.map(url=>{
      let label=url;try{const parsed=new URL(url);label=`MDN · ${decodeURIComponent(parsed.pathname.split('/').filter(Boolean).pop()||parsed.hostname).replaceAll('_',' ').replaceAll('-',' ')}`;}catch{}
      return `<li><a href="${html(url)}" target="_blank" rel="noopener noreferrer">${html(label)} ↗</a></li>`;
    }).join('')}</ul></section>`;
  }
  const questions={
    '02.01':[
      ['Em 5 + 2 * 3, qual operação vem primeiro?',['Multiplicação; o resultado final é 11.','Soma; o resultado final é 21.','As duas sempre ocorrem da esquerda para a direita.']],
      ['Que tipo true && "ok" devolve?',['String: "ok".','Boolean: true.','Number: 1.']],
      ['Por que 1 == "1" difere de 1 === "1"?',['== faz coerção; === não converte tipos.','=== sempre converte strings em números.','== e === seguem exatamente a mesma regra.']],
    ],
    '02.10':[
      ['Por que floor(-1.8) e trunc(-1.8) diferem?',['Floor dá -2; trunc dá -1.','Ambos dão -1.','Trunc dá -2; floor dá -1.']],
      ['Como obter a magnitude de -4?',['Math.abs(-4), que dá 4.','Math.min(-4,0), que dá 4.','Math.floor(-4), que dá 4.']],
      ['Qual é o intervalo de Math.random()?',['Inclui 0 e exclui 1: [0,1).','Inclui 0 e 1: [0,1].','Devolve apenas inteiros entre 1 e 6.']],
    ],
    '02.11':[
      ['Todo decimal é aproximado em Number?',['Não: 0.5 e 0.25 são exemplos exatos.','Sim: nenhum decimal é representável exatamente.','Não: 0.1 + 0.2 é exatamente 0.3.']],
      ['Quando BigInt ajuda?',['Na aritmética de inteiros além da precisão segura.','Em frações decimais exatas, misturado com Number.','Apenas para arredondar números menores que 1.']],
    ],
  };
  const parsons={A:'const suficiente = saldo >= valor;',B:'const autorizada = ativa === true;',C:'const podePagar = suficiente && autorizada;',D:'console.log(podePagar);',E:'const podePagar = suficiente || autorizada;'};
  function getState(item,progress){
    progress.stage02 ||= {};
    let state=progress.stage02[item.id];
    if(!state || state.version!==VERSION || !Array.isArray(state.blocks) || state.blocks.length!==lessons.lessons[item.id].length){
      state={version:VERSION,index:0,complete:false,reflection:'',blocks:lessons.lessons[item.id].map(config=>({code:config.starter,prediction:'',predictionSaved:false,understood:false,passedCode:null,hintLevel:0,parsons:['C','D','A','E','B']}))};
      progress.stage02[item.id]=state;
    }
    state.index=Math.max(0,Math.min(state.blocks.length-1,Number(state.index)||0));
    return state;
  }
  function passed(state,index){const block=state.blocks[index];return block.predictionSaved && block.understood && block.passedCode===block.code;}
  function complete(item,progress){const state=progress.stage02?.[item.id];return Boolean(state?.complete && state.version===VERSION && state.blocks.every((_,index)=>passed(state,index)));}
  function questionFor(item,index){
    const own=questions[item.id]?.[index];
    return own?{prompt:own[0],choices:own[1],answer:0}:item.review;
  }
  function predictionFields(config,block,id,index){
    if(!config.rows)return `<label class="course-response-label" for="s02-prediction"><span>Sua previsão para os casos</span><small>Registre as saídas e seus tipos antes de executar. Pode errar: depois você compara com a saída real.</small><textarea id="s02-prediction" data-s02-prediction maxlength="2000" ${block.predictionSaved?'readonly':''}>${html(block.prediction)}</textarea></label>`;
    let values=[];try{values=JSON.parse(block.prediction||'[]');}catch{}
    return `<div class="s02-table-wrap"><table class="s02-table"><caption>Preveja cada expressão. Escreva strings entre aspas, inclusive "".</caption><thead><tr><th>Expressão</th><th>Valor previsto</th></tr></thead><tbody>${config.rows.map((row,rowIndex)=>`<tr><th scope="row"><label for="s02-pred-${rowIndex}"><code>${html(row)}</code></label></th><td><input id="s02-pred-${rowIndex}" data-s02-row="${rowIndex}" value="${html(values[rowIndex]||'')}" ${block.predictionSaved?'readonly':''} maxlength="120" autocomplete="off" /></td></tr>`).join('')}</tbody></table></div>`;
  }
  function inputs(fixtures){return Object.entries(fixtures).map(([name,value])=>`${name} = ${format(value)}`).join('; ') || 'Expressões do bloco';}
  function resultsMarkup(result,config,block){
    if(!result)return '<p>Execute seu código para ver cada caso, os valores e os tipos.</p>';
    let predictions=[];try{predictions=JSON.parse(block.prediction);}catch{}
    return `<p class="s02-result-message ${result.ok?'s02-success':'s02-error'}">${html(result.message)}</p><div class="s02-table-wrap"><table class="s02-table"><caption>Casos públicos: entrada, esperado e obtido</caption><thead><tr><th>Caso / entrada</th><th>Esperado</th><th>Obtido</th><th>Resultado</th></tr></thead><tbody>${result.results.map(row=>`<tr><th scope="row">${html(row.label)}<small>${html(inputs(row.fixtures))}</small></th><td><code>${html(row.expected.map(format).join(', '))}</code></td><td><code>${html(row.error || row.actual.map(value=>`${format(value)} (${typeof value})`).join(', '))}</code></td><td>${row.passed?'✓ passou':'Ajustar'}</td></tr>`).join('')}</tbody></table></div>${config.rows && predictions.length && result.results[0]?.actual.length?`<details><summary>Comparar com sua previsão registrada</summary><ol>${config.rows.map((row,index)=>`<li><code>${html(row)}</code>: previu <code>${html(predictions[index])}</code>; obteve <code>${html(format(result.results.flatMap(row=>row.actual)[index]))}</code>.</li>`).join('')}</ol></details>`:''}`;
  }
  function render(item,ctx){
    const state=getState(item,ctx.progress),index=state.index,block=state.blocks[index],configs=lessons.lessons[item.id],config=configs[index];
    const firstMissing=state.blocks.findIndex((_,i)=>!passed(state,i));
    const maxOpen=firstMissing<0?state.blocks.length-1:firstMissing;
    const question=questionFor(item,index),canRun=block.predictionSaved && block.understood;
    const allPassed=state.blocks.every((_,i)=>passed(state,i));
    const key=`${item.id}:${index}`;
    const result=latest.get(key) || (passed(state,index)?lessons.check(item.id,index,block.code):null);
    const unitB=Number(item.id.slice(3))>=10;
    const bridgeTitle=unitB?'Ponte 02B':'Ponte 02A';
    const bridge=(item.resources||[]).find(resource=>resource.startsWith(`### ${bridgeTitle} —`));
    const hints=lessons.hints[item.id]?.[index]||[];
    return `<article class="course-lesson s02-lesson"><a class="lesson-back" href="#/catalog">← Todas as etapas</a><header class="course-lesson-hero"><div class="eyebrow">ETAPA 02 · ${html(item.id)} · ${html(item.kind)}</div><h1>${html(item.title)}<span class="brand-period">.</span></h1><p>${html(item.prompt)}</p><div class="course-lesson-meta"><span>Estimativa: ${html(item.duration)}</span><span>${state.blocks.filter((_,i)=>passed(state,i)).length}/${configs.length} blocos conferidos</span><span>${complete(item,ctx.progress)?'✓ concluído':'em andamento'}</span></div></header>${bridge?`<details class="s02-bridge"><summary>Preparação: ${unitB?'Number e Math':'expressões e operadores'}</summary><div class="s02-bridge-content">${bridgeMarkup(bridge)}</div></details>`:''}${officialDocs(item.resources)}<nav class="s02-block-nav" aria-label="Blocos do exercício">${configs.map((entry,i)=>`<button type="button" data-s02-action="block" data-s02-index="${i}" ${i>maxOpen?'disabled':''} aria-current="${i===index?'step':'false'}">${passed(state,i)?'✓ ':''}${html(entry.title)}${i>maxOpen?' · bloqueado':''}</button>`).join('')}</nav><section class="course-prompt-panel"><h2 id="s02-block-heading" tabindex="-1">${html(config.title)}</h2><h3>1. Leia as entradas e preveja</h3><p>As entradas abaixo estão declaradas no código. Ao conferir um caso, apenas suas inicializações mudam.</p><ul class="s02-fixtures">${config.cases.map(entry=>`<li><strong>${html(entry.label)}</strong><code>${html(inputs(entry.fixtures))}</code></li>`).join('')}</ul>${predictionFields(config,block,item.id,index)}${!block.predictionSaved?'<button class="button-primary" type="button" data-s02-action="predict">Registrar previsão e estudar o exemplo</button>':'<p class="s02-success">✓ Previsão registrada antes da execução.</p>'}</section>${block.predictionSaved?`<section class="course-explanation-panel"><h3>2. Entenda o exemplo</h3><p>${html(config.example)}</p><fieldset class="s02-understanding"><legend>${html(question.prompt)}</legend>${question.choices.map((choice,i)=>`<label><input type="radio" name="s02-understanding" value="${i}" ${block.understood && i===question.answer?'checked':''} ${block.understood?'disabled':''}/><span>${html(choice)}</span></label>`).join('')}</fieldset>${block.understood?'<p class="s02-success">✓ Conceito conferido. Agora escreva e execute.</p>':'<button type="button" class="button-secondary" data-s02-action="understand">Conferir entendimento</button>'}<p data-s02-understanding-feedback role="status" aria-live="polite"></p></section>`:''}${canRun?`<section class="course-practice-panel"><h3>3. Escreva e confira os casos</h3><p>O ambiente aceita const/let, expressões, console.log e as APIs de Number/Math desta etapa. Não execute funções, loops ou código de navegador aqui.</p>${config.parsons?`<fieldset class="s02-parsons"><legend>Monte A/B/C/D e retire o distrator. A e B podem trocar de posição.</legend><ol>${block.parsons.map((letter,i)=>`<li><code>${html(letter+': '+parsons[letter])}</code><div><button type="button" data-s02-action="up" data-s02-position="${i}" ${i===0?'disabled':''} aria-label="Mover bloco ${letter} para cima">↑</button><button type="button" data-s02-action="down" data-s02-position="${i}" ${i===block.parsons.length-1?'disabled':''} aria-label="Mover bloco ${letter} para baixo">↓</button><button type="button" data-s02-action="remove" data-s02-position="${i}" aria-label="Retirar bloco ${letter}">Retirar</button></div></li>`).join('')}</ol><button type="button" class="button-secondary" data-s02-action="restore">Restaurar blocos</button><button type="button" class="button-secondary" data-s02-action="assemble">Levar montagem ao editor</button></fieldset>`:''}<label class="course-editor-label" for="s02-code"><span>main.js · bloco ${index+1}</span><textarea id="s02-code" data-s02-code maxlength="12000" spellcheck="false" autocapitalize="off">${html(block.code)}</textarea></label><div class="s02-run-actions"><button class="button-primary" type="button" data-s02-action="run">Executar e conferir todos os casos</button>${config.random?'<button class="button-secondary" type="button" data-s02-action="random">Fazer um sorteio real</button>':''}${config.debug?'<button class="button-secondary" type="button" data-s02-action="reproduce">Executar código original</button>':''}<button class="button-secondary" type="button" data-s02-action="reset">Restaurar código inicial</button><button class="button-secondary" type="button" data-s02-action="hint" ${!hints||block.hintLevel>=hints.length?'disabled':''}>${!hints||block.hintLevel>=hints.length?'Dicas abertas':`Abrir dica ${block.hintLevel+1}/${hints.length}`}</button></div>${(hints||[]).slice(0,block.hintLevel).map((hint,i)=>`<p class="s02-hint"><strong>Dica ${i+1}</strong> ${html(hint)}</p>`).join('')}<div class="s02-results" data-s02-results role="status" aria-live="polite">${resultsMarkup(result,config,block)}</div><p data-s02-single-output role="status" aria-live="polite"></p>${passed(state,index) && index<configs.length-1?'<button type="button" class="button-primary" data-s02-action="next">Avançar para o próximo bloco →</button>':''}</section>`:'<p class="course-gate-note">Registre a previsão e confira o entendimento para liberar o editor deste bloco.</p>'}<section class="course-practice-panel"><h3>4. Explique e conclua</h3><label class="course-reflection-label" for="s02-reflection"><span>Qual regra você aplicou e o que mudou em relação à previsão?</span><textarea id="s02-reflection" data-s02-reflection maxlength="600">${html(state.reflection)}</textarea></label><div class="course-complete-row"><span data-s02-completion-status>${allPassed?'Todos os blocos passaram.':'Confira todos os blocos para liberar a conclusão.'}</span><button type="button" class="button-primary" data-s02-action="complete" ${!allPassed || state.reflection.trim().length<16 || state.complete?'disabled':''}>${state.complete?'Atividade concluída ✓':'Concluir exercício e agendar revisão'}</button></div>${state.complete?'<p class="s02-success" role="status">Revisão vinculada a este exercício, agendada para daqui a 7 dias.</p>':''}</section><footer class="course-lesson-footer"><a class="button-secondary" href="#/catalog">Voltar ao catálogo</a>${item.id!=='02.12'?`<a class="button-secondary" href="#/javascript/02.${String(Number(item.id.slice(3))+1).padStart(2,'0')}">Próximo exercício →</a>`:''}</footer></article>`;
  }
  function capture(item,ctx){
    const state=getState(item,ctx.progress),block=state.blocks[state.index];
    const code=view().querySelector('[data-s02-code]');
    if(code && code.value!==block.code){block.code=code.value;block.passedCode=null;state.complete=false;latest.delete(`${item.id}:${state.index}`);}
    if(!block.predictionSaved){const rows=[...view().querySelectorAll('[data-s02-row]')];block.prediction=rows.length?JSON.stringify(rows.map(row=>row.value.trim())):view().querySelector('[data-s02-prediction]')?.value ?? block.prediction;}
    const reflection=view().querySelector('[data-s02-reflection]');if(reflection)state.reflection=reflection.value;
    return {state,block};
  }
  function handleClick(event,item,ctx){
    const button=event.target.closest('[data-s02-action]');if(!button)return false;
    const {state,block}=capture(item,ctx),index=state.index,config=lessons.lessons[item.id][index],action=button.dataset.s02Action;
    const refresh=()=>{ctx.saveProgress();ctx.render();document.querySelector('#s02-block-heading')?.focus();};
    if(action==='predict'){
      let valid=block.prediction.trim().length>0;if(config.rows){try{valid=JSON.parse(block.prediction).length===config.rows.length && JSON.parse(block.prediction).every(value=>value.trim());}catch{valid=false;}}
      if(!valid){ctx.toast('Preencha todas as previsões antes de continuar.');return true;}block.predictionSaved=true;refresh();
    } else if(action==='understand'){
      const answer=view().querySelector('input[name="s02-understanding"]:checked'),question=questionFor(item,index);
      if(!answer || Number(answer.value)!==question.answer){view().querySelector('[data-s02-understanding-feedback]').textContent=answer?'Releia o exemplo e confira a regra usada. Tente novamente.':'Escolha uma resposta antes de conferir.';return true;}block.understood=true;refresh();
    } else if(action==='run'){
      if(!block.predictionSaved || !block.understood)return true;
      const result=lessons.check(item.id,index,block.code);latest.set(`${item.id}:${index}`,result);block.passedCode=result.ok?block.code:null;state.complete=false;refresh();
    } else if(action==='random' || action==='reproduce'){
      const result=runner.run(action==='reproduce'?config.starter:block.code);
      view().querySelector('[data-s02-single-output]').textContent=result.ok?result.lines.map(entry=>`Linha ${entry.line}: ${entry.values.map(format).join(', ')}`).join('\n'):result.error;
    } else if(action==='next' || action==='block'){
      const destination=action==='next'?index+1:Number(button.dataset.s02Index);
      if(destination>=0 && destination<state.blocks.length && state.blocks.slice(0,destination).every((_,i)=>passed(state,i))){state.index=destination;refresh();}
    } else if(action==='hint'){block.hintLevel=Math.min(lessons.hints[item.id]?.[index]?.length||0,block.hintLevel+1);refresh();}
    else if(action==='reset'){block.code=config.starter;block.passedCode=null;state.complete=false;latest.delete(`${item.id}:${index}`);refresh();}
    else if(['up','down','remove','restore','assemble'].includes(action)){
      const position=Number(button.dataset.s02Position);
      if(action==='restore')block.parsons=['C','D','A','E','B'];
      if(action==='remove')block.parsons.splice(position,1);
      if(action==='up' && position>0)[block.parsons[position-1],block.parsons[position]]=[block.parsons[position],block.parsons[position-1]];
      if(action==='down' && position<block.parsons.length-1)[block.parsons[position+1],block.parsons[position]]=[block.parsons[position],block.parsons[position+1]];
      if(action==='assemble'){block.code='const saldo = 10;\nconst valor = 8;\nconst ativa = true;\n'+block.parsons.map(letter=>parsons[letter]).join('\n');block.passedCode=null;state.complete=false;}
      refresh();
    } else if(action==='complete'){
      if(state.reflection.trim().length<16 || !state.blocks.every((entry,i)=>passed(state,i) && lessons.check(item.id,i,entry.code).ok)){ctx.toast('Confira todos os blocos e escreva sua explicação antes de concluir.');return true;}
      state.complete=true;ctx.progress.exerciseReflections ||= {};ctx.progress.exerciseReflections[item.id]=state.reflection;
      ctx.progress.answers ||= {};ctx.progress.answers[item.id]=true;
      ctx.progress.completed ||= [];if(!ctx.progress.completed.includes(item.id))ctx.progress.completed.push(item.id);
      ctx.progress.reviewSchedule ||= {};ctx.progress.reviewSchedule[item.id]={intervalIndex:0,dueAt:Date.now()+7*86400000};refresh();
    }
    return true;
  }
  function handleInput(event,item,ctx){
    if(!event.target.matches('[data-s02-code],[data-s02-reflection],[data-s02-prediction],[data-s02-row]'))return false;
    const {state}=capture(item,ctx);
    const button=view().querySelector('[data-s02-action="complete"]');if(button){button.disabled=!state.blocks.every((_,i)=>passed(state,i)) || state.reflection.trim().length<16 || state.complete;button.textContent=state.complete?'Atividade concluída ✓':'Concluir exercício e agendar revisão';}
    const next=view().querySelector('[data-s02-action="next"]');if(next)next.disabled=!passed(state,state.index);
    const firstMissing=state.blocks.findIndex((_,i)=>!passed(state,i));
    view().querySelectorAll('[data-s02-action="block"]').forEach(button=>{button.disabled=firstMissing>=0 && Number(button.dataset.s02Index)>firstMissing;});
    if(event.target.matches('[data-s02-code]')){
      const results=view().querySelector('[data-s02-results]');if(results)results.textContent='Código alterado: execute novamente para conferir os casos desta versão.';
    }
    const label=view().querySelector('[data-s02-completion-status]');if(label)label.textContent=state.blocks.every((_,i)=>passed(state,i))?'Todos os blocos passaram.':'Confira todos os blocos para liberar a conclusão.';
    ctx.scheduleSave();return true;
  }
  global.DevPathStage02UI={render,handleClick,handleInput,complete,getState};
})(globalThis);
