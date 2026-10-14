(function attachCourseProjectExport(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.DevPathCourseProjectExport = api;
})(typeof globalThis === 'object' ? globalThis : this, function createCourseProjectExport() {
  const encoder = new TextEncoder();
  const UTF8_FLAG = 0x0800;
  const MAX_FILES = 2048;
  const MAX_FILE_BYTES = 16 * 1024 * 1024;
  const MAX_TOTAL_BYTES = 64 * 1024 * 1024;
  const DOS_DATE = 0x0021;
  const WINDOWS_RESERVED = /^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\..*)?$/i;
  const crcTable = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let bit = 0; bit < 8; bit += 1) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    crcTable[n] = c >>> 0;
  }

  function normalizePath(value) {
    if (typeof value !== 'string' || !value.trim() || value.includes('\0')) throw new Error('Project file path must be a non-empty safe relative path.');
    const input = value.replaceAll('\\', '/').normalize('NFC');
    if (input.startsWith('/') || /^[a-z]:/i.test(input) || /^[a-z][a-z\d+.-]*:/i.test(input) || input.startsWith('//')) {
      throw new Error(`Project file path must be relative and cannot contain a drive or URL: ${value}`);
    }
    const parts = input.split('/');
    if (parts.some(part => part === '..')) throw new Error(`Project file path cannot escape the project root: ${value}`);
    const safe = parts.filter(part => part && part !== '.');
    if (!safe.length) throw new Error(`Project file path has no filename: ${value}`);
    for (const part of safe) {
      if (part.includes(':') || /[\u0000-\u001f\u007f<>"|?*]/.test(part) || /[ .]$/.test(part) || WINDOWS_RESERVED.test(part)) {
        throw new Error(`Project file path contains a name unsafe to extract on Windows: ${value}`);
      }
    }
    return safe.join('/');
  }

  function asFiles(files) {
    if (!Array.isArray(files) || files.length > MAX_FILES) throw new Error(`Project files must be an array of at most ${MAX_FILES} entries.`);
    const result = [];
    const seen = new Set();
    let total = 0;
    for (const file of files) {
      if (!file || typeof file !== 'object' || typeof file.content !== 'string') throw new Error('Every project file must have a string path and string content.');
      const path = normalizePath(file.path);
      const key = path.normalize('NFKC').toLocaleLowerCase('en-US');
      if ([...seen].some(existing => key === existing || key.startsWith(`${existing}/`) || existing.startsWith(`${key}/`))) {
        throw new Error(`Duplicate, colliding, or file/directory-conflicting project path: ${path}`);
      }
      seen.add(key);
      const byteLength = encoder.encode(file.content).length;
      if (byteLength > MAX_FILE_BYTES) throw new Error(`Project file exceeds ${MAX_FILE_BYTES} bytes: ${path}`);
      total += byteLength;
      if (total > MAX_TOTAL_BYTES) throw new Error(`Project exceeds ${MAX_TOTAL_BYTES} total bytes.`);
      result.push({path, content: file.content});
    }
    return result;
  }

  function jsonFile(files, path) {
    const file = files.find(candidate => candidate.path === path);
    if (!file) return undefined;
    try { return JSON.parse(file.content); }
    catch (error) { throw new Error(`${path} must contain valid JSON: ${error.message}`); }
  }

  function sortedKeys(value) { return Object.keys(value || {}).sort(); }

  function versionParts(version) {
    const match = /^(\d+)\.(\d+)\.(\d+)(?:-([\w.-]+))?$/.exec(String(version));
    return match && [Number(match[1]), Number(match[2]), Number(match[3]), match[4] || ''];
  }

  function compareVersions(left, right) {
    const a = versionParts(left);
    const b = versionParts(right);
    if (!a || !b) return undefined;
    for (let index = 0; index < 3; index += 1) if (a[index] !== b[index]) return a[index] < b[index] ? -1 : 1;
    if (a[3] === b[3]) return 0;
    if (!a[3]) return 1;
    if (!b[3]) return -1;
    return a[3].localeCompare(b[3], 'en');
  }

  function satisfiesRange(version, range) {
    if (range === version) return true;
    const versionValue = versionParts(version);
    if (!versionValue || typeof range !== 'string') return false;
    if (range.startsWith('^') || range.startsWith('~')) {
      const target = versionParts(range.slice(1));
      if (!target || compareVersions(version, range.slice(1)) < 0) return false;
      return range[0] === '^'
        ? (target[0] > 0 ? versionValue[0] === target[0] : target[1] > 0 ? versionValue[0] === 0 && versionValue[1] === target[1] : versionValue[0] === 0 && versionValue[1] === 0 && versionValue[2] === target[2])
        : versionValue[0] === target[0] && versionValue[1] === target[1];
    }
    const terms = range.match(/(?:>=|<=|>|<|=)?\s*\d+\.\d+\.\d+(?:-[\w.-]+)?/g);
    if (!terms) return false;
    return terms.every(term => {
      const match = /^(>=|<=|>|<|=)?\s*(.+)$/.exec(term.trim());
      const order = compareVersions(version, match[2]);
      if (order === undefined) return false;
      switch (match[1] || '=') {
        case '>=': return order >= 0;
        case '<=': return order <= 0;
        case '>': return order > 0;
        case '<': return order < 0;
        default: return order === 0;
      }
    });
  }

  function resolveLockedPackage(packages, fromPath, dependency) {
    let prefix = fromPath;
    while (prefix) {
      const candidate = packages[`${prefix}/node_modules/${dependency}`];
      if (candidate) return candidate;
      const marker = prefix.lastIndexOf('/node_modules/');
      if (marker >= 0) prefix = prefix.slice(0, marker);
      else if (prefix.startsWith('node_modules/')) prefix = '';
      else prefix = prefix.slice(0, prefix.lastIndexOf('/'));
    }
    return packages[`node_modules/${dependency}`];
  }

  function assertDependencyMap(packageJson, packageLock, lockRoot, field) {
    const dependencies = packageJson[field] || {};
    const locked = lockRoot[field] || {};
    const names = sortedKeys(dependencies);
    if (names.join('\0') !== sortedKeys(locked).join('\0')) throw new Error(`package-lock.json ${field} do not match package.json.`);
    for (const name of names) {
      const version = dependencies[name];
      if (typeof version !== 'string' || !/^\d+\.\d+\.\d+(?:-[\w.-]+)?$/.test(version)) {
        throw new Error(`Dependency ${name} must be pinned to an exact version in package.json.`);
      }
      if (locked[name] !== version) throw new Error(`package-lock.json ${field} version for ${name} does not match package.json.`);
      const entry = packageLock.packages?.[`node_modules/${name}`];
      if (!entry || entry.version !== version) throw new Error(`package-lock.json has no matching locked package entry for ${name}@${version}.`);
      if (typeof entry.resolved !== 'string' || !/^https:\/\//.test(entry.resolved) || typeof entry.integrity !== 'string' || !/^sha(?:256|384|512)-[A-Za-z0-9+/]{16,}={0,2}$/.test(entry.integrity)) {
        throw new Error(`package-lock.json package entry for ${name} must have a registry URL and integrity hash.`);
      }
    }
  }

  function validatePackage(files) {
    const packageJson = jsonFile(files, 'package.json');
    const packageLock = jsonFile(files, 'package-lock.json');
    if (!packageJson && !packageLock) return;
    if (!packageJson) throw new Error('package-lock.json is present but package.json is missing.');
    if (!packageLock) {
      const hasDependencies = Object.keys(packageJson.dependencies || {}).length || Object.keys(packageJson.devDependencies || {}).length;
      if (hasDependencies) throw new Error('package-lock.json is required when package.json declares dependencies.');
      throw new Error('package-lock.json is required for exported npm projects.');
    }
    const name = packageJson.name;
    const version = packageJson.version;
    const lockRoot = packageLock.packages?.[''];
    if (packageLock.lockfileVersion !== 3 || !lockRoot || packageLock.name !== name || packageLock.version !== version || lockRoot.name !== name || lockRoot.version !== version) {
      throw new Error('package-lock.json identity and lockfileVersion must match package.json.');
    }
    assertDependencyMap(packageJson, packageLock, lockRoot, 'dependencies');
    assertDependencyMap(packageJson, packageLock, lockRoot, 'devDependencies');
    for (const [path, entry] of Object.entries(packageLock.packages)) {
      if (!path || !path.startsWith('node_modules/')) continue;
      for (const [dependency, range] of Object.entries(entry.dependencies || {})) {
        const locked = resolveLockedPackage(packageLock.packages, path, dependency);
        if (!locked || !satisfiesRange(locked.version, range)) throw new Error(`package-lock.json does not resolve ${dependency}@${range} required by ${path}.`);
      }
    }
    return packageJson;
  }

  function readme({item, assessment, checkpoint, packageJson}) {
    const lines = [
      `# ${item?.title || checkpoint.title || `Projeto ${item?.id || checkpoint.id || ''}`}`.trim(),
      '',
      `Atividade: ${item?.id || checkpoint.id || 'projeto local'}.`,
      '',
      checkpoint.instructions?.length ? '## Instruções' : '',
      ...(checkpoint.instructions || []).map(line => `- ${line}`),
      '',
      checkpoint.commands?.length ? '## Comandos' : '',
      ...(checkpoint.commands || assessment.local?.commands || []).map(command => `- \`${command.join(' ')}\``),
      '',
      checkpoint.expected?.length ? '## Saída esperada' : '',
      ...(checkpoint.expected || []).map(line => `- ${line}`),
      '',
      checkpoint.evidence?.length || assessment.local?.evidence?.length ? '## Evidências' : '',
      ...((checkpoint.evidence || assessment.local?.evidence || []).map(line => `- ${line}`)),
      '',
    ].filter(line => line !== undefined);
    if (packageJson?.devDependencies?.typescript) {
      lines.push('## TypeScript', '', `O projeto foi fixado no TypeScript ${packageJson.devDependencies.typescript}. O curso apresenta TypeScript ${checkpoint.courseTypescript || '7.0'}; esta versão é um proxy local e não comprova compatibilidade com a versão do curso.`, '');
    }
    return lines.join('\n');
  }

  function validateAssessment(files, assessment = {}, checkpointCommands = []) {
    const paths = new Set(files.map(file => file.path));
    for (const [label, value] of [['entryPath', assessment.entryPath], ['testPath', assessment.testPath], ['tsconfigPath', assessment.tsconfigPath], ['fixturesPath', assessment.fixturesPath]]) {
      if (value === undefined || value === null || value === '') continue;
      const path = normalizePath(value);
      if (!paths.has(path)) throw new Error(`Declared ${label} is missing from the project: ${path}`);
    }
    for (const command of [...(assessment.local?.commands || []), ...(checkpointCommands || [])]) {
      if (!Array.isArray(command) || !command.length || command.some(arg => typeof arg !== 'string' || !arg)) throw new Error('Local commands must be non-empty argument arrays.');
      for (let index = 1; index < command.length; index += 1) {
        const argument = command[index];
        if (typeof argument === 'string' && /\.(?:m?[jt]s|json|html|css|cjs|md)$/i.test(argument) && !argument.startsWith('-')) {
          let path;
          try { path = normalizePath(argument); }
          catch { continue; }
          if (!paths.has(path)) throw new Error(`Command references a missing project file: ${argument}`);
        }
      }
    }
  }

  function validateNpmCommands(assessment, checkpointCommands, packageJson) {
    for (const command of [...(assessment.local?.commands || []), ...(checkpointCommands || [])]) {
      if (!/^(?:npm|npm\.cmd)$/i.test(command[0])) continue;
      if (!packageJson) throw new Error('An npm command requires exported package.json and package-lock.json.');
      const scriptName = command[1] === 'run' ? command[2] : command[1] === 'test' ? 'test' : undefined;
      if (scriptName && typeof packageJson.scripts?.[scriptName] !== 'string') throw new Error(`package.json is missing the declared npm script: ${scriptName}`);
    }
  }

  function appendGenerated(files, path, content) {
    const key = path.normalize('NFKC').toLocaleLowerCase('en-US');
    const collision = files.find(file => {
      const existing = file.path.normalize('NFKC').toLocaleLowerCase('en-US');
      return existing === key || existing.startsWith(`${key}/`) || key.startsWith(`${existing}/`);
    });
    if (collision) {
      if (collision.path === path) return false;
      throw new Error(`Generated project file collides with an existing path: ${path}`);
    }
    files.push({path, content});
    return true;
  }

  function createProjectFiles({item = {}, files = [], assessment = {}, checkpoint = {}} = {}) {
    const output = asFiles(files);
    validateAssessment(output, assessment, checkpoint.commands);
    const generatedPackage = checkpoint.package;
    if (generatedPackage) appendGenerated(output, 'package.json', JSON.stringify(generatedPackage, null, 2) + '\n');
    const generatedLock = checkpoint.packageLock;
    if (generatedLock) appendGenerated(output, 'package-lock.json', JSON.stringify(generatedLock, null, 2) + '\n');
    const packageJson = validatePackage(output);
    validateNpmCommands(assessment, checkpoint.commands, packageJson);
    const existingReadme = output.find(file => file.path === 'README.md');
    if (!existingReadme) {
      appendGenerated(output, 'README.md', readme({item, assessment, checkpoint, packageJson}));
    } else if (!existingReadme.content.includes('## DevPath local checkpoint')) {
      const supplement = readme({item, assessment, checkpoint, packageJson}).replace(/^# .*\r?\n/, '').trim();
      existingReadme.content = `${existingReadme.content.trimEnd()}\n\n## DevPath local checkpoint\n\n${supplement}\n`;
    }
    if (!output.some(file => file.path === 'README.md')) output.push({path: 'README.md', content: readme({item, assessment, checkpoint, packageJson})});
    const manifest = {
      schemaVersion: 1,
      activityId: String(item.id || checkpoint.id || ''),
      title: String(item.title || checkpoint.title || ''),
      environment: String(assessment.environment || checkpoint.environment || 'local-declared'),
      evidenceSource: 'local-declared',
      verificationStatus: 'not-run-by-export',
      courseTypescript: checkpoint.courseTypescript || undefined,
      checkerTypescript: packageJson?.devDependencies?.typescript || undefined,
      files: [...output.map(file => file.path), 'devpath-project.json'].sort(),
      checks: assessment.checks || [],
    };
    appendGenerated(output, 'devpath-project.json', JSON.stringify(manifest, null, 2) + '\n');
    return asFiles(output).sort((a, b) => a.path.localeCompare(b.path, 'en'));
  }

  function crc32(bytes) {
    let crc = 0xffffffff;
    for (const byte of bytes) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
  }

  function write16(target, offset, value) { target[offset] = value & 0xff; target[offset + 1] = (value >>> 8) & 0xff; }
  function write32(target, offset, value) { write16(target, offset, value & 0xffff); write16(target, offset + 2, Math.floor(value / 0x10000)); }

  function createZip(files) {
    const locals = [];
    const centrals = [];
    let localOffset = 0;
    let totalSize = 22;
    for (const file of files) {
      const name = encoder.encode(file.path);
      const data = encoder.encode(file.content);
      if (name.length > 0xffff || data.length > 0xffffffff || localOffset > 0xffffffff) throw new Error('Project is too large for the ZIP format supported by this exporter.');
      const crc = crc32(data);
      const local = new Uint8Array(30 + name.length + data.length);
      const lv = new DataView(local.buffer);
      write32(local, 0, 0x04034b50); write16(local, 4, 20); write16(local, 6, UTF8_FLAG); write16(local, 8, 0);
      write16(local, 10, 0); write16(local, 12, DOS_DATE); write32(local, 14, crc); write32(local, 18, data.length); write32(local, 22, data.length);
      write16(local, 26, name.length); write16(local, 28, 0); local.set(name, 30); local.set(data, 30 + name.length);
      locals.push(local);
      const central = new Uint8Array(46 + name.length);
      write32(central, 0, 0x02014b50); write16(central, 4, 20); write16(central, 6, 20); write16(central, 8, UTF8_FLAG); write16(central, 10, 0);
      write16(central, 12, 0); write16(central, 14, DOS_DATE); write32(central, 16, crc); write32(central, 20, data.length); write32(central, 24, data.length);
      write16(central, 28, name.length); write16(central, 30, 0); write16(central, 32, 0); write16(central, 34, 0); write16(central, 36, 0);
      write32(central, 38, 0x81a40000); write32(central, 42, localOffset); central.set(name, 46);
      centrals.push(central);
      localOffset += local.length;
      totalSize += local.length + central.length;
      if (centrals.length > 0xffff || totalSize > 0xffffffff) throw new Error('Project is too large for the ZIP format supported by this exporter.');
    }
    const centralOffset = localOffset;
    const centralSize = centrals.reduce((size, entry) => size + entry.length, 0);
    const end = new Uint8Array(22);
    write32(end, 0, 0x06054b50); write16(end, 4, 0); write16(end, 6, 0); write16(end, 8, centrals.length); write16(end, 10, centrals.length);
    write32(end, 12, centralSize); write32(end, 16, centralOffset); write16(end, 20, 0);
    return new Blob([...locals, ...centrals, end], {type: 'application/zip'});
  }

  function safeFilename(value) {
    const name = String(value || 'project').normalize('NFKD').replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
    return `${name || 'project'}.zip`;
  }

  async function downloadProject(input, options = {}) {
    const files = createProjectFiles(input);
    const blob = createZip(files);
    const filename = safeFilename(input?.item?.id || input?.checkpoint?.id || 'project');
    const documentRef = options.documentRef || (typeof document === 'object' ? document : undefined);
    const urlApi = options.urlApi || (typeof URL === 'object' ? URL : undefined);
    if (options.triggerDownload !== false && documentRef?.createElement && urlApi?.createObjectURL) {
      const url = urlApi.createObjectURL(blob);
      const anchor = documentRef.createElement('a');
      anchor.href = url;
      anchor.download = filename;
      anchor.hidden = true;
      documentRef.body.appendChild(anchor);
      try { anchor.click(); }
      finally {
        anchor.remove?.();
        const schedule = options.setTimeoutFn || setTimeout;
        schedule(() => urlApi.revokeObjectURL?.(url), options.revokeAfterMs ?? 1000);
      }
    }
    return {files, blob, filename};
  }

  return Object.freeze({createProjectFiles, downloadProject, normalizeProjectPath: normalizePath});
});
