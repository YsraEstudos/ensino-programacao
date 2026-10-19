import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import path from 'node:path';

const defs = {
  '20.03': {
    entry:'range.js', environment:'javascript',
    solution:`export class Range {\n  constructor(start, end) { this.start = start; this.end = end; }\n  [Symbol.iterator]() {\n    let cursor = this.start;\n    const end = this.end;\n    return { next() { return cursor > end ? {value: undefined, done: true} : {value: cursor++, done: false}; } };\n  }\n}\n`,
    tests:`import {Range} from "./range.js";\ntest("cada coleta cria cursor inclusivo independente",()=>{const range=new Range(2,4);expect([...range]).toEqual([2,3,4]);expect([...range]).toEqual([2,3,4]);});\ntest("iteradores intercalados não compartilham progresso e respeitam faixa vazia",()=>{const range=new Range(7,8);const a=range[Symbol.iterator]();const b=range[Symbol.iterator]();expect(a.next()).toEqual({value:7,done:false});expect(b.next()).toEqual({value:7,done:false});expect(a.next()).toEqual({value:8,done:false});expect(a.next()).toEqual({value:undefined,done:true});expect([...new Range(5,4)]).toEqual([]);});`,
    mutants:[{id:'exclusive-end',files:[{path:'range.js',content:`export class Range {constructor(start,end){this.start=start;this.end=end;}[Symbol.iterator](){let cursor=this.start;const end=this.end;return {next(){return cursor>=end?{value:undefined,done:true}:{value:cursor++,done:false};}};}}`}]}],
    transfer:`# Transferência 20.03\n\nImplemente \`PaginaIteravel(total, tamanho)\` para total=5 e tamanho=2. A primeira sessão deve produzir [0,1,2,3,4]; duas sessões intercaladas não podem roubar itens uma da outra. Confirme também total=0 e que \`done\` só fica true após o último item. Entregue o iterable e um teste próprio que use dois iteradores simultâneos.`,
    rubric:['O cursor pertence a cada iterator criado por Symbol.iterator e a coleção conserva apenas os limites.','O caso de cinco elementos com páginas de dois mantém ordem e limite final; duas sessões intercaladas são independentes.','O retorno terminal tem done:true e não aparece como elemento da sequência.']
  },
  '20.04': {
    entry:'proxy.js', environment:'javascript',
    solution:`export function observar(target, onRead = () => {}) {\n  return new Proxy(target, { get(obj, key, receiver) { onRead(key); return Reflect.get(obj, key, receiver); } });\n}\nexport const proxyGetter = observar(Object.create({get dobro(){return this.base*2;}}));\n`,
    tests:`import {observar} from "./proxy.js";\ntest("delegação lê valor normal e símbolo sem reentrada",()=>{const proxy=observar({x:2});expect(proxy.x).toBe(2);expect(proxy[Symbol.toStringTag]).toBe(undefined);});\ntest("getter herdado recebe o proxy como this",()=>{let proxy;const proto={get dono(){return this===proxy;},get dobro(){return this.base*2;}};const target=Object.assign(Object.create(proto),{base:5});proxy=observar(target);expect(proxy.dono).toBe(true);expect(proxy.dobro).toBe(10);});`,
    mutants:[{id:'drop-receiver',files:[{path:'proxy.js',content:`export function observar(target,onRead=()=>{}){return new Proxy(target,{get(obj,key,receiver){onRead(key);return Reflect.get(obj,key);}});} export const proxyGetter=observar(Object.create({get dobro(){return this.base*2;}}));`}]}],
    transfer:`# Transferência 20.04\n\nCrie um proxy de auditoria para um objeto de configuração cuja propriedade herdada \`endpoint\` getter usa \`this.host\`. Leia \`endpoint\` e \`Symbol.toStringTag\`, registre a chave observada e mostre que o getter recebe o próprio proxy. Um segundo getter devolve um valor derivado de \`this\`; inclua um teste que falhe se delegar sem receiver.`,
    rubric:['O trap delega com Reflect.get e encaminha o receiver recebido.','Getter herdado que lê host funciona pelo proxy; leitura simbólica não reentra.','O log registra a chave sem substituir ou quebrar a semântica do getter.']
  },
  '20.05': {
    entry:'validador.js', environment:'javascript',
    solution:`export function validarAge(value) { if (!Number.isInteger(value) || value < 0 || value > 150) throw new RangeError("age fora do intervalo"); return value; }\nexport function validarUser(user) { return new Proxy(user, {set(target,key,value,receiver) { if (key === "age") validarAge(value); return Reflect.set(target,key,value,receiver); }}); }\nexport function updateUser(current, patch) { const next = {...current, ...patch}; if (Object.hasOwn(patch,"age")) validarAge(next.age); return next; }\n`,
    tests:`import {validarUser,updateUser} from "./validador.js";\ntest("trap valida limites inclusivos, inteiro e não grava inválidos",()=>{const user=validarUser({age:20});user.age=0;expect(user.age).toBe(0);user.age=150;expect(user.age).toBe(150);for(const value of [-1,151,1.5,NaN,"20"])expect(()=>{user.age=value}).toThrow(RangeError);expect(user.age).toBe(150);});\ntest("função explícita não muta entrada e proxy externo não valida objeto aninhado",()=>{const input={age:20,address:{city:"A"}};const next=updateUser(input,{age:21});expect(next.age).toBe(21);expect(input.age).toBe(20);const proxy=validarUser(input);proxy.address.city=42;expect(proxy.address.city).toBe(42);});`,
    mutants:[{id:'accept-fractions',files:[{path:'validador.js',content:`export function validarAge(value){if(typeof value!=="number"||value<0||value>150)throw new RangeError("age fora do intervalo");return value;} export function validarUser(user){return new Proxy(user,{set(target,key,value,receiver){if(key==="age")validarAge(value);return Reflect.set(target,key,value,receiver);}});} export function updateUser(current,patch){const next={...current,...patch};if(Object.hasOwn(patch,"age"))validarAge(next.age);return next;}`}]}],
    transfer:`# Transferência 20.05\n\nEscreva \`validarPreco\` para aceitar apenas centavos inteiros entre 1 e 50.000 em \`produto.preco\` e numa função \`alterarProduto\` que cria nova cópia. Compare 1, 50.000, 0, 50.001, 2,5 e uma string; verifique que nenhuma falha grava valor inválido e que alterar propriedade dentro de \`produto.detalhes\` não passa pelo proxy externo.`,
    rubric:['As duas APIs aplicam a mesma faixa e rejeitam zero, limite acima, fração e texto.','A alternativa explícita retorna novo objeto sem mudar a entrada; o teste descreve visibilidade/contagem.','A análise reconhece que Proxy externo observa apenas operações no próprio alvo e recomenda com base no caso.']
  },
  '20.08': {
    entry:'pipeline.js', environment:'javascript',
    solution:`export function pipeline(source) {\n  const operators=[];\n  const api={map(fn){operators.push({kind:"map",fn});return api;},filter(fn){operators.push({kind:"filter",fn});return api;},take(count){operators.push({kind:"take",count});return api;},[Symbol.iterator](){let iterator=source[Symbol.iterator]();let taken=0;const limit=operators.find(op=>op.kind==="take");return {next(){if(limit&&taken>=limit.count){iterator.return?.();return {done:true,value:undefined};}while(true){const item=iterator.next();if(item.done)return item;let value=item.value,skip=false;for(const op of operators){if(op.kind==="map")value=op.fn(value);else if(op.kind==="filter"&&!op.fn(value)){skip=true;break;}}if(skip)continue;taken++;return {done:false,value};}}};}};return api;\n}\n`,
    tests:`import {pipeline} from "./pipeline.js";\nfunction* tracked(limit, pulls, closed){try{for(let i=1;i<=limit;i++){pulls.count++;yield i;}}finally{closed.value=true;}}\ntest("lazy map/filter/take puxa só até resultados aceitos",()=>{const pulls={count:0},closed={value:false};const values=[...pipeline(tracked(10,pulls,closed)).map(x=>x*2).filter(x=>x>3).take(2)];expect(values).toEqual([4,6]);expect(pulls.count).toBe(3);expect(closed.value).toBe(true);});\ntest("take zero não consome e a pipeline pode ser iterada de novo",()=>{const pulls={count:0},closed={value:false};const source=tracked(10,pulls,closed);const p=pipeline(source).map(x=>x).take(0);expect([...p]).toEqual([]);expect(pulls.count).toBe(0);const finite=pipeline([1,2,3]).filter(x=>x>1).take(1);expect([...finite]).toEqual([2]);expect([...finite]).toEqual([2]);});`,
    mutants:[{id:'eager-map',files:[{path:'pipeline.js',content:`export function pipeline(source){return {map(fn){return {filter(predicate){return {take(count){return [...source].map(fn).filter(predicate).slice(0,count);},[Symbol.iterator](){return this.take(Infinity)[Symbol.iterator]();}};}};}};}`}]}],
    transfer:`# Transferência 20.08\n\nConstrua pipeline para pedidos em fluxo infinito: converta cada entrada para {sku, ativo}, filtre ativos e pegue três. Fonte começa com um inativo e, após o terceiro ativo, lança se puxada de novo. Resultado esperado: três SKUs, quatro pulls e produtor fechado. Acrescente \`take(0)\` sem pull e segunda iteração independente.`,
    rubric:['Cada operador adia o trabalho até next e o contador de pulls distingue resultado de entrada.','A fonte encerra sem pull extra depois do terceiro ativo; take(0) não avança a fonte.','return/finally fecha o produtor e a explicação relaciona demanda upstream a memória/cancelamento.']
  },
  '20.10': {
    entry:'bytes.js', environment:'javascript',
    solution:`export function medirTexto(text) { const bytes = new TextEncoder().encode(text); return {textLength:text.length, byteLength:bytes.length, bytes, decoded:new TextDecoder().decode(bytes)}; }\nexport function decodificar(bytes, {fatal=false}={}) { return new TextDecoder("utf-8",{fatal}).decode(bytes); }\n`,
    tests:`import {medirTexto,decodificar} from "./bytes.js";\ntest("UTF-8 round-trip separa unidades UTF-16 de bytes",()=>{const result=medirTexto("ação 😀");expect(result.decoded).toBe("ação 😀");expect(result.byteLength).toBeGreaterThan(result.textLength);expect(medirTexto("").byteLength).toBe(0);expect(medirTexto("A").byteLength).toBe(1);});\ntest("entrada inválida troca byte por replacement ou lança em modo fatal",()=>{expect(decodificar(new Uint8Array([0x61,0xc3,0x28]))).toBe("a�(");expect(()=>decodificar(new Uint8Array([0x61,0xc3,0x28]),{fatal:true})).toThrow(TypeError);});`,
    mutants:[{id:'count-utf16-as-bytes',files:[{path:'bytes.js',content:`export function medirTexto(text){const bytes=new TextEncoder().encode(text);return {textLength:text.length,byteLength:text.length,bytes,decoded:new TextDecoder().decode(bytes)};} export function decodificar(bytes,{fatal=false}={}){return new TextDecoder("utf-8",{fatal}).decode(bytes);}`}]}],
    transfer:`# Transferência 20.10\n\nCodifique a mensagem de protocolo \`café / 🛰️\`. Registre \`string.length\`, quantidade de bytes enviados e conteúdo recuperado. Depois decodifique [0x7b,0xc3,0x28,0x7d] em modo tolerante e estrito; descreva qual resposta a aplicação envia ao receber sequência inválida.`,
    rubric:['Mede UTF-16 e bytes UTF-8 separadamente para texto não ASCII e emoji.','Registra round-trip exato e diferença entre replacement padrão e erro fatal.','Define política observável para payload inválido sem cortar arbitrariamente uma sequência multibyte.']
  },
};

