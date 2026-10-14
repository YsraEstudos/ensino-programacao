import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {JSDOM} from 'jsdom';
import {withPublicDependencies} from './public-test-source.mjs';
import {diagnosticPreparation} from '../course-src/diagnostic-preparation.mjs';

const root = new URL('../public/', import.meta.url);
const catalog = JSON.parse(readFileSync(new URL('course-catalog.json', root), 'utf8'));
const diagnosticIds = ['D.01','D.02','D.03','D.04','D.05','D.06','D.07','D.08','D.09'];

test('D catalog appends four bands and keeps the published prerequisites explicit', () => {
  assert.deepEqual(catalog.filter(item => item.stage === 'D').map(item => item.id), diagnosticIds);
  assert.deepEqual(Object.keys(diagnosticPreparation).filter(id => id.startsWith('D.')), diagnosticIds);
  const expected = {
    'D.06': {entry:'01.01', prerequisites:['00.01']},
    'D.07': {entry:'07.01', prerequisites:['04.01','05.01']},
    'D.08': {entry:'15.01', prerequisites:['04.01','06.01']},
    'D.09': {entry:'21.01', prerequisites:['04.01']}
  };
  for (const [id, mapping] of Object.entries(expected)) {
    assert.deepEqual(diagnosticPreparation[id].recommendation, mapping);
    assert.deepEqual(catalog.find(item => item.id === mapping.entry).learningMetadata.requires, mapping.prerequisites);
  }
  assert.deepEqual(diagnosticPreparation['D.07'].coverage['05.01'],[1,2,3], 'array coverage includes alias mutation and copied-array isolation');
  assert.deepEqual(diagnosticPreparation['D.08'].coverage['06.01'],[1,2,3,4,5], 'reference coverage includes alias mutation, spread-copy isolation and nested shared references');
  assert.match(diagnosticPreparation['D.07'].fields[2].label,/b = valores/);
  assert.match(diagnosticPreparation['D.07'].fields[3].label,/slice/);
  assert.match(diagnosticPreparation['D.08'].fields[2].label,/alias/);
  assert.match(diagnosticPreparation['D.08'].fields[3].label,/spread/);
  assert.match(diagnosticPreparation['D.08'].fields[4].label,/pessoa\.meta\.ativo/);
  assert.match(diagnosticPreparation['D.08'].fields[5].label,/copia\.meta === pessoa\.meta/);
});

test('each new diagnostic accepts unknown for study and renders the bounded, non-certifying recommendation', () => {
  for (const id of diagnosticIds.slice(5)) {
    const config = diagnosticPreparation[id];
    assert(config, `${id} has a learning configuration`);
    assert(config.fields.length >= 3);
    for (const field of config.fields) {
      assert(field.options.some(option => option.value === 'unknown'));
      assert(field.options.some(option => option.value === field.expected));
      assert(field.explanation.trim());
    }
    assert.match(config.takeaway, /diagnóstico de estudo/i);
    assert.match(config.takeaway, /não.*(certifica|prova independente)/i);
  }
});

test('an incomplete prediction cannot be submitted, while each complete band maps only to its declared entry', () => {
  const incomplete=fixture('D.06',{mode:'recall',state:'attempted',attemptId:'attempt-incomplete',attemptIndependent:true,assisted:false});
  try {
    incomplete.input('[data-diagnostic-field="0"]',diagnosticPreparation['D.06'].fields[0].expected);
    incomplete.input('[data-diagnostic-confidence]','50');
    incomplete.click('[data-diagnostic-action="check"]');
    assert.equal(incomplete.progress.exerciseEvidence,undefined,'missing answers do not create a submission');
    assert.match(incomplete.view.querySelector('[data-diagnostic-status]').textContent,/Escolha uma resposta/);
  } finally {incomplete.dom.window.close();}

  const mappings={'D.06':'01.01','D.07':'07.01','D.08':'15.01','D.09':'21.01'};
  for (const [id,entry] of Object.entries(mappings)) {
    const f=fixture(id,{mode:'recall',state:'attempted',attemptId:`attempt-${id}`,attemptIndependent:true,assisted:false});
    try {
      for (const [index,field] of diagnosticPreparation[id].fields.entries()) f.input(`[data-diagnostic-field="${index}"]`,field.expected);
      f.input('[data-diagnostic-confidence]','80'); f.click('[data-diagnostic-action="check"]');
      const submission=f.progress.exerciseEvidence[f.ui.key(f.item)].diagnostic.submissions.at(-1);
      assert.deepEqual(Array.from(submission.recommendations),[entry],`${id} recommends only its limited entry`);
      assert(Buffer.byteLength(submission.snapshot,'utf8')<=400,`${id} snapshot stays within the prediction limit`);
      assert.equal(submission.independent,true);
    } finally {f.dom.window.close();}
  }
});

