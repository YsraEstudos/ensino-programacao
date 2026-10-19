// A referência publicada precisa conter a entrada executável e todo módulo local
// alcançável pela suíte, pelo HTML de entrada ou por seus próprios imports.
// Arquivos estáticos do starter podem ser reutilizados; código executável não.
import ts from "typescript";
import { JSDOM } from "jsdom";
import { posix } from "node:path";
import { normalizePath, suiteFor, suiteIds, indexById } from "./gate-common.mjs";

export const GATE = "gate-solucao-completa";

const STATIC = /\.(?:html?|css|json|md|svg|png|jpe?g|webp)$/i;
const RELATIVE_PATH = /^\.\.?\//;
const EXTERNAL_URL = /^(?:[a-z][a-z\d+.-]*:|\/\/|\/|#)/i;

function addSpecifier(found, value, owner) {
  const specifier = String(value ?? "").trim();
  if (!RELATIVE_PATH.test(specifier)) return;
  found.push(posix.normalize(posix.join(posix.dirname(owner), specifier)));
}

function isLocalUrlBase(node) {
  if (!node || !ts.isPropertyAccessExpression(node)) return false;
  if (node.name.text === "url" && ts.isMetaProperty(node.expression)) {
    return node.expression.keywordToken === ts.SyntaxKind.ImportKeyword && node.expression.name.text === "meta";
  }
  if (node.name.text !== "href") return false;
  const location = node.expression;
  if (ts.isIdentifier(location)) return location.text === "location";
  return ts.isPropertyAccessExpression(location) && location.name.text === "location" &&
    ts.isIdentifier(location.expression) && ["self", "window", "globalThis"].includes(location.expression.text);
}

function addLocalUrl(found, value, owner) {
  const specifier = String(value ?? "").trim();
  if (!specifier || EXTERNAL_URL.test(specifier)) return;
  const path = specifier.split(/[?#]/, 1)[0];
  if (path) found.push(posix.normalize(posix.join(posix.dirname(owner), path)));
}

function codeLinks(source, owner, found) {
  const scriptKind = /\.tsx?$/i.test(owner) ? ts.ScriptKind.TSX : ts.ScriptKind.JSX;
  const file = ts.createSourceFile(owner || "source.js", String(source), ts.ScriptTarget.Latest, true, scriptKind);
  const visit = node => {
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier) {
      if (ts.isStringLiteralLike(node.moduleSpecifier)) addSpecifier(found, node.moduleSpecifier.text, owner);
    } else if (ts.isImportEqualsDeclaration(node) && ts.isExternalModuleReference(node.moduleReference)) {
      const expression = node.moduleReference.expression;
      if (expression && ts.isStringLiteralLike(expression)) addSpecifier(found, expression.text, owner);
    } else if (ts.isCallExpression(node)) {
      const expression = node.expression;
      const dynamicImport = expression.kind === ts.SyntaxKind.ImportKeyword;
      const loader = ts.isIdentifier(expression) && ["require", "importScripts"].includes(expression.text);
      if (dynamicImport || loader) {
        const args = loader && expression.text === "importScripts" ? node.arguments : node.arguments.slice(0, 1);
        for (const argument of args) if (ts.isStringLiteralLike(argument)) addSpecifier(found, argument.text, owner);
      }
    } else if (ts.isNewExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === "URL") {
      const specifier = node.arguments?.[0];
      const base = node.arguments?.[1];
      if (specifier && ts.isStringLiteralLike(specifier) && isLocalUrlBase(base)) {
        addLocalUrl(found, specifier.text, owner);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(file);
}

function htmlLinks(source, owner, found) {
  const dom = new JSDOM(String(source));
  try {
    for (const element of dom.window.document.querySelectorAll("script[src], link[href]")) {
      const attribute = element.localName === "script" ? "src" : "href";
      const value = element.getAttribute(attribute)?.trim() ?? "";
      if (!value || EXTERNAL_URL.test(value)) continue;
      const path = value.split(/[?#]/, 1)[0];
      if (path) found.push(posix.normalize(posix.join(posix.dirname(owner), path)));
    }
  } finally {
    dom.window.close();
  }
}

function links(source, owner = "") {
  const found = [];
  if (/\.html?$/i.test(owner)) htmlLinks(source, owner, found);
  else codeLinks(source, owner, found);
  return found.map(normalizePath);
}

export function run({ catalog = [], assessments = {}, tests = {} } = {}) {
  const byId = indexById(catalog);
  const warnings = [];
  for (const id of suiteIds(assessments, tests)) {
    const suite = suiteFor(id, assessments, tests);
    if (!suite) continue;
    const assessment = assessments[id] ?? {};
    const activity = byId.get(id);
    const provided = new Map((assessment.correctFiles ?? []).map(file => [normalizePath(file.path ?? ""), file.content ?? ""]));
    const starter = new Map((activity?.starterFiles ?? []).map(file => [normalizePath(file.path ?? ""), file.content ?? ""]));
    const missing = new Set();
    const queue = [...links(suite)];
    const entry = normalizePath(assessment.entryPath ?? "");
    if (entry) queue.push(entry);
    const seen = new Set();

    while (queue.length) {
      const path = queue.shift();
      if (!path || seen.has(path)) continue;
      seen.add(path);
      const source = provided.get(path);
      if (source !== undefined) {
        queue.push(...links(source, path));
      } else if (STATIC.test(path) && starter.has(path)) {
        queue.push(...links(starter.get(path), path));
      } else {
        missing.add(starter.has(path) ? `${path} (só no starter)` : path);
      }
    }
    // Um auxiliar pode não ser importado diretamente pela suíte, mas ainda
    // compor a implementação de referência consumida no aplicativo.
    for (const [path, source] of provided) {
      for (const dependency of links(source, path)) {
        if (!provided.has(dependency) && !(STATIC.test(dependency) && starter.has(dependency))) {
          missing.add(starter.has(dependency) ? `${dependency} (só no starter)` : dependency);
        }
      }
    }
    if (missing.size) warnings.push({
      activityId: id,
      message: `dependência executável da referência ausente de correctFiles: ${[...missing].sort().join(", ")}`,
    });
  }
  return { gate: GATE, warnings };
}
