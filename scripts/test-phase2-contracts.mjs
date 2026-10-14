import assert from 'node:assert/strict';
import {readFileSync, readdirSync, existsSync} from 'node:fs';
import path from 'node:path';
import {parse} from 'acorn';

const root = process.cwd();
const sourceTests = path.join(root, 'course-src', 'tests');
const assessmentsPath = path.join(root, 'course-src', 'assessments.json');
const publishedTestsPath = path.join(root, 'public', 'course-tests.json');
const publishedAssessmentsPath = path.join(root, 'public', 'course-assessments.json');
const allowedMatchers = new Set([
  'toBe', 'toEqual', 'toStrictEqual', 'toBeTruthy', 'toBeFalsy', 'toBeNull',
  'toBeUndefined', 'toBeInstanceOf', 'toContain', 'toHaveLength',
  'toBeGreaterThan', 'toBeLessThan', 'toBeCloseTo', 'toThrow',
  'toHaveBeenCalled', 'toHaveBeenCalledTimes', 'toHaveBeenCalledWith',
]);

function walk(node, visit, parent = null, ancestors = []) {
  if (!node || typeof node !== 'object') return;
  if (typeof node.type === 'string') visit(node, parent, ancestors);
  const nextAncestors = typeof node.type === 'string' ? [...ancestors, node] : ancestors;
  for (const [key, value] of Object.entries(node)) {
    if (key === 'loc' || key === 'start' || key === 'end') continue;
    if (Array.isArray(value)) for (const child of value) walk(child, visit, node, nextAncestors);
    else if (value && typeof value === 'object' && typeof value.type === 'string') walk(value, visit, node, nextAncestors);
  }
}

function onlyTriviaOrAwait(source) {
  const remaining = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\r\n]*/g, '').trim();
  return remaining === '' || remaining === 'await';
}
function normalizedArrangement(value) {
  const text = String(value || '').trim();
  return text === 'sem setup anterior dentro deste teste' ? '' : text.replace(/\s+/g, ' ');
}
function loopDomain(source, item, ast) {
  const loop = [...item.ancestors].reverse().find(node => ['ForStatement', 'ForInStatement', 'ForOfStatement', 'WhileStatement', 'DoWhileStatement'].includes(node.type));
  if (!loop) return {};
  const domainNode = loop.type === 'ForOfStatement' || loop.type === 'ForInStatement' ? loop.right : loop.type === 'ForStatement' ? loop.init : loop.test;
  if (!domainNode) return {};
  const result = {domainExpression: source.slice(domainNode.start, domainNode.end)};
  if (domainNode.type === 'CallExpression' && domainNode.callee?.type === 'MemberExpression' && domainNode.callee.object?.name === 'Object' && domainNode.callee.property?.name === 'entries' && domainNode.arguments[0]?.type === 'Identifier') {
    const name = domainNode.arguments[0].name;
    for (const statement of ast.body || []) {
      if (statement.type !== 'VariableDeclaration') continue;
      const declaration = statement.declarations.find(candidate => candidate.id?.type === 'Identifier' && candidate.id.name === name);
      if (declaration?.init) {
        result.domainBindingName = name;
        result.domainBindingExpression = source.slice(declaration.init.start, declaration.init.end);
        break;
      }
    }
  }
  return result;
}

function matcherName(node) {
  if (node?.type !== 'CallExpression' || node.callee?.type !== 'MemberExpression') return null;
  const property = node.callee.computed ? node.callee.property?.value : node.callee.property?.name;
  if (!allowedMatchers.has(property)) return null;
  let current = node.callee.object;
  const chain = [];
  while (current?.type === 'MemberExpression') {
    chain.unshift(current.computed ? current.property?.value : current.property?.name);
    current = current.object;
  }
  if (current?.type !== 'CallExpression' || current.callee?.name !== 'expect') return null;
  return {name: property, root: current, chain};
}

