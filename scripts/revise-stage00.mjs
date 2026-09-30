import {readFileSync,writeFileSync} from 'node:fs';
const root=new URL('../',import.meta.url);
const source=JSON.parse(readFileSync(new URL('stage00-content.json',import.meta.url),'utf8'));
const catalogPath=new URL('public/course-catalog.json',root);
const catalog=JSON.parse(readFileSync(catalogPath,'utf8'));
for(const item of catalog.filter(item=>item.stage==='00')){
  const p=source[item.id];if(!p)throw Error(`Missing teaching content ${item.id}`);
  item.contentVersion=Math.max(item.contentVersion||1,3);
  item.title=p.title;item.objective=p.mental;item.prompt=p.prompt;item.interaction=p.response;
  item.firstResponse={action:p.response,timing:p.mode==='debug'?'Depois de ler a explicação e executar o arquivo intacto, antes da primeira alteração.':p.mode==='written'?'Depois de ler a explicação e o exemplo resolvido, antes de preencher sua análise.':'Depois de ler a explicação e o exemplo resolvido, antes de executar sua tentativa.'};
  item.explanation={mental_model:p.mental,worked_example:p.example.walkthrough.join(' '),common_trap:item.explanation.common_trap,why_it_matters:item.explanation.why_it_matters};
  item.preparation=p;item.rubric=p.rubric;item.resources=p.docs.map(doc=>`${doc.title}: ${doc.url}. ${doc.task}`);
  item.review=p.review;
  if(p.starterFiles)item.starterFiles=p.starterFiles;
  // Learner criteria are the relevant ones for this introductory revision.
  item.constraints=[];
}
writeFileSync(catalogPath,JSON.stringify(catalog));
console.log('Stage 00 teaching content applied to all 9 activities.');
