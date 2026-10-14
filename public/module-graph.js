(function (global) {
    'use strict';
    let engineReady;
    function normalize(path, base = '') {
        if (typeof path !== 'string' || /[:\\?#\0]/.test(path) || path.startsWith('/'))
            throw new Error('Use caminhos locais dos arquivos do exercício.');
        const parts = base ? base.split('/').slice(0, -1) : [];
        for (const part of path.split('/')) {
            if (!part || part === '.')
                continue;
            if (part === '..') {
                if (!parts.length)
                    throw new Error('O import sai dos arquivos do exercício.');
                parts.pop();
            }
            else
                parts.push(part);
        }
        return parts.join('/');
    }
    async function engine() {
        if (!engineReady)
            engineReady = (async () => {
                let compiler;
                if (global.DevPathCompilerLoader?.load) compiler = await global.DevPathCompilerLoader.load();
                else if (global.DevPathCompilerEngine) compiler = global.DevPathCompilerEngine;
                else compiler = await new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = global.DevPathCompilerAssets.script;
                    script.onload = () => global.DevPathCompilerEngine ? resolve(global.DevPathCompilerEngine) : reject(new Error('O compilador local não expôs o engine.'));
                    script.onerror = () => { script.remove(); reject(new Error('Não foi possível carregar o compilador local. Tente novamente.')); };
                    document.head.append(script);
                });
                if (typeof compiler?.initialize !== 'function') throw new Error('O compilador local não está disponível. Tente novamente.');
                await compiler.initialize({ wasmURL: global.DevPathCompilerAssets.wasm });
                return compiler;
            })().catch(error => { engineReady = null; throw error; });
        return engineReady;
    }
    function loaderFor(path) {
        if (/\.tsx$/i.test(path)) return 'tsx';
        if (/\.ts$/i.test(path)) return 'ts';
        if (/\.jsx$/i.test(path)) return 'jsx';
        if (/\.json$/i.test(path)) return 'json';
        if (/\.m?js$/i.test(path)) return 'js';
        return null;
    }
    function resolveModulePath(path, modules) {
        if (modules.has(path)) return path;
        const candidates = [];
        if (/\.m?js$/i.test(path)) candidates.push(path.replace(/\.m?js$/i, '.ts'), path.replace(/\.m?js$/i, '.tsx'), path.replace(/\.m?js$/i, '.jsx'));
        if (!/\.[a-z]+$/i.test(path)) candidates.push(`${path}.ts`, `${path}.tsx`, `${path}.js`, `${path}.jsx`, `${path}.json`);
        return candidates.find(candidate => modules.has(candidate));
    }
    function validateDynamicImports(ast, path) {
        const visit = node => {
            if (!node || typeof node !== 'object') return;
            if (node.type === 'ImportExpression' && (node.source.type !== 'Literal' || typeof node.source.value !== 'string'))
                throw new Error(`Import dinâmico precisa de caminho literal local: ${path}`);
            for (const value of Object.values(node)) {
                if (Array.isArray(value)) value.forEach(visit);
                else if (value && typeof value === 'object') visit(value);
            }
        };
        visit(ast);
    }
    const NODE_MODULES = new Set(['node:fs/promises', 'node:path', 'node:url', 'node:test', 'node:assert/strict']);
    const unsupportedNode = message => { const error = new Error(message); error.code = 'UNSUPPORTED'; return error; };
    function nodeModuleSource(path) {
        const exports = {
            'node:fs/promises': ['readFile', 'writeFile', 'default'],
            'node:path': ['join', 'resolve', 'dirname', 'basename', 'extname', 'default'],
            'node:url': ['pathToFileURL', 'fileURLToPath', 'default'],
            'node:test': ['describe', 'test', 'it', 'beforeEach', 'afterEach', 'expect', 'vi', 'default'],
            'node:assert/strict': ['ok', 'equal', 'notEqual', 'strictEqual', 'notStrictEqual', 'deepEqual', 'deepStrictEqual', 'notDeepEqual', 'notDeepStrictEqual', 'throws', 'rejects', 'match', 'doesNotMatch', 'default']
        }[path];
        if (!exports) throw unsupportedNode(`Módulo Node não suportado no Node simulado: ${path}`);
        return `const __module = globalThis.__devpathNodeModules?.[${JSON.stringify(path)}]; if (!__module) throw new Error("Runtime Node simulado indisponível."); ${exports.filter(name => name !== 'default').map(name => `export const ${name} = __module.${name};`).join(' ')} export default __module.default;`;
    }
    const ASSERTION_MATCHERS = new Set(['toBe', 'toEqual', 'toStrictEqual', 'toBeTruthy', 'toBeFalsy', 'toBeNull', 'toBeUndefined', 'toBeInstanceOf', 'toContain', 'toHaveLength', 'toBeGreaterThan', 'toBeLessThan', 'toBeCloseTo', 'toThrow', 'toHaveBeenCalled', 'toHaveBeenCalledTimes', 'toHaveBeenCalledWith']);
    function onlyTriviaOrAwait(source) {
        const remaining = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\r\n]*/g, '').trim();
        return remaining === '' || remaining === 'await';
    }
    function instrumentAssertionCases(code, cases, parse, sourcePath) {
        if (!code.includes('/*@case')) return code;
        if (typeof parse !== 'function') throw new Error('Não foi possível associar os casos públicos: analisador local indisponível.');
        const comments = [];
        const ast = parse(code, {ecmaVersion: 'latest', sourceType: 'module', onComment: comments});
        const matchers = [];
        const assertMethods = new Set(['ok', 'equal', 'notEqual', 'strictEqual', 'notStrictEqual', 'deepEqual', 'notDeepEqual', 'throws', 'doesNotThrow', 'rejects', 'doesNotRejects', 'match', 'doesNotMatch', 'fail']);
        const assertNamespaces = new Set();
        const assertNamed = new Map();
        for (const statement of ast.body || []) if (statement.type === 'ImportDeclaration' && /^node:assert(?:\/strict)?$/.test(statement.source.value)) {
            for (const specifier of statement.specifiers) {
                if (specifier.type === 'ImportDefaultSpecifier' || specifier.type === 'ImportNamespaceSpecifier') assertNamespaces.add(specifier.local.name);
                else if (assertMethods.has(specifier.imported.name)) assertNamed.set(specifier.local.name, specifier.imported.name);
            }
        }
        const visit = node => {
            if (!node || typeof node !== 'object') return;
            if (Array.isArray(node)) { node.forEach(visit); return; }
            if (node.type === 'CallExpression' && node.callee?.type === 'MemberExpression') {
                const property = node.callee.computed ? node.callee.property?.value : node.callee.property?.name;
                let root = node.callee.object;
                while (root?.type === 'MemberExpression') root = root.object;
                if (ASSERTION_MATCHERS.has(property) && root?.type === 'CallExpression' && root.callee?.name === 'expect') matchers.push({node, root});
                else if (root?.type === 'Identifier' && assertNamespaces.has(root.name) && assertMethods.has(property)) matchers.push({node, root: node, api: 'node-assert'});
            } else if (node.type === 'CallExpression' && node.callee?.type === 'Identifier' && assertNamed.has(node.callee.name)) {
                matchers.push({node, root: node, api: 'node-assert'});
            }
            for (const key of Object.keys(node)) {
                if (key === 'start' || key === 'end' || key === 'loc') continue;
                const value = node[key];
                if (value && typeof value === 'object') visit(value);
            }
        };
        visit(ast);
        matchers.sort((a, b) => a.node.start - b.node.start);
        const sourceCases = (Array.isArray(cases) ? cases : []).filter(record => record && typeof record.id === 'string');
        const normalizedPath = String(sourcePath || '').replaceAll('\\', '/');
        const matchingSourceCases = sourceCases.filter(record => typeof record.sourceTestPath === 'string' && record.sourceTestPath.replaceAll('\\', '/') === normalizedPath);
        const relevantCases = matchingSourceCases.length ? matchingSourceCases : sourceCases;
        const records = new Map();
        for (const record of relevantCases) {
            if (!records.has(record.id)) records.set(record.id, []);
            records.get(record.id).push(record);
        }
        const markerComments = comments.filter(comment => /@case\b/.test(comment.value));
        const used = new Set();
        const edits = [];
        const occurrences = new Map();
        const targetStart = matcher => matcher.api === 'node-assert' ? matcher.node.start : matcher.root.start;
        for (const matcher of matchers) {
            const start = targetStart(matcher);
            const candidates = markerComments.filter(comment => comment.end <= start && !used.has(comment)
                && onlyTriviaOrAwait(code.slice(comment.end, start))
                && !matchers.some(other => targetStart(other) > comment.end && targetStart(other) < start));
            const marker = candidates.sort((a, b) => b.end - a.end)[0];
            if (!marker) continue;
            used.add(marker);
            const parsed = marker.value.trim().match(/^@case\s+([A-Za-z0-9][A-Za-z0-9._-]*)\s*$/);
            if (!parsed) throw new Error(`Anotação de caso malformada em ${sourcePath}:${marker.start}.`);
            const id = parsed[1];
            const recordsForId = records.get(id);
            if (!recordsForId) throw new Error(`Caso público ${id} ausente ao executar ${sourcePath}.`);
            const occurrence = occurrences.get(id) || 0;
            if (occurrence >= recordsForId.length) throw new Error(`Contexto público ${id} ausente para a ocorrência ${occurrence + 1} em ${sourcePath}.`);
            occurrences.set(id, occurrence + 1);
            if (matcher.api !== 'node-assert') {
                edits.push({start: matcher.root.start, end: matcher.root.arguments[0]?.start ?? matcher.root.callee.end + 1, text: `__devpathExpect(${JSON.stringify(id)},`});
                edits.push({start: matcher.root.end - 1, end: matcher.root.end - 1, text: `,${occurrence}`});
            }
        }
        const orphan = markerComments.find(comment => !used.has(comment));
        if (orphan) throw new Error(`Anotação sem assert correspondente em ${sourcePath}:${orphan.start}.`);
        for (const [id, recordsForId] of records) {
            if ((occurrences.get(id) || 0) !== recordsForId.length) throw new Error(`Foram encontradas ${(occurrences.get(id) || 0)} ocorrências para ${recordsForId.length} contextos públicos ${id} em ${sourcePath}.`);
        }
        for (const edit of edits.sort((a, b) => b.start - a.start)) code = `${code.slice(0, edit.start)}${edit.text}${code.slice(edit.end)}`;
        return code;
    }
    async function buildModuleGraph({ files, entryPath, runtime = 'browser', assertionCases = [] }, compiler) {
        const nodeSimulated = runtime === 'node-simulated';
        if (!Array.isArray(files) || files.length > 64)
            throw new Error('O exercício aceita até 64 arquivos locais.');
        const modules = new Map();
        let bytes = 0;
        for (const file of files) {
            const path = normalize(file.path);
            if (/\.d\.ts$/i.test(path)) {
                if (typeof file.content !== 'string') throw new Error(`Declaração inválida: ${path}`);
                continue;
            }
            const loader = loaderFor(path);
            if (!loader || typeof file.content !== 'string')
                throw new Error('Este executor aceita apenas arquivos locais JavaScript, JSX, TypeScript ou JSON.');
            if (modules.has(path))
                throw new Error(`Arquivo duplicado: ${path}`);
            bytes += new TextEncoder().encode(file.content).length;
            if (bytes > 900000)
                throw new Error('O código do exercício excede o limite.');
            modules.set(path, file.content);
        }
        const entry = normalize(entryPath);
        if (!modules.has(entry))
            throw new Error(`Arquivo de entrada ausente: ${entry}`);
        const resolvedCompiler = compiler || await engine();
        const { build, parse } = resolvedCompiler;
        // Parsing validates computed imports even when the bundler would leave them unresolved.
        for (const [path, originalContent] of modules) {
            const content = instrumentAssertionCases(originalContent, assertionCases, parse, path);
            if (content !== originalContent) modules.set(path, content);
            const loader = loaderFor(path);
            if (nodeSimulated && /\brequire\s*\(/.test(content)) throw new Error('CommonJS/require não é suportado no Node simulado; use ESM ou um checkpoint local.');
            if (loader === 'ts' || loader === 'tsx') {
                if (typeof resolvedCompiler.transform === 'function') {
                    const transformed = await resolvedCompiler.transform(content, { loader, format: 'esm', sourcefile: path });
                    if (transformed?.code && typeof resolvedCompiler.parse === 'function') validateDynamicImports(resolvedCompiler.parse(transformed.code, { ecmaVersion: 'latest', sourceType: 'module' }), path);
                }
                continue;
            }
            if (loader === 'json') {
                try { JSON.parse(content); } catch { throw new Error(`JSON inválido: ${path}`); }
                continue;
            }
            validateDynamicImports(parse(content, { ecmaVersion: 'latest', sourceType: 'module' }), path);
        }
        const result = await build({ entryPoints: [entry], bundle: true, write: false, format: 'esm', platform: 'browser', target: 'es2022', logLevel: 'silent', plugins: [{
                    name: 'exercise-files', setup(api) {
                        api.onResolve({ filter: /.*/ }, args => {
                            if (args.path === 'vitest') return { path: 'vitest', namespace: 'devpath-test-runtime' };
                            if (args.path.startsWith('node:')) {
                                if (!nodeSimulated || !NODE_MODULES.has(args.path)) throw unsupportedNode(`Módulo Node não suportado no ambiente publicado: ${args.path}`);
                                return { path: args.path, namespace: 'devpath-node-runtime' };
                            }
                            if (args.kind !== 'entry-point' && !args.path.startsWith('./') && !args.path.startsWith('../'))
                                throw new Error(`Import externo não permitido: ${args.path}`);
                             const path = normalize(args.path, args.importer);
                             const resolved = resolveModulePath(path, modules);
                             if (!resolved)
                                 throw new Error(`Arquivo importado ausente: ${path}`);
                             return { path: resolved, namespace: 'exercise' };
                        });
                        api.onLoad({ filter: /.*/, namespace: 'exercise' }, args => ({ contents: nodeSimulated ? modules.get(args.path).replace(/\bimport\.meta\.url\b/g, JSON.stringify(`virtual:///${args.path}`)) : modules.get(args.path), loader: loaderFor(args.path) }));
                        api.onLoad({ filter: /.*/, namespace: 'devpath-test-runtime' }, () => ({
                            contents: "export const describe = globalThis.describe; export const test = globalThis.test; export const it = globalThis.it; export const beforeEach = globalThis.beforeEach; export const afterEach = globalThis.afterEach; export const expect = globalThis.expect; export const vi = globalThis.vi;",
                            loader: 'js'
                        }));
                        api.onLoad({ filter: /.*/, namespace: 'devpath-node-runtime' }, args => ({ contents: nodeModuleSource(args.path), loader: 'js' }));
                    }
                }] });
        const code = nodeSimulated ? `const process = globalThis.__devpathNodeProcess;\n${result.outputFiles[0].text}` : result.outputFiles[0].text;
        return Object.freeze({ entryPath: entry, code, modules: [...modules.keys()], environment: nodeSimulated ? 'node-simulated' : 'browser', capabilities: nodeSimulated ? Object.freeze([...NODE_MODULES]) : undefined, dispose() { } });
    }
    global.DevPathModuleGraph = Object.freeze({ buildModuleGraph, instrumentAssertionCases });
})(window);
