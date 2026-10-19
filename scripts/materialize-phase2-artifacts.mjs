import {copyFileSync, existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const readJson = name => JSON.parse(readFileSync(path.join(root, name), 'utf8'));
const writeJson = (name, value) => {
  const target = path.join(root, name);
  if (name === 'course-src/assessments.json' && existsSync(target)) {
    const previous = JSON.parse(readFileSync(target, 'utf8'));
    for (const [id, assessment] of Object.entries(value)) {
      if (!assessment.assertionCases && Array.isArray(previous[id]?.assertionCases)) assessment.assertionCases = previous[id].assertionCases;
    }
  }
  writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`);
};
const put = (relative, content) => {
  const target = path.join(root, relative);
  if (/^course-src[\\/]tests[\\/].+\.test\.js$/i.test(relative) && existsSync(target)) {
    const current = readFileSync(target, 'utf8');
    const existingIds = [...current.matchAll(/\/\*@case\s+([A-Za-z0-9][A-Za-z0-9._-]*)\s*\*\//g)].map(match => match[1]);
    if (existingIds.length) {
      const nextIds = [...content.matchAll(/\/\*@case\s+([A-Za-z0-9][A-Za-z0-9._-]*)\s*\*\//g)].map(match => match[1]);
      if (existingIds.some(id => !nextIds.includes(id))) throw new Error(`Refusing to replace annotated suite ${relative}: generated source must carry and revalidate its published case IDs.`);
    }
  }
  mkdirSync(path.dirname(target), {recursive: true});
  writeFileSync(target, content.endsWith('\n') ? content : `${content}\n`);
};

const typeRubric = id => id === '19.06'
  ? [
      'Aplicar -readonly e -? e comprovar que as propriedades resultantes são obrigatórias e graváveis.',
      'No TypeScript 6.0.3 em --strict sem exactOptionalPropertyTypes, testar ausência e undefined em propriedades opcionais, inclusive union explícito; ambos são rejeitados.',
      'Com exactOptionalPropertyTypes, um union explícito com undefined permanece; comparar os dois modos antes de normalizar Settings.',
    ]
  : ['Os type tests confirmam as relações e rejeitam os casos inválidos publicados.'];

if (process.argv.includes('--only=19.06-rubric')) {
  const assessments = readJson('course-src/assessments.json');
  if (assessments['19.06']?.environment !== 'typescript') throw new Error('19.06 assessment tipado ausente');
  assessments['19.06'].rubric = typeRubric('19.06');
  writeJson('course-src/assessments.json', assessments);
  console.log('Regenerated 19.06 type rubric from the canonical Phase 2 materializer.');
  process.exit(0);
}

const starters = {
  '11.01': {
    files: {'index.html':'<!doctype html><article id="pai"><a id="filho" href="#"><span id="alvo">Abrir</span></a></article>', 'main.js':`export function observarClique(root) {
  const log = [];
  for (const id of ['pai', 'filho', 'alvo']) root.querySelector('#'+id).addEventListener('click', event => log.push({target:event.target.id,currentTarget:event.currentTarget.id}));
  return log;
}
export function observarControles(root, modo) {
  const alvo=root.querySelector('#alvo'),log=[];
  root.addEventListener('click',()=>log.push('capture'),{capture:true});
  alvo.addEventListener('click',()=>log.push('target-1'));
  alvo.addEventListener('click',event=>{log.push('target-controle');if(modo==='stop')event.stopPropagation();if(modo==='immediate')event.stopImmediatePropagation();});
  alvo.addEventListener('click',()=>log.push('target-3'));
  root.addEventListener('click',()=>log.push('bubble'));
  return log;
}`},
    test: `import {observarClique,observarControles} from './main.js';
describe('propagação de eventos',()=>{
 test('preserva target e a ordem bubble dos currentTarget',()=>{const root=document.createElement('div');root.innerHTML='<article id="pai"><a id="filho" href="#"><span id="alvo">Abrir</span></a></article>';const log=observarClique(root);root.querySelector('#alvo').dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));expect(log).toEqual([{target:'alvo',currentTarget:'alvo'},{target:'alvo',currentTarget:'filho'},{target:'alvo',currentTarget:'pai'}]);});
 test('stopPropagation mantém listeners do mesmo alvo e remove o bubble ancestral',()=>{const root=document.createElement('div');root.innerHTML='<span id="alvo"></span>';const log=observarControles(root,'stop');root.querySelector('#alvo').click();expect(log).toEqual(['capture','target-1','target-controle','target-3']);});
 test('stopImmediatePropagation também interrompe listeners irmãos',()=>{const root=document.createElement('div');root.innerHTML='<span id="alvo"></span>';const log=observarControles(root,'immediate');root.querySelector('#alvo').click();expect(log).toEqual(['capture','target-1','target-controle']);});
});`,
  },
  '11.02': {
    files:{'main.js':`export function montarItem(lista, mensagem) {
  const item = document.createElement('li'); item.innerHTML = mensagem;
  const botao = document.createElement('button'); botao.type = 'button'; botao.textContent = 'Remover';
  botao.addEventListener('click', () => lista.remove()); item.append(botao); lista.append(item); return item;
}`},
    test:`import {montarItem} from './main.js';
