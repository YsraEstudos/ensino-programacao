// Gate heurístico (somente aviso): identificador citado em crases em explanation, vocabulário ou conceptSteps
// precisa existir nos arquivos do starter. Palavras reservadas, globais e APIs comuns são ignoradas.
import { indexById, starterText, textValues, wordRegExp } from "./gate-common.mjs";

export const GATE = "gate-identificadores";

const SKIP = new Set(
  (
    "break case catch class const continue debugger default delete do else enum export extends false finally for " +
    "function if import in instanceof let new null of return static super switch this throw true try typeof " +
    "undefined var void while with yield await async from as type get set implements interface private protected public " +
    "string number boolean bigint object symbol " +
    "Array Object String Number Boolean Symbol Map Set WeakMap WeakSet WeakRef Promise Error TypeError RangeError " +
    "SyntaxError ReferenceError Date Math JSON RegExp Reflect Proxy BigInt Intl console process require module " +
    "exports globalThis window document localStorage setTimeout clearTimeout setInterval clearInterval queueMicrotask " +
    "structuredClone fetch URL URLSearchParams Buffer NaN Infinity isNaN isFinite parseInt parseFloat " +
    "describe it test expect beforeEach afterEach assert vi jest node " +
    "then catch finally map filter reduce forEach push pop shift unshift slice splice join split length toString " +
    "valueOf keys values entries has add delete clear includes indexOf find some every sort reverse concat trim " +
    "toUpperCase toLowerCase replace match stringify parse freeze isArray from of call apply bind next return throw " +
    "resolve reject all race any log error warn info"
  ).split(" ")
);

const BACKTICK_RE = /`([^`\n]+)`/g;
const IDENTIFIER_RE = /^[A-Za-z_$][\w$]*$/;

export function citedIdentifiers(text) {
  const found = new Set();
  for (const match of String(text).matchAll(BACKTICK_RE)) {
    const token = match[1].trim().replace(/\(\)$/, "");
    if (token.length < 2 || !IDENTIFIER_RE.test(token) || SKIP.has(token)) continue;
    found.add(token);
  }
  return found;
}

export function run({ catalog = [] } = {}) {
  const warnings = [];
  const byId = indexById(catalog);
  for (const activity of catalog) {
    const prep = activity.preparation ?? {};
    const cited = new Set();
    for (const value of [activity.explanation, prep.vocabulary, prep.conceptSteps]) {
      for (const text of textValues(value)) for (const name of citedIdentifiers(text)) cited.add(name);
    }
    if (!cited.size) continue;
    const starter = starterText(byId.get(activity.id));
    for (const name of [...cited].sort()) {
      if (!wordRegExp(name).test(starter)) {
        warnings.push({
          activityId: activity.id,
          message: `identificador \`${name}\` citado em explicação/vocabulário mas ausente do starter`,
        });
      }
    }
  }
  return { gate: GATE, warnings };
}