function parseSuite(source, filename) {
  const comments = [];
  const ast = parse(source, {ecmaVersion: 'latest', sourceType: 'module', allowHashBang: true, onComment: comments});
  const matchers = [];
  const assertMethods = new Set(['ok', 'equal', 'notEqual', 'strictEqual', 'notStrictEqual', 'deepEqual', 'deepStrictEqual', 'notDeepEqual', 'notDeepStrictEqual', 'throws', 'doesNotThrow', 'rejects', 'doesNotReject', 'doesNotRejects', 'match', 'doesNotMatch', 'ifError', 'fail']);
  const assertNamespaces = new Set();
  const assertNamed = new Map();
  for (const statement of ast.body || []) if (statement.type === 'ImportDeclaration' && /^node:assert(?:\/strict)?$/.test(statement.source.value)) {
    for (const specifier of statement.specifiers) {
      if (specifier.type === 'ImportDefaultSpecifier' || specifier.type === 'ImportNamespaceSpecifier') assertNamespaces.add(specifier.local.name);
      else if (assertMethods.has(specifier.imported.name)) assertNamed.set(specifier.local.name, specifier.imported.name);
    }
  }
  walk(ast, (node, _parent, ancestors) => {
    const found = matcherName(node);
    if (found) matchers.push({node, ...found, ancestors});
    if (node.type !== 'CallExpression') return;
    if (node.callee?.type === 'MemberExpression') {
      const property = node.callee.computed ? node.callee.property?.value : node.callee.property?.name;
      let base = node.callee.object;
      while (base?.type === 'MemberExpression') base = base.object;
      if (assertNamespaces.has(base?.name) && assertMethods.has(property)) matchers.push({node, name: `assert.${property}`, negated: /^not|doesNot/.test(property), root: node, chain: [], api: 'node-assert', ancestors});
    } else if (assertNamespaces.has(node.callee?.name)) {
      matchers.push({node, name: 'assert', negated: false, root: node, chain: [], api: 'node-assert', ancestors});
    } else if (assertNamed.has(node.callee?.name)) {
      const name = assertNamed.get(node.callee.name);
      matchers.push({node, name: `assert.${name}`, negated: /^not|doesNot/.test(name), root: node, chain: [], api: 'node-assert', ancestors});
    }
  });
  matchers.sort((a, b) => a.node.start - b.node.start);
  const markerComments = comments.filter(comment => /@case\b/.test(comment.value));
  const errors = [];
  const usedComments = new Set();
  const byId = new Map();
  const targetStart = item => item.api === 'node-assert' ? item.node.start : item.root.start;
  for (const item of matchers) {
    const start = targetStart(item);
    const candidates = markerComments.filter(comment => comment.end <= start && !usedComments.has(comment)
      && onlyTriviaOrAwait(source.slice(comment.end, start))
      && !matchers.some(other => targetStart(other) > comment.end && targetStart(other) < start));
    const nearest = candidates.sort((a, b) => b.end - a.end)[0];
    if (!nearest) {
      errors.push(`${filename}:${item.node.start}: assert ${item.name} sem anotação /*@case ID*/`);
      continue;
    }
    usedComments.add(nearest);
    const raw = nearest.value.trim();
    const parsed = raw.match(/^@case\s+([A-Za-z0-9][A-Za-z0-9._-]*)\s*$/);
    if (!parsed) {
      errors.push(`${filename}:${nearest.start}: anotação malformada: /*${raw}*/`);
      continue;
    }
    const id = parsed[1];
    if (!id.startsWith(`${path.basename(filename, '.test.js')}.`)) errors.push(`${filename}:${nearest.start}: ID ${id} pertence a outro item`);
    const testCall = [...item.ancestors].reverse().find(node => node.type === 'CallExpression' && ['test', 'it'].includes(node.callee?.name));
    const callback = testCall?.arguments?.find(arg => ['ArrowFunctionExpression', 'FunctionExpression'].includes(arg?.type));
    const setupStart = callback?.body?.type === 'BlockStatement' ? callback.body.start + 1 : callback?.body?.start;
    const assertionStart = item.api === 'node-assert' ? item.node.start : ([...item.ancestors].reverse().find(node => node.type === 'AwaitExpression')?.start ?? item.root.start);
    const initialArrangementExpression = (setupStart === undefined ? '' : source.slice(setupStart, assertionStart))
      .replace(/\/\*@case\s+[A-Za-z0-9][A-Za-z0-9._-]*\*\//g, '').trim() || 'sem setup anterior dentro deste teste';
    const isAssert = item.api === 'node-assert';
    let inputNode = isAssert ? item.root.arguments[0] : item.root.arguments[0];
    const expectedNode = isAssert ? item.root.arguments[1] : item.node.arguments[0];
    if (!isAssert && inputNode?.type === 'CallExpression' && inputNode.callee?.name === '__devpathCaptureInput' && inputNode.arguments.length >= 3) {
      const callback = inputNode.arguments[2];
      inputNode = callback.body?.type === 'BlockStatement' ? callback.body.body.find(statement => statement.type === 'ReturnStatement')?.argument : callback.body;
    }
    const actualExpression = source.slice(inputNode?.start ?? item.root.start, inputNode?.end ?? item.root.end);
    const domain = loopDomain(source, item, ast);
    const negated = item.negated ?? item.chain.includes('not');
    const expectedExpression = isAssert
      ? item.name === 'assert.ok' || item.name === 'assert' || item.name === 'assert.fail' ? 'true'
        : /^assert\.(?:doesNotThrow|doesNotReject|doesNotRejects)$/.test(item.name) ? 'não lançar/rejeitar'
          : source.slice(expectedNode?.start ?? item.node.end, expectedNode?.end ?? item.node.end) || (/^assert\.(?:throws|rejects)$/.test(item.name) ? 'algum erro' : 'true')
      : item.name === 'toHaveBeenCalledWith' ? `[${item.node.arguments.map(argument => source.slice(argument.start, argument.end)).join(', ')}]`
        : item.name === 'toThrow' && negated && !expectedNode ? 'não lançar'
        : source.slice(expectedNode?.start ?? item.node.end, expectedNode?.end ?? item.node.end) || ({toBeTruthy: 'true', toBeFalsy: 'false', toBeNull: 'null', toBeUndefined: 'undefined', toHaveBeenCalled: 'true', toThrow: 'algum erro'}[item.name] || 'true');
    const record = {id, matcher: item.name, negated, api: item.api || 'expect', offset: item.node.start, inputExpression: actualExpression, expectedExpression, assertionExpression: source.slice(item.node.start, item.node.end), ...domain};
    byId.set(id, [...(byId.get(id) || []), {...record, initialArrangementExpression}]);
  }
  for (const comment of markerComments) if (!usedComments.has(comment)) errors.push(`${filename}:${comment.start}: anotação órfã ou ambígua`);
  return {matchers, records: [...byId.values()].flat(), errors};
}

function loadContractRecords(assessments) {
  return Object.entries(assessments).flatMap(([activityId, assessment]) => (assessment.assertionCases || []).map(record => ({activityId, ...record})));
}

function matchesContract(record, contract) {
  return contract.activityId === record.activityId && contract.matcher === record.matcher && contract.negated === record.negated
    && contract.inputExpression === record.inputExpression && contract.expectedExpression === record.expectedExpression
    && contract.assertionExpression === record.assertionExpression
    && (contract.domainExpression ?? null) === (record.domainExpression ?? null)
    && (contract.domainBindingName ?? null) === (record.domainBindingName ?? null)
    && (contract.domainBindingExpression ?? null) === (record.domainBindingExpression ?? null)
    && normalizedArrangement(contract.initialArrangementExpression) === normalizedArrangement(record.initialArrangementExpression);
}

function validate() {
  const assessments = JSON.parse(readFileSync(assessmentsPath, 'utf8'));
  const contractRecords = loadContractRecords(assessments);
  const contracts = new Map();
  for (const record of contractRecords) contracts.set(record.id, [...(contracts.get(record.id) || []), record]);
  const files = readdirSync(sourceTests).filter(name => name.endsWith('.test.js')).sort();
  const errors = [];
  const seenAnnotationIds = new Set();
  const usedContractRecords = new Set();
  const sourceResults = new Map();
  for (const file of files) {
    const fullPath = path.join(sourceTests, file);
    const parsed = parseSuite(readFileSync(fullPath, 'utf8'), file);
    errors.push(...parsed.errors);
    for (const record of parsed.records) {
      seenAnnotationIds.add(record.id);
      const contractOptions = contracts.get(record.id) || [];
      const activityId = path.basename(file, '.test.js');
      const contract = contractOptions.find(candidate => !usedContractRecords.has(candidate) && matchesContract({...record, activityId}, candidate));
      if (!contract) errors.push(`${file}:${record.offset}: contexto/matcher/entrada/esperado sem contrato publicado exclusivo: ${record.id}`);
      else {
        usedContractRecords.add(contract);
        if (!contract.inputExpression || !contract.matcher || typeof contract.expectedExpression !== 'string' || typeof contract.negated !== 'boolean' || !contract.contractRule || !contract.investigation || !contract.initialArrangementExpression || !contract.executionScope) errors.push(`${record.id}: contrato concreto incompleto`);
        const asyncMatcher = record.assertionExpression.match(/\.(rejects|resolves)(\.not)?\.(to[A-Za-z0-9]+)\s*\(/);
        if (asyncMatcher) {
          const fullMatcher = `${asyncMatcher[1]}${asyncMatcher[2] || ''}.${asyncMatcher[3]}`;
          if (!contract.contractRule.includes(fullMatcher) || !contract.investigation.includes(fullMatcher)) errors.push(`${record.id}: modo assíncrono/matcher completo ausente na regra pública ou investigação`);
        }
        if (record.api === 'node-assert' && !/source-local-suite; not evidence of browser behavior/.test(contract.executionScope)) errors.push(`${record.id}: origem local do node:assert não está declarada como fora do site`);
      }
    }
    sourceResults.set(file, parsed.records);
  }
  for (const id of contracts.keys()) if (!seenAnnotationIds.has(id)) errors.push(`Contrato órfão sem assert: ${id}`);
  for (const contract of contractRecords) if (!usedContractRecords.has(contract)) errors.push(`Contexto publicado órfão ou divergente: ${contract.id}`);
  if (existsSync(publishedTestsPath) && existsSync(publishedAssessmentsPath)) {
    const publishedTests = JSON.parse(readFileSync(publishedTestsPath, 'utf8'));
    const publishedAssessments = JSON.parse(readFileSync(publishedAssessmentsPath, 'utf8'));
    for (const [activityId, assessment] of Object.entries(assessments)) {
      const publicAssessment = publishedAssessments[activityId];
      if (!publicAssessment) continue;
      if ((publicAssessment.assertionCases || []).length !== (assessment.assertionCases || []).length) errors.push(`${activityId}: quantidade de contextos de caso não foi preservada na publicação`);
      for (const record of assessment.assertionCases || []) {
        assert.ok(publicAssessment.assertionCases?.some(candidate => candidate.id === record.id), `caso não publicado: ${record.id}`);
      }
      const source = typeof assessment.tests === 'string' ? assessment.tests : publishedTests[activityId];
      if (typeof source === 'string' && /\/\*@case\s+/.test(source)) {
        const publicFile = `${activityId}.test.js`;
        const publicParsed = parseSuite(source, publicFile);
        errors.push(...publicParsed.errors);
        const expectedIds = new Set((assessment.assertionCases || []).map(record => record.id));
        for (const record of publicParsed.records) {
          const contractOptions = contracts.get(record.id) || [];
          const contract = contractOptions.find(candidate => matchesContract({...record, activityId}, candidate));
          if (!expectedIds.has(record.id) || !contract) errors.push(`${publicFile}:${record.offset}: caso público inesperado ${record.id}`);
        }
        if (publicParsed.records.length !== (assessment.assertionCases || []).length) errors.push(`${publicFile}: quantidade de asserts/contextos diverge da fonte`);
        for (const id of expectedIds) if ((publicParsed.records.filter(record => record.id === id)).length !== (assessment.assertionCases || []).filter(record => record.id === id).length) errors.push(`${publicFile}: quantidade de ocorrências do caso diverge da fonte ${id}`);
      }
    }
  }
  assert.equal(errors.length, 0, errors.slice(0, 60).join('\n'));
  const assertionCount = [...sourceResults.values()].reduce((total, records) => total + records.length, 0);
  console.log(`Task 4 contracts: ${files.length} suites, ${assertionCount} annotated assertions, ${seenAnnotationIds.size} stable case IDs.`);
}

// Small AST fixtures keep offset/loop/matcher semantics exercised independently of the corpus.
const fixture = parseSuite('for (const value of [1, 2]) { /*@case 04.11.loop*/ expect(() => run(value)).not.toThrow(); }\n/*@case 04.11.reject*/ await expect(load()).rejects.toBe(failure);', '04.11.test.js');
assert.equal(fixture.matchers.length, 2);
assert.equal(fixture.errors.length, 0, fixture.errors.join('\n'));
assert.deepEqual(fixture.records.map(record => [record.matcher, record.negated]), [['toThrow', true], ['toBe', false]]);
const namedFixture = parseSuite('import {strictEqual as same, rejects as waitFor} from "node:assert/strict"; /*@case 04.11.named-equal*/ same(value, 1); /*@case 04.11.named-reject*/ waitFor(load());', '04.11.test.js');
assert.deepEqual(namedFixture.records.map(record => record.matcher), ['assert.strictEqual', 'assert.rejects']);
assert.equal(namedFixture.errors.length, 0, namedFixture.errors.join('\n'));
const rejectsFixture = parseSuite('/*@case 04.11.rejects*/ await expect(load()).rejects.toBe(failure);', '04.11.test.js');
const resolvesFixture = parseSuite('/*@case 04.11.resolves*/ await expect(load()).resolves.toBe(value);', '04.11.test.js');
const syncFixture = parseSuite('/*@case 04.11.sync*/ expect(load()).toBe(failure);', '04.11.test.js');
assert.match(rejectsFixture.records[0].assertionExpression, /\.rejects\.toBe\(failure\)$/);
assert.match(resolvesFixture.records[0].assertionExpression, /\.resolves\.toBe\(value\)$/);
assert.notEqual(rejectsFixture.records[0].assertionExpression, syncFixture.records[0].assertionExpression, 'remover .rejects precisa mudar o contrato que validamos');
for (const source of [
  'expect(value).toBe(1);',
  '/*@case 99.01.case*/ expect(value).toBe(1);',
  '/*@case 04.11.case*/ const value = 1;',
  '/*@case 04.11.case*/ const value = 1; expect(value).toBe(1);',
  '/*@case nope with spaces*/ expect(value).toBe(1);',
]) assert.ok(parseSuite(source, '04.11.test.js').errors.length, 'invalid annotation fixture must fail');

validate();