describe('componente removível', () => { test('usa texto literal e remove apenas o item acionado', () => { const lista=document.createElement('ul'); const primeiro=montarItem(lista,'<b>rascunho</b>'); montarItem(lista,'outro'); expect(lista.children).toHaveLength(2); expect(primeiro.firstChild.nodeType).toBe(Node.TEXT_NODE); expect(primeiro.textContent).toBe('<b>rascunho</b>Remover'); primeiro.querySelector('button').click(); expect([...lista.children].map(item=>item.textContent)).toEqual(['outroRemover']); }); });`,
  },
  '11.09': {
    files: {
      'index.html': '<!doctype html><html><head><script>window.ordem=["clássico"]</script><script defer src="defer.js"></script><script async src="async.js"></script><script type="module" src="module.js"></script></head><body><button id="salvar">Salvar</button></body></html>',
      'defer.js': 'window.ordem.push("defer");', 'async.js': 'window.ordem.push("async");', 'module.js': 'window.ordem.push("module");',
    },
  },
  '11.11': {
    files: {'index.html':'<!doctype html><div id="fora"><div id="menu"><button id="item" data-parar>Escolher</button></div></div>', 'main.js': `export function instalar(menu,item,{modo='none',cancelar=false}={}) {
 const log=[],fora=menu.parentElement;
 fora.addEventListener('click',()=>log.push('fora-capture'),{capture:true});
 menu.addEventListener('click',()=>log.push('menu-capture'),{capture:true});
 item.addEventListener('click',()=>log.push('item-1'));
 item.addEventListener('click',event=>{log.push('item-controle');if(cancelar)event.preventDefault();if(modo==='stop')event.stopPropagation();if(modo==='immediate')event.stopImmediatePropagation();});
 item.addEventListener('click',()=>log.push('item-3'));
 menu.addEventListener('click',()=>log.push('menu-bubble'));
 fora.addEventListener('click',()=>log.push('fora-bubble'));
 return {log};
}`},
    test: `import {instalar} from './main.js';
describe('capture, target, bubble e ação padrão',()=>{const run=(modo,cancelar=false)=>{const fora=document.createElement('div');fora.innerHTML='<div id="menu"><button id="item">Escolher</button></div>';const menu=fora.querySelector('#menu'),item=fora.querySelector('#item'),installed=instalar(menu,item,{modo,cancelar}),event=new MouseEvent('click',{bubbles:true,cancelable:true});item.dispatchEvent(event);return {log:installed.log,defaultPrevented:event.defaultPrevented};};
 test('percorre captura, listeners do target e bubble',()=>expect(run('none')).toEqual({log:['fora-capture','menu-capture','item-1','item-controle','item-3','menu-bubble','fora-bubble'],defaultPrevented:false}));
 test('stopPropagation interrompe ancestors mas mantém listeners irmãos e não cancela ação',()=>expect(run('stop')).toEqual({log:['fora-capture','menu-capture','item-1','item-controle','item-3'],defaultPrevented:false}));
 test('preventDefault pode cancelar a ação sem interromper propagação',()=>expect(run('none',true)).toEqual({log:['fora-capture','menu-capture','item-1','item-controle','item-3','menu-bubble','fora-bubble'],defaultPrevented:true}));
 test('stopImmediatePropagation interrompe listeners irmãos e ancestors sem cancelar ação',()=>expect(run('immediate')).toEqual({log:['fora-capture','menu-capture','item-1','item-controle'],defaultPrevented:false}));
});`,
  },
  '11.14': {
    files: {'index.html':'<!doctype html><button id="copiar">Copiar</button><div id="conteudo"></div><section id="painel"></section>', 'main.js': `export function instalar({botao,rolagem,painel,copiarTexto,observarRolagem,atualizarPainel,controller=new AbortController()}) {
  botao.addEventListener('click',copiarTexto,{once:true}); rolagem.addEventListener('wheel',observarRolagem,{passive:true}); painel.addEventListener('click',atualizarPainel,{signal:controller.signal}); return controller;
}`},
    test: `import {instalar} from './main.js';
describe('ciclo de vida dos listeners',()=>{
 test('once roda uma vez, passive não cancela e abort remove o listener',()=>{const b=document.createElement('button'),r=document.createElement('div'),p=document.createElement('div');let copy=0,wheel=0,panel=0;const c=instalar({botao:b,rolagem:r,painel:p,copiarTexto:()=>copy++,observarRolagem:e=>{wheel++;e.preventDefault();},atualizarPainel:()=>panel++});b.click();b.click();const e=new WheelEvent('wheel',{bubbles:true,cancelable:true});r.dispatchEvent(e);p.click();c.abort();p.click();expect(copy).toBe(1);expect(wheel).toBe(1);expect(e.defaultPrevented).toBe(false);expect(panel).toBe(1);});
 test('signal já abortado não instala listener efetivo',()=>{const controller=new AbortController();controller.abort();const p=document.createElement('div');let panel=0;instalar({botao:document.createElement('button'),rolagem:document.createElement('div'),painel:p,copiarTexto:()=>{},observarRolagem:()=>{},atualizarPainel:()=>panel++,controller});p.click();expect(panel).toBe(0);});
});`,
  },
  '12.01': {files:{'main.js':"console.log('A');\nsetTimeout(() => console.log('T'), 0);\nPromise.resolve().then(() => console.log('P'));\nconsole.log('B');"}},
  '12.02': {
    files:{'main.js':`export async function tentar(operacao,max,esperar,atraso) {
  if(!Number.isInteger(max)||max<1)return Promise.reject(new RangeError('max deve ser inteiro positivo')); let ultima;
  for(let tentativa=0;tentativa<=max;tentativa++){try{return await operacao();}catch(erro){ultima=erro;await esperar(atraso);}}
  return Promise.reject(ultima);
}`},
    test:`import {tentar} from './main.js';
describe('retry com limite explícito',()=>{test('espera somente entre tentativas e preserva sucesso posterior',async()=>{let chamadas=0;const esperas=[];const result=await tentar(async()=>{if(++chamadas<3)throw Error('transitório');return 'ok';},3,async ms=>esperas.push(ms),25);expect(result).toBe('ok');expect(chamadas).toBe(3);expect(esperas).toEqual([25,25]);});test('aguarda apenas entre falhas e preserva o erro original final',async()=>{let chamadas=0;const esperas=[];const erro=Error('fim');let recebido;try{await tentar(async()=>{chamadas++;throw erro;},2,async ms=>esperas.push(ms),1);}catch(error){recebido=error;}expect(recebido).toBe(erro);expect(chamadas).toBe(2);expect(esperas).toEqual([1]);});});`,
  },
  '12.04':{files:{'main.js':"console.log('A');\nPromise.resolve().then(() => { console.log('P1'); Promise.resolve().then(() => console.log('P2')); });\nqueueMicrotask(() => console.log('Q'));\nsetTimeout(() => console.log('T'), 0);\nconsole.log('B');"}},
  '12.07':{files:{'material.md':'Requisito 1: esperar todas as operações obrigatórias (`Promise.all`).\nRequisito 2: conservar sucessos parciais (`Promise.allSettled`).\nRequisito 3: primeiro término (`Promise.race`).\nRequisito 4: primeiro sucesso (`Promise.any`).\nRequisito 5: timeout com limpeza explícita; um race sozinho não cancela o trabalho perdedor.\nRequisito 6: consultar réplicas e aceitar o primeiro sucesso; cancelar/limpar as demais só se a API oferecer essa operação.'}},
  '12.09':{files:{'material.md':`Callback retorna valor, Promise ou lança. Compare:
