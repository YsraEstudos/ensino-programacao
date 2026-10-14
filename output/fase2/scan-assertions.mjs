// Read-only inventory for the forthcoming annotation task; does not edit sources.
import {parse} from 'acorn';
import fs from 'node:fs';

function expectBase(node) {
  if (node?.type === 'CallExpression' && node.callee?.type === 'Identifier' && node.callee.name === 'expect') return node;
  if (node?.type === 'MemberExpression') return expectBase(node.object);
  if (node?.type === 'CallExpression') return expectBase(node.callee);
  return null;
}
const cases = [], errors = [];
for (const file of fs.readdirSync('course-src/tests').filter(file => /^\d{2}\.\d{2}\.test\.js$/.test(file)).sort()) {
  const source = fs.readFileSync('course-src/tests/' + file, 'utf8');
  let ast;
  try {ast = parse(source, {ecmaVersion: 'latest', sourceType: 'module'});}
  catch (error) {errors.push({file, error: error.message}); continue;}
  let index = 0;
  const assertBindings = new Set(ast.body.filter(node => node.type === 'ImportDeclaration' && /^node:assert(?:\/strict)?$/.test(node.source.value)).flatMap(node => node.specifiers.filter(specifier => specifier.type === 'ImportDefaultSpecifier' || specifier.type === 'ImportNamespaceSpecifier' || specifier.imported?.name === 'strict').map(specifier => specifier.local.name)));
  function walk(node, parents = []) {
    if (!node || typeof node !== 'object' || !node.type) return;
    const property = node.callee?.property;
    const matcher = property?.type === 'Identifier' ? property.name : property?.value;
    const base = node.type === 'CallExpression' && /^to[A-Z]/.test(matcher || '') ? expectBase(node.callee.object) : null;
    const nodeAssert = node.type === 'CallExpression' && ((node.callee.type === 'MemberExpression' && assertBindings.has(node.callee.object?.name)) || (node.callee.type === 'Identifier' && assertBindings.has(node.callee.name)));
    if (base || nodeAssert) {
      const label = parents.findLast(parent => parent.type === 'CallExpression' && parent.callee?.type === 'Identifier' && parent.callee.name === 'test')?.arguments?.[0];
      const loops = parents.filter(parent => ['ForStatement', 'ForOfStatement', 'ForInStatement', 'WhileStatement', 'DoWhileStatement'].includes(parent.type)).map(parent => source.slice(parent.start, parent.body.start).trim());
      const received = (base || node).arguments[0];
      cases.push({id: file.slice(0, 5), index: ++index, file, start: node.start, end: node.end, label: label?.value || null, origin: nodeAssert ? 'node-assert' : 'expect', inputExpression: received ? source.slice(received.start, received.end) : '', matcher: nodeAssert ? matcher || 'ok' : matcher, expectedExpressions: (nodeAssert ? node.arguments.slice(1) : node.arguments).map(argument => source.slice(argument.start, argument.end)), negated: base ? /\.not\b/.test(source.slice(base.end, node.callee.end)) : /^(?:not|doesNot)/.test(matcher || ''), loops});
    }
    for (const value of Object.values(node)) {
      if (Array.isArray(value)) value.forEach(child => walk(child, [...parents, node]));
      else if (value && typeof value === 'object' && value.type) walk(value, [...parents, node]);
    }
  }
  walk(ast);
}
fs.writeFileSync('output/fase2/assertion-inventory.json', JSON.stringify({cases, errors}, null, 2));
console.log(JSON.stringify({assertions: cases.length, activities: new Set(cases.map(row => row.id)).size, origins: Object.fromEntries(['expect', 'node-assert'].map(origin => [origin, cases.filter(row => row.origin === origin).length])), inLoops: cases.filter(row => row.loops.length).length, closures: cases.filter(row => /^\(?\s*\)?\s*=>|^function\b/.test(row.inputExpression)).length, parseErrors: errors}, null, 2));
