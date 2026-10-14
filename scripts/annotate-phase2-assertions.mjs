import {createHash} from 'node:crypto';
import {readFileSync, readdirSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {parse} from 'acorn';

const root = process.cwd();
const testRoot = path.join(root, 'course-src', 'tests');
const assessmentsFile = path.join(root, 'course-src', 'assessments.json');
const matchers = new Set(['toBe', 'toEqual', 'toStrictEqual', 'toBeTruthy', 'toBeFalsy', 'toBeNull', 'toBeUndefined', 'toBeInstanceOf', 'toContain', 'toHaveLength', 'toBeGreaterThan', 'toBeLessThan', 'toBeCloseTo', 'toThrow', 'toHaveBeenCalled', 'toHaveBeenCalledTimes', 'toHaveBeenCalledWith']);
const comments = [];

function sourceName(node) {
  if (node?.type === 'Identifier') return node.name;
  if (node?.type === 'Literal') return String(node.value);
  if (node?.type === 'MemberExpression') return `${sourceName(node.object)}.${sourceName(node.property)}`;
  return '';
}
const assertMethods = new Set(['ok', 'equal', 'notEqual', 'strictEqual', 'notStrictEqual', 'deepEqual', 'notDeepEqual', 'throws', 'doesNotThrow', 'rejects', 'doesNotRejects', 'match', 'doesNotMatch', 'fail']);
function importedAssertBindings(ast) {
  const namespaces = new Set();
  const named = new Map();
  for (const statement of ast.body || []) {
    if (statement.type !== 'ImportDeclaration' || !/^node:assert(?:\/strict)?$/.test(statement.source.value)) continue;
    for (const specifier of statement.specifiers) {
      if (specifier.type === 'ImportDefaultSpecifier' || specifier.type === 'ImportNamespaceSpecifier') namespaces.add(specifier.local.name);
      else if (assertMethods.has(specifier.imported.name)) named.set(specifier.local.name, specifier.imported.name);
    }
  }
  return {namespaces, named};
}
function walk(node, source, ancestors, output, assertBindings) {
  if (!node || typeof node !== 'object') return;
  const chain = [...ancestors, node];
  if (node.type === 'CallExpression' && node.callee?.type === 'MemberExpression') {
    const matcher = sourceName(node.callee.property);
    let base = node.callee.object;
    const chainNames = [];
    while (base?.type === 'MemberExpression') { chainNames.unshift(sourceName(base.property)); base = base.object; }
    if (matchers.has(matcher) && base?.type === 'CallExpression' && base.callee?.name === 'expect') {
      output.push({node, matcher, api: 'expect', root: base, chainNames, ancestors: chain});
    } else if (base?.type === 'Identifier' && assertBindings.namespaces.has(base.name) && assertMethods.has(matcher)) {
      output.push({node, matcher: `assert.${matcher}`, api: 'node-assert', root: node, chainNames: [], ancestors: chain});
    }
  } else if (node.type === 'CallExpression' && node.callee?.type === 'Identifier' && assertBindings.named.has(node.callee.name)) {
    const method = assertBindings.named.get(node.callee.name);
    output.push({node, matcher: `assert.${method}`, api: 'node-assert', root: node, chainNames: [], ancestors: chain});
  }
  for (const [key, value] of Object.entries(node)) {
    if (key === 'loc' || key === 'start' || key === 'end') continue;
    if (Array.isArray(value)) for (const child of value) walk(child, source, chain, output, assertBindings);
    else if (value && typeof value === 'object' && typeof value.type === 'string') walk(value, source, chain, output, assertBindings);
  }
}
function expression(source, node) { return node ? source.slice(node.start, node.end) : 'sem argumento'; }
function markerFor(source, comments, matcher, used) {
  const start = matcher.api === 'node-assert' ? matcher.node.start : matcher.root.start;
  const eligible = comments.filter(comment => comment.end <= start && !used.has(comment) && /@case\b/.test(comment.value)
    && ['', 'await'].includes(source.slice(comment.end, start).replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\r\n]*/g, '').trim())
    && !comments.some(other => other !== comment && other.start > comment.end && other.start < start && /@case\b/.test(other.value)));
  const nearest = eligible.sort((a, b) => b.end - a.end)[0];
  const parsed = nearest?.value.trim().match(/^@case\s+([A-Za-z0-9][A-Za-z0-9._-]*)\s*$/);
  if (parsed) used.add(nearest);
  return nearest ? (parsed ? {comment: nearest, id: parsed[1]} : (() => { throw new Error(`Anotação malformada ou sem associação direta no offset ${nearest.start}.`); })()) : null;
}
function slug(value) { return String(value || 'case').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 28) || 'case'; }
function getCaseContext(source, item, file, activityAssessment, ast) {
  const testCall = [...item.ancestors].reverse().find(node => node.type === 'CallExpression' && ['test', 'it'].includes(node.callee?.name));
  const testName = typeof testCall?.arguments?.[0]?.value === 'string' ? testCall.arguments[0].value : 'assertiva sem título';
  const callback = testCall?.arguments?.find(arg => ['ArrowFunctionExpression', 'FunctionExpression'].includes(arg?.type));
  const setupStart = callback?.body?.type === 'BlockStatement' ? callback.body.start + 1 : callback?.body?.start;
  const assertionStart = item.api === 'node-assert' ? item.node.start : ([...item.ancestors].reverse().find(node => node.type === 'AwaitExpression')?.start ?? item.root.start);
  const setup = setupStart === undefined ? '' : source.slice(setupStart, assertionStart).replace(/\/\*@case\s+[A-Za-z0-9][A-Za-z0-9._-]*\*\//g, '').trim();
  const loop = [...item.ancestors].reverse().find(node => ['ForStatement', 'ForInStatement', 'ForOfStatement', 'WhileStatement', 'DoWhileStatement'].includes(node.type));
  const loopDomain = loop?.type === 'ForOfStatement' || loop?.type === 'ForInStatement'
    ? expression(source, loop.right)
    : loop?.type === 'ForStatement' ? expression(source, loop.init) : loop ? expression(source, loop.test) : undefined;
  let domainBindingName;
  let domainBindingExpression;
  const binding = loop?.right?.type === 'CallExpression' && loop.right.callee?.type === 'MemberExpression'
    && loop.right.callee.object?.name === 'Object' && loop.right.callee.property?.name === 'entries'
    ? loop.right.arguments[0] : null;
  if (binding?.type === 'Identifier') {
    const declaration = (ast.body || []).filter(statement => statement.type === 'VariableDeclaration').flatMap(statement => statement.declarations)
      .find(candidate => candidate.id?.type === 'Identifier' && candidate.id.name === binding.name);
    if (declaration?.init) { domainBindingName = binding.name; domainBindingExpression = expression(source, declaration.init); }
  }
  const expectedNodes = item.node.arguments;
  const isAssert = item.api === 'node-assert';
  const isNegated = item.chainNames.includes('not') || /^assert\.(?:notEqual|notStrictEqual|notDeepEqual|notDeepStrictEqual|doesNotThrow|doesNotReject|doesNotRejects|doesNotMatch)$/.test(item.matcher);
  const receivedNode = item.root.arguments[0];
  const isExplicitInputCapture = !isAssert && receivedNode?.type === 'CallExpression' && receivedNode.callee?.name === '__devpathCaptureInput' && receivedNode.arguments.length >= 3;
  const actualExpression = isAssert ? expression(source, expectedNodes[0]) : isExplicitInputCapture ? expression(source, receivedNode.arguments[2].body || receivedNode.arguments[2]) : expression(source, receivedNode);
  const expectedExpression = isAssert && ['assert.ok', 'assert.fail', 'assert'].includes(item.matcher)
    ? 'true'
    : isAssert && ['assert.doesNotThrow', 'assert.doesNotReject', 'assert.doesNotRejects'].includes(item.matcher)
      ? 'não lançar/rejeitar'
      : isAssert ? (expectedNodes[1] ? expression(source, expectedNodes[1]) : ['assert.throws', 'assert.rejects'].includes(item.matcher) ? 'algum erro' : 'true')
        : item.matcher === 'toHaveBeenCalledWith' ? `[${expectedNodes.map(node => expression(source, node)).join(', ')}]`
          : item.matcher === 'toThrow' && isNegated ? 'não lançar'
          : expectedNodes[0] ? expression(source, expectedNodes[0])
            : ({toBeTruthy: 'true', toBeFalsy: 'false', toBeNull: 'null', toBeUndefined: 'undefined', toHaveBeenCalled: 'true', toThrow: 'algum erro'}[item.matcher] || 'true');
  const inputExpression = actualExpression;
  const assertionExpression = expression(source, item.node);
  const hash = createHash('sha256').update(`${file}\0${testName}\0${item.matcher}\0${assertionExpression}`).digest('hex').slice(0, 8);
  return {testName, setup, loopDomain, domainBindingName, domainBindingExpression, expectedExpression, inputExpression, assertionExpression, hash, isExplicitInputCapture, negated: isNegated};
}

const assessments = JSON.parse(readFileSync(assessmentsFile, 'utf8'));
const argumentsList = process.argv.slice(2);
for (let index = 0; index < argumentsList.length; index += 1) {
  const argument = argumentsList[index];
  if (argument.startsWith('--') && !['--ids', '--initialize-marked', '--refresh-marked'].includes(argument)) throw new Error(`Opção desconhecida: ${argument}`);
  if (!argument.startsWith('--') && argumentsList[index - 1] !== '--ids') throw new Error(`Argumento inesperado: ${argument}`);
}
const selectedIndex = argumentsList.indexOf('--ids');
const selectedIds = selectedIndex >= 0 ? new Set((argumentsList[selectedIndex + 1] || '').split(',').filter(Boolean)) : null;
if (selectedIndex >= 0 && (!selectedIds.size || !argumentsList[selectedIndex + 1] || argumentsList[selectedIndex + 1].startsWith('--'))) {
  throw new Error('--ids exige uma lista não vazia de IDs separados por vírgula.');
}
const initializeMarked = argumentsList.includes('--initialize-marked');
const refreshMarked = argumentsList.includes('--refresh-marked');
if (refreshMarked && !selectedIds) throw new Error('--refresh-marked exige --ids para limitar a atualização.');
const files = readdirSync(testRoot).filter(name => name.endsWith('.test.js')
  && (!selectedIds || selectedIds.has(name.replace(/\.test\.js$/, '')))).sort();
if (selectedIds && files.length !== selectedIds.size) throw new Error(`Arquivo de suíte ausente para: ${[...selectedIds].join(', ')}`);
let annotated = 0;
for (const filename of files) {
  const id = filename.replace(/\.test\.js$/, '');
  if (!assessments[id]) throw new Error(`Assessment ausente: ${id}`);
  const fullPath = path.join(testRoot, filename);
  const source = readFileSync(fullPath, 'utf8');
  const parsedComments = [];
  const ast = parse(source, {ecmaVersion: 'latest', sourceType: 'module', allowHashBang: true, onComment: parsedComments});
  const assertions = [];
  const assertBindings = importedAssertBindings(ast);
  walk(ast, source, [], assertions, assertBindings);
  const existing = new Map();
  for (const record of (assessments[id].assertionCases || [])) existing.set(record.id, [...(existing.get(record.id) || []), record]);
  const inserted = [];
  const cases = [];
  const usedMarkers = new Set();
  for (const item of assertions) {
    const marker = markerFor(source, parsedComments, item, usedMarkers);
    const context = getCaseContext(source, item, filename, assessments[id], ast);
    const caseId = marker?.id || `${id}.${slug(context.testName)}-${context.hash}`;
    const record = {
      id: caseId,
      sourceTestPath: `tests/${filename}`,
      testName: context.testName,
      inputExpression: context.inputExpression,
      matcher: item.matcher,
      expectedExpression: context.expectedExpression,
      negated: context.negated,
      assertionApi: item.api,
      executionScope: item.api === 'node-assert' ? 'source-local-suite; not evidence of browser behavior' : assessments[id].checks?.includes('behavior') ? 'browser-behavior-suite' : 'source-suite-only; not evidence of browser behavior',
      ...(context.isExplicitInputCapture ? {runtimeInputMeaning: 'explicitly captured input immediately before the asserted call; callback executes once'} : {}),
      ...(context.loopDomain ? {domainExpression: context.loopDomain} : {}),
      ...(context.domainBindingName ? {domainBindingName: context.domainBindingName, domainBindingExpression: context.domainBindingExpression} : {}),
      initialArrangementExpression: context.setup || 'sem setup anterior dentro deste teste',
      assertionExpression: context.assertionExpression,
      contractRule: `${context.inputExpression} ${item.chainNames.length ? `${item.chainNames.join('.')}.` : ''}${item.matcher} ${context.expectedExpression}`,
      investigation: `Confira a expressão de entrada e a comparação ${item.matcher} deste caso: ${context.assertionExpression}`,
      assertionOffset: item.node.start,
    };
    const priors = existing.get(caseId) || [];
    if (marker && priors.length === 0 && !initializeMarked) throw new Error(`${filename}:${item.node.start}: anotação sem contrato publicado: ${caseId}`);
    if (priors.length) {
      const semanticFields = ['inputExpression', 'matcher', 'expectedExpression', 'negated', 'assertionExpression', 'domainExpression', 'domainBindingName', 'domainBindingExpression', 'initialArrangementExpression'];
      const prior = priors.find(candidate => semanticFields.every(field => (candidate[field] ?? null) === (record[field] ?? null)));
      if (!prior && !(marker && refreshMarked)) throw new Error(`${filename}:${item.node.start}: mudança semântica/contextual em ${caseId}; revise o contrato publicado antes de materializar`);
      cases.push(prior ? {...prior, assertionOffset: record.assertionOffset} : record);
    } else cases.push(record);
    if (!marker) inserted.push({offset: item.node.start, text: `/*@case ${caseId}*/`});
  }
  const orphanMarkers = parsedComments.filter(comment => /@case\b/.test(comment.value) && !usedMarkers.has(comment));
  if (orphanMarkers.length) throw new Error(`${filename}:${orphanMarkers[0].start}: anotação órfã/ambígua; cada marker precisa ficar diretamente junto a um assert.`);
  let next = source;
  for (const insertion of inserted.sort((a, b) => b.offset - a.offset)) next = `${next.slice(0, insertion.offset)}${insertion.text}${next.slice(insertion.offset)}`;
  if (next !== source) writeFileSync(fullPath, next, 'utf8');
  annotated += assertions.length;
  assessments[id].assertionCases = cases;
}
writeFileSync(assessmentsFile, `${JSON.stringify(assessments, null, 2)}\n`, 'utf8');
console.log(`Published ${annotated} case records across ${files.length} handwritten suites.`);