Promise.try(callback)
try { Promise.resolve(callback()) } catch (erro) { Promise.reject(erro) }
Promise.resolve().then(callback)

Registre para cada forma quando o callback roda e como um throw síncrono aparece. Promise.try depende do runtime-alvo; não presuma disponibilidade universal.`}},
  '12.10':{files:{'material.md':`GET /itens -> 200, Content-Type application/json, body=[{"id":1}]
POST /itens -> 201, Location /itens/2, Content-Type application/json, body={"id":2}
GET /ausente -> 404, Content-Type text/plain, body=not found
GET /vazio -> 204, sem corpo

Para cada troca, separe status, headers e body. Não tente parsear JSON no 204 nem trate fetch como rejeição automática para 404.`}},
  '12.11':{
    files:{'client.js':`export async function inspecionar(resposta) {
  const antes=resposta.bodyUsed; const status=resposta.status; const tipo=resposta.headers.get('Content-Type'); let corpo;
  try { corpo=await resposta.json(); } catch(erro) { return {status,tipo,antes,depois:resposta.bodyUsed,erro:erro.name}; }
  return {status,tipo,antes,depois:resposta.bodyUsed,corpo};
}`},
    test:`import {inspecionar} from './client.js';
describe('corpo consumível de Response',()=>{test('registra consumo e não lê corpo duas vezes',async()=>{const response=new Response('{"erro":"indisponível"}',{status:503,headers:{'Content-Type':'application/json'}});expect(await inspecionar(response)).toEqual({status:503,tipo:'application/json',antes:false,depois:true,corpo:{erro:'indisponível'}});let erro;try{await response.json();}catch(error){erro=error;}expect(erro?.name).toBe('TypeError');});test('reporta JSON inválido depois do consumo sem ocultar status',async()=>{const response=new Response('not json',{status:502,headers:{'Content-Type':'text/plain'}});expect(await inspecionar(response)).toEqual({status:502,tipo:'text/plain',antes:false,depois:true,erro:'SyntaxError'});});});`,
  },
  '12.13':{files:{'stream.js':`export async function* valores() { yield 1; await Promise.resolve(); yield 2; }
export async function consumir(informar) { const vistos=[]; for await (const valor of valores()) { vistos.push(valor); informar([...vistos]); } return vistos; }`},test:`import {consumir} from './stream.js';
describe('iteração incremental',()=>{test('expõe cada parcial antes da coleção final',async()=>{const vistos=[];const final=await consumir(parcial=>vistos.push(parcial));expect(vistos).toEqual([[1],[1,2]]);expect(final).toEqual([1,2]);});});`},
  '12.14':{files:{'main.js':`export async function primeiroSucesso(promessas) { try { return {ok:true,valor:await Promise.any(promessas)}; } catch(erro) { return {ok:false,nome:erro.name,erros:erro.errors.map(item=>item.message)}; } }`},test:`import {primeiroSucesso} from './main.js';
describe('Promise.any',()=>{test('resolve no primeiro sucesso sem esperar rejeições restantes',async()=>{expect(await primeiroSucesso([Promise.reject(Error('rede')),Promise.resolve('cache')])).toEqual({ok:true,valor:'cache'});});test('agrega erros na ordem das entradas quando todas falham',async()=>{expect(await primeiroSucesso([Promise.reject(Error('rede')),Promise.reject(Error('timeout'))])).toEqual({ok:false,nome:'AggregateError',erros:['rede','timeout']});});});`},
  '13.01':{files:{'material.md':'Vitest: `expect(paginar([1,2,3],2,2)).toEqual([3])`.\nRecebido: `[2,3]`.\nA divergência localiza comportamento diferente; não prova a causa. Escreva uma hipótese refutável e a menor reprodução que separaria erro de índice de erro de normalização.'}},
  '13.02':{files:{'main.js':`export function dividir(dividendo,divisor) { return dividendo/divisor; }`},test:`import {dividir} from './main.js';
describe('guardas antes do cálculo',()=>{test('aceita divisão finita',()=>expect(dividir(8,2)).toBe(4));test('rejeita cada entrada inválida antes de dividir',()=>{expect(()=>dividir(NaN,2)).toThrow(TypeError);expect(()=>dividir(8,Infinity)).toThrow(TypeError);expect(()=>dividir(8,0)).toThrow(RangeError);});});`},
  '13.04':{files:{'material.md':'Protocolo: preveja os valores de total ao entrar e depois de cada iteração para [1,-2,3]; execute; avance o debugger e registre a primeira divergência entre previsão e valor observado. Explique qual evidência do watch/breakpoint resolveu a dúvida.'}},
  '13.11':{files:{'indices.js':`export function ler(itens,indice){return itens.at(indice);}