// Contrato focal da rodada: a retomada depende da fonte concreta.
defs['20.08'].solution = `export function pipeline(source) {
  return {
    map(fn) {
      const input = this;
      return pipeline({ *[Symbol.iterator]() { for (const value of input) yield fn(value); } });
    },
    filter(predicate) {
      const input = this;
      return pipeline({ *[Symbol.iterator]() { for (const value of input) if (predicate(value)) yield value; } });
    },
    take(count) {
      if (!Number.isInteger(count) || count < 0) throw new RangeError('take requer inteiro não negativo');
      const input = this;
      return pipeline({ *[Symbol.iterator]() {
        if (count === 0) return;
        const iterator = input[Symbol.iterator]();
        try {
          for (let accepted = 0; accepted < count; accepted++) {
            const step = iterator.next();
            if (step.done) return;
            yield step.value;
          }
        } finally { iterator.return?.(); }
      } });
    },
    [Symbol.iterator]() { return source[Symbol.iterator](); },
  };
}`;
defs['20.08'].tests += `
test('iterável reiniciável, generator consumível e fábrica explícita',()=>{
  const values=pipeline([1,2]);
  expect([...values]).toEqual([1,2]);
  expect([...values]).toEqual([1,2]);
  function* generate(){yield 1;yield 2;}
  const oneShot=pipeline(generate());
  expect([...oneShot]).toEqual([1,2]);
  expect([...oneShot]).toEqual([]);
  let creations=0;
  const makeSource=()=>{creations++;return generate();};
  expect([...pipeline(makeSource())]).toEqual([1,2]);
  expect([...pipeline(makeSource())]).toEqual([1,2]);
  expect(creations).toBe(2);
});
test('take fecha a fonte e não faz pull após a quantidade aceita',()=>{
  const trace=[];
  function* source(){try{for(let value=1;value<=3;value++){trace.push('pull:'+value);yield value;}}finally{trace.push('return');}}
  expect([...pipeline(source()).take(2)]).toEqual([1,2]);
  expect(trace).toEqual(['pull:1','pull:2','return']);
});`;
defs['20.08'].transfer = `# Transferência 20.08

Compare três fontes para a mesma pipeline: um array reiniciável, a mesma instância de generator (iterador de uso único) e uma fábrica que cria generators. Registre a saída da primeira e da segunda iteração do array e da instância. Em seguida, chame a fábrica para construir uma pipeline nova a cada passagem e confirme que ambas começam do início. Depois encadeie map/filter/take com uma fonte que conte os valores produzidos: inclua entradas descartadas pelo filtro, prove que take(0) não consome, que não há pull após o último resultado aceito e que interromper com break propaga return/finally. Não suponha que todo for...of reinicia qualquer fonte.`;
defs['20.08'].rubric = [
  'Distingue a chamada a Symbol.iterator de um novo cursor: array reinicia, a mesma instância generator pode estar consumida e uma fábrica cria outra instância.',
  'Conta pulls da fonte separadamente dos valores aceitos pelo filtro e demonstra que take(0) não consome.',
  'Confirma que take/break fecha a fonte por return/finally sem pedir um item além do limite.',
];

