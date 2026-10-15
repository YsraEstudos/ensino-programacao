import fs from 'node:fs';
const TRANSFER_RUBRICS={"15.01": ["Três diagnósticos no handler de reserva (lista possivelmente ausente, propriedade numérica vinda do JSON e correção sem cast), cada um com arquivo e linha", "Casos avaliáveis: lista vazia tratada sem erro; quantidade textual rejeitada antes da soma; a correção usa guarda ou validação, não `as`."], "15.02": ["Limite padrão e faixa 1..100 com entrada decimal em string, e rejeição de texto inválido em teste independente", "Casos avaliáveis: '  42 ' aceito como 42; 'abc' e '' rejeitados; 0 e 101 falham com erro de faixa."], "15.03": ["Normalização do título e limite mínimo, com asserções negativas de tipo para título e limite", "Casos avaliáveis: título com espaços é aparado; limite 0 gera RangeError; número no lugar do título falha no checker."], "15.04": ["Validação de objeto, user e email antes do uso, com payload válido e erro explícito para as formas inválidas", "Casos avaliáveis: payload válido devolve o email; user ausente lança erro; email numérico é rejeitado."], "15.06": ["Compatibilidade estrutural de dois DTOs e de literal fresco com campo extra, com aceite e rejeição por atribuição", "Casos avaliáveis: literal com campo extra falha; variável previamente tipada passa; classes com private separadas são incompatíveis, e a diferença é classificada como tipo ou runtime."], "15.07": ["Decisão explícita entre fallback e erro para lista vazia e tratamento do campo opcional sem undefined implícito", "Casos avaliáveis: lista vazia com fallback devolve o padrão; campo ausente não vira texto 'undefined'; uso sem checagem falha no checker."], "15.08": ["Migração de API de ordenação e filtro preservando assinaturas, erros e exports, com dois casos corretos e um typecheck negativo", "Casos avaliáveis: ordenar não muta a entrada; entrada inválida lança o mesmo erro; tipo errado falha no checker."], "15.09": ["Efeito de push por alias, bloqueio de reatribuição e distinção entre readonly, identidade e congelamento em runtime", "Casos avaliáveis: push pelo editor aparece no painel; reatribuição de readonly falha no checker; Object.freeze bloqueia escrita só em runtime."], "15.10": ["Escolha entre literal, variável e satisfies com evidência do checker e política de schema runtime para campo desconhecido", "Casos avaliáveis: campo role em literal fresco é checado; satisfies preserva o tipo inferido; payload com campo extra segue a política declarada."], "15.11": ["Conversão de texto externo de preço com validação de formato e faixa antes do uso", "Casos avaliáveis: '19.90' aceito e convertido; '-1' fora da faixa; formato com vírgula rejeitado conforme a regra declarada."]};
import path from 'node:path';