function fixture(id, record = null) {
  const dom = new JSDOM('<main id="view"></main>', {runScripts:'outside-only',url:'http://localhost'});
  dom.window.HTMLElement.prototype.scrollIntoView = function () {};
  for (const file of ['diagnostic-preparation.js','diagnostic-ui.js','learning-paths.js']) {
    dom.window.eval(withPublicDependencies(readFileSync(new URL(file,root),'utf8')));
  }
  const item = catalog.find(entry => entry.id === id), ui=dom.window.DevPathDiagnosticUI, progress={exerciseLearning: record ? {[id]:record} : {}}, view=dom.window.document.querySelector('#view');
  const calls = [];
  const ctx = {
    progress, activities:catalog,
    learning:{record:()=>progress.exerciseLearning[id],requestHelp:async (...args)=>{calls.push(['help',...args]); if(progress.exerciseLearning[id]) progress.exerciseLearning[id].assisted=true;},submitStudy:async (...args)=>{calls.push(['study',...args]);},runAssessment:async()=>{calls.push(['assessment']);}},
    saveProgress(){assert.doesNotThrow(()=>JSON.stringify(progress));},
    render(){view.innerHTML=dom.window.DevPathLearningPaths.decorate(item,ui.render(item,ctx),ctx);}
  };
  const click = selector => ui.handleClick({target:view.querySelector(selector),preventDefault(){}},item,ctx);
  const input = (selector,value) => {const target=view.querySelector(selector); if(target.type==='checkbox')target.checked=value;else target.value=value; ui.handleInput({type:target.type==='checkbox'?'change':'input',target},item,ctx);};
  ctx.render(); return {dom,item,ui,progress,view,ctx,calls,click,input};
}

test('unknown and wrong answers can be studied but never recommend an entry', () => {
  const f=fixture('D.06',{mode:'recall',state:'attempted',attemptId:'attempt-unknown',attemptIndependent:true,assisted:false});
  try {
    f.click('[data-diagnostic-action="unknown"]');
    f.click('[data-diagnostic-action="check"]');
    assert(f.view.querySelector('[data-diagnostic-feedback]')?.textContent.includes('Ainda não sei'));
    assert.equal(f.progress.exerciseEvidence[f.ui.key(f.item)].diagnostic.submissions.at(-1).recommendations.length,0);
    assert.equal(f.progress.exerciseLearning['D.06'].state,'attempted');
    assert.equal(f.calls.some(call=>call[0]==='assessment'),false,'study feedback does not invent an assessment');
    f.input('[data-diagnostic-reviewed]',true);
    f.click('[data-diagnostic-action="complete"]');
    assert.equal(f.progress.answers['D.06'],true,'unknown answers can complete the study activity');
    const study=f.calls.find(call=>call[0]==='study');
    assert.equal(study[2],f.progress.exerciseEvidence[f.ui.key(f.item)].output,'study uses the exact submitted snapshot when reflection is too short');
  } finally {f.dom.window.close();}
});

test('a plausible but incorrect prediction keeps feedback available and blocks the mapped entry', () => {
  const record={mode:'recall',state:'attempted',attemptId:'attempt-error',attemptIndependent:true,assisted:false};
  const f=fixture('D.07',record);
  try {
    for (const [index,field] of diagnosticPreparation['D.07'].fields.entries()) f.input(`[data-diagnostic-field="${index}"]`,field.expected);
    f.input('[data-diagnostic-field="0"]','3');
    f.input('[data-diagnostic-confidence]','90');
    f.click('[data-diagnostic-action="check"]');
    assert(f.view.querySelector('[data-diagnostic-feedback]')?.textContent.includes('Este caso mostra'));
    assert.deepEqual(Array.from(f.progress.exerciseEvidence[f.ui.key(f.item)].diagnostic.submissions.at(-1).recommendations),[]);
  } finally {f.dom.window.close();}
});

