import assert from 'node:assert/strict';

const DEDICATED_HINT_STAGES = new Set(['D', '00', '02', '03']);
const SOURCE_TYPES = new Set(['ecmascript', 'web-node-api', 'runtime-proposal']);

function list(value, label) {
  assert(Array.isArray(value), `${label} must be an array`);
  return value;
}

function metadataEntry(entry, id) {
  assert(entry && typeof entry === 'object' && !Array.isArray(entry), `Invalid metadata for ${id}`);
  const requires = list(entry.requires ?? [], `requires for ${id}`);
  assert(requires.every(item => typeof item === 'string' && item.trim()), `Invalid prerequisite in ${id}`);
  assert(new Set(requires).size === requires.length, `Duplicate prerequisite for ${id}`);
  if (entry.hintExemption !== undefined) {
    assert(typeof entry.hintExemption === 'string' && entry.hintExemption.trim().length >= 12,
      `hintExemption for ${id} must explain the authored source`);
  }
  for (const field of ['primerSource', 'graphNote']) {
    if (entry[field] !== undefined) assert(typeof entry[field] === 'string' && entry[field].trim(), `${field} for ${id} must explain its source`);
  }
  return {requires: [...requires], hintExemption: entry.hintExemption, primerSource: entry.primerSource, graphNote: entry.graphNote};
}

export function validateLearningMetadata(catalog, metadata, {optionalIds = new Set()} = {}) {
  list(catalog, 'catalog');
  assert(metadata && typeof metadata === 'object' && !Array.isArray(metadata), 'metadata must be an object');
  const ids = new Set(catalog.map(item => item?.id));
  assert(!ids.has(undefined), 'catalog contains an activity without an id');
  const positions = new Map(catalog.map((item, index) => [item.id, index]));
  for (const id of Object.keys(metadata)) assert(ids.has(id), `metadata for unknown activity ${id}`);
  const normalizedMetadata = new Map();
  for (const item of catalog) {
    const entry = metadata[item.id];
    assert(entry !== undefined, `missing metadata for ${item.id}`);
    const normalized = metadataEntry(entry, item.id);
    normalizedMetadata.set(item.id, normalized);
    const requires = normalized.requires;
    for (const target of requires) {
      assert(ids.has(target), `unknown prerequisite ${target} for ${item.id}`);
      assert(!optionalIds.has(target), `optional activity ${target} cannot be a prerequisite of ${item.id}`);
    }
  }
  // Check cycles before the effective-order rule so a malformed cycle is
  // reported as a cycle, rather than being hidden behind a later-edge error.
  const graph = new Map([...normalizedMetadata].map(([id, entry]) => [id, entry.requires]));
  const visiting = new Set(), visited = new Set();
  function visit(id) {
    if (visiting.has(id)) throw new Error(`cyclic prerequisite graph at ${id}`);
    if (visited.has(id)) return;
    visiting.add(id);
    for (const target of graph.get(id) ?? []) visit(target);
    visiting.delete(id); visited.add(id);
  }
  for (const id of ids) visit(id);
  for (const item of catalog) {
    const requires = normalizedMetadata.get(item.id).requires;
    for (const target of requires) {
      assert(positions.get(target) < positions.get(item.id),
        `later activity ${target} cannot be a prerequisite of ${item.id}`);
    }
    const hasHints = Array.isArray(item.hints) && item.hints.length >= 3;
    const dedicated = DEDICATED_HINT_STAGES.has(String(item.stage));
    if (!hasHints && !normalizedMetadata.get(item.id).hintExemption) {
      assert(dedicated === false, `${item.id} needs authored hints or hintExemption`);
      assert(false, `${item.id} needs authored hints or hintExemption`);
    }
  }
  return true;
}

function semver(value) {
  const match = String(value ?? '').match(/^(\d+)\.(\d+)\.(\d+)$/);
  assert(match, `Invalid runtime version ${value}`);
  return match.slice(1).map(Number);
}

export function validateRuntimeFeatureMatrix(matrix, {minimum, current} = {}, records = []) {
  assert(matrix && typeof matrix === 'object' && !Array.isArray(matrix), 'feature matrix must be an object');
  assert((matrix.sources ?? matrix.source) && typeof (matrix.sources ?? matrix.source) === 'object', 'feature matrix sources are required');
  const features = list(matrix.features ?? matrix.entries, 'feature matrix features');
  const minimumVersion = semver(String(minimum).includes('.') ? minimum : `${minimum}.0.0`);
  const currentVersion = semver(String(current).includes('.') ? current : `${current}.0.0`);
  const seen = new Set();
  for (const feature of features) {
    const featureId = feature?.id ?? feature?.label;
    assert(featureId && !seen.has(featureId), `duplicate or missing feature id ${featureId ?? ''}`);
    seen.add(featureId);
    const sourceType = feature.sourceType ?? (feature.edition === 'API Web/Node'
      ? 'web-node-api' : feature.edition === 'fora do ES2026' ? 'runtime-proposal' : 'ecmascript');
    assert(SOURCE_TYPES.has(sourceType), `invalid sourceType for ${feature.id ?? feature.label}`);
    const unavailable = feature.nodeVersionAdded === 'não suportado';
    const added = unavailable ? null : semver(feature.nodeVersionAdded);
    assert(unavailable || (added[0] <= currentVersion[0] &&
      (added[0] < currentVersion[0] || added[1] < currentVersion[1] ||
        (added[1] === currentVersion[1] && added[2] <= currentVersion[2]))),
      `${featureId} is newer than current Node ${current}`);
    const aboveMinimum = unavailable || added[0] > minimumVersion[0] ||
      (added[0] === minimumVersion[0] && (added[1] > minimumVersion[1] ||
        (added[1] === minimumVersion[1] && added[2] > minimumVersion[2])));
    if (aboveMinimum) {
      const referenced = records.filter(record => {
        const text = JSON.stringify(record?.learner ?? record ?? {});
        return (feature.match ?? []).some(token => text.includes(token));
      });
      if (referenced.length) {
        for (const record of referenced) {
          assert(/fallback|feature detection|polyfill|compat|confirmar|opcional/i.test(String(record.compatibility ?? '')),
            `${record.id} cites ${featureId} without an explicit Node ${minimum} compatibility strategy`);
        }
      }
    }
  }
  return true;
}