const root = process.cwd();
const catalog = JSON.parse(fs.readFileSync('public/course-catalog.json', 'utf8'));
const manifest = JSON.parse(fs.readFileSync('course-src/starters/manifest.json', 'utf8'));
const assessments = JSON.parse(fs.readFileSync('course-src/assessments.json', 'utf8'));
const entries = catalog.filter(item => item.id.startsWith('15.'));
const files = new Map();
const definitions = {
  '15.01': { environment: 'typescript', checks: ['types'], entryPath: 'diagnosticos.ts', tsconfigPath: 'tsconfig.json', expectedDiagnostics: [[2532,12],[2322,16],[18046,23],[2540,28],[2353,32],[2366,35]], rubric: ['Matriz com exatamente seis linhas ligadas a código e linha: identificar o tipo conhecido, a prova ausente e uma correção mínima sem cast (0–2 por linha).','Distinguir os seis diagnósticos estáticos da validação de JSON em runtime (0–2); demonstrar com um payload que compila sob assertion e falha ao ser usado.'], solution: 'Matriz 15.01: (1) reservas[0] pode ser undefined com noUncheckedIndexedAccess; conferir existência antes de .nome. (2) EntradaFormulario.noites é string e não pode ser number; converter e validar. (3) JSON.parse em unknown exige guarda de objeto/campo antes de .checkIn. (4) Reserva.id é readonly; retornar uma cópia ou definir operação de renomeação. (5) literal fresco tem campo cafe ausente no contrato; corrigir a forma ou declarar extensão deliberada. (6) preco não retorna em todos os caminhos; tratar noites inválidas ou retornar um valor para cada ramo. Essas correções estáticas não validam o corpo de JSON recebido.' },
  '15.02': { environment:'typescript', checks:['types','behavior','mutation'], entryPath:'config.ts', testPath:'tests/15.02.test.js', ref:{'config.ts':`export type Config = { port: number };\nexport function parseConfig(raw: unknown): Config {\n  if (typeof raw !== 'object' || raw === null || !('port' in raw)) throw new TypeError('Configuração inválida');\n  const value = raw.port;\n  if (typeof value !== 'string' && typeof value !== 'number') throw new TypeError('Porta inválida');\n  const port = typeof value === 'number' ? value : Number(value);\n  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new RangeError('Porta fora da faixa');\n  return { port };\n}`}, tests:`import {test} from 'node:test'; import assert from 'node:assert/strict'; import {parseConfig} from '../config.ts';\ntest('converte texto numérico',()=>{assert.deepEqual(parseConfig({port:'8080'}),{port:8080});});\ntest('aplica default e aceita limite',()=>{assert.deepEqual(parseConfig({port:1}),{port:1}); assert.deepEqual(parseConfig({port:65535}),{port:65535});});\ntest('rejeita forma ausente e porta inválida',()=>{assert.throws(()=>parseConfig({}),TypeError); for (const port of ['abc',0,65536]) assert.throws(()=>parseConfig({port}),RangeError); assert.throws(()=>parseConfig(null),TypeError);});`, mutant:{'config.ts':`export type Config={port:number}; export function parseConfig(raw:unknown):Config { const port=Number((raw as {port?:unknown})?.port ?? 3000); return {port}; }`}, transfer:'Implemente parsePageLimit(raw: unknown): { limit:number } com entrada string decimal, default 20, e rejeição de texto inválido/valor fora de 1..100. Inclua as entradas, saídas e exceções num teste independente.'},
  '15.03': { environment:'typescript', checks:['types','behavior','mutation'], entryPath:'usuario.ts', testPath:'tests/15.03.test.js', ref:{'usuario.ts':`export type Usuario={nome:string; idade:number; criadoEm:string};\nexport function criarUsuario(nome:string, idade:number):Usuario { const limpo=nome.trim(); if (idade<13) throw new RangeError('Idade mínima: 13'); return {nome:limpo,idade,criadoEm:new Date(0).toISOString()}; }`}, tests:`import {test} from 'node:test'; import assert from 'node:assert/strict'; import {criarUsuario} from '../usuario.ts';\ntest('preserva contrato e normaliza nome',()=>{assert.deepEqual(criarUsuario(' Ana ',13),{nome:'Ana',idade:13,criadoEm:'1970-01-01T00:00:00.000Z'});});\ntest('rejeita idade abaixo do limite',()=>assert.throws(()=>criarUsuario('Ana',12),RangeError));\ntest('não altera a idade permitida',()=>assert.equal(criarUsuario('Bia',13).idade,13));`, mutant:{'usuario.ts':`export type Usuario={nome:string;idade:number;criadoEm:string}; export function criarUsuario(nome:string,idade:number):Usuario { return {nome,idade,criadoEm:new Date(0).toISOString()}; }`}, transfer:'Projete criarPagina(titulo: string, limite: number) para normalizar o título e rejeitar limite abaixo de 1. Acrescente type assertions negativas para título numérico e retorno incompatível, além de um caso runtime próprio.'},
  '15.04': { environment:'typescript', checks:['types','behavior','mutation'], entryPath:'perfil.ts', testPath:'tests/15.04.test.js', ref:{'perfil.ts':`export function ler(input: unknown): string {\n  if (typeof input !== 'object' || input === null || !('user' in input)) throw new TypeError('Perfil inválido');\n  const user = input.user;\n  if (typeof user !== 'object' || user === null || !('name' in user) || typeof user.name !== 'string') throw new TypeError('Nome inválido');\n  return user.name.toUpperCase();\n}`}, tests:`import {test} from 'node:test'; import assert from 'node:assert/strict'; import {ler} from '../perfil.ts';\ntest('lê o perfil válido',()=>assert.equal(ler({user:{name:'Ana'}}),'ANA'));\ntest('rejeita cada fronteira sem acesso prematuro',()=>{for(const v of [null,{}, {user:null},{user:{}},{user:{name:42}}]) assert.throws(()=>ler(v),TypeError);});\ntest('aceita nomes em branco sem alterar o limite da função',()=>assert.equal(ler({user:{name:'bia'}}),'BIA'));`,mutant:{'perfil.ts':`export function ler(input:unknown):string { return (input as any).user.name.toUpperCase(); }`},transfer:'Escreva uma função que lê email de um retorno desconhecido. Valide objeto, user e email:string, e inclua um payload válido, user ausente e email numérico em testes próprios.'},
  '15.06': { environment:'typescript', checks:['types'], entryPath:'formas.ts', tsconfigPath:'tsconfig.json', rubric:['Demonstrar por atribuições válidas/inválidas a compatibilidade estrutural de A/B e o efeito de alterar o tipo do campo id (0–3).','Distinguir propriedade extra de literal fresco e origem nominal de private/protected em classes (0–4).','Separar private apagado do TypeScript de #private em runtime e criar um caso de DTO independente (0–3).'], solution:'Atribuição de interfaces depende dos membros estruturais. Um campo private/protected cria compatibilidade nominal vinculada à declaração de origem. O excesso é checado com mais rigor em literal fresco, não em toda variável. `private` do TypeScript não vira proteção runtime; `#private` é campo privado ECMAScript. `implements` verifica a classe, não cria nominalidade para interfaces.' },
  '15.07': { environment:'typescript', checks:['types','behavior','mutation'], entryPath:'catalogo.ts', tsconfigPath:'tsconfig.json', testPath:'tests/15.07.test.js', ref:{'catalogo.ts':`export type Produto={nome:string; apelido?:string};\nexport function primeiroNome(lista: readonly Produto[]): string { const primeiro=lista[0]; if (!primeiro) throw new RangeError('Catálogo vazio'); return primeiro.nome; }\nexport const semApelido: Produto={nome:'Caneca'};\nexport function rotulo(produto:Produto):string { return produto.apelido ?? produto.nome; }`,'tsconfig.json':JSON.stringify({compilerOptions:{strict:true,noEmit:true,noUncheckedIndexedAccess:true,exactOptionalPropertyTypes:true},files:['catalogo.ts']})}, tests:`import {test} from 'node:test'; import assert from 'node:assert/strict'; import {primeiroNome,rotulo,semApelido} from '../catalogo.ts';\ntest('trata elemento ausente e campo opcional',()=>{assert.equal(primeiroNome([{nome:'A'}]),'A'); assert.throws(()=>primeiroNome([]),RangeError);});\ntest('usa nome como fallback',()=>assert.equal(rotulo(semApelido),'Caneca'));\ntest('prefere apelido definido',()=>assert.equal(rotulo({nome:'B',apelido:'Bee'}),'Bee'));`, mutant:{'catalogo.ts':`export type Produto={nome:string;apelido?:string}; export function primeiroNome(lista:readonly Produto[]):string { return lista[0]!.nome; } export const semApelido:Produto={nome:'Caneca'}; export function rotulo(produto:Produto):string { return produto.apelido!; }`}, transfer:'Modele uma lista de mensagens que pode estar vazia e um campo opcional exato. Defina se vazio retorna fallback ou erro; prove a escolha sem non-null assertion e teste item ausente e alias ausente.'},
  '15.08': { environment:'typescript', checks:['types','behavior','mutation'], entryPath:'paginacao.ts', tsconfigPath:'tsconfig.json', testPath:'tests/15.08.test.js', ref:{'paginacao.ts':`export function clamp(value:number,min:number,max:number):number { if (min>max) throw new RangeError('Faixa inválida'); return Math.min(max,Math.max(min,value)); }\nexport function unique<T>(items:readonly T[]):T[] { return [...new Set(items)]; }\nexport function paginar<T>(items:readonly T[],pagina:number,tamanho:number):T[] { if (!Number.isInteger(pagina)||pagina<1||!Number.isInteger(tamanho)||tamanho<1) throw new RangeError('Página e tamanho devem ser inteiros positivos'); return items.slice((pagina-1)*tamanho,pagina*tamanho); }`}, tests:`import {test} from 'node:test'; import assert from 'node:assert/strict'; import {clamp,unique,paginar} from '../paginacao.js';\ntest('clamp respeita faixa e ordem',()=>{assert.equal(clamp(4,1,3),3);assert.equal(clamp(-1,0,3),0);assert.throws(()=>clamp(1,5,0),RangeError);});\ntest('unique preserva ordem e não muta',()=>{const input=[3,1,3,NaN,NaN];assert.deepEqual(unique(input),[3,1,NaN]);assert.deepEqual(input,[3,1,3,NaN,NaN]);});\ntest('paginar verifica fronteiras e devolve recorte',()=>{assert.deepEqual(paginar([1,2,3],2,2),[3]);for(const [page,size] of [[0,2],[1.2,2],[1,0]])assert.throws(()=>paginar([1],page,size),RangeError);});`, mutant:{'paginacao.ts':`export function clamp(value:number,min:number,max:number):number { return Math.max(min,Math.min(max,value)); } export function unique<T>(items:readonly T[]):T[] { return [...new Set(items)]; } export function paginar<T>(items:readonly T[],pagina:number,tamanho:number):T[] { return items.slice((pagina-1)*tamanho,pagina*tamanho); }`}, transfer:'Migre uma API de ordenação e filtro preservando assinaturas, erros e exports. Inclua dois casos corretos, entrada inválida e um typecheck negativo; explique qualquer limite de compatibilidade do checker.'},
  '15.09': { environment:'rubric', checks:['rubric'], rubric:['Previsão antes de executar: indicar identidade compartilhada e valor observado após push em dados.itens (0–3).','Explicar por que a propriedade readonly bloqueia reatribuição estática, mas não torna profundo o array referenciado nem impede alias mutável (0–4).','Registrar uma execução reproduzível e política de cópia/ownership para um novo objeto de inventário (0–3).'], solution:'`vista.itens` e `dados.itens` apontam para o mesmo array; `dados.itens.push(2)` é visível pela vista. `readonly` impede atribuir outra referência a `vista.itens`, mas não torna imutável o array e é superficial. `Object.freeze` também não deve ser presumido profundo.' },
  '15.10': { environment:'rubric', checks:['rubric'], rubric:['Comparar o literal fresco com campo role e variável estruturalmente compatível, incluindo evidência de checker (0–3).','Mostrar como `satisfies` valida autoria sem alterar o tipo inferido e criar um caso próprio com tipo/valor errado (0–3).','Definir validação runtime para DTO externo com campo extra, indicando aceitar/rejeitar e observação concreta (0–4).'], solution:'A checagem de excesso aponta propriedades extras em literais recém escritos. A atribuição de variável permanece estrutural se os membros requeridos forem compatíveis. `satisfies` verifica o literal e preserva sua inferência; não cria schema nem valida rede.' },
  '15.11': { environment:'typescript', checks:['types','behavior','mutation'], entryPath:'perfil.ts', testPath:'tests/15.11.test.js', ref:{'perfil.ts':`type User={name:string};\nexport function nomeEmCaixaAlta(json:string):string {\n  let parsed: unknown; try { parsed=JSON.parse(json); } catch { throw new SyntaxError('JSON inválido'); }\n  if (typeof parsed!=='object'||parsed===null||!('name' in parsed)||typeof parsed.name!=='string') throw new TypeError('Perfil inválido: name deve ser texto');\n  return parsed.name.toUpperCase();\n}`}, tests:`import {test} from 'node:test'; import assert from 'node:assert/strict'; import {nomeEmCaixaAlta} from '../perfil.ts';\ntest('lê e normaliza payload válido',()=>assert.equal(nomeEmCaixaAlta('{"name":"Ana"}'),'ANA'));\ntest('distingue JSON malformado',()=>assert.throws(()=>nomeEmCaixaAlta('{'),SyntaxError));\ntest('rejeita forma inválida antes do método',()=>{assert.throws(()=>nomeEmCaixaAlta('{"name":42}'),TypeError);assert.throws(()=>nomeEmCaixaAlta('{}'),TypeError);});`, mutant:{'perfil.ts':`type User={name:string}; export function nomeEmCaixaAlta(json:string):string { const user=JSON.parse(json) as User; return user.name.toUpperCase(); }`}, transfer:'Leia um preço de storage como texto externo. Converta e valide formato/faixa antes de usá-lo; entregue casos para sucesso, texto inválido e valor fora da faixa e diferencie erro de parse de erro de domínio.'},
};
for (const id of ['15.02', '15.03', '15.04', '15.07', '15.08', '15.11']) definitions[id].environment = 'node-simulated';
// These are implementation and Parsons tasks; conformance tests remain
// protected in the published assessment instead of editable starter files.
definitions['15.02'].ref['config.ts'] = `export type Config = { port: number };
export function parseConfig(raw: unknown): Config {
  if (typeof raw !== 'object' || raw === null) throw new TypeError('Configuração inválida');
  if (!('port' in raw) || raw.port === undefined) return { port: 3000 };
  const value = raw.port;
  if (typeof value !== 'string' || !/^\\d+$/.test(value)) throw new RangeError('Porta inválida');
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new RangeError('Porta fora da faixa');
  return { port };
}`;
definitions['15.02'].tests = `import {test} from 'node:test'; import assert from 'node:assert/strict'; import {parseConfig} from '../config.ts';
test('usa default apenas quando port está ausente',()=>assert.deepEqual(parseConfig({}),{port:3000}));
test('aceita texto de dígitos nos limites e no meio da faixa',()=>{assert.deepEqual(parseConfig({port:'1'}),{port:1});assert.deepEqual(parseConfig({port:'65535'}),{port:65535});assert.deepEqual(parseConfig({port:'8080'}),{port:8080});});
test('rejeita valor numérico e texto que não representa inteiro permitido',()=>{for(const port of [1,3000,65535,'',' 80','80 ','+80','8e1','1.5','abc','0','65536'])assert.throws(()=>parseConfig({port}),RangeError);});
test('port undefined usa default e entrada que não seja objeto falha',()=>{assert.deepEqual(parseConfig({port:undefined}),{port:3000});for(const raw of [null,undefined,7,'{}'])assert.throws(()=>parseConfig(raw),TypeError);});`;
definitions['15.02'].mutant['config.ts'] = `export type Config={port:number}; export function parseConfig(raw:unknown):Config { if(typeof raw!=='object'||raw===null)return {port:3000}; const value=(raw as {port?:unknown}).port; if(value===undefined)return {port:3000}; const port=Number(value); if(!Number.isInteger(port)||port<1||port>65535)throw new RangeError('Porta inválida'); return {port}; }`;
definitions['15.02'].contractTypes = `import {parseConfig, type Config} from '../config.js';
type IsAny<T> = 0 extends (1 & T) ? true : false;
type AssertFalse<T extends false> = T;
type RawMustNotBeAny = AssertFalse<IsAny<Parameters<typeof parseConfig>[0]>>;
type ResultMustNotBeAny = AssertFalse<IsAny<ReturnType<typeof parseConfig>>>;
const result: Config = parseConfig({});
// @ts-expect-error port is the numeric normalized result, not text
const badResult: {port: string} = parseConfig({});`;
definitions['15.02'].typeMutant = {'config.ts':`export type Config={port:number}; export function parseConfig(raw:any):any { return raw; }`};
definitions['15.03'].ref['usuario.ts'] = `export type Usuario={nome:string; idade:number; criadoEm:string};
export function criarUsuario(nome:string, idade:number):Usuario { const limpo=nome.trim(); if (idade<13) throw new RangeError('Idade mínima: 13'); return {nome:limpo,idade,criadoEm:new Date().toISOString()}; }`;
definitions['15.03'].tests = `import {test} from 'node:test'; import assert from 'node:assert/strict'; import {criarUsuario} from '../usuario.ts';
test('preserva API, normaliza nome e grava instante ISO atual',()=>{const before=Date.now();const user=criarUsuario(' Ana ',13);const after=Date.now();assert.equal(user.nome,'Ana');assert.equal(user.idade,13);assert.match(user.criadoEm,/^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}Z$/);const stamp=Date.parse(user.criadoEm);assert.ok(stamp>=before-1000&&stamp<=after+1000);});
test('rejeita idade abaixo do limite',()=>assert.throws(()=>criarUsuario('Ana',12),RangeError));
test('não altera a idade permitida',()=>assert.equal(criarUsuario('Bia',13).idade,13));`;
definitions['15.03'].mutant['usuario.ts'] = `export type Usuario={nome:string;idade:number;criadoEm:string}; export function criarUsuario(nome:string,idade:number):Usuario { return {nome,idade,criadoEm:new Date(0).toISOString()}; }`;
definitions['15.03'].contractTypes = `import {criarUsuario, type Usuario} from '../usuario.js';
type IsAny<T> = 0 extends (1 & T) ? true : false;
type AssertFalse<T extends false> = T;
type NameMustNotBeAny = AssertFalse<IsAny<Parameters<typeof criarUsuario>[0]>>;
type AgeMustNotBeAny = AssertFalse<IsAny<Parameters<typeof criarUsuario>[1]>>;
type UserMustNotBeAny = AssertFalse<IsAny<ReturnType<typeof criarUsuario>>>;
const creator: (nome: string, idade: number) => Usuario = criarUsuario;
const user: Usuario = creator('Ana', 13);
// @ts-expect-error nome precisa ser texto
criarUsuario(13, 13);
// @ts-expect-error idade precisa ser número
criarUsuario('Ana', '13');
// @ts-expect-error retorno precisa preservar o modelo Usuario
const wrongReturn: {nome: number} = criarUsuario('Ana', 13);`;
definitions['15.04'].contractTypes = `import {ler} from '../perfil.js';
type IsAny<T> = 0 extends (1 & T) ? true : false;
type AssertFalse<T extends false> = T;
type InputMustNotBeAny = AssertFalse<IsAny<Parameters<typeof ler>[0]>>;
const readProfile: (payload: unknown) => string = ler;
const name: string = readProfile({user: {name: 'Ana'}});
// @ts-expect-error return is normalized text
const wrongName: number = readProfile({user: {name: 'Ana'}});`;
definitions['15.04'].mutant['perfil.ts'] = `export function ler(payload: unknown): string { return (payload as {user:{name:string}}).user.name.toUpperCase(); }`;
definitions['15.07'].ref['catalogo.ts'] = `export type Produto={nome:string; apelido?:string};
export function primeiroNome(lista: string[]): string { const primeiro=lista[0]; if (primeiro === undefined) throw new RangeError('Catálogo vazio'); return primeiro.toUpperCase(); }
export function semApelido(produto: Produto): Produto { const {apelido: _apelido, ...sem}=produto; return sem; }
export function rotulo(produto:Produto):string { return (produto.apelido ?? produto.nome).trim(); }`;
definitions['15.07'].tests = `import {test} from 'node:test'; import assert from 'node:assert/strict'; import {primeiroNome,rotulo,semApelido} from '../catalogo.ts';
test('primeiroNome recebe string[] e trata lista vazia',()=>{assert.equal(primeiroNome(['ana','bia']),'ANA');assert.throws(()=>primeiroNome([]),RangeError);});
test('semApelido é função que devolve cópia sem apelido',()=>{const source={nome:'Caneca',apelido:'C'};const result=semApelido(source);assert.deepEqual(result,{nome:'Caneca'});assert.equal(Object.hasOwn(result,'apelido'),false);assert.equal(source.apelido,'C');});
test('rotulo usa fallback e remove espaços do valor escolhido',()=>{assert.equal(rotulo({nome:' Caneca '}),'Caneca');assert.equal(rotulo({nome:'X',apelido:'  Bee  '}),'Bee');});`;
definitions['15.07'].mutant['catalogo.ts'] = `export type Produto={nome:string;apelido?:string}; export function primeiroNome(lista:string[]):string { const primeiro=lista[0]; if(primeiro===undefined)throw new RangeError('Catálogo vazio'); return primeiro.toUpperCase(); } export function semApelido(produto:Produto):Produto { return {...produto}; } export function rotulo(produto:Produto):string { return produto.apelido ?? produto.nome; }`;
definitions['15.02'].solution = 'Em parseConfig, primeiro rejeite raw que não seja objeto (null inclusive). Se a propriedade port estiver ausente, retorne o default 3000. Se estiver presente, aceite apenas string composta por dígitos; converta para number e exija inteiro entre 1 e 65535. Todos os valores de port fora desse domínio, inclusive valores numéricos, geram RangeError. O Config retornado descreve a saída normalizada, não o parser.';
definitions['15.03'].solution = 'Declare criarUsuario(nome: string, idade: number): Usuario. O nome da constante local pode ser inferido a partir de trim; a função retorna Usuario. Preserve criadoEm: new Date().toISOString() para registrar o instante atual em ISO, normalize espaços do nome e mantenha o limite mínimo de idade.';
definitions['15.04'].solution = 'Troque any por unknown e prove cada acesso em sequência: payload deve ser objeto não nulo, ter user objeto não nulo, e name string. Lance TypeError com mensagem própria em cada forma inválida e só então aplique toUpperCase. O cast do JSON não valida a forma recebida.';
definitions['15.07'].solution = 'Mantenha primeiroNome(lista: string[]): string, trate lista vazia com RangeError e devolva o primeiro nome em maiúsculas. semApelido é função de Produto para Produto; retorne uma cópia sem a chave apelido. rotulo escolhe apelido quando existe ou nome quando falta, depois aplica trim ao texto escolhido.';
definitions['15.08'].solution = 'Migre clamp, unique e paginar para TypeScript sem trocar nomes, exports, ordem dos argumentos nem erros documentados. Preserve o clamp inclusivo, a ordem da primeira ocorrência em unique e a fatia 1-based em paginar; valide faixa, página e tamanho antes de calcular o recorte.';
definitions['15.11'].solution = 'Faça JSON.parse retornar unknown e separe JSON malformado (SyntaxError) de payload inválido (TypeError). Antes de acessar name, valide que o valor é objeto não nulo, contém name e que name é string; normalize para maiúsculas somente depois das guardas.';
definitions['15.07'].contractTypes = `import {primeiroNome, semApelido, rotulo, type Produto} from '../catalogo.js';
type IsAny<T> = 0 extends (1 & T) ? true : false;
type AssertFalse<T extends false> = T;
type NamesMustNotBeAny = AssertFalse<IsAny<Parameters<typeof primeiroNome>[0]>>;
type NameMustNotBeAny = AssertFalse<IsAny<ReturnType<typeof primeiroNome>>>;
type ProductInputMustNotBeAny = AssertFalse<IsAny<Parameters<typeof semApelido>[0]>>;
type ProductResultMustNotBeAny = AssertFalse<IsAny<ReturnType<typeof semApelido>>>;
type LabelInputMustNotBeAny = AssertFalse<IsAny<Parameters<typeof rotulo>[0]>>;
type LabelResultMustNotBeAny = AssertFalse<IsAny<ReturnType<typeof rotulo>>>;
const name: string = primeiroNome(['ana']);
const product: Produto = semApelido({nome: 'Caneca', apelido: 'C'});
const text: string = rotulo(product);
// @ts-expect-error primeiroNome takes string[], not Produto[]
primeiroNome([{nome: 'Caneca'}]);
// @ts-expect-error semApelido is a function requiring a product
const notAFunction: Produto = semApelido;
// @ts-expect-error rotulo returns string, not Produto
const wrongLabel: Produto = rotulo(product);`;
definitions['15.07'].typeMutant = {'catalogo.ts':`export type Produto={nome:string;apelido?:string}; export function primeiroNome(lista:any):any {return lista[0];} export function semApelido(produto:any):any{return produto;} export function rotulo(produto:any):any{return produto;}`};
definitions['15.04'].tests += `\ntest('valida a string antes de chamar métodos',()=>assert.throws(()=>ler({user:{name:42}}),/Nome inválido/));`;
definitions['15.08'].tests = definitions['15.08'].tests.replace("from '../paginacao.js'", "from '../paginacao.ts'");
definitions['15.08'].contractTypes = `import {clamp, unique, paginar} from '../paginacao.js';
const bound: (value: number, min: number, max: number) => number = clamp;
const dedupe: <T>(items: readonly T[]) => T[] = unique;
const page: <T>(items: readonly T[], pagina: number, tamanho: number) => T[] = paginar;
const labels: string[] = dedupe(['a', 'b']);
const firstLabel: string = page(labels, 1, 1)[0]!;
const high: number = bound(5, 0, 3);
// @ts-expect-error generic element type must be preserved
const wrongItems: string[] = dedupe([1, 2]);
// @ts-expect-error unique must accept readonly arrays
const readonlyInput: (items: readonly number[]) => number[] = (items: number[]) => unique(items);
// @ts-expect-error page indices remain numbers
page(labels, '1', 2);`;
definitions['15.11'].tests += `\ntest('expõe mensagem de validação de forma inválida',()=>assert.throws(()=>nomeEmCaixaAlta('{"name":42}'),/Perfil inválido/));`;
definitions['15.11'].contractTypes = `import {nomeEmCaixaAlta} from '../perfil.js';
const parseProfile: (json: string) => string = nomeEmCaixaAlta;
const upper: string = parseProfile('{"name":"Ana"}');
// @ts-expect-error input is serialized JSON text, not an object
parseProfile({name: 'Ana'});
// @ts-expect-error normalized result is text
const count: number = parseProfile('{"name":"Ana"}');`;