// Consulte a documentação oficial de Array.prototype.at. Registre assinatura, retorno,
// compatibilidade do runtime-alvo e compare índice positivo, negativo e fora dos limites.`}},
  '13.12':{files:{'material.md':'Falha de sintaxe; valor inesperado num loop; regressão; requisito sem critério.\nPara cada caso escolha Run, debugger, teste ou leitura de documentação. Registre hipótese, evidência que a ferramenta oferece e o que ela não prova.'}},
  '14.01':{files:{'material.md':'Grafo de imports de valor: A -> B, B -> C, C -> A, D -> B, E isolado.\nIdentifique somente os membros do ciclo e proponha uma fronteira comum sem novo ciclo. Um import de tipo isolado em D não cria aresta de runtime.'}},
  '14.02':{files:{'main.js':`const comandos = new Set(['somar']);
export function executarDominio(comando,args){if(comando==='somar')return String(Number(args[0])+Number(args[1]));throw new Error('comando inválido');}
export function main(argv,io){const argumentos=argv.slice(2);io.write(executarDominio(argumentos[0],argumentos.slice(1))+'\\n');return 0;}`},test:`import {executarDominio,main} from './main.js';
describe('fronteiras do CLI',()=>{test('valida argv e apresenta resultado sem acoplar domínio a process.argv',()=>{const out=[];expect(main(['node','app.js','somar','2','3'],{write:x=>out.push(x)})).toBe(0);expect(out).toEqual(['5\\n']);expect(executarDominio('somar',['4','6'])).toBe('10');});test('comando inválido mostra uso e status 2 sem executar domínio',()=>{const out=[];expect(main(['node','app.js','apagar'],{write:x=>out.push(x)})).toBe(2);expect(out).toEqual(['Uso: somar <a> <b>\\n']);});});`},
  '14.03':{files:{'package.json':'{"type":"module","scripts":{"dev":"TODO","test":"TODO","start":"TODO"}}','package-lock.json':'{"name":"devpath-14-03","lockfileVersion":3,"requires":true,"packages":{"":{"name":"devpath-14-03"}}}','src/main.js':'// Implemente o ponto de entrada ESM do app.\nexport {};','test/app.test.js':"import test from 'node:test';\ntest.todo('app');",'README.md':'Complete dev/test/start apontando para os arquivos existentes e usando node:test; confirme no Node.js 24 local.'}},
  '14.04':{files:{'material.md':'math.cjs exporta soma com module.exports; app.cjs importa por require.\nConverta o projeto para ESM: declare `type: module`, use export/import nomeados e inclua extensão nos imports relativos. Confirme a resolução no Node do projeto; o browser não simula package.json.'}},
  '14.05':{files:{'config.js':"import {readFile} from 'node:fs/promises';\nexport async function carregarConfig(){return JSON.parse(await readFile('./data/config.json','utf8'));}\n// BUG: o caminho depende do cwd e quebra ao chamar o CLI de outro diretório."}},
  '14.07':{files:{'promise-try.js':'// Node.js 24 LTS: registre versão, fonte oficial e data da consulta. Compare Promise.try, fallback síncrono fiel e Promise.resolve().then(callback).\nconst callback=()=>{throw new Error("falhou");};\nconsole.log(typeof Promise.try);'}},
  '14.09':{files:{'material.md':"Repositório descartável: main tem README 'uso'; feature acrescenta 'exemplo'; working tree modifica config.json com segredo fictício. Inspecione status, diff staged, base e resultado combinado antes de concluir. Faça a atividade em Git local isolado."}},
  '14.10':{files:{'material.md':"A importa binding nomeado de B; B exporta valor via top-level await; C faz import('./A.js'). Traceie linking, avaliação assíncrona, resolução de import() e logs separadamente. Registre runtime/formato e não una os snippets em um arquivo."}},
  '14.11':{files:{'material.md':'Dossiê comparativo de duas bibliotecas CSV: licença, manutenção, tamanho, dependências transitivas, lockfile, testes e custo futuro. Escolha com evidência verificável; execução local de pacote não decide adequação.'}},
  '14.12':{files:{'src/index.html':'<!doctype html><html><head><meta charset="UTF-8"><script type="module" src="/main.js"></script></head><body><button id="details">Detalhes</button><p id="result"></p></body></html>','src/main.js':"import { soma } from './math.js';\nimport './style.css';\nimport { mostrarDetalhe } from './details.js';\ndocument.querySelector('#result').textContent = String(soma(2, 3));\ndocument.querySelector('#details').addEventListener('click', mostrarDetalhe);",'src/math.js':'export function soma(a, b) { return a + b; }\nexport function multiplicar(a, b) { return a * b; }','src/details.js':"export function mostrarDetalhe() { document.querySelector('#result').textContent = '5 detalhes'; }",'src/style.css':'body { font: 1rem sans-serif; }\nbutton { color: navy; }'},readonly:[
      ['bundle/index.html','HTML de saída real produzido pelo Vite','built/index.html'],['bundle/assets/index.js','Bundle inicial minificado com source map','built/assets/index-DUMI4yNI.js'],['bundle/assets/index.js.map','Mapa de origem do chunk inicial','built/assets/index-DUMI4yNI.js.map'],['bundle/assets/index.css','CSS emitido pelo build','built/assets/index-2zTRaWrQ.css'],['bundle/assets/details.js','Chunk dinâmico emitido pelo build','built/assets/details-DIqtiVVa.js'],['bundle/assets/details.js.map','Mapa de origem do chunk dinâmico','built/assets/details-DIqtiVVa.js.map'],['bundle/provenance.md','Proveniência e comando do build','provenance.md'],
    ]},
  '14.13':{files:{'ordem-browser.js':"// Browser evergreen\nconsole.log('A síncrono');setTimeout(()=>console.log('T timer'),0);Promise.resolve().then(()=>console.log('P promise'));console.log('B síncrono');\n// Node ESM/CJS usa também process.nextTick: execute localmente e registre versão/contexto."}},
};

