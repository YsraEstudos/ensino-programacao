import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import path from 'node:path';
const manifest=JSON.parse(readFileSync('course-src/assessments.json','utf8'));
const ids=Object.keys(manifest).filter(id=>/^(20|21|22|23)\.\d{2}$/.test(id)).sort();
for(const id of ids){
 const a=manifest[id],dir=path.join('course-src',a.referenceDir),file=path.join(dir,'README.md');
 mkdirSync(dir,{recursive:true});
 const transfer=a.transfer?.files?.map(entry=>entry.content).join('\n\n')||'';
 const rubric=a.rubric||a.transfer?.rubric||[];
 let current=existsSync(file)?readFileSync(file,'utf8'):'';
 if(!current.trim())current=`# ${id} — Referência de avaliação\n\n## Contrato observado\n\nAvalie este ID com o ambiente ${a.environment} e as verificações declaradas: ${a.checks.join(', ')}. Os arquivos de referência são: ${(a.correctFiles||[]).map(x=>x.path).join(', ')||'material de rubrica e evidência local'}. A referência preserva o contrato authored indicado nos arquivos e no enunciado.\n`;
 if(transfer&&!current.includes(transfer))current+=`\n## Transferência independente\n\n${transfer}\n`;
 if(rubric.length&&!current.includes('## Critérios observáveis da avaliação'))current+=`\n## Critérios observáveis da avaliação\n\n${rubric.map(value=>`- ${value}`).join('\n')}\n`;
 if(a.local?.commands?.length&&!current.includes('## Verificação local'))current+=`\n## Verificação local\n\n${a.local.commands.map(command=>command.join(' ')).join('\n\n')}\n\nLimite: esta evidência é local/contida e não representa aprovação de navegador nem publicação.\n`;
 else if(!a.local?.commands?.length&&!current.includes('## Verificação'))current+=`\n## Verificação\n\nA evidência depende do executor ${a.environment}; erros de infraestrutura, suíte vazia ou timeout não aprovam a tentativa.\n`;
 writeFileSync(file,current.endsWith('\n')?current:current+'\n');
}
console.log(`Ensured authored README references for ${ids.length} assessment IDs.`);
