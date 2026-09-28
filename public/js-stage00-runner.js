/*
 * Interpretador pedagógico da etapa 00.
 * Gramática: uma chamada console.log por linha; argumentos string/number ou
 * soma de dois literais numéricos. Não avalia JavaScript nem cria scripts.
 * Resultado: {ok:true, lines:[{sourceLine, values}]} ou erro didático por linha.
 */
(function (global) {
  "use strict";

  const MAX_SOURCE_LENGTH = 600;
  const MAX_LINES = 20;

  function failure(line, kind, message) {
    return { ok: false, error: { line, kind, message } };
  }

  function parseString(source, start) {
    const quote = source[start];
    let value = "";
    for (let index = start + 1; index < source.length; index += 1) {
      const char = source[index];
      if (char === quote) return { value, next: index + 1 };
      if (char === "\\") {
        index += 1;
        if (index >= source.length) return null;
        const escaped = source[index];
        const escapes = { n: "\n", r: "\r", t: "\t", "\\": "\\", "'": "'", '"': '"' };
        if (!Object.prototype.hasOwnProperty.call(escapes, escaped)) return null;
        value += escapes[escaped];
      } else {
        value += char;
      }
    }
    return null;
  }

  function parseNumber(source, start) {
    const match = source.slice(start).match(/^(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/);
    if (!match) return null;
    const value = Number(match[0]);
    return Number.isFinite(value) ? { value, next: start + match[0].length } : null;
  }

  function parseExpression(source, start) {
    let cursor = start;
    while (/\s/.test(source[cursor] || "")) cursor += 1;
    const first = parseString(source, cursor) || parseNumber(source, cursor);
    if (!first) return null;
    cursor = first.next;
    while (/\s/.test(source[cursor] || "")) cursor += 1;
    if (source[cursor] === "+" && typeof first.value === "number") {
      cursor += 1;
      while (/\s/.test(source[cursor] || "")) cursor += 1;
      const second = parseNumber(source, cursor);
      if (!second) return null;
      const value = first.value + second.value;
      if (!Number.isFinite(value)) return null;
      return { value, next: second.next };
    }
    return first;
  }

  function parseArguments(source, cursor) {
    const values = [];
    let position = cursor;
    while (position < source.length && /\s/.test(source[position])) position += 1;
    if (source[position] === ")") return { values, next: position + 1 };

    while (position < source.length) {
      const expression = parseExpression(source, position);
      if (!expression) return null;
      values.push(expression.value);
      position = expression.next;
      while (position < source.length && /\s/.test(source[position])) position += 1;
      if (source[position] === ",") {
        position += 1;
        while (position < source.length && /\s/.test(source[position])) position += 1;
        if (position >= source.length || source[position] === ")") return null;
        continue;
      }
      if (source[position] === ")") return { values, next: position + 1 };
      return null;
    }
    return null;
  }

  function parseLine(rawLine, sourceLine) {
    const line = rawLine.trim();
    if (!line) return { values: null };
    if (/^(\/\/|\/\*|\*|#)/.test(line)) {
      return { error: { line: sourceLine, kind: "not_taught", message: `Linha ${sourceLine}: comentários ainda não foram ensinados. Use apenas chamadas console.log.` } };
    }
    const prefix = /^console\s*\.\s*log\s*\(/.exec(line);
    if (!prefix) {
      const kind = /\b(const|let|var|if|for|while|function|return|fetch|document|window|process|require|import)\b/.test(line) || /\bconsole\s*\./.test(line)
        ? "not_taught" : "syntax";
      const message = kind === "not_taught"
        ? `Linha ${sourceLine}: essa construção ainda não foi ensinada. Por enquanto, escreva console.log(...) com literais.`
        : `Linha ${sourceLine}: comece a instrução com console.log(...).`;
      return { error: { line: sourceLine, kind, message } };
    }

    const parsed = parseArguments(line, prefix[0].length);
    if (!parsed) return { error: { line: sourceLine, kind: "syntax", message: `Linha ${sourceLine}: confira aspas, parênteses, vírgulas e literais dentro de console.log(...).` } };
    let tail = line.slice(parsed.next).trim();
    if (tail === ";") tail = "";
    if (tail) {
      const kind = /\b(const|let|var|if|for|while|function|return|fetch|document|window|process|require|import)\b/.test(tail) ? "not_taught" : "syntax";
      const message = kind === "not_taught"
        ? `Linha ${sourceLine}: há uma construção ainda não ensinada depois da chamada.`
        : `Linha ${sourceLine}: deixe apenas uma chamada console.log(...) por linha.`;
      return { error: { line: sourceLine, kind, message } };
    }
    return { values: parsed.values };
  }

  function interpret(source) {
    if (typeof source !== "string") return failure(1, "syntax", "O código precisa estar em texto.");
    if (source.length > MAX_SOURCE_LENGTH) return failure(1, "syntax", `O código passou do limite de ${MAX_SOURCE_LENGTH} caracteres.`);
    const sourceLines = source.split(/\r?\n/);
    if (sourceLines.length > MAX_LINES) return failure(MAX_LINES + 1, "syntax", `Use no máximo ${MAX_LINES} linhas nesta atividade.`);
    const lines = [];
    for (let index = 0; index < sourceLines.length; index += 1) {
      const result = parseLine(sourceLines[index], index + 1);
      if (result.error) return { ok: false, error: result.error };
      if (result.values) lines.push({ sourceLine: index + 1, values: result.values });
    }
    return { ok: true, lines };
  }

  global.DevPathStage00Runner = Object.freeze({ interpret });
})(window);
