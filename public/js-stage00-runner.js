/*
 * Interpretador pedagógico: console.log com literais, typeof restrito,
 * somas numéricas simples e validação estrutural de HTML em modo separado.
 * Não avalia JavaScript arbitrário nem executa a marcação submetida.
 * Resultado: {ok:true, lines:[{sourceLine, values}]} ou erro didático por linha.
 */
(function (global) {
    "use strict";
    const MAX_SOURCE_LENGTH = 600;
    const MAX_LINES = 20;
    function failure(line, kind, message) {
        return { ok: false, error: {
                line, kind, message
            } };
    }
    function parseString(source, start) {
        const quote = source[start];
        let value = "";
        for (let index = start + 1; index < source.length; index += 1) {
            const char = source[index];
            if (char === quote)
                return { value, next: index + 1 };
            if (char === "\\") {
                index += 1;
                if (index >= source.length)
                    return null;
                const escaped = source[index];
                const escapes = {
                    n: "\n", r: "\r", t: "\t", "\\": "\\", "'": "'", '"': '"'
                };
                if (!Object.prototype.hasOwnProperty.call(escapes, escaped))
                    return null;
                value += escapes[escaped];
            }
            else {
                value += char;
            }
        }
        return null;
    }
    function parseNumber(source, start) {
        const match = source.slice(start).match(/^-?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/);
        if (!match)
            return null;
        const value = Number(match[0]);
        return Number.isFinite(value) ? { value, next: start + match[0].length } : null;
    }
    function parseTemplate(source, start) {
        let value = "";
        for (let index = start + 1; index < source.length; index += 1) {
            const char = source[index];
            if (char === "`")
                return { value, next: index + 1 };
            if (char === "$")
                return null;
            if (char === "\\") {
                index += 1;
                if (index >= source.length || ![
                    "`", "\\", "n", "t"
                ].includes(source[index]))
                    return null;
                value += source[index] === "n" ? "\n" : source[index] === "t" ? "\t" : source[index];
            }
            else
                value += char;
        }
        return null;
    }
    function parseLiteral(source, start) {
        const first = parseString(source, start) || (source[start] === "`" ? parseTemplate(source, start) : null) || parseNumber(source, start);
        if (first)
            return first;
        const match = source.slice(start).match(/^(true|false|null|undefined|NaN)\b/);
        if (!match)
            return null;
        const value = match[0] === "true" ? true : match[0] === "false" ? false : match[0] === "null" ? null : match[0] === "undefined" ? undefined : NaN;
        return { value, next: start + match[0].length };
    }
    function parseExpression(source, start) {
        let cursor = start;
        while (/\s/.test(source[cursor] || ""))
            cursor += 1;
        const typeOperator = /^typeof\b/.exec(source.slice(cursor));
        if (typeOperator) {
            cursor += typeOperator[0].length;
            while (/\s/.test(source[cursor] || ""))
                cursor += 1;
            const operand = parseLiteral(source, cursor);
            if (!operand)
                return null;
            return { value: typeof operand.value, next: operand.next };
        }
        const first = parseLiteral(source, cursor);
        if (!first)
            return null;
        cursor = first.next;
        while (/\s/.test(source[cursor] || ""))
            cursor += 1;
        if (source[cursor] === "+" && typeof first.value === "number") {
            cursor += 1;
            while (/\s/.test(source[cursor] || ""))
                cursor += 1;
            const second = parseNumber(source, cursor);
            if (!second)
                return null;
            const value = first.value + second.value;
            if (!Number.isFinite(value))
                return null;
            return { value, next: second.next };
        }
        return first;
    }
    function parseArguments(source, cursor) {
        const values = [];
        let position = cursor;
        while (position < source.length && /\s/.test(source[position]))
            position += 1;
        if (source[position] === ")")
            return { values, next: position + 1 };
        while (position < source.length) {
            const expression = parseExpression(source, position);
            if (!expression)
                return null;
            values.push(expression.value);
            position = expression.next;
            while (position < source.length && /\s/.test(source[position]))
                position += 1;
            if (source[position] === ",") {
                position += 1;
                while (position < source.length && /\s/.test(source[position]))
                    position += 1;
                if (position >= source.length || source[position] === ")")
                    return null;
                continue;
            }
            if (source[position] === ")")
                return { values, next: position + 1 };
            return null;
        }
        return null;
    }
    function interpretHtml(source) {
        if (typeof source !== "string")
            return failure(1, "syntax", "O código precisa estar em texto.");
        if (source.length > MAX_SOURCE_LENGTH)
            return failure(1, "syntax", `O código passou do limite de ${MAX_SOURCE_LENGTH} caracteres.`);
        const sourceLines = source.split(/\r?\n/);
        if (sourceLines.length > MAX_LINES)
            return failure(MAX_LINES + 1, "syntax", `Use no máximo ${MAX_LINES} linhas nesta atividade.`);
        const tokens = /<\/?[A-Za-z][A-Za-z0-9-]*(?:\s+[^<>]*?)?\s*\/?>|[^<]+/g;
        const allowedTags = new Set([
            "form", "label", "input", "button"
        ]);
        const allowedAttributes = new Set([
            "id", "for", "class", "type", "name"
        ]);
        const stack = [];
        const elements = [];
        let cursor = 0;
        let match;
        while ((match = tokens.exec(source))) {
            if (match.index !== cursor)
                return failure(source.slice(0, cursor).split(/\r?\n/).length, "syntax", "Confira a escrita da tag ou o texto solto entre elementos.");
            cursor = tokens.lastIndex;
            const token = match[0];
            if (!token.startsWith("<")) {
                if (token.trim() && !["label", "button"].includes(stack[stack.length - 1]?.name))
                    return failure(source.slice(0, match.index).split(/\r?\n/).length, "syntax", "Nesta prática, escreva texto somente dentro de label ou button.");
                if (stack.length)
                    stack[stack.length - 1].text += token;
                continue;
            }
            const line = source.slice(0, match.index).split(/\r?\n/).length;
            const closing = /^<\s*\//.test(token);
            const tagMatch = token.match(closing ? /^<\/\s*([A-Za-z][A-Za-z0-9-]*)\s*>$/ : /^<\s*([A-Za-z][A-Za-z0-9-]*)([\s\S]*?)\s*\/?>$/);
            if (!tagMatch)
                return failure(line, "syntax", `Linha ${line}: confira os sinais de abertura e fechamento da tag.`);
            const name = tagMatch[1].toLowerCase();
            if (!allowedTags.has(name))
                return failure(line, "not_taught", `Linha ${line}: esta prática usa somente form, label, input e button.`);
            if (closing) {
                if (name === "input" || stack[stack.length - 1]?.name !== name)
                    return failure(line, "syntax", `Linha ${line}: a tag de fechamento não corresponde à estrutura aberta.`);
                stack.pop();
                continue;
            }
            const attributes = {};
            let rest = tagMatch[2].replace(/\/\s*$/, "");
            while (rest.trim()) {
                const attribute = rest.match(/^\s+([A-Za-z][A-Za-z0-9-]*)\s*=\s*(?:"([^"]*)"|'([^']*)')/);
                if (!attribute)
                    return failure(line, "syntax", `Linha ${line}: use atributos com valores entre aspas, por exemplo id="nome".`);
                const key = attribute[1].toLowerCase();
                if (!allowedAttributes.has(key))
                    return failure(line, "not_taught", `Linha ${line}: o atributo ${key} ainda não faz parte desta prática.`);
                if (Object.prototype.hasOwnProperty.call(attributes, key))
                    return failure(line, "syntax", `Linha ${line}: evite repetir o atributo ${key}.`);
                attributes[key] = attribute[2] ?? attribute[3] ?? "";
                rest = rest.slice(attribute[0].length);
            }
            const parent = stack[stack.length - 1] || null;
            if (name === "form" ? Boolean(parent) || elements.some((element) => element.name === "form") : parent?.name !== "form") {
                return failure(line, "structure", name === "form" ? "O formulário deve ser o elemento raiz." : `${name} deve ser filho direto de form nesta atividade.`);
            }
            const element = {
                name, attributes, parent, line, text: ""
            };
            elements.push(element);
            if (name !== "input")
                stack.push(element);
        }
        if (cursor !== source.length)
            return failure(source.slice(0, cursor).split(/\r?\n/).length, "syntax", "Há uma tag incompleta no fim do código.");
        if (stack.length)
            return failure(stack[stack.length - 1].line, "syntax", `Feche a tag ${stack[stack.length - 1].name} antes de conferir.`);
        const forms = elements.filter((element) => element.name === "form");
        const labels = elements.filter((element) => element.name === "label");
        const inputs = elements.filter((element) => element.name === "input");
        const buttons = elements.filter((element) => element.name === "button");
        const issues = [];
        if (forms.length !== 1)
            issues.push("Mantenha um único form como raiz.");
        if (labels.length !== 1 || inputs.length !== 1 || buttons.length !== 1)
            issues.push("Inclua um label, um input e um button dentro do formulário.");
        if (labels.length === 1 && !labels[0].text.trim())
            issues.push("Escreva um texto dentro do label.");
        if (buttons.length === 1 && !buttons[0].text.trim())
            issues.push("Escreva um rótulo dentro do button.");
        if (inputs.length === 1 && (!inputs[0].attributes.id || !inputs[0].attributes.class))
            issues.push("O input precisa de id e class.");
        if (labels.length === 1 && inputs.length === 1 && labels[0].attributes.for !== inputs[0].attributes.id)
            issues.push("O valor de for do label deve corresponder ao id do input.");
        const lines = elements.map((element) => {
            const detail = element.name === "input" ? `id ${element.attributes.id || "ausente"}` : element.name === "label" ? `for ${element.attributes.for || "ausente"}` : element.text.trim() || "elemento";
            return { sourceLine: element.line, values: [`<${element.name}> · ${detail}`] };
        });
        return {
            ok: true, lines, validation: { complete: issues.length === 0, issues }
        };
    }
    function parseLine(rawLine, sourceLine) {
        const line = rawLine.trim();
        if (!line)
            return { values: null };
        if (/^\/\//.test(line))
            return { values: null };
        if (/^(\/\*|\*|#)/.test(line)) {
            return { error: {
                    line: sourceLine, kind: "not_taught", message: `Linha ${sourceLine}: comentários ainda não foram ensinados. Use apenas chamadas console.log.`
                } };
        }
        const prefix = /^console\s*\.\s*log\s*\(/.exec(line);
        if (!prefix) {
            const misspelled = /^consle\s*\.\s*log\s*\(/.exec(line);
            if (misspelled) {
                const arguments_ = parseArguments(line, misspelled[0].length);
                if (!arguments_ || !/^(?:;)?$/.test(line.slice(arguments_.next).trim()))
                    return { error: {
                            line: sourceLine, kind: 'syntax', message: 'Confira aspas e parênteses antes de investigar o nome da chamada.'
                        } };
                return { error: {
                        line: sourceLine, kind: 'runtime', message: 'consle não está definido. Compare o nome com console no exemplo.'
                    } };
            }
            const kind = /\b(const|let|var|if|for|while|function|return|fetch|document|window|process|require|import)\b/.test(line) || /\bconsole\s*\./.test(line)
                ? "not_taught" : "syntax";
            const message = kind === "not_taught"
                ? `Linha ${sourceLine}: essa construção ainda não foi ensinada. Por enquanto, escreva console.log(...) com literais.`
                : `Linha ${sourceLine}: comece a instrução com console.log(...).`;
            return { error: {
                    line: sourceLine, kind, message
                } };
        }
        const parsed = parseArguments(line, prefix[0].length);
        if (!parsed)
            return { error: {
                    line: sourceLine, kind: "syntax", message: `Linha ${sourceLine}: confira aspas, parênteses, vírgulas e literais dentro de console.log(...).`
                } };
        let tail = line.slice(parsed.next).trim();
        if (tail === ";")
            tail = "";
        if (tail) {
            const kind = /\b(const|let|var|if|for|while|function|return|fetch|document|window|process|require|import)\b/.test(tail) ? "not_taught" : "syntax";
            const message = kind === "not_taught"
                ? `Linha ${sourceLine}: há uma construção ainda não ensinada depois da chamada.`
                : `Linha ${sourceLine}: deixe apenas uma chamada console.log(...) por linha.`;
            return { error: {
                    line: sourceLine, kind, message
                } };
        }
        return { values: parsed.values };
    }
    function interpret(source, options) {
        if (options === "html" || options?.mode === "html")
            return interpretHtml(source);
        if (typeof source !== "string")
            return failure(1, "syntax", "O código precisa estar em texto.");
        if (source.length > MAX_SOURCE_LENGTH)
            return failure(1, "syntax", `O código passou do limite de ${MAX_SOURCE_LENGTH} caracteres.`);
        const sourceLines = source.split(/\r?\n/);
        if (sourceLines.length > MAX_LINES)
            return failure(MAX_LINES + 1, "syntax", `Use no máximo ${MAX_LINES} linhas nesta atividade.`);
        // Check the whole file for syntax before simulating any runtime effect.
        const parsed = sourceLines.map((line, index) => parseLine(line, index + 1));
        const syntax = parsed.find(result => result.error?.kind === 'syntax');
        if (syntax)
            return { ok: false, error: syntax.error };
        const lines = [];
        for (let index = 0; index < parsed.length; index += 1) {
            const result = parsed[index];
            if (result.error)
                return {
                    ok: false, error: result.error, lines
                };
            if (result.values)
                lines.push({ sourceLine: index + 1, values: result.values });
        }
        return { ok: true, lines };
    }
    global.DevPathStage00Runner = Object.freeze({ interpret });
})(window);