const executableReferences = {
  '11.02': {'main.js':`export function montarItem(lista,mensagem){const item=document.createElement('li');const texto=document.createTextNode(mensagem);const botao=document.createElement('button');botao.type='button';botao.textContent='Remover';botao.addEventListener('click',()=>item.remove());item.append(texto,botao);lista.append(item);return item;}`},
  '12.02': {'main.js':`export async function tentar(operacao,max,esperar,atraso){if(!Number.isInteger(max)||max<1)return Promise.reject(new RangeError('max deve ser inteiro positivo'));let ultima;for(let tentativa=0;tentativa<max;tentativa++){try{return await operacao();}catch(erro){ultima=erro;if(tentativa===max-1)return Promise.reject(erro);await esperar(atraso);}}return Promise.reject(ultima);}`},
  '13.02': {'main.js':`export function dividir(dividendo,divisor){if(typeof dividendo!=='number'||!Number.isFinite(dividendo))throw new TypeError('dividendo inválido');if(typeof divisor!=='number'||!Number.isFinite(divisor))throw new TypeError('divisor inválido');if(divisor===0)throw new RangeError('divisor não pode ser zero');return dividendo/divisor;}`},
  '14.02': {'main.js':`const comandos=new Set(['somar']);export function executarDominio(comando,args){if(comando==='somar')return String(Number(args[0])+Number(args[1]));throw new Error('comando inválido');}export function main(argv,io){const argumentos=argv.slice(2);if(!comandos.has(argumentos[0])){io.write('Uso: somar <a> <b>\\n');return 2;}io.write(executarDominio(argumentos[0],argumentos.slice(1))+'\\n');return 0;}`},
};
const executable = {
  '11.01':['dom','main.js','tests/11.01.test.js','solutions/11.01'],
  '11.02':['dom','main.js','tests/11.02.test.js','solutions/11.02'],
  '11.11':['dom','main.js','tests/11.11.test.js','solutions/11.11'],
  '11.14':['dom','main.js','tests/11.14.test.js','solutions/11.14'],
  '12.02':['javascript','main.js','tests/12.02.test.js','solutions/12.02'],
    '12.11':['network','client.js','tests/12.11.test.js','solutions/12.11'],
    '12.14':['javascript','main.js','tests/12.14.test.js','solutions/12.14'],
  '13.02':['javascript','main.js','tests/13.02.test.js','solutions/13.02'],
  '14.02':['node-simulated','main.js','tests/14.02.test.js','solutions/14.02'],
};
const executableMutants = {
  '11.01': [`export function observarClique(root) { const log=[]; for (const id of ['alvo']) root.querySelector('#'+id).addEventListener('click',event=>log.push({target:event.target.id,currentTarget:event.currentTarget.id})); return log; }`],
  '11.02': [`export function montarItem(lista,mensagem){const item=document.createElement('li');item.innerHTML=mensagem;const botao=document.createElement('button');botao.textContent='Remover';botao.addEventListener('click',()=>lista.remove());item.append(botao);lista.append(item);return item;}`],
  '11.11': [`export function instalar(menu,item){const log=[];item.addEventListener('click',()=>log.push('item-1'));item.addEventListener('click',event=>{if(event.target.matches('[data-parar]'))event.stopImmediatePropagation();});item.addEventListener('click',()=>log.push('item-3'));menu.addEventListener('click',()=>log.push('menu'));return {log};}`],
  '11.14': [`export function instalar({botao,rolagem,painel,copiarTexto,observarRolagem,atualizarPainel,controller=new AbortController()}){botao.addEventListener('click',copiarTexto);rolagem.addEventListener('wheel',observarRolagem);painel.addEventListener('click',atualizarPainel);return controller;}`],
  '12.02': [`export async function tentar(operacao,max,esperar,atraso){for(let tentativa=0;tentativa<max;tentativa++){try{return await operacao();}catch(erro){if(tentativa===max-1)throw erro;}}}`],
  '12.11': [`export async function inspecionar(resposta){const antes=resposta.bodyUsed,status=resposta.status,tipo=resposta.headers.get('Content-Type');try{const corpo=await resposta.json();return {status,tipo,antes,depois:resposta.bodyUsed,corpo};}catch(erro){return {status,tipo,antes,depois:antes,erro:erro.name};}}`],
  '12.13': [`export async function* valores(){yield 1;await Promise.resolve();yield 2;} export async function consumir(informar){const vistos=[];for await(const valor of valores())vistos.push(valor);informar([...vistos]);return vistos;}`],
  '12.14': [`export async function primeiroSucesso(promessas){try{return {ok:true,valor:await Promise.race(promessas)}}catch(erro){return {ok:false,nome:erro.name,erros:erro.errors?.map(item=>item.message)||[erro.message]}}}`],
  '13.02': [`export function dividir(dividendo,divisor){return dividendo/divisor;}`],
  '14.02': [`const comandos=new Set(['somar']); export function executarDominio(comando,args){if(comando==='somar')return String(Number(args[0])+Number(args[1]));throw new Error('comando inválido');} export function main(argv,io){const args=argv.slice(2);if(!comandos.has(args[0])){io.write('Uso: somar <a> <b>\\n');return 0;}io.write(executarDominio(args[0],args.slice(1))+'\\n');return 0;}`],
};

