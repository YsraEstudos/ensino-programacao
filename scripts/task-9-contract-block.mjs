export function replaceContractBlock(source, marker, lines) {
  const sourceLines = source.split(/\r?\n/);
  const markerIndex = sourceLines.findIndex(line => line === marker);
  if (markerIndex < 0) return [marker, ...lines.map(line => '// ' + line), '', ...sourceLines].join('\n');

  let blockEnd = markerIndex + 1;
  while (blockEnd < sourceLines.length && sourceLines[blockEnd].startsWith('//')) blockEnd++;
  sourceLines.splice(markerIndex, blockEnd - markerIndex, marker, ...lines.map(line => '// ' + line));
  return sourceLines.join('\n');
}
