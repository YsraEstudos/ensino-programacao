import {readFileSync, existsSync, statSync} from 'node:fs';
import {resolve, dirname, extname} from 'node:path';
import {createRequire} from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';

export function loadTsModule(path, stubs = {}) {
  const cache = new Map();
  const nativeRequire = createRequire(import.meta.url);
  function load(file) {
    file = resolve(file);
    if (Object.hasOwn(stubs, file)) return stubs[file];
    if (cache.has(file)) return cache.get(file).exports;
    if (extname(file) === '.json') return JSON.parse(readFileSync(file, 'utf8'));
    const loadedModule = {exports: {}};
    cache.set(file, loadedModule);
    const source = ts.transpileModule(readFileSync(file, 'utf8'), {
      compilerOptions: {target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true}
    }).outputText;
    const require = name => {
      if (!name.startsWith('.')) return nativeRequire(name);
      const base = resolve(dirname(file), name);
      const target = [base, base + '.ts', base + '.json', resolve(base, 'index.ts')]
        .find(candidate => existsSync(candidate) && statSync(candidate).isFile());
      if (!target) throw new Error(`Cannot resolve ${name} from ${file}`);
      return load(target);
    };
    vm.runInThisContext(`(function(require,module,exports){${source}\n})`, {filename: file})(require, loadedModule, loadedModule.exports);
    return loadedModule.exports;
  }
  return load(path);
}
