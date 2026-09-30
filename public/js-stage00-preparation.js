(function (global) {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const inline = value => esc(value).replace(/`([^`]+)`/g,'<code>$1</code>');
  const key = item => Number(item.contentVersion || 1)>1 ? `${item.id}@v${item.contentVersion}` : item.id;
  const writing = item => ['written','trace-writing'].includes(item.preparation.mode);
  const editable = (item,file) => file.path==='resposta.md' || ['edit-run','debug'].includes(item.preparation.mode) && /\.js$/.test(file.path);
  function drafts(item, progress) {
    const saved=progress.exerciseDrafts?.[key(item)];
    try {if(saved?.startsWith('__course_files__:'))return JSON.parse(saved.slice('__course_files__:'.length));}catch{}
    return Object.fromEntries(item.starterFiles.map(file=>[file.path,file.content]));
  }
  const done = (item, progress) => progress.answers?.[item.id]===true && Number(progress.exerciseVersions?.[item.id]||1)===Number(item.contentVersion||1);
  function render(item, context) {
    const p=item.preparation, progress=context.progress, k=key(item), saved=progress.warmupCompleted?.[k]===true;
    const files=drafts(item,progress), evidence=progress.exerciseEvidence?.[k]||{}, complete=done(item,progress);
    const prefix=`s00-${item.id.replace('.','-')}`;
    const activities=(context.activities||[]).filter(activity=>activity.optional!==true),position=activities.indexOf(item);
    const previous=position>0?activities[position-1]:null,next=position>=0?activities[position+1]:null;
    const sections=['learn','challenge','predict','practice','explain'];
    const labels=['01 · Aprender','02 · Ler o desafio','03 · Responder','04 · Praticar','05 · Explicar'];
    const descriptions=['Vocabulário e exemplo resolvido','O que a atividade pede','Sua previsão ou plano','Executar código ou registrar análise','Comparar e explicar o resultado'];
    return `<article class="course-lesson s00-lesson" data-s00-id="${esc(item.id)}">
      <a class="lesson-back" href="#/catalog">Todas as etapas</a>
      <header class="course-lesson-hero"><div class="eyebrow">JAVASCRIPT · ETAPA 00 · ${esc(item.id)}</div><h1>${esc(item.title)}</h1><p>${inline(item.objective)}</p></header>
      <nav class="s00-steps" aria-label="Ir para uma parte desta aula">${sections.map((name,i)=>`<button type="button" data-s00-target="${prefix}-${name}"><strong>${labels[i]}</strong><span>${descriptions[i]}</span></button>`).join('')}</nav>
      <p class="s00-path-help">Os passos acima são atalhos para as partes da aula. Comece por Aprender; você pode voltar à explicação a qualquer momento. Registrar uma resposta não é necessário para ler a teoria.</p>
      <section id="${prefix}-learn" tabindex="-1" class="course-explanation-panel" data-s00-teaching><div class="course-section-kicker">ANTES DO EXERCÍCIO</div><h2>O que você precisa saber</h2><ul class="s00-vocabulary">${p.vocabulary.map(line=>`<li>${inline(line)}</li>`).join('')}</ul><h3>Como pensar neste problema</h3><p>${inline(p.mental)}</p><h3>Exemplo resolvido</h3><p>Este exemplo ensina a regra com outros valores. Use o raciocínio para resolver a atividade abaixo.</p><pre><code>${esc(p.example.code)}</code></pre><strong>Resultado do exemplo</strong><pre class="s00-example-output">${esc(p.example.output)}</pre><ol>${p.example.walkthrough.map(line=>`<li>${inline(line)}</li>`).join('')}</ol>
      ${p.docs.length?`<aside class="s00-docs"><h3>Aprenda a consultar a documentação</h3><p>Documentação é uma referência para conferir um recurso. Abra o link em outra aba e leia somente o trecho indicado. Se a página estiver em inglês, use a tradução do navegador; os nomes de código continuam iguais. Consultar uma referência faz parte do exercício.</p>${p.docs.map(doc=>`<div><a href="${esc(doc.url)}" target="_blank" rel="noopener noreferrer">${esc(doc.title)}</a><span class="s00-doc-kind">${doc.required?'Consulta guiada nesta atividade':'Consulta opcional'}</span><p>${inline(doc.task)}</p><p><strong>O que aproveitar:</strong> ${inline(doc.takeaway)}</p></div>`).join('')}</aside>`:''}</section>
      <section id="${prefix}-challenge" tabindex="-1" class="course-prompt-panel"><div class="course-section-kicker">AGORA, O EXERCÍCIO</div><h2>O que fazer</h2><p>${inline(item.prompt)}</p><ol>${p.steps.map(line=>`<li>${inline(line)}</li>`).join('')}</ol><div class="course-starter-read">${item.starterFiles.filter(file=>file.path!=='resposta.md').map(file=>`<div class="course-file-preview"><strong>${esc(file.path)}</strong><pre><code>${esc(file.content)||'(arquivo vazio: você escreverá o programa na prática)'}</code></pre></div>`).join('')}</div></section>
      <section id="${prefix}-predict" tabindex="-1" class="course-prompt-panel"><h2>${p.mode==='debug'?'Registre a primeira observação':'Sua previsão ou plano'}</h2><p>${inline(item.interaction)}</p><p>${inline(item.firstResponse.timing)}</p><label for="${prefix}-prediction">${p.mode==='debug'?'Erro observado e hipótese':'Resposta inicial'}</label><textarea id="${prefix}-prediction" data-s00-prediction maxlength="400" ${saved?'readonly':''} placeholder="${p.mode==='debug'?'SyntaxError; linha …; suspeito que …':'Escreva sua resposta seguindo o formato acima.'}">${esc(progress.exercisePredictions?.[k]||'')}</textarea><button type="button" class="button-primary" data-s00-action="predict" ${saved?'disabled':''}>${saved?'Resposta inicial registrada':'Registrar resposta'}</button><p data-s00-prediction-status role="status">${saved?'A resposta foi preservada para comparação. A explicação continua disponível acima.':'Depois de registrar, a prática fica disponível. Você pode reler a explicação antes.'}</p></section>
      <section id="${prefix}-practice" tabindex="-1" class="course-practice-panel"><h2>${writing(item)?'Registre sua análise':'Confira na prática'}</h2><p>${p.mode==='debug'?'Execute o arquivo intacto primeiro. Depois registre sua observação acima para liberar a edição. Cada execução fica no histórico abaixo.':writing(item)?'O arquivo do exercício é para leitura. Escreva sua análise em resposta.md; .md indica um arquivo de texto, não um programa JavaScript.':p.mode==='read-run'?'O código é para leitura. Depois da previsão, execute e compare as mensagens; não é preciso editar.':'Depois da previsão, escreva sua tentativa no editor. Não escreva apenas a saída: use as chamadas JavaScript ensinadas.'}</p>
      ${item.starterFiles.map(file=>`<label class="course-editor-label" for="${prefix}-${esc(file.path)}"><span>${esc(file.path)} · ${editable(item,file)?'área de escrita':'somente leitura'}</span><textarea id="${prefix}-${esc(file.path)}" data-s00-editor data-s00-file="${esc(file.path)}" class="course-editor" maxlength="${file.path.endsWith('.js')?600:1200}" spellcheck="false" autocapitalize="off" ${!editable(item,file)||!saved?'readonly':''}>${esc(files[file.path]??file.content)}</textarea></label>`).join('')}
      ${p.mode==='debug'?`<label for="${prefix}-notes">Histórico de investigação · anote erro, hipótese e alteração</label><textarea id="${prefix}-notes" data-s00-notes maxlength="600">${esc(files['investigacao.md']||'')}</textarea>`:''}
      ${p.mode!=='written'?`<button type="button" class="button-secondary" data-s00-action="run" ${!saved&&p.mode!=='debug'?'disabled':''}>Executar e comparar</button>`:''}
      ${writing(item)?`<button type="button" class="button-secondary" data-s00-action="write" ${!saved?'disabled':''}>Registrar análise</button><p>O registro salva sua análise. Confira os critérios abaixo: uma resposta escrita não recebe correção automática.</p>`:''}
      <pre data-s00-output class="course-run-output" role="status" aria-live="polite">${esc(evidence.output||'O resultado aparecerá aqui. Executar significa seguir as instruções do arquivo; registrar análise significa salvar sua resposta escrita.')}</pre></section>
      <section id="${prefix}-explain" tabindex="-1" class="course-practice-panel"><h2>Compare e explique</h2><p>${inline(p.reflection)}</p><label for="${prefix}-reflection">Sua explicação · pelo menos 16 caracteres</label><textarea id="${prefix}-reflection" data-s00-reflection maxlength="600">${esc(progress.exerciseReflections?.[k]||'')}</textarea><fieldset class="course-rubric-checks"><legend>Confira seu trabalho</legend><p>Marque somente o que você conferiu. Se algum ponto falta, volte à prática ou à explicação.</p>${item.rubric.map((line,i)=>`<label class="course-self-check"><input type="checkbox" data-s00-rubric value="${i}" ${evidence.rubric?.includes(i)?'checked':''}><span>${inline(line)}</span></label>`).join('')}</fieldset><button type="button" class="button-primary" data-s00-action="complete" disabled>${complete?'Atividade concluída':'Concluir com minha explicação'}</button><p data-s00-completion-status role="status">${complete?'Conclusão salva. Você pode reler a aula.':'Para concluir: registre a resposta inicial, confira uma tentativa, escreva sua explicação e marque os critérios verificados.'}</p></section>
      <footer class="course-lesson-footer">${previous?`<a href="#/javascript/${esc(previous.id)}" class="button-secondary">Anterior: ${esc(previous.id)}</a>`:'<a href="#/catalog" class="button-secondary">Voltar ao catálogo</a>'}${next?`<a href="#/javascript/${esc(next.id)}" class="button-secondary">Próxima atividade: ${esc(next.id)}</a>`:''}</footer></article>`;
  }
  function root() {return document.querySelector('[data-s00-id]');}
  function status(selector,text) {const node=root()?.querySelector(selector);if(node)node.textContent=text;}
  function snapshot(item,context) {
    const values=Object.fromEntries([...root().querySelectorAll('[data-s00-editor]')].map(input=>[input.dataset.s00File,input.value]));
    const notes=root().querySelector('[data-s00-notes]');if(notes)values['investigacao.md']=notes.value;
    context.progress.exerciseDrafts ||= {};context.progress.exerciseDrafts[key(item)]='__course_files__:'+JSON.stringify(values);
    return values;
  }
  function ready(item,context) {
    const r=root(),p=context.progress,k=key(item),ev=p.exerciseEvidence?.[k];
    const checked=[...r.querySelectorAll('[data-s00-rubric]:checked')].length;
    const evidenceOkay=writing(item)?ev?.status==='written' && ev.runResult==='guided':ev?.runResult==='result';
    return p.warmupCompleted?.[k]===true && evidenceOkay && (r.querySelector('[data-s00-reflection]')?.value.trim().length||0)>=16 && checked===item.rubric.length;
  }
  function sync(item,context) {const button=root()?.querySelector('[data-s00-action="complete"]');if(button)button.disabled=done(item,context.progress)||!ready(item,context);}
  function handleInput(event,item,context) {
    if(!root()?.contains(event.target))return false;
    const input=event.target,k=key(item),p=context.progress;
    if(input.matches('[data-s00-reflection]')){p.exerciseReflections ||= {};p.exerciseReflections[k]=input.value.slice(0,600);}
    else if(input.matches('[data-s00-editor]')){snapshot(item,context);if(p.exerciseEvidence?.[k] && (input.dataset.s00File!=='resposta.md' || p.exerciseEvidence[k].status==='written')){p.exerciseEvidence[k].status='executed';p.exerciseEvidence[k].runResult='guided';}status('[data-s00-output]','O arquivo mudou. Confira novamente esta tentativa antes de concluir.');}
    else if(input.matches('[data-s00-notes]'))snapshot(item,context);
    else if(input.matches('[data-s00-prediction]') && !p.warmupCompleted?.[k]){p.exercisePredictions ||= {};p.exercisePredictions[k]=input.value.slice(0,400);}
    else return false;
    (context.scheduleSave||context.saveProgress)();sync(item,context);return true;
  }
  function record(item,context,result) {
    const k=key(item),p=context.progress;p.exerciseEvidence ||= {};
    const previous=p.exerciseEvidence[k]||{};
    p.exerciseEvidence[k]={...previous,...result,output:(result.output||'').slice(-9000),rubric:[],runCount:(previous.runCount||0)+1,recordedAt:new Date().toISOString()};
    context.saveProgress();status('[data-s00-output]',p.exerciseEvidence[k].output);sync(item,context);
  }
  function run(item,context) {
    const p=context.progress,k=key(item),saved=p.warmupCompleted?.[k]===true;
    if(!saved && item.preparation.mode!=='debug')return;
    const files=snapshot(item,context),texts=[];let passed=true;
    for(const file of item.starterFiles.filter(file=>/\.js$/.test(file.path))){
      const result=global.DevPathStage00Runner.interpret(files[file.path]);
      texts.push(file.path);
      if(!result.ok){passed=false;if(result.lines?.length)texts.push(result.lines.map(line=>line.values.map(String).join(' ')).join('\n'));texts.push(`${result.error.kind==='syntax'?'SyntaxError':result.error.kind==='runtime'?'ReferenceError':'Construção fora desta prática'} · linha ${result.error.line}: ${result.error.message}`);continue;}
      const values=result.lines.map(line=>line.values),expected=item.preparation.expectedByFile?.[file.path]||item.preparation.expected;
      texts.push(values.map(row=>row.map(String).join(' ')).join('\n')||'(sem saída)');
      const index=expected?.findIndex((row,i)=>JSON.stringify(row)!==JSON.stringify(values[i]))??-1;
      if(index!==-1 || values.length!==expected?.length){passed=false;texts.push(`Primeira divergência na saída ${index>=0?index+1:Math.min(values.length,expected?.length||0)+1}. Compare com o resultado pedido e confira o valor dessa chamada.`);}
      else texts.push('Resultado confere com as mensagens esperadas. Compare agora com sua previsão registrada acima.');
    }
    const previous=item.preparation.mode==='debug'?(p.exerciseEvidence?.[k]?.output||''):'';
    const text=`${previous?previous+'\n\n':''}Execução ${(p.exerciseEvidence?.[k]?.runCount||0)+1}\n${texts.join('\n')}`;
    record(item,context,{status:'executed',runResult:passed?'result':'error',output:text});
  }
  function handleClick(event,item,context) {
    const target=event.target.closest('[data-s00-action], [data-s00-target], [data-s00-rubric]');if(!target)return false;
    if(target.hasAttribute('data-s00-rubric')){sync(item,context);return true;}
    event.preventDefault?.();
    if(target.dataset.s00Target){const section=document.getElementById(target.dataset.s00Target);section?.focus({preventScroll:true});section?.scrollIntoView({block:'start',behavior:'auto'});return true;}
    const p=context.progress,k=key(item);
    if(target.dataset.s00Action==='predict'){
      if(p.warmupCompleted?.[k])return true;
      if(item.preparation.mode==='debug' && !p.exerciseEvidence?.[k]){status('[data-s00-prediction-status]','Execute primeiro o arquivo intacto e observe o erro. Depois registre sua hipótese.');return true;}
      const value=root().querySelector('[data-s00-prediction]').value.trim();
      if(!value){status('[data-s00-prediction-status]','Escreva a resposta seguindo o formato acima. A explicação já está disponível para ajudar.');return true;}
      p.exercisePredictions ||= {};p.exercisePredictions[k]=value.slice(0,400);p.warmupCompleted ||= {};p.warmupCompleted[k]=true;context.saveProgress();
      root().querySelector('[data-s00-prediction]').readOnly=true;target.disabled=true;target.textContent='Resposta inicial registrada';
      root().querySelectorAll('[data-s00-editor]').forEach(input=>input.readOnly=!editable(item,{path:input.dataset.s00File}));
      root().querySelectorAll('[data-s00-action="run"], [data-s00-action="write"]').forEach(button=>button.disabled=false);
      status('[data-s00-prediction-status]','Resposta preservada. Agora siga as instruções da prática; você pode reler a teoria.');sync(item,context);return true;
    }
    if(target.dataset.s00Action==='run'){run(item,context);return true;}
    if(target.dataset.s00Action==='write'){
      if(!p.warmupCompleted?.[k])return true;
      const files=snapshot(item,context),answer=(files['resposta.md']||'').trim(),starter=item.starterFiles.find(file=>file.path==='resposta.md')?.content.trim();
      if(answer===starter||answer.length<40){status('[data-s00-output]','Preencha sua análise em resposta.md. O modelo inicial sozinho não é uma resposta.');return true;}
      if(item.preparation.mode==='trace-writing' && p.exerciseEvidence?.[k]?.runResult!=='result'){status('[data-s00-output]','Execute e confira o arquivo original antes de registrar os cenários.');return true;}
      record(item,context,{status:'written',runResult:'guided',output:'Análise registrada. Confira sua resposta com as explicações e com cada critério; este registro não é uma correção automática.'});return true;
    }
    if(target.dataset.s00Action==='complete'){
      if(done(item,p)||!ready(item,context)){status('[data-s00-completion-status]','Ainda falta conferir a tentativa, explicar o resultado ou marcar os critérios.');return true;}
      p.exerciseEvidence[k].rubric=[...root().querySelectorAll('[data-s00-rubric]:checked')].map(input=>Number(input.value));
      p.exerciseReflections ||= {};p.exerciseReflections[k]=root().querySelector('[data-s00-reflection]').value.slice(0,600);
      p.answers ||= {};p.answers[item.id]=true;p.exerciseVersions ||= {};p.exerciseVersions[item.id]=Number(item.contentVersion||1);p.completed ||= [];if(!p.completed.includes(item.id))p.completed.push(item.id);
      p.reviewSchedule ||= {};p.reviewSchedule[item.id]={intervalIndex:0,dueAt:Date.now()+7*86400000};context.saveProgress();target.disabled=true;target.textContent='Atividade concluída';status('[data-s00-completion-status]','Conclusão salva. Sua revisão foi agendada para daqui a 7 dias.');return true;
    }
    return false;
  }
  global.DevPathStage00Preparation=Object.freeze({render,handleClick,handleInput,key,sync});
})(window);