test('out-of-order synchronous output blocks the foundational entry but still shows the explanation', () => {
  const record={mode:'recall',state:'attempted',attemptId:'attempt-order',attemptIndependent:true,assisted:false};
  const f=fixture('D.06',record);
  try {
    for (const [index,field] of diagnosticPreparation['D.06'].fields.entries()) {
      const answer=index===0 ? field.options.find(option=>option.value!==field.expected&&option.value!=='unknown').value : field.expected;
      f.input(`[data-diagnostic-field="${index}"]`,answer);
    }
    f.input('[data-diagnostic-confidence]','80'); f.click('[data-diagnostic-action="check"]');
    const submission=f.progress.exerciseEvidence[f.ui.key(f.item)].diagnostic.submissions.at(-1);
    assert.equal(submission.coverage['00.01'],false);
    assert.deepEqual(Array.from(submission.recommendations),[]);
    assert(f.view.querySelector('[data-diagnostic-feedback]')?.textContent.includes('Resposta explicada:'));
  } finally {f.dom.window.close();}
});

test('alias and shallow-copy misconceptions block the competencies they are meant to cover', () => {
  for (const [id,index] of [['D.07',2],['D.07',3],['D.08',2],['D.08',3],['D.08',4],['D.08',5]]) {
    const record={mode:'recall',state:'attempted',attemptId:`attempt-${id}-${index}`,attemptIndependent:true,assisted:false};
    const f=fixture(id,record);
    try {
      for (const [fieldIndex,field] of diagnosticPreparation[id].fields.entries()) {
        const answer=fieldIndex===index ? field.options.find(option=>option.value!==field.expected&&option.value!=='unknown').value : field.expected;
        f.input(`[data-diagnostic-field="${fieldIndex}"]`,answer);
      }
      f.input('[data-diagnostic-confidence]','80'); f.click('[data-diagnostic-action="check"]');
      const submission=f.progress.exerciseEvidence[f.ui.key(f.item)].diagnostic.submissions.at(-1);
      assert.equal(submission.coverage[id==='D.07'?'05.01':'06.01'],false,`${id} field ${index} should leave the alias/reference competency uncovered`);
      assert.deepEqual(Array.from(submission.recommendations),[]);
      assert(f.view.querySelector('[data-diagnostic-feedback]')?.textContent.includes('Resposta explicada:'));
    } finally {f.dom.window.close();}
  }
});

test('help requested before submitting blocks eligibility while preserving study feedback', () => {
  const record={mode:'recall',state:'attempted',attemptId:'attempt-help',attemptIndependent:true,assisted:true};
  const f=fixture('D.08',record);
  try {
    for (const [index,field] of diagnosticPreparation['D.08'].fields.entries()) f.input(`[data-diagnostic-field="${index}"]`,field.expected);
    f.input('[data-diagnostic-confidence]','75');
    f.click('[data-diagnostic-action="check"]');
    const submission=f.progress.exerciseEvidence[f.ui.key(f.item)].diagnostic.submissions.at(-1);
    assert.equal(submission.assisted,true);
    assert.deepEqual(Array.from(submission.recommendations),[]);
    assert(f.view.querySelector('[data-diagnostic-feedback]')?.textContent.includes('Resposta explicada:'));
  } finally {f.dom.window.close();}
});