function write(relative, content) { const target=path.join(root, relative); fs.mkdirSync(path.dirname(target),{recursive:true}); fs.writeFileSync(target,content.endsWith('\n')?content:content+'\n'); files.set(relative,content); }
for (const id of ['15.02','15.03','15.04','15.11']) {
  definitions[id].tsconfigPath = 'tsconfig.json';
  write(`course-src/starters/${id}/tsconfig.json`,JSON.stringify({compilerOptions:{target:'es2022',strict:true,noEmit:true},files:[definitions[id].entryPath]}));
  manifest[id].files=[...new Set([...manifest[id].files,'tsconfig.json'])];
  definitions[id].ref['tsconfig.json']=JSON.stringify({compilerOptions:{target:'es2022',strict:true,noEmit:true},files:[definitions[id].entryPath]});
}
definitions['15.08'].tsconfigPath='assessment.tsconfig.json';
const stage15TypeConfig=JSON.stringify({compilerOptions:{target:'es2022',strict:true,noEmit:true,noUncheckedIndexedAccess:true},files:['paginacao.ts']});
write('course-src/starters/15.08/assessment.tsconfig.json',stage15TypeConfig);
manifest['15.08'].files=[...new Set([...manifest['15.08'].files,'assessment.tsconfig.json'])];
definitions['15.08'].ref['assessment.tsconfig.json']=stage15TypeConfig;
write('course-src/starters/15.01/tsconfig.json',JSON.stringify({compilerOptions:{strict:true,noEmit:true,noUncheckedIndexedAccess:true},files:['diagnosticos.ts']}));
manifest['15.01'].files=[...new Set([...manifest['15.01'].files,'tsconfig.json'])];
definitions['15.01'].transfer='Em um handler de reserva, diagnostique uma leitura possivelmente ausente de lista e uma propriedade numérica vinda de JSON. Registre arquivo/linha, tipo conhecido, prova ausente e uma correção sem cast; mostre um payload inválido que ainda precisa de validação runtime.';
definitions['15.06'].transfer='Compare dois DTOs próprios com os mesmos campos públicos, um literal fresco com campo extra e duas classes que declaram private separadamente. Inclua atribuições que o checker aceita/rejeita e diga se a privacidade é estática ou runtime.';
definitions['15.09'].transfer='Uma coleção de membros é compartilhada entre editor e painel. Registre o que acontece após push por cada alias, uma tentativa de reatribuição e uma opção de cópia. Separe readonly superficial, identidade e congelamento runtime.';
definitions['15.10'].transfer='Projete a leitura de um cartão de produto recebido por fetch com campo de extensão desconhecido. Compare literal, variável e satisfies no checker e escolha uma política de schema runtime com exemplo válido e inválido.';
function solution(id, body) { write(`course-src/solutions/${id}/README.md`, `# Referência ${id}\n\n${body || 'Esta atividade é investigativa: use o contrato publicado, compare os exemplos documentados e registre evidência observável antes de generalizar.'}\n\n## Evidência independente\n${definitions[id].transfer || 'A referência demonstra o contrato principal; a transferência exige cenário novo, entradas, saídas e limite explicitamente registrados.'}\n`); }
for (const item of entries) {
  const id=item.id, d=definitions[id]; if(!d) throw new Error(`Missing Stage15 ${id}`);
  const entry=manifest[id].files.find(file=>/\.(?:ts|js)$/.test(file));
  if(d.ref){ for(const [name,content] of Object.entries(d.ref)) write(`course-src/solutions/${id}/${name}`,content); }
  if(d.tests) {
    write(`course-src/tests/${id}.test.js`,d.tests.replaceAll("from '../", "from './"));
    manifest[id].files = manifest[id].files.filter(file => file !== `tests/${id}.test.js`);
    const editableTest = path.join(root, 'course-src/starters', id, 'tests', `${id}.test.js`);
    if (fs.existsSync(editableTest)) fs.unlinkSync(editableTest);
  }
  if(d.mutant) for(const [name,content] of Object.entries(d.mutant)) write(`course-src/mutants/${id}/plausible/${name}`,content);
  solution(id,d.solution);
  const runnable=Boolean(d.testPath);
  const assessment={environment:d.environment,version:1,checks:d.checks,entryPath:d.entryPath,referenceDir:`solutions/${id}`,...(d.tsconfigPath?{tsconfigPath:d.tsconfigPath}:{}),...(d.contractTypes?{contractTypeFiles:[{path:`contracts/${id}.types.ts`,content:d.contractTypes}]}:{}),...(d.typeMutant?{typeContractMutants:[{id:'any-signature',files:Object.entries(d.typeMutant).map(([name,content])=>({path:name,content}))}]}:{}),...(d.testPath?{testPath:`tests/${id}.test.js`,behaviorTestPath:'__devpath_tests__.js',typecheckMutants:true,mutantDirs:[{id:'plausible',files:Object.entries(d.mutant).map(([name,content])=>({path:name,content}))}],correctFiles:Object.entries(d.ref).map(([name,content])=>({path:name,content}))}:{}),...(d.expectedDiagnostics?{expectedDiagnostics:d.expectedDiagnostics.map(([code,line])=>({code,file:entry,line}))}:{}),...(d.rubric?{rubric:d.rubric}:{}),transfer:{id:`${id}-transfer`,files:[{path:'transfer.md',content:`# Transferência ${id}\n\n${d.transfer || 'Produza um caso independente com entrada, saída, erro e limite observados.'}`}],rubric:d.rubric||['Preserve o contrato e diferencie resultado normal, borda e falha com evidência reproduzível.']},prompt:`${d.transfer || `Resolva o contrato publicado de ${id} e registre evidência com entrada, resultado e limite.`}`};
  assessments[id]=assessment;
}
write('course-src/starters/manifest.json',JSON.stringify(manifest,null,2));
for(const[k,v]of Object.entries(TRANSFER_RUBRICS))assessments[k].transfer.rubric=v;write('course-src/assessments.json',JSON.stringify(assessments,null,2));
write('output/learning-execution/task-8b-stage15-owned-paths.json',JSON.stringify([...files.keys()].sort(),null,2));
console.log(`Stage 15 authored ${entries.length} activities; ${entries.filter(item=>definitions[item.id].testPath).length} executable suites.`);
