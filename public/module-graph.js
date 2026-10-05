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
            engineReady = new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = global.DevPathCompilerAssets.script;
                script.onload = async () => {
                    try {
                        await global.DevPathCompilerEngine.initialize({ wasmURL: global.DevPathCompilerAssets.wasm });
                        resolve(global.DevPathCompilerEngine);
                    }
                    catch (error) {
                        reject(error);
                    }
                };
                script.onerror = () => { script.remove(); reject(new Error('Não foi possível carregar o compilador local. Tente novamente.')); };
                document.head.append(script);
            }).catch(error => { engineReady = null; throw error; });
        return engineReady;
    }
    async function buildModuleGraph({ files, entryPath }, compiler) {
        if (!Array.isArray(files) || files.length > 64)
            throw new Error('O exercício aceita até 64 arquivos locais.');
        const modules = new Map();
        let bytes = 0;
        for (const file of files) {
            const path = normalize(file.path);
            if (!/\.(?:m?js)$/.test(path) || typeof file.content !== 'string')
                throw new Error('Este executor aceita apenas arquivos JavaScript locais.');
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
        const { build, parse } = compiler || await engine();
        // Parsing validates computed imports even when the bundler would leave them unresolved.
        for (const [path, content] of modules) {
            const ast = parse(content, { ecmaVersion: 'latest', sourceType: 'module' });
            const visit = node => {
                if (!node || typeof node !== 'object')
                    return;
                if (node.type === 'ImportExpression' && (node.source.type !== 'Literal' || typeof node.source.value !== 'string'))
                    throw new Error(`Import dinâmico precisa de caminho literal local: ${path}`);
                for (const value of Object.values(node)) {
                    if (Array.isArray(value))
                        value.forEach(visit);
                    else if (value && typeof value === 'object')
                        visit(value);
                }
            };
            visit(ast);
        }
        const result = await build({ entryPoints: [entry], bundle: true, write: false, format: 'esm', platform: 'browser', target: 'es2022', logLevel: 'silent', plugins: [{
                    name: 'exercise-files', setup(api) {
                        api.onResolve({ filter: /.*/ }, args => {
                            if (args.kind !== 'entry-point' && !args.path.startsWith('./') && !args.path.startsWith('../'))
                                throw new Error(`Import externo não permitido: ${args.path}`);
                            const path = normalize(args.path, args.importer);
                            if (!modules.has(path))
                                throw new Error(`Arquivo importado ausente: ${path}`);
                            return { path, namespace: 'exercise' };
                        });
                        api.onLoad({ filter: /.*/, namespace: 'exercise' }, args => ({ contents: modules.get(args.path), loader: 'js' }));
                    }
                }] });
        return Object.freeze({ entryPath: entry, code: result.outputFiles[0].text, modules: [...modules.keys()], dispose() { } });
    }
    global.DevPathModuleGraph = Object.freeze({ buildModuleGraph });
})(window);