const typeContracts = {
    '16.01': {entry:'search.ts', source:`export type SearchState<T> = {kind:'idle'}|{kind:'loading';data?:T;message?:string}|{kind:'success';data:T}|{kind:'error';message:string};
export const idle:SearchState<never>={kind:'idle'}; export const loading:SearchState<never>={kind:'loading'}; export const success:SearchState<string[]>={kind:'success',data:['a']}; export const failure:SearchState<never>={kind:'error',message:'offline'};`, assertions:`import type {SearchState} from '../search.js';
const idle:SearchState<string[]>={kind:'idle'}; const loading:SearchState<string[]>={kind:'loading'}; const success:SearchState<string[]>={kind:'success',data:['x']}; const error:SearchState<string[]>={kind:'error',message:'offline'};
// @ts-expect-error loading não carrega data nem error
const impossible:SearchState<string[]>={kind:'loading',data:['x'],message:'offline'};`},
    '17.02': {entry:'repository.ts', source:`export type Entity={id:string};
export function pair(key:string,value:string){return [key,value];}
export function wrap<T>(value:T){return {value};}
export interface Repository<T extends Entity,ID= T['id']>{save(value:T):void;get(id:ID):T|undefined;}`, assertions:`import {pair,wrap,type Repository} from '../repository.js';
type Equal<A,B>=(<T>()=>T extends A?1:2) extends (<T>()=>T extends B?1:2)?true:false; type Assert<T extends true>=T;
type P=Assert<Equal<ReturnType<typeof pair<string,number>>,readonly [string,number]>>; const w=wrap({id:1,total:10}); const total:number=w.value.total;
type Order={id:number;total:number}; declare const repo:Repository<Order,number>; const found=repo.get(1); if(found) found.total.toFixed();
// @ts-expect-error repository requires an Order
repo.save({id:2});
// @ts-expect-error ID is a number
repo.get('2');`},
    '18.02': {entry:'patch.ts', source:`export type Perfil={nome:string;tema:'claro'|'escuro'}; export type Usuario={id:number;nome:string;perfil:Perfil};
export function aplicarPatch<T extends object>(base:T,patch:any):T{return {...base,...patch};}`, assertions:`import {aplicarPatch,type Usuario} from '../patch.js';
const u:Usuario={id:1,nome:'Ana',perfil:{nome:'alto contraste',tema:'escuro'}};const atual=aplicarPatch(u,{nome:'Bia'});const id:number=atual.id;
// @ts-expect-error chave desconhecida
aplicarPatch(u,{apelido:'B'});
// @ts-expect-error nome tem tipo string
aplicarPatch(u,{nome:2});`, test:`import {aplicarPatch} from './patch.js';
describe('patch raso sem mutação',()=>{test('retorna cópia, preserva campos ausentes e substitui o objeto aninhado inteiro',()=>{const perfil={nome:'alto contraste',tema:'escuro'};const original={id:1,nome:'Ana',perfil};const atual=aplicarPatch(original,{nome:'Bia'});expect(atual).toEqual({id:1,nome:'Bia',perfil});expect(atual).not.toBe(original);expect(atual.perfil).toBe(perfil);expect(original.nome).toBe('Ana');const atualizado=aplicarPatch(original,{perfil:{nome:'compacto',tema:'claro'}});expect(atualizado.perfil).toEqual({nome:'compacto',tema:'claro'});});});`},
    '19.01': {entry:'flags.ts', source:`export type User={id:number;name:string;active:boolean}; export type Flags<T>={[K in keyof T]:unknown}; export type UserFlags=Flags<User>;`, assertions:`import type {Flags,User} from '../flags.js'; type F=Flags<User>; const flags:F={id:true,name:false,active:true};
// @ts-expect-error chaves inexistentes
const extra:F={id:true,name:false,active:true,email:true};
// @ts-expect-error valor deve ser boolean
const wrong:F={id:true,name:'no',active:true};`},
    '19.02': {entry:'element.ts', source:`export type ElementOrSelf<T>=T extends readonly (infer U)[]?U:unknown;`, assertions:`import type {ElementOrSelf} from '../element.js'; type Equal<A,B>=(<T>()=>T extends A?1:2) extends (<T>()=>T extends B?1:2)?true:false; type Assert<T extends true>=T;
type A=Assert<Equal<ElementOrSelf<string[]>,string>>; type B=Assert<Equal<ElementOrSelf<readonly [1,2]>,1|2>>; type C=Assert<Equal<ElementOrSelf<number>,number>>; type D=Assert<Equal<ElementOrSelf<boolean[]|number>,boolean|number>>;`},
    '19.06': {entry:'mutable.ts', source:`export type MutableRequired<T>=T; export type Settings=MutableRequired<{readonly theme?:'light'|'dark';readonly retries?:number}>;`, assertions:`import type {MutableRequired} from '../mutable.js'; type Input={readonly theme?:'light'|'dark';readonly retries?:number}; type Out=MutableRequired<Input>; let out:Out={theme:'dark',retries:2};out.retries=3;
// @ts-expect-error mapped -? requires theme
const absent:Out={retries:2};
// @ts-expect-error exact value union excludes undefined
const invalid:Out={theme:undefined,retries:2};`},
};

