import {readFileSync} from 'node:fs';
const root = new URL('../public/', import.meta.url);

// Isolated stage tests load the same foundational scripts as devpath.html.
export function withPublicDependencies(source) {
  return ['progress-migrations.js', 'teaching-utils.js', 'progress-model.js', 'stage00-activities.js']
    .map(name => readFileSync(new URL(name, root), 'utf8')).join('\n') + '\n' + source;
}
