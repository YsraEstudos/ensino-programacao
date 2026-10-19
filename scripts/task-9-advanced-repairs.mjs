import {readFileSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {tmpdir} from 'node:os';
import {replaceContractBlock} from './task-9-contract-block.mjs';

// This generator is intentionally the last task-9 source pass.
const root = path.resolve(process.cwd());
const scratch = path.resolve(tmpdir()).toLowerCase();
if (!root.toLowerCase().startsWith(scratch + path.sep.toLowerCase())) {
  throw new Error('Run task-9-advanced-repairs only in a temporary copy.');
}
const manifestPath = 'course-src/assessments.json';
const data = JSON.parse(readFileSync(manifestPath, 'utf8'));
const overridesPath = 'course-src/publication-overrides.json';
const overrides = JSON.parse(readFileSync(overridesPath, 'utf8'));
const resolved = JSON.parse(readFileSync('course-src/.generated/resolved_preview.json', 'utf8'));
const lessonPrompts = new Map(resolved.map(record => [record.id, record.learner?.prompt]).filter(([, prompt]) => prompt));
const put = (file, content) => writeFileSync(file, content.trimEnd() + '\n');
function reference(id, file, content) {
  put('course-src/solutions/' + id + '/' + file, content);
  const entry = data[id].correctFiles.find(value => value.path === file);
  if (!entry) throw new Error(id + ': absent reference ' + file);
  entry.content = content;
}
function suite(id, content) {
  put('course-src/tests/' + id + '.test.js', content);
  data[id].tests = content;
}
function contract(id, file, lines) {
  const filename = 'course-src/starters/' + id + '/' + file;
  const old = readFileSync(filename, 'utf8');
  const marker = '// Contrato visível ' + id + ':';
  const updatedStarter = replaceContractBlock(old, marker, lines);
  if (updatedStarter !== old) put(filename, updatedStarter);
  const promptMarker = '\n\nContrato da entrega (' + id + '):\n';
  const updatePrompt = prompt => {
    const markerText = promptMarker.trim();
    const index = prompt.indexOf(markerText);
    const block = markerText + '\n' + lines.map(line => '- ' + line).join('\n');
    return index < 0 ? prompt.trimEnd() + promptMarker + lines.map(line => '- ' + line).join('\n') : prompt.slice(0, index) + block;
  };
  data[id].prompt = updatePrompt(data[id].prompt);
  const publicPrompt = overrides[id]?.prompt || lessonPrompts.get(id) || data[id].prompt;
  overrides[id] = {...overrides[id], prompt: updatePrompt(publicPrompt)};
}
function starterAppend(id, file, content) {
  const filename = 'course-src/starters/' + id + '/' + file;
  const old = readFileSync(filename, 'utf8');
  if (old.includes('// Avaliação visível: implementação pendente') || (id === '20.01' && old.includes('export function percorrer()'))) return;
  put(filename, old + '\n// Avaliação visível: implementação pendente\n' + content);
}
const pipeline = [
  'export function pipeline(source) {',
  '  return {',
  '    map(fn) {',
  '      const input = this;',
  '      return pipeline({ *[Symbol.iterator]() { for (const value of input) yield fn(value); } });',
  '    },',
  '    filter(predicate) {',
  '      const input = this;',
  '      return pipeline({ *[Symbol.iterator]() { for (const value of input) if (predicate(value)) yield value; } });',
  '    },',
  '    take(count) {',
  "      if (!Number.isInteger(count) || count < 0) throw new RangeError('take requer inteiro não negativo');",
  '      const input = this;',
  '      return pipeline({ *[Symbol.iterator]() {',
  '        if (count === 0) return;',
  '        const iterator = input[Symbol.iterator]();',
  '        try {',
  '          for (let accepted = 0; accepted < count; accepted++) {',
  '            const step = iterator.next();',
  '            if (step.done) return;',
  '            yield step.value;',
  '          }',
  '        } finally { iterator.return?.(); }',
  '      } });',
  '    },',
  '    [Symbol.iterator]() { return source[Symbol.iterator](); },',
  '  };',
  '}',
].join('\n');
reference('20.08', 'pipeline.js', pipeline);
suite('20.08', data['20.08'].tests + '\n' +
  "test('take posicional e ramos independentes',()=>{const base=pipeline([1,2,3,4]);expect([...base.take(2).map(x=>x*10)]).toEqual([10,20]);expect([...base.filter(x=>x%2===0).take(2)]).toEqual([2,4]);expect([...base]).toEqual([1,2,3,4]);});\n" +
  "test('break fecha a fonte',()=>{let closed=false;function* input(){try{yield 1;yield 2;}finally{closed=true;}}for(const value of pipeline(input()).map(x=>x).filter(Boolean))break;expect(closed).toBe(true);});\n" +
  "test('array reinicia, mesma instância generator pode estar consumida, fábrica cria nova instância',()=>{const array=pipeline([1,2]);expect([...array]).toEqual([1,2]);expect([...array]).toEqual([1,2]);function* items(){yield 1;yield 2;}const instance=pipeline(items());expect([...instance]).toEqual([1,2]);expect([...instance]).toEqual([]);const makeItems=()=>items();expect([...pipeline(makeItems())]).toEqual([1,2]);expect([...pipeline(makeItems())]).toEqual([1,2]);});\n" +
  "test('take fecha com return sem pull extra depois do limite',()=>{const trace=[];function* input(){try{for(let n=1;n<=3;n++){trace.push('pull:'+n);yield n;}}finally{trace.push('return');}}expect([...pipeline(input()).take(2)]).toEqual([1,2]);expect(trace).toEqual(['pull:1','pull:2','return']);});");
const clockCode = [
  'export function debounce(fn, wait, relogio = {setTimeout, clearTimeout}) {',
  '  let timer;',
  '  const schedule = relogio.setTimeout ?? relogio.set;',
  '  const cancel = relogio.clearTimeout ?? relogio.clear;',
  '  const wrapped = (...args) => {',
  '    if (timer !== undefined) cancel(timer);',
  '    timer = schedule(() => { timer = undefined; fn(...args); }, wait);',
  '  };',
  '  wrapped.cancel = () => { if (timer !== undefined) cancel(timer); timer = undefined; };',
  '  return wrapped;',
  '}',
  'export function throttle(fn, wait, relogio = {agora: Date.now}) {',
  '  let last = -Infinity;',
  '  return (...args) => { const now = (relogio.agora ?? relogio.now)(); if (now - last >= wait) { last = now; fn(...args); } };',
  '}',
].join('\n');
reference('21.07', 'tempo.js', clockCode);
suite('21.07', data['21.07'].tests + '\n' +
  "test('100 eventos usam o relogio do starter',()=>{let now=0;const tasks=[];const callsD=[],callsT=[];const clock={agora:()=>now,setTimeout(fn,ms){const task={at:now+ms,fn,cancelled:false};tasks.push(task);return task;},clearTimeout(task){task.cancelled=true;}};const d=debounce(x=>callsD.push([now,x]),100,clock),t=throttle(x=>callsT.push([now,x]),100,clock);for(let i=0;i<100;i++){now=i*10;d(i);t(i);}now=1090;for(const task of tasks)if(!task.cancelled&&task.at<=now)task.fn();expect(callsD).toEqual([[1090,99]]);expect(callsT.map(row=>row[0])).toEqual([0,100,200,300,400,500,600,700,800,900]);d(101);d.cancel();});");
const resource = readFileSync('course-src/solutions/21.08/recurso.js', 'utf8').trimEnd();
if (!data['21.08'].correctFiles.some(entry => entry.path === 'recurso.js')) {
  data['21.08'].correctFiles.push({path: 'recurso.js', content: resource});
}
const starterManifestPath = 'course-src/starters/manifest.json';
const starterManifest = JSON.parse(readFileSync(starterManifestPath, 'utf8'));
if (!starterManifest['21.08'].files.includes('recurso.js')) {
  starterManifest['21.08'].files.push('recurso.js');
}
put('course-src/starters/21.08/recurso.js',
  'export async function usarRecursos(recursos, corpo) {\n  // TODO: executar corpo e descartar recursos em LIFO, mesmo quando ele lançar.\n  return corpo();\n}');
contract('21.08', 'recurso.js', [
  'A suíte complementar usa usarRecursos(recursos, corpo): Promise<valor>.',
  'Descarte em LIFO com Symbol.dispose ou Symbol.asyncDispose, aguardando descartes assíncronos.',
  'Mesmo quando corpo lança, todos os recursos fecham e o erro continua observável.',
]);
const lab = readFileSync('course-src/solutions/21.09/lab.js', 'utf8').trimEnd();
if (!lab.includes('median:s[Math.floor(s.length/2)]')) throw new Error('21.09 median anchor changed');
const compareCode = [
  'export function comparar(input) {',
  "  if (!Array.isArray(input) || input.length === 0 || input.some(x => !Number.isFinite(x))) return {erro:'Entrada inválida: use números finitos.'};",
  '  const a = somaComReduce(input), b = somaComFor(input);',
  "  if (a !== b) return {erro:'Resultados diferentes.'};",
  "  return {resultado:a, reduce:medir(somaComReduce,input), for:medir(somaComFor,input), memory:globalThis.performance?.memory?.usedJSHeapSize??null};",
  '}',
].join('\n');
reference('21.09', 'lab.js', lab.replace('median:s[Math.floor(s.length/2)]',
  'median:s.length%2?s[Math.floor(s.length/2)]:(s[s.length/2-1]+s[s.length/2])/2')
  .replace('export function montarLaboratorio', compareCode + '\nexport function montarLaboratorio'));
const medianTest = "test('mediana de quatro amostras usa a media central',async()=>{const {medir}=await import('./lab.js');let i=0;const times=[0,2,3,7,8,14,15,25];const r=medir(()=>{},[1],{warmups:0,runs:4,now:()=>times[i++]});expect(r.samples).toEqual([2,4,6,10]);expect(r.median).toBe(5);});";
suite('21.09', data['21.09'].tests + '\n' + medianTest);
const flow = readFileSync('course-src/solutions/23.02/fluxo.js', 'utf8').trimEnd();
if (!flow.includes(',causa:error.cause?.message')) throw new Error('23.02 leak anchor changed');
reference('23.02', 'fluxo.js', flow.replace(',causa:error.cause?.message', ''));
const oldAssertion = "expect(r.causa).toBe('disco cheio')";
const newAssertion = "expect(Object.hasOwn(r,'causa')).toBe(false)";
if (!data['23.02'].tests.includes(oldAssertion)) throw new Error('23.02 suite anchor changed');
suite('23.02', data['23.02'].tests.replace(oldAssertion, newAssertion));
for (const check of data['23.02'].assertionCases || []) {
  if (check.assertionExpression !== oldAssertion) continue;
  check.assertionExpression = newAssertion;
  check.inputExpression = "Object.hasOwn(r,'causa')";
  check.expectedExpression = 'false';
  check.contractRule = 'resposta pública sem causa técnica';
  check.investigation = 'Confira que a causa técnica fica no erro interno, sem campo causa na resposta pública.';
}
const visible = {
  '20.01': ['protocolo.js', 'Exporte percorrer(): {primeira:number[], depois:number, segunda:number[], chamadas:number}.', 'A coleta produz primeira=[1,2], depois=3, segunda=[], chamadas=4; o mesmo iterador é consumível uma vez e done:true encerra a coleta.'],
  '20.04': ['proxy.js', 'Exporte observar(target, onRead = () => {}): Proxy; o trap get chama onRead(key) e delega com Reflect.get(target, key, receiver).', 'O getter herdado deve receber o Proxy como this; leituras de símbolo também funcionam.'],
  '20.05': ['validador.js', 'Exporte validarUser(user): Proxy e updateUser(current, patch): novo objeto validado sem mutar current.', 'age deve ser inteiro entre 0 e 150, inclusive; qualquer outro valor lança RangeError antes de gravar. A validação do Proxy é superficial.'],
  '20.06': ['pipelines.js', 'Exporte manualPipeline(iteravel): generator; take(iteravel,count): array; run(): {values:number[],pulls:number,zero:number[]}.', 'run usa [1,2,3,4,5], filtra pares, dobra e pega dois: values=[4,8], pulls=4, zero=[]. take(iteravel,0) não consome a fonte.'],
  '20.09': ['stream.js', 'Exporte criarStream(): {stream:ReadableStream,eventos:Array} e consumirLento(source,wait=0): Promise<{values:number[],eventos:Array}>.', 'Leia 1,2,3 e cancele com motivo "consumidor terminou"; cada evento pull registra desiredSize numérico.'],
  '20.10': ['bytes.js', 'Exporte medirTexto(text): {textLength:number,byteLength:number,bytes:Uint8Array,decoded:string} e decodificar(bytes,{fatal=false}={}): string.', 'byteLength conta UTF-8; UTF-8 inválido lança TypeError no modo fatal e insere U+FFFD no modo padrão.'],
  '20.08': ['pipeline.js', 'Exporte pipeline(source), cujo builder oferece map(fn), filter(predicate), take(count) e [Symbol.iterator]().', 'Cada encadeamento é lazy e imutável; take(2) limita dois valores aceitos e sair do for...of chama return() na fonte.'],
  '21.09': ['lab.js', 'Exporte comparar(input) para validar números finitos, comparar os totais e medir reduce/for; medir(fn,input,{warmups,runs,now}) retorna samples e median.', 'Com número par de amostras, median é a média dos dois valores centrais ordenados.'],
  '21.07': ['tempo.js', 'Implemente debounce(fn, ms, relogio) e throttle(fn, ms, relogio).', 'No cronograma de quatro eventos do starter (t=0,20,40,160), debounce trailing chama em t=140,260 e throttle leading em t=0,160.', 'Em cenário separado de 100 eventos (t=0,10,...,990), debounce trailing chama em t=1090 com valor 99 e throttle leading em t=0,100,...,900.', 'Throttle leading aceita na borda quando t - última chamada >= 100; debounce trailing dispara ao avançar o relógio até o prazo após o último evento.'],
  '21.05': ['primos.js', 'Exporte contarPrimos(n): número de primos até n, inclusive.', 'n negativo, fracionário, NaN, Infinity ou texto lança RangeError com message "n must be a nonnegative integer".'],
  '21.06': ['metadados.js', 'Exporte criarCache(calcular): {metaDe(node),calculos}; cachePorId(): Map.', 'criarCache memoiza por identidade de objeto em WeakMap; cachePorId aceita IDs string.'],
  '22.04': ['patch.js', 'Exporte first(xs) e migrar(xs): migrar usa a função explícita; array vazio produz undefined.', 'Não modifique Array.prototype nem adicione propriedade enumerável.'],
  '22.05': ['a.js', 'Exporte executar(json): número. Para {"quantidade":3,"preco":5}, devolve 15.', 'JSON inválido lança SyntaxError; quantidade que não seja inteira lança TypeError antes de produzir resultado.'],
  '23.02': ['fluxo.js', 'Exporte criarServico(repo) com criarPedido(raw), e responder(servico,raw): Promise<{status,corpo}>.', '400 não persiste; 500 tem mensagem genérica e não traz cause/causa pública. A causa original permanece disponível no erro interno.'],
  '23.03': ['contrato.js', 'Exporte ValidationError(campo,mensagem), StorageError(mensagem,cause) e criarTarefa(entrada,repositorio,criarId): Promise<Tarefa>.', 'Normalize título, valide prazo ISO real antes de salvar e use status a-fazer. Entrada inválida não chama salvar; falha do repositório vira StorageError com a mesma referência em cause.'],
  '23.09': ['operacao.js', 'Exporte lerLogs(): cópia dos eventos e limparLogs(): remove eventos entre testes.', 'Resposta pública informa apenas falha e ID; log interno preserva causa técnica útil com Authorization, Cookie e Token redigidos em campos aninhados, sem mutar a entrada.'],
};
for (const [id, [file, ...lines]] of Object.entries(visible)) contract(id, file, lines);
starterAppend('20.04', 'proxy.js', 'export function observar(target, onRead = () => {}) { return new Proxy(target, {get(obj,key,receiver) { onRead(key); return receiver[key]; }}); }');
starterAppend('20.01', 'protocolo.js', 'export function percorrer() {\n  const itens = [{value:1,done:false},{value:2,done:false},{value:"fim",done:true}];\n  let chamadas = 0;\n  const iterador = {next() { const resultado = itens[chamadas] ?? {value:undefined,done:true}; chamadas++; return resultado; }, [Symbol.iterator]() { return this; }};\n  const primeira = [...iterador];\n  const depois = chamadas;\n  const segunda = [...iterador];\n  return {primeira,depois,segunda,chamadas};\n}');
put('course-src/starters/20.01/protocolo.js', readFileSync('course-src/starters/20.01/protocolo.js', 'utf8').replace('// Avaliação visível: implementação pendente', '// Instrumento de observação para registrar a sequência descrita.'));
const validatorStarter = 'course-src/starters/20.05/validador.js';
put(validatorStarter, readFileSync(validatorStarter, 'utf8').replace('function updateUser(atual, patch)', 'export function updateUser(current, patch)'));
starterAppend('20.05', 'validador.js', 'export function validarUser(user) { return new Proxy(user, {set(target,key,value,receiver) { /* TODO: validar age antes de gravar. */ return Reflect.set(target,key,value,receiver); }}); }');
const pipelineStarter = 'course-src/starters/20.06/pipelines.js';
let pipelineStarterText = readFileSync(pipelineStarter, 'utf8').replace(/^function\* manualPipeline\(iteravel\)/m, 'export function* manualPipeline(iteravel)');
if (!pipelineStarterText.includes('// API pública visível 20.06')) {
  pipelineStarterText += '\n\n// API pública visível 20.06\nexport function take(iteravel, count) { /* TODO: retornar no máximo count valores sem consumir quando count é zero. */ return []; }\nexport function run() { /* TODO: usar a fonte descrita acima. */ return {values: [], pulls: 0, zero: []}; }';
}
put(pipelineStarter, pipelineStarterText);
starterAppend('20.09', 'stream.js', 'export function criarStream() { /* TODO: retornar {stream,eventos}. */ return {stream: null, eventos: []}; }\nexport async function consumirLento(source, wait = 0) { /* TODO: ler e cancelar o reader. */ return {values: [], eventos: []}; }');
starterAppend('20.10', 'bytes.js', 'export function medirTexto(text) { return {textLength:text.length, byteLength:text.length, bytes:new Uint8Array(), decoded:text}; }\nexport function decodificar(bytes, {fatal=false}={}) { return new TextDecoder("utf-8",{fatal}).decode(bytes); }');
contract('20.08', 'pipeline.js', [
  'pipeline(source) oferece map(fn), filter(predicate), take(count) e [Symbol.iterator]().',
  'source é um iterable. Array cria novo iterator; a mesma instância generator pode estar consumida; para repetir, chame a fábrica e passe a nova instância a outra pipeline.',
  'Cada operador retorna um pipeline lazy independente; take limita valores aceitos, take(0) não consome, filtros podem descartar pulls, e return() da fonte é propagado ao interromper a iteração.',
]);
contract('21.09', 'lab.js', [
  'Exporte comparar(input) e medir(fn,input,{warmups,runs,now}); comparar valida a entrada e mede reduce e for sobre a mesma lista.',
  'median em quantidade par de amostras é a média dos dois valores centrais ordenados.',
]);
starterAppend('21.06', 'metadados.js', 'export function criarCache(calcular) { /* TODO: memoizar por identidade em WeakMap. */ return {metaDe(node) { return calcular(node); }, get calculos() { return 0; }}; }\nexport function cachePorId() { return new Map(); }');
starterAppend('22.04', 'patch.js', 'export function first(xs) { return xs.first(); }\nexport function migrar(xs) { return first(xs); }');
starterAppend('22.05', 'a.js', 'export function executar(json) { return totalDosPedidos([json]); }');
starterAppend('23.02', 'fluxo.js', 'export function criarServico(repo) { return {async criarPedido(raw) { /* TODO: parse, validate, save, and preserve an internal cause on storage failure. */ return {status:201,corpo:raw}; }}; }\nexport async function responder(servico, raw) { /* TODO: return only safe {status,corpo}. */ return servico.criarPedido(raw); }');
starterAppend('23.09', 'operacao.js', 'export function lerLogs() { return logs; }\nexport function limparLogs() { logs.length=0; }');
put(starterManifestPath, JSON.stringify(starterManifest, null, 2));
contract('23.03', 'contrato.js', [
  'Exporte ValidationError(campo,mensagem), StorageError(mensagem,cause) e criarTarefa(entrada,repositorio,criarId): Promise<Tarefa>.',
  'Tarefa tem ID injetável, título sem espaços externos, prazo opcional em data ISO real e status inicial a-fazer.',
  'Título vazio e prazo inválido lançam ValidationError antes de salvar; falha do repositório lança StorageError cujo cause é a mesma referência original.',
]);
starterAppend('23.03', 'contrato.js', 'export class StorageError extends Error { constructor(mensagem, cause) { super(mensagem, {cause}); this.name = "StorageError"; } }\nexport async function criarTarefa(entrada, repositorio, criarId = () => crypto.randomUUID()) { /* TODO: validar antes da escrita; preservar cause em StorageError. */ }');
put(manifestPath, JSON.stringify(data, null, 2));
put(overridesPath, JSON.stringify(overrides, null, 2));
for (const record of resolved) {
  const files = starterManifest[record.id]?.files;
  if (!files || !record.learner) continue;
  record.learner.starter_files = files.map(file => ({path: file, content: readFileSync(`course-src/starters/${record.id}/${file}`, 'utf8')}));
}
put('course-src/.generated/resolved_preview.json', JSON.stringify(resolved, null, 2));
console.log('Advanced stage 20-23 source repairs applied.');
