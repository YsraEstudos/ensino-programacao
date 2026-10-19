import path from 'node:path';

export function isStrictDescendant(candidate, parent) {
  const relative = path.relative(path.resolve(parent), path.resolve(candidate));
  return relative !== '' && relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
}
