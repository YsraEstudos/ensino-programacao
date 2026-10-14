export function parseLinha(texto) {
  if (texto === '') return {};
  const result = {}; let key = ''; let value = ''; let readingValue = false; let escaping = false;
  const flush = () => { if (!key || !readingValue) throw new SyntaxError('segmento inválido'); result[key] = value; key = ''; value = ''; readingValue = false; };
  for (const char of texto) {
    if (escaping) { if (readingValue) value += char; else key += char; escaping = false; continue; }
    if (char === '\\') { escaping = true; continue; }
    if (!readingValue && char === '=') { readingValue = true; continue; }
    if (char === ';') { flush(); continue; }
    if (readingValue) value += char; else key += char;
  }
  if (escaping) throw new SyntaxError('escape incompleto'); flush(); return result;
}