const root=process.cwd();
const manifestPath=path.join(root,'course-src/assessments.json');
const assessments=JSON.parse(readFileSync(manifestPath,'utf8'));
const write=(file,content)=>{const target=path.resolve(root,file);mkdirSync(path.dirname(target),{recursive:true});writeFileSync(target,content.endsWith('\n')?content:content+'\n');};
for(const [id,d] of Object.entries(defs)){
  const solutionName=d.entry;
  write(`course-src/solutions/${id}/${solutionName}`,d.solution);
  write(`course-src/tests/${id}.test.js`,d.tests);
  for(const mutant of d.mutants) for(const file of mutant.files) write(`course-src/mutants/${id}/${mutant.id}/${file.path}`,file.content);
  assessments[id]={environment:d.environment,version:1,checks:['behavior','mutation'],entryPath:d.entry,testPath:`tests/${id}.test.js`,behaviorTestPath:'__devpath_protected_behavior__.js',tests:d.tests,referenceDir:`solutions/${id}`,correctFiles:[{path:d.entry,content:d.solution}],mutantDirs:d.mutants,transfer:{id:`${id}-transfer`,files:[{path:'transfer.md',content:d.transfer}],rubric:d.rubric},rubric:d.rubric,prompt:`Resolva ${id} conforme o contrato e use a evidência dos testes para transferir o conceito.`};
}
write(manifestPath,JSON.stringify(assessments,null,2));
console.log(`Stage 20 source ready: ${Object.keys(defs).length} IDs; ${Object.values(defs).reduce((n,d)=>n+d.mutants.length,0)} semantic mutants.`);
