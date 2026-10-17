// Authoring sync confined to 24.02; never exports internal reference/mutations.
import {readFileSync, writeFileSync, mkdirSync, cpSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
const read = p => JSON.parse(readFileSync(path.join(root, p), 'utf8'));
const write = (p, value) => writeFileSync(path.join(root, p), JSON.stringify(value, null, 2) + '\n');
const files = ['package.json','package-lock.json','README.md','contract.md','ADR-001.md','ticket.md','change-request.md','incident.md','postmortem.md','manual-test-plan.md','migrations/001-core.sql','migrations/002-sessions.sql','src/cli.mjs','src/server.mjs','src/passwords.mjs','src/schema-bridge.mjs','src/schema.mjs','src/store.mjs','src/service.mjs','src/hono.mjs','scripts/check.mjs','scripts/test.mjs','scripts/test-workspace.mjs','maintenance/report.mjs','test/contract.test.mjs','test/maintenance.test.mjs'];
for (const file of files) {
  const target = path.join(root, 'course-src/starters/24.02', file);
  mkdirSync(path.dirname(target), {recursive: true});
  cpSync(path.join(root, 'course-src/phase7/backend', file), target);
}
const manifest = read('course-src/starters/manifest.json');
manifest['24.02'] = {version: 1, files};
write('course-src/starters/manifest.json', manifest);
const commands = [['npm','ci'],['npm','run','build'],['npm','run','test:schema'],['npm','run','test'],['npm','run','test:maintenance'],['npm','run','test:incident']];
const checkpoint = {
  id:'24.02', stage:'24', activityIds:['24.02'], environment:'Node.js >=24.15.0; SQLite RC; HTTP loopback', title:'Back-end: API privada persistente e port Hono',
  instructions:['Implemente service/schema/transação/Hono conforme contract.md; starter falha por asserções.', 'Use Node >=24.15.0; SQLite é RC, não Stability 2.', 'Complete também os blocos e rubricas24.01 e registre evidência local-declared.'],
  commands, powershellCommands:commands.map(([cmd,...args])=>[cmd==='npm'?'npm.cmd':cmd,...args]),
  expected:['Starter reprovado por asserções até a implementação; schema/HTTP/SQLite/rollback e manutenção passam após completar o contrato.', 'Hono via adaptador Node e node:http cumprem os mesmos cenários; SQLite temporário e listeners são encerrados.', 'Falha ambiental/import/instalação/timeout não conta como reprovação do aluno nem mutante morto.'],
  troubleshooting:['Use caminho curto no Windows; confira node --version >=24.15.0.', 'npm ci precisa de registry/cache e lockfile genuíno. Nenhuma instalação na raiz do curso.', 'Loopback deve permitir conexão na porta efêmera. Não aceite skip como evidência.', 'Não há navegador obrigatório nesta API; E2E web pertence a24.01.'],
  evidence:['comandos/saídas e Node/SO','testes e diff','ticket, README e ADR','B-25 antes/depois','I-24 e postmortem','plano manual e limites'],
  evidenceLabel:'learner-declared', gitStep:{required:false,reason:'Entrega local sem commit/publicação obrigatórios.'},
  reviewStep:{required:true,steps:['Compare a execução com o contrato e registre o que não foi executado.','Revise o teste manual, incidente e mudança com as quatro rubricas comuns24.01.','Não promova a evidência local-declared para demonstrated.']},
  package:read('course-src/phase7/backend/package.json'), packageLock:read('course-src/phase7/backend/package-lock.json'),
};
const checkpoints = read('course-src/local-checkpoints.json');
const index = checkpoints.targets.findIndex(x=>x.id==='24.02');
if(index<0) checkpoints.targets.push(checkpoint); else checkpoints.targets[index]=checkpoint;
write('course-src/local-checkpoints.json',checkpoints);
const assessments = read('course-src/assessments.json');
assessments['24.02']={environment:'local',version:1,checks:['local'],local:{commands,evidence:checkpoint.evidence,evidenceLabel:'local-declared'},rubric:['API node:http e Hono: contratos HTTP/DB reais, duas entidades relacionadas e isolamento por usuário.','Schema baseado em22.06 executado; SQLite migrações/transação e rollback; autenticação scrypt, sessão aleatória/expirada/encerrada, autorização e problemas RFC9457.','Entrada limitada, SQL parametrizado, logs/erros sem segredos e shutdown; testes negativos, regressão e técnica adicional justificada.','Mudança B-25 e incidente I-24 com reprodução antes/depois, README/ADR/postmortem e quatro blocos/rubricas de24.01.'],prompt:'Implemente/exporte a API e declare a evidência e seus limites.',evidenceNote:'local-declared: testes internos de referência/mutantes não executam o projeto submetido pelo aluno nem conferem rubricas.'};
write('course-src/assessments.json',assessments);
const metadata=read('course-src/learning-metadata.json');
const direct=['12.16','13.03','14.03','14.18','22.06','24.01'];
const chains=new Map();
const visit=(id,chain)=> { if(chains.has(id))return; chains.set(id,chain); for(const dep of metadata[id]?.requires||[])visit(dep,[...chain,dep]); };
for(const id of direct)visit(id,['24.02',id]);
metadata['24.02']={requires:[...chains.keys()].sort()};
write('course-src/learning-metadata.json',metadata);
const map=read('course-src/phase7/competency-map.json');
map.status='complete-local-curriculum';
map.activities['24.02']={status:'implemented',scope:['7.1','7.4'],evidence:'local-declared',prerequisites:direct,prerequisiteClosure:[...chains].sort(([a],[b])=>a.localeCompare(b)).map(([id,chain])=>({id,origin:direct.includes(id)?'direct':'transitive',evidence:{chain,source:'course-src/learning-metadata.json requires edges'}})),practiceMinutes:{minimum:1800,maximum:2700,estimate:2250,calibrated:false},authoringEstimateHours:{implementation:[12,20],review:[4,8],note:'Planning hypotheses, record actuals separately'},toolchain:{node:'>=24.15.0',sqliteStability:'1.2 Release candidate',source:'https://nodejs.org/download/release/v24.15.0/docs/api/sqlite.html',packageLockStatus:'available'},tests:['test/contract.test.mjs','test/maintenance.test.mjs','scripts/verify-fixtures.mjs'],limits:['Local-declared only','No production HTTPS/browser/cross-platform signal proof','Manual plan and account synchronization require separate homologation']};
map.activities['24.02'].security={asvsVersion:'5.0.0',source:map.asvs.source,note:'Teaching subset; no complete ASVS certification. Common fixture controls remain scoped to24.01.',controls:[
  {id:'v5.0.0-V1.2.4',control:'Bound SQL parameters and a hostile project name preserved as text',test:'test/contract.test.mjs'},
  {id:'v5.0.0-V11.4.2',control:'crypto.scrypt salted hashes and timing-safe verification; no production parameter sizing claim',test:'test/contract.test.mjs'},
  {id:'v5.0.0-V11.5.1',control:'CSPRNG 256-bit session token, expiry and revocation; digest persisted',test:'test/contract.test.mjs'},
  {id:'v5.0.0-V16.2.5',control:'Selected log metadata omits sentinels in password/token/body/query',test:'test/contract.test.mjs'},
  {id:'local-resource-authorization',control:'Anonymous, other owner, expired and ended sessions on projects and related tasks',test:'test/contract.test.mjs'},
  {id:'local-input-bounds',control:'Zod strict schema, JSON syntax, byte limit, media type, fixed loopback, no browser Origin',test:'test/contract.test.mjs'}
],notApplicable:[{control:'cookie attributes and CSRF',reason:'API accepts explicit Bearer Authorization, no cookie authentication and refuses Origin; browser-cookie practice remains mandatory24.01'},{control:'DOM/CSP, upload, external command, outbound URL/SSRF',reason:'No browser UI, upload, shell input, URL fetching or eval route; these common controls remain in24.01'}]};
const competence={id:'7.1',title:'Back-end persistente',reused:[{activityId:'22.06',competency:'guard manual e schema na fronteira; execução Zod é acrescentada em24.02'},{activityId:'12.16',competency:'leitura HTTP/CORS não equivale a autoria de API'},{activityId:'13.03',competency:'erros assíncronos'},{activityId:'14.03',competency:'Node e módulos'}],introduced:[{activityId:'24.02',evidenceKind:'lesson-and-contract',path:'course-src/phase7/backend/contract.md',objectives:['HTTP routing','SQLite migrations and atomicity','password/session authorization','RFC9457','Hono Node adapter']}],practiced:[{activityId:'24.02',evidenceKind:'student-local-implementation',paths:['src/service.mjs','src/schema.mjs','src/store.mjs','src/hono.mjs','maintenance/report.mjs']}],assessed:[{activityId:'24.02',evidenceKind:'local-declared',paths:['test/contract.test.mjs','test/maintenance.test.mjs','manual-test-plan.md'],teamGate:'scripts/test-phase7-backend.mjs',note:'Team reference/mutation runs are not assessment of learner submission.'}]};
const ci=map.competencies.findIndex(x=>x.id==='7.1'); if(ci<0)map.competencies.push(competence);else map.competencies[ci]=competence;
write('course-src/phase7/competency-map.json',map);
const runtimePath=path.join(root,'course-src/runtime-baseline.json');
const runtimeText=readFileSync(runtimePath,'utf8');
if(!runtimeText.includes('"node-sqlite-rc"')) writeFileSync(runtimePath,runtimeText.replace('"git": "Git (versão estável atual)"','"git": "Git (versão estável atual)",\n    "node-sqlite-rc": "Node.js >=24.15.0 · SQLite Stability 1.2 Release candidate · módulos ES"'));
const matrix=read('course-src/feature-matrix.json');
const sqlite={label:'node:sqlite / DatabaseSync',edition:'Node platform API',match:['node:sqlite','DatabaseSync'],nodeVersionAdded:'22.5.0',chromeVersionAdded:'não suportado',compatibility:'node:sqlite / DatabaseSync existe desde22.5.0; 24.02 exige >=24.15.0 para Stability1.2 RC, não Stability2.',availableInLocalNode26:true,sourceType:'web-node-api',fonte:'https://nodejs.org/download/release/v24.15.0/docs/api/sqlite.html'};
const si=matrix.entries.findIndex(x=>x.label===sqlite.label);if(si<0)matrix.entries.push(sqlite);else matrix.entries[si]=sqlite;write('course-src/feature-matrix.json',matrix);
const exercise=read('course-src/exercise_index.json'); if(!exercise.some(x=>x.id==='24.02'))exercise.push({id:'24.02',title:'Back-end: API privada persistente e port Hono',stage:'24',kind:'PROJECT',origin:'third_edition',audit_ids:[],prompt:'Implemente API node:http/SQLite e fatia Hono; execute o checkpoint e registre evidência local-declared.'});write('course-src/exercise_index.json',exercise);
console.log(`24.02 synchronized: ${files.length} learner files; ${chains.size} prerequisite IDs. Internal reference excluded.`);