const initial = readJson('output/fase2/catalog-before.json');
const assessmentsBefore = readJson('output/fase2/assessments-before.json');
const assessments = readJson('course-src/assessments.json');
const initialProseIds = initial.filter(item => Number(item.stage)>=11 && Number(item.stage)<=14 && item.starterFiles?.length===1 && item.starterFiles[0].path==='material.md').map(item=>item.id).sort();
if (initialProseIds.length !== 19) throw new Error(`Expected 19 baseline prose starters, found ${initialProseIds.length}`);
const manifest = readJson('course-src/starters/manifest.json');
for (const [id, definition] of Object.entries(starters)) {
  const dir = path.join(root,'course-src','starters',id); mkdirSync(dir,{recursive:true});
  const files=[]; for(const [name,content] of Object.entries(definition.files)){put(path.join('course-src','starters',id,name),content);files.push(name);}
  const readonlyFiles=[]; for(const [relative,label,from] of definition.readonly||[]){const target=path.join(dir,relative);mkdirSync(path.dirname(target),{recursive:true});copyFileSync(path.join(root,'output','fase2','bundle-14-12',from),target);readonlyFiles.push({path:relative,label});}
  const preservedContext={
    '16.01':[['busca.ts','Arquivo inicial original para comparação com a união discriminada.']],
    '17.02':[['repositorio.ts','Blocos embaralhados originais para reconstrução do contrato genérico.']],
  }[id]||[];
  for(const [relative,label] of preservedContext)readonlyFiles.push({path:relative,label});
  manifest[id]={version:2,files,...(readonlyFiles.length?{readonlyFiles}:{})};
  if(definition.test)put(path.join('course-src','tests',`${id}.test.js`),definition.test);
}
for(const [id,[environment,entryPath,testPath,referenceDir]] of Object.entries(executable)){
  mkdirSync(path.join(root,'course-src',referenceDir),{recursive:true});
  const referenceFiles={...starters[id].files,...(executableReferences[id]||{})};
  for(const [name,content] of Object.entries(referenceFiles))put(path.join('course-src',referenceDir,name),content);
  const old=assessmentsBefore[id];
  const assessment={environment,version:(old?.version||1)+1,checks:['behavior'],entryPath,testPath,behaviorTestPath:'__devpath_protected_behavior__.js',tests:starters[id].test,referenceDir,correctFiles:Object.entries(referenceFiles).filter(([name])=>/\.(?:m?js|html|ts)$/.test(name)).map(([path,content])=>({path,content})),
    transfer:{id:`${id}-transfer`,files:[{path:'transfer.js',content:`// Reaplique ${id} a uma entrada nova e preserve o mesmo contrato observável.\nexport {};`}],rubric:['Aplique o contrato publicado a uma entrada independente e cite a evidência observada.']}};
  if(environment==='dom')assessment.fixtures={html:id==='11.01'?'<article id="pai"><a id="filho" href="#"><span id="alvo">Abrir</span></a></article>':id==='11.11'?'<div id="menu"><button id="item" data-parar>Escolher</button></div>':id==='11.14'?'<button id="copiar">Copiar</button><div id="conteudo"></div><section id="painel"></section>':'<ul></ul>'};
  if(environment==='network')assessment.fixtures={responses:[{url:'/indisponivel',status:503,headers:{'Content-Type':'application/json'},body:'{"erro":"indisponível"}'},{url:'/ruim',status:502,headers:{'Content-Type':'text/plain'},body:'not json'}]};
  for(const [index,content] of (executableMutants[id]||[]).entries())put(path.join('course-src',`mutants/${id}/behavior-${index+1}/${entryPath}`),content);
  assessments[id]=assessment;
}
for(const [id,definition] of Object.entries(typeContracts)){
  put(path.join('course-src','starters',id,definition.entry),definition.source);
  const assertionsPath=`contracts/${id}.types.ts`;put(path.join('course-src',assertionsPath),definition.assertions);
  const obsoleteStudentSuite=`course-src/tests/${id}.types.ts`;if(existsSync(path.join(root,obsoleteStudentSuite)))unlinkSync(path.join(root,obsoleteStudentSuite));
  if(definition.test)put(path.join('course-src','tests',`${id}.test.js`),definition.test);
  const old=assessmentsBefore[id];
  const referenceSources={
    '16.01':`export type SearchState<T>={kind:'idle'}|{kind:'loading'}|{kind:'success';data:T}|{kind:'error';message:string};`,
    '17.02':`export type Entity={id:string|number}; export function pair<K,V>(key:K,value:V):readonly [K,V]{return [key,value];} export function wrap<T>(value:T){return {value};} export interface Repository<T extends Entity,ID=T['id']>{save(value:T):void;get(id:ID):T|undefined;}`,
    '18.02':`export type Perfil={nome:string;tema:'claro'|'escuro'}; export type Usuario={id:number;nome:string;perfil:Perfil}; export function aplicarPatch<T extends object>(base:T,patch:Partial<T>):T{return {...base,...patch};}`,
    '19.01':`export type User={id:number;name:string;active:boolean}; export type Flags<T>={[K in keyof T]:boolean}; export type UserFlags=Flags<User>;`,
    '19.02':`export type ElementOrSelf<T>=T extends readonly (infer U)[]?U:T;`,
    '19.06':`export type MutableRequired<T>={-readonly [K in keyof T]-?:T[K]}; export type Settings=MutableRequired<{readonly theme?:'light'|'dark';readonly retries?:number}>;`,
  };
  const mutantSources={
    '16.01':`export type SearchState<T>={kind:string;data?:T;message?:string};`,
    '17.02':`export type Entity={id:string}; export function pair<K,V>(key:K,value:V){return [key,value];} export function wrap<T>(value:T){return {value};} export interface Repository<T extends Entity,ID=T['id']>{save(value:T):void;get(id:ID):T|undefined;}`,
    '18.02':`export type Perfil={nome:string;tema:'claro'|'escuro'}; export type Usuario={id:number;nome:string;perfil:Perfil}; export function aplicarPatch<T extends object>(base:T,patch:T):T{return {...base,...patch};}`,
    '19.01':`export type User={id:number;name:string;active:boolean}; export type Flags<T>=Record<string,boolean>; export type UserFlags=Flags<User>;`,
    '19.02':`export type ElementOrSelf<T>=[T] extends [readonly (infer U)[]]?U:T;`,
    '19.06':`export type MutableRequired<T>=T; export type Settings=MutableRequired<{readonly theme?:'light'|'dark';readonly retries?:number}>;`,
  };
  const mutantPath=`mutants/${id}/weakened/${definition.entry}`;
  put(path.join('course-src',mutantPath),mutantSources[id]);
  assessments[id]={environment:'typescript',version:(old?.version||1)+1,checks:definition.test?['types','behavior']:['types','mutation'],entryPath:definition.entry,...(definition.test?{testPath:`tests/${id}.test.js`,behaviorTestPath:'__devpath_protected_behavior__.js'}:{}),referenceDir:`solutions/${id}`,correctFiles:[{path:definition.entry,content:referenceSources[id]}],contractTypeFiles:[{path:assertionsPath,content:definition.assertions}],...(!definition.test?{typeContractMutants:[{id:'weakened-contract',files:[{path:definition.entry,content:mutantSources[id]}]}]}:{}),rubric:typeRubric(id)};
  mkdirSync(path.join(root,'course-src',`solutions/${id}`),{recursive:true});put(path.join('course-src',`solutions/${id}/${definition.entry}`),referenceSources[id]);
  const readonlyFiles=({
    '16.01':[{path:'busca.ts',label:'Arquivo inicial original para comparação com a união discriminada.'}],
    '17.02':[{path:'repositorio.ts',label:'Blocos embaralhados originais para reconstrução do contrato genérico.'}],
  })[id]||[];
  manifest[id]={version:2,files:[definition.entry],...(readonlyFiles.length?{readonlyFiles}:{})};
}
writeJson('course-src/starters/manifest.json',manifest);
writeJson('course-src/assessments.json',assessments);

const converted=new Set([...Object.keys(executable),...Object.keys(typeContracts)]);
const retained=Object.keys(assessmentsBefore).filter(id=>/^\d{2}\./.test(id)&&Number(id.slice(0,2))>=11&&Number(id.slice(0,2))<=23&&['rubric','local'].includes(assessmentsBefore[id].environment));
for(const id of retained){if(converted.has(id))continue;if(id==='12.13')assessments[id]={...assessmentsBefore[id]};const assessment=assessments[id];if(['rubric','local'].includes(assessment.environment))assessment.evidenceNote=assessment.environment==='local'?'Evidência declarada · execute este checkpoint em ambiente local isolado e registre o resultado junto aos critérios humanos.':'Evidência declarada · execução apoia o estudo; a decisão exige análise do contexto e conferência humana da rubrica.';}
writeJson('course-src/assessments.json',assessments);

