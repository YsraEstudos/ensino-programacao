import ts from 'typescript';

const ROOT = '/exercise';
const LIB_ROOT = '/node_modules/typescript/lib';

function slash(value) {
  return String(value).replaceAll('\\', '/');
}

function normalizeAbsolute(value) {
  const path = slash(value);
  if (/^[a-zA-Z]:|^[a-zA-Z][a-zA-Z0-9+.-]*:|\0/.test(path)) throw new Error(`Caminho virtual inválido: ${value}`);
  const absolute = path.startsWith('/') ? path : `${ROOT}/${path}`;
  const parts = [];
  for (const part of absolute.split('/')) {
    if (!part || part === '.') continue;
    if (part === '..') {
      if (!parts.length) throw new Error(`Caminho virtual fora da raiz: ${value}`);
      parts.pop();
    } else parts.push(part);
  }
  return `/${parts.join('/')}`;
}

function virtualize(value) {
  const path = slash(value);
  const packageIndex = path.lastIndexOf('/node_modules/');
  if (packageIndex >= 0) return path.slice(packageIndex);
  if (path.endsWith('/node_modules')) return '/node_modules';
  if (/^[A-Za-z]:\//.test(path)) return path;
  if (path.startsWith(`${ROOT}/`) || path === ROOT || path.startsWith('/')) return path;
  return normalizeAbsolute(path);
}

function normalizeExercisePath(value) {
  if (typeof value !== 'string' || value.startsWith('/') || /[:\\?#\0]/.test(value)) throw new Error(`Caminho de exercício inválido: ${value}`);
  const result = normalizeAbsolute(value);
  if (!result.startsWith(`${ROOT}/`)) throw new Error(`Caminho de exercício fora da raiz: ${value}`);
  return result;
}

function flattenMessage(messageText) {
  if (typeof messageText === 'string') return messageText;
  if (Array.isArray(messageText)) return messageText.map(item => `${item.messageText}${item.next ? ` ${flattenMessage(item.next)}` : ''}`).join('');
  return `${messageText.messageText}${messageText.next ? ` ${flattenMessage(messageText.next)}` : ''}`;
}

function category(category) {
  if (category === ts.DiagnosticCategory.Warning) return 'warning';
  if (category === ts.DiagnosticCategory.Message) return 'message';
  return 'error';
}

function relativeFile(fileName) {
  const path = slash(fileName);
  if (path.startsWith(`${ROOT}/`)) return path.slice(ROOT.length + 1);
  return path.replace(/^\//, '');
}

function toDiagnostic(diagnostic) {
  const sourceFile = diagnostic.file;
  let line;
  let column;
  if (sourceFile && typeof diagnostic.start === 'number') {
    const position = sourceFile.getLineAndCharacterOfPosition(diagnostic.start);
    line = position.line + 1;
    column = position.character + 1;
  }
  return {
    code: diagnostic.code,
    category: category(diagnostic.category),
    message: flattenMessage(diagnostic.messageText),
    ...(sourceFile ? { file: relativeFile(sourceFile.fileName) } : {}),
    ...(line === undefined ? {} : { line, column })
  };
}

function isUnsupportedDiagnostic(diagnostic) {
  const text = flattenMessage(diagnostic.messageText);
  const fileName = slash(diagnostic.file?.fileName || '');
  return diagnostic.code === 5023 || diagnostic.code === 6046 || diagnostic.code === 6047 || diagnostic.code === 6053
    || diagnostic.code === 6231 || /Cannot find type definition file|lib\.[\w.]+\.d\.ts.*not found|unsupported compiler option/i.test(text)
    || (/Cannot find module/i.test(text) && (/undici-types|node:/i.test(text) || /\/node_modules\//.test(fileName)));
}

function makeLibraryMap(libraries = {}) {
  const map = new Map();
  for (const [key, content] of Object.entries(libraries || {})) {
    if (typeof content !== 'string') throw new Error(`Declaração inválida para ${key}`);
    const path = slash(key).startsWith('/') ? slash(key) : `/${slash(key)}`;
    if (/[:\\?#\0]/.test(path) || path.includes('/../')) throw new Error(`Biblioteca virtual inválida: ${key}`);
    map.set(path, content);
    if (path.startsWith('/node_modules/')) map.set(`${ROOT}${path}`, content);
  }
  return map;
}

function createVirtualHost({ files, libraries, options, configPath }) {
  const exercise = new Map();
  for (const file of files) exercise.set(normalizeExercisePath(file.path), file.content);
  const library = makeLibraryMap(libraries);
  const all = new Map([...library, ...exercise]);
  const has = path => all.has(virtualize(path));
  const read = path => all.get(virtualize(path));
  const getFileSystemEntries = directory => {
    const root = virtualize(directory).replace(/\/$/, '');
    const filesInDirectory = new Set();
    const directories = new Set();
    for (const file of all.keys()) {
      if (!file.startsWith(`${root}/`)) continue;
      const rest = file.slice(root.length + 1);
      const slashIndex = rest.indexOf('/');
      if (slashIndex < 0) filesInDirectory.add(rest);
      else directories.add(rest.slice(0, slashIndex));
    }
    return { files: [...filesInDirectory].sort(), directories: [...directories].sort() };
  };
  const match = (directory, extensions, excludes, includes, depth) => {
    return ts.matchFiles(virtualize(directory), extensions, excludes, includes, true, ROOT, depth, getFileSystemEntries, virtualize);
  };
  const host = {
    getCurrentDirectory: () => ROOT,
    getCanonicalFileName: value => slash(value),
    useCaseSensitiveFileNames: () => true,
    fileExists: path => has(path),
    readFile: path => read(path),
    realpath: path => virtualize(path),
    getDefaultLibLocation: () => LIB_ROOT,
    getDefaultLibFileName: compilerOptions => `${LIB_ROOT}/${ts.getDefaultLibFileName(compilerOptions)}`,
    getNewLine: () => '\n',
    getEnvironmentVariable: () => '',
    writeFile: () => {},
    createDirectory: () => {},
    trace: () => {},
    directoryExists: directory => {
    const path = virtualize(directory).replace(/\/$/, '');
    return [...all.keys()].some(file => file.startsWith(`${path}/`));
    },
    getDirectories: directory => {
    const path = virtualize(directory).replace(/\/$/, '');
    const names = new Set();
    for (const file of all.keys()) {
      if (!file.startsWith(`${path}/`)) continue;
      const rest = file.slice(path.length + 1);
      const slashIndex = rest.indexOf('/');
      if (slashIndex > 0) names.add(`${path}/${rest.slice(0, slashIndex)}`);
    }
    return [...names];
    },
    readDirectory: (directory, extensions, excludes, includes, depth) => {
      return match(directory, extensions, excludes, includes, depth);
    },
    getSourceFile: (fileName, languageVersion) => {
    const content = read(fileName);
    if (content === undefined) return undefined;
    const extension = slash(fileName).toLowerCase();
    const scriptKind = extension.endsWith('.tsx') ? ts.ScriptKind.TSX : extension.endsWith('.jsx') ? ts.ScriptKind.JSX : extension.endsWith('.json') ? ts.ScriptKind.JSON : extension.endsWith('.js') ? ts.ScriptKind.JS : ts.ScriptKind.TS;
    return ts.createSourceFile(fileName, content, languageVersion, true, scriptKind);
    },
    getSourceFileByPath: (fileName, path, languageVersion) => host.getSourceFile(fileName, languageVersion),
    onUnRecoverableConfigFileDiagnostic: () => {}
  };
  return { host, exercise, library, all, configPath };
}

function parseConfig(files, tsconfigPath, libraries) {
  const path = tsconfigPath ? normalizeExercisePath(tsconfigPath) : `${ROOT}/tsconfig.json`;
  const raw = files.find(file => normalizeExercisePath(file.path) === path)?.content;
  if (raw === undefined) return { path, config: {}, diagnostics: [] };
  const parsed = ts.parseConfigFileTextToJson(path, raw);
  const allowedOptions = new Set([
    'allowJs', 'allowImportingTsExtensions', 'checkJs', 'exactOptionalPropertyTypes', 'esModuleInterop', 'erasableSyntaxOnly',
    'forceConsistentCasingInFileNames', 'isolatedModules', 'jsx', 'lib', 'module', 'moduleResolution', 'noEmit', 'noFallthroughCasesInSwitch',
    'noImplicitAny', 'noImplicitOverride', 'noImplicitReturns', 'noImplicitThis', 'noUncheckedIndexedAccess', 'resolveJsonModule',
    'skipLibCheck', 'strict', 'strictFunctionTypes', 'strictNullChecks', 'target', 'types', 'useDefineForClassFields', 'verbatimModuleSyntax'
  ]);
  const unknownOptions = Object.keys(parsed.config?.compilerOptions || {}).filter(key => !allowedOptions.has(key)).map(key => ({
    category: ts.DiagnosticCategory.Error,
    code: 5023,
    messageText: `Unknown compiler option '${key}'.`
  }));
  const virtualFiles = [...files.map(file => normalizeExercisePath(file.path)), ...Object.keys(libraries).map(virtualize)];
  const configFileSystemEntries = directory => {
    const root = virtualize(directory).replace(/\/$/, '');
    const filesInDirectory = new Set();
    const directories = new Set();
    for (const file of virtualFiles) {
      if (!file.startsWith(`${root}/`)) continue;
      const rest = file.slice(root.length + 1);
      const slashIndex = rest.indexOf('/');
      if (slashIndex < 0) filesInDirectory.add(rest);
      else directories.add(rest.slice(0, slashIndex));
    }
    return { files: [...filesInDirectory].sort(), directories: [...directories].sort() };
  };
  const configFile = ts.parseJsonConfigFileContent(parsed.config || {}, {
    useCaseSensitiveFileNames: true,
    readDirectory: (directory, extensions, excludes, includes, depth) => {
      return ts.matchFiles(virtualize(directory), extensions, excludes, includes, true, ROOT, depth, configFileSystemEntries, virtualize);
    },
    fileExists: fileName => files.some(file => normalizeExercisePath(file.path) === virtualize(fileName)),
    readFile: fileName => files.find(file => normalizeExercisePath(file.path) === virtualize(fileName))?.content,
    trace: () => {}
  }, ROOT, { noEmit: true }, path);
  return { path, config: configFile, diagnostics: [...(parsed.error ? [parsed.error] : []), ...(configFile.errors || []), ...unknownOptions] };
}

export function checkTypes(input, { libraries = {} } = {}) {
  if (!input || !Array.isArray(input.files) || !Array.isArray(input.entryPaths) || !input.entryPaths.length) throw new TypeError('Arquivos e entryPaths são obrigatórios.');
  const seenPaths = new Set();
  const files = input.files.map(file => {
    if (!file || typeof file.path !== 'string' || typeof file.content !== 'string') throw new TypeError('Arquivo virtual inválido.');
    const normalizedPath = normalizeExercisePath(file.path);
    if (seenPaths.has(normalizedPath)) throw new TypeError(`Caminho de exercício duplicado: ${file.path}`);
    seenPaths.add(normalizedPath);
    return file;
  });
  const entryPaths = input.entryPaths.map(normalizeExercisePath);
  const configResult = parseConfig(files, input.tsconfigPath, libraries);
  const options = { ...(configResult.config.options || {}), noEmit: true, strict: configResult.config.options?.strict ?? true };
  const virtual = createVirtualHost({ files, libraries, options, configPath: configResult.path });
  const rootNames = [...new Set([...entryPaths, ...(configResult.config.fileNames || [])])];
  const program = ts.createProgram(rootNames, options, virtual.host);
  const rawDiagnostics = [...configResult.diagnostics, ...ts.getPreEmitDiagnostics(program)];
  const diagnostics = rawDiagnostics
    .filter((diagnostic, index, list) => list.findIndex(other => other.code === diagnostic.code && other.start === diagnostic.start && other.file?.fileName === diagnostic.file?.fileName && flattenMessage(other.messageText) === flattenMessage(diagnostic.messageText)) === index)
    .map(toDiagnostic)
    .sort((a, b) => (a.file || '').localeCompare(b.file || '') || (a.line || 0) - (b.line || 0) || (a.column || 0) - (b.column || 0) || a.code - b.code);
  const unsupported = configResult.diagnostics.length > 0 || rawDiagnostics.some(isUnsupportedDiagnostic);
  return { diagnostics, supported: !unsupported };
}

export { createVirtualHost };