test('only a correct, complete, unassisted recall recommends its mapped entry and survives reload', () => {
  const record={mode:'recall',state:'attempted',attemptId:'attempt-pass',attemptIndependent:true,assisted:false};
  const f=fixture('D.06',record);
  try {
    for (const [index,field] of diagnosticPreparation['D.06'].fields.entries()) f.input(`[data-diagnostic-field="${index}"]`,field.expected);
    f.input('[data-diagnostic-confidence]','80');
    f.click('[data-diagnostic-action="check"]');
    const evidence=f.progress.exerciseEvidence[f.ui.key(f.item)];
    assert.deepEqual(Array.from(evidence.diagnostic.submissions.at(-1).recommendations),['01.01']);
    assert.equal(evidence.diagnostic.submissions.at(-1).attemptId,'attempt-pass');
    assert.equal(evidence.runResult,'guided');
    assert.equal(f.progress.exerciseLearning['D.06'].verifiedEvidence,undefined);
    f.input('[data-diagnostic-reflection]','Quero revisar a diferença entre número e texto.');
    assert.equal(f.view.querySelector('[data-diagnostic-feedback]')?.textContent.includes('Resposta explicada:'),true,
      'reflection does not invalidate the submitted answer');
    const restored=JSON.parse(JSON.stringify(f.progress));
    f.view.innerHTML=f.dom.window.DevPathLearningPaths.decorate(f.item,f.ui.render(f.item,{...f.ctx,progress:restored}),{...f.ctx,progress:restored});
    assert(f.view.querySelector('[data-diagnostic-feedback]')?.textContent.includes('Resposta explicada:'));
  } finally {f.dom.window.close();}
});

test('post-feedback edit marks only the new answer assisted; reverting and a new recall cannot reuse the old snapshot', async () => {
  const record={mode:'recall',state:'attempted',attemptId:'attempt-edit',attemptIndependent:true,assisted:false};
  const f=fixture('D.06',record);
  try {
    for (const [index,field] of diagnosticPreparation['D.06'].fields.entries()) f.input(`[data-diagnostic-field="${index}"]`,field.expected);
    f.input('[data-diagnostic-confidence]','60'); f.click('[data-diagnostic-action="check"]');
    const evidence=f.progress.exerciseEvidence[f.ui.key(f.item)], original=evidence.diagnostic.submissions.at(-1);
    const first=f.view.querySelector('[data-diagnostic-field="0"]');
    f.input('[data-diagnostic-field="0"]',diagnosticPreparation['D.06'].fields[0].options.find(o=>o.value!==first.value&&o.value!=='unknown').value);
    await Promise.resolve();
    assert.equal(f.calls.filter(call=>call[0]==='help').length,1);
    const afterEdit=f.ui.readState(f.item,f.progress);
    const originalAnswers=JSON.parse(original.snapshot).a;
    f.input('[data-diagnostic-field="0"]',originalAnswers[0]);
    assert.equal(f.view.querySelector('[data-diagnostic-finish]').hidden,true,'reverting answers cannot reopen old feedback');
    f.click('[data-diagnostic-action="check"]');
    const editedEvidence=f.progress.exerciseEvidence[f.ui.key(f.item)];
    const assisted=editedEvidence.diagnostic.submissions.at(-1);
    assert.equal(assisted.attemptId,'attempt-edit');
    assert.equal(assisted.assisted,true);
    assert.deepEqual(Array.from(editedEvidence.diagnostic.submissions[0].recommendations),['01.01'],'the earlier submission remains historical evidence');
    assert.deepEqual(Array.from(editedEvidence.diagnostic.assistedAttemptIds),['attempt-edit']);
    assert.notEqual(afterEdit.answers[0],originalAnswers[0]);

    const restored=JSON.parse(JSON.stringify(f.progress));
    const restoredCtx={...f.ctx,progress:restored,render:()=>{f.view.innerHTML=f.dom.window.DevPathLearningPaths.decorate(f.item,f.ui.render(f.item,{...f.ctx,progress:restored}),{...f.ctx,progress:restored});}};
    restoredCtx.render();
    assert.equal(f.view.querySelector('[data-diagnostic-finish]').hidden,false,'the new assisted feedback survives reload');
    assert.equal(restored.exerciseEvidence[f.ui.key(f.item)].diagnostic.submissions.at(-1).assisted,true);

    f.progress.exerciseLearning['D.06']={...record,attemptId:'attempt-new',assisted:false};
    f.ctx.render();
    assert.equal(f.view.querySelector('[data-diagnostic-finish]').hidden,true,'a new recall needs an explicit submission');
    f.click('[data-diagnostic-action="check"]');
    assert.equal(f.progress.exerciseEvidence[f.ui.key(f.item)].diagnostic.submissions.at(-1).attemptId,'attempt-new');
    assert(f.view.querySelector('[data-diagnostic-feedback]')?.textContent.includes('Resposta explicada:'));
  } finally {f.dom.window.close();}
});