const predictions=readJson('course-src/predictions.json');
for(const [id,table] of Object.entries({
  '11.01':{version:1,instructions:'Anote o target e os currentTarget na ordem bubble antes de executar.',fields:[{id:'path',label:'target,currentTarget em sequência'}]},
  '12.01':{version:1,instructions:'Registre os rótulos separados por vírgula antes de executar; depois compare a ordem observada.',outputFormat:'lines',fields:[{id:'order',label:'Ordem dos logs'}]},
  '12.04':{version:1,instructions:'Registre os rótulos separados por vírgula antes de executar; depois compare a ordem observada.',outputFormat:'lines',fields:[{id:'order',label:'Ordem dos logs'}]},
})) { predictions[id]={version:1,cases:[{id:'published',...table}]}; assessments[id].predictionTable=table; }
writeJson('course-src/predictions.json',predictions);writeJson('course-src/assessments.json',assessments);

const decisionItems=initial.filter(item=>Number(item.stage)>=11&&Number(item.stage)<=23&&assessmentsBefore[item.id]&&['rubric','local'].includes(assessmentsBefore[item.id].environment)).sort((a,b)=>a.id.localeCompare(b.id));
if(decisionItems.length!==59)throw new Error(`Expected 59 baseline rubric/local decisions, found ${decisionItems.length}`);
const rationaleFor=(item,assessment)=>{
  if(converted.has(item.id)){const evidence=assessment.environment==='typescript'?`contrato protegido em ${assessment.contractTypeFiles?.[0]?.path}${assessment.typeContractMutants?.length?' e mutante de controle interno':''}`:`teste protegido em ${assessment.testPath} executado sobre o envio`;return `Conversão ${assessment.environment}: ${evidence}; referência em ${assessment.referenceDir}. Escopo: ${assessment.rubric?.[0]||'comportamento publicado'}.`;}
  const criteria=(assessmentsBefore[item.id].rubric||[]).slice(0,2).join(' ');
  if(assessment.environment==='local')return `Checkpoint ${item.title} exige ${criteria||'operação em ambiente de projeto'}. O runner atual não reproduz com honestidade esse ambiente, histórico ou ferramenta local.`;
  if(['PREDICT','TRACE'].includes(item.kind))return `${item.title}: os campos estruturados registram a previsão antes de executar e comparam com a saída real. A conclusão exige explicar relações/causas; a saída observada sozinha não prova essa compreensão. Critério: ${criteria}`;
  if(['COMPARE','READ','DOCS','INVESTIGATE'].includes(item.kind))return `${item.title}: o objetivo é interpretar evidência, justificar hipótese ou comparar limites, não produzir uma única saída determinística. Critérios: ${criteria}`;
  if(item.kind==='PROJECT')return `${item.title}: o trabalho integra decisões e entregas de múltiplos arquivos. Uma suíte pequena não verifica a arquitetura, os requisitos e a transferência descritos na rubrica. Critérios: ${criteria}`;
  return `${item.title}: mantido como rubrica porque a entrega combina implementação com análise/transferência além do contrato estreito que o executor atual consegue provar. Critérios: ${criteria}`;
};
const matrix=decisionItems.map(item=>{
  const id=item.id, assessment=assessments[id], action=converted.has(id)?`Convertida (${assessment.environment})`:`Declarada (${assessment.environment})`;
  return `| ${id} | ${item.kind} · ${item.title.replaceAll('|','/')} | ${action} | ${rationaleFor(item,assessment).replaceAll('|','/').replaceAll('\n',' ')} |`;
});
const report=[
  '# Fase 2 · Task 2: artefatos 11–14 e decisões de evidência',
  '',
  `| Baseline | Convertidas | Mantidas como declaradas |`,
  `| ---: | ---: | ---: |`,
  `| ${decisionItems.length} | ${converted.size} convertidas | ${decisionItems.length-converted.size} declaradas |`,
  '',
  'As decisões usam `output/fase2/assessments-before.json` e `catalog-before.json`, preservados antes da Fase 2. As conversões JS publicam testes protegidos que importam o trabalho enviado. As conversões TS executam contratos de tipo protegidos sem exigir que o aluno escreva testes. Cinco usam controles internos enfraquecidos para provar sensibilidade do contrato; 18.02 combina type tests com comportamento executável do patch raso. Os starters PARSONS de 11.02, 13.02 e 14.02 e o retry de 12.02 falham em semântica coberta pela suíte. 12.13 permanece declarado porque comparar a disponibilidade incremental com a materialização exige explicação que a saída sozinha não prova. A evidência fica limitada ao que os gates efetivamente rodarem. As avaliações declaradas exibem `evidenceNote` na interface e não geram aprovação automática.',
  '',
  '12.01 e 12.04 permanecem previsões/trace: os programas iniciais são entradas corretas para estudo. O botão executa uma demonstração JavaScript isolada, espera uma task de timer e compara os logs com a previsão, mas preserva a evidência rubric-declared e não concede aprovação automática. 11.01 também oferece previsão estruturada e avaliação comportamental DOM.',
  '',
  '## Matriz das 59 decisões',
  '',
  '| ID | Objetivo baseline | Decisão | Evidência e justificativa |',
  '| --- | --- | --- | --- |',
  ...matrix,
  '',
  '## Starter 14.12',
  '',
  'A manifestação canônica aponta para a fonte do exemplo e mantém arquivos somente leitura de `output/fase2/bundle-14-12`: HTML, JS/CSS emitidos, chunks inicial e dinâmico, source maps e `provenance.md`. Esse bundle foi preparado antes da materialização e não foi regenerado ou substituído por esta tarefa.',
  '',
  '## Limites de verificação',
  '',
  'A suíte `scripts/test-phase2-artifacts.mjs` confirma IDs da baseline, referências, arquivos de teste, evidência declarada, tabela 59x1 e bundle. Testes DOM/network precisam de navegador real; o gate de execução browser da raiz deve registrar esse resultado. Node simulated é uma fronteira didática com APIs limitadas, e typecheck prova somente as relações expressas nos type tests. Nenhuma dessas verificações equivale a revisão humana dos itens rubric/local.',
].join('\n');
writeFileSync(path.join(root,'output/fase2/task2-report.md'),`${report}\n`);


