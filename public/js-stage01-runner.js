/* Stage 01's deliberately small JavaScript interpreter. Student text is parsed
   into data and interpreted; it is never passed to eval, Function, or a host API. */
(function (global) {
    'use strict';
    const MAX = 12000;
    const constants = new Map([
        ['true', true], ['false', false], ['null', null], ['undefined', undefined], ['NaN', NaN], ['Infinity', Infinity]
    ]);
    const reserved = new Set([
        ...constants.keys(), 'typeof', 'const', 'let', 'console', 'console.log'
    ]);
    const format = global.DevPathTeachingUtils.formatValue;
    function tokenizer(text, lineOffset = 0) {
        const out = [];
        let i = 0;
        let line = lineOffset + 1;
        let nl = false;
        const push = (type, value, at = line) => { out.push({
            type, value, line: at, nlBefore: nl
        }); nl = false; };
        while (i < text.length) {
            const c = text[i];
            if (/\s/.test(c)) {
                if (c === '\n') {
                    line++;
                    nl = true;
                }
                i++;
                continue;
            }
            if (text.startsWith('//', i)) {
                const end = text.indexOf('\n', i + 2);
                i = end < 0 ? text.length : end;
                continue;
            }
            if (c === '"' || c === "'") {
                const start = line;
                const q = c;
                let value = '';
                i++;
                while (i < text.length && text[i] !== q) {
                    if (text[i] === '\n')
                        throw new Error(`Linha ${line}: feche a string na mesma linha.`);
                    if (text[i] === '\\') {
                        i++;
                        const e = text[i];
                        const escapes = {
                            n: '\n', r: '\r', t: '\t', '\\': '\\', '"': '"', "'": "'"
                        };
                        if (!(e in escapes))
                            throw new Error(`Linha ${line}: escape não suportado.`);
                        value += escapes[e];
                    }
                    else
                        value += text[i];
                    i++;
                }
                if (i >= text.length)
                    throw new Error(`Linha ${start}: string sem fechamento.`);
                i++;
                push('literal', value, start);
                continue;
            }
            if (c === '`') {
                const start = line;
                let body = '';
                i++;
                while (i < text.length && text[i] !== '`') {
                    if (text[i] === '\\' && text[i + 1] === '`') {
                        body += '`';
                        i += 2;
                        continue;
                    }
                    if (text[i] === '\n')
                        line++;
                    body += text[i++];
                }
                if (i >= text.length)
                    throw new Error(`Linha ${start}: template sem fechamento.`);
                i++;
                push('template', body, start);
                continue;
            }
            const number = /^(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?n?/.exec(text.slice(i));
            if (number) {
                const raw = number[0];
                if (raw.endsWith('n') && !/^\d+n$/.test(raw))
                    throw new Error(`Linha ${line}: BigInt aceita apenas inteiros.`);
                push('literal', raw.endsWith('n') ? BigInt(raw.slice(0, -1)) : Number(raw));
                i += raw.length;
                continue;
            }
            const word = /^[A-Za-z_$][\w$]*/.exec(text.slice(i));
            if (text.startsWith('console.log', i) && !/[\w$]/.test(text[i + 11] || '')) {
                push('word', 'console.log');
                i += 11;
                continue;
            }
            if (word) {
                push('word', word[0]);
                i += word[0].length;
                continue;
            }
            const op = /^(===|!==|==|!=|>=|<=|&&|\|\||\*\*|[+\-*/%><=(),;])/.exec(text.slice(i));
            if (op) {
                push('symbol', op[0]);
                i += op[0].length;
                continue;
            }
            throw new Error(`Linha ${line}: símbolo ${JSON.stringify(c)} fora da sintaxe desta etapa.`);
        }
        out.push({
            type: 'eof', value: 'EOF', line
        });
        return out;
    }
    function parse(source) {
        const tokens = tokenizer(source);
        let p = 0;
        const peek = () => tokens[p];
        const take = v => peek().value === v ? tokens[p++] : null;
        const fail = (message, token = peek()) => { throw new Error(`Linha ${token.line}: ${message}`); };
        const precedence = { '+': 1 };
        function expression(min = 0) {
            const token = tokens[p++];
            let node;
            if (token.type === 'literal')
                node = { type: 'literal', value: token.value };
            else if (token.type === 'template')
                node = templateNode(token.value, token.line);
            else if (token.type === 'word' && token.value === 'typeof')
                node = {
                    type: 'unary', op: 'typeof', value: expression(7)
                };
            else if (token.type === 'symbol' && (token.value === '+' || token.value === '-'))
                node = {
                    type: 'unary', op: token.value, value: expression(7)
                };
            else if (token.value === '(') {
                node = expression();
                node.parenthesized = true;
                if (!take(')'))
                    fail('esperado ).');
            }
            else if (token.type === 'word')
                node = { type: 'name', name: token.value };
            else
                fail('escreva uma expressão completa.', token);
            while (precedence[peek().value] !== undefined && precedence[peek().value] >= min) {
                const op = tokens[p++].value;
                const right = expression(precedence[op] + 1);
                node = {
                    type: 'binary', op, left: node, right
                };
            }
            return node;
        }
        function templateNode(body, atLine) {
            const parts = [];
            let i = 0;
            let text = '';
            while (i < body.length) {
                if (body[i] === '\\' && body[i + 1] === '$') {
                    text += '$';
                    i += 2;
                    continue;
                }
                if (body[i] === '\\' && body[i + 1] === '\\') {
                    text += '\\';
                    i += 2;
                    continue;
                }
                if (body[i] !== '$' || body[i + 1] !== '{') {
                    text += body[i++];
                    continue;
                }
                if (text) {
                    parts.push({ type: 'text', value: text });
                    text = '';
                }
                i += 2;
                const start = i;
                let depth = 1;
                while (i < body.length && depth) {
                    if (body[i] === '{')
                        depth++;
                    else if (body[i] === '}')
                        depth--;
                    i++;
                }
                if (depth)
                    fail('template sem fechamento.', { line: atLine });
                const inner = body.slice(start, i - 1);
                let innerNode;
                try {
                    innerNode = parse(`console.log(${inner});`).statements[0].args[0];
                }
                catch {
                    fail('expressão inválida no template.', { line: atLine });
                }
                parts.push({ type: 'expr', value: innerNode });
            }
            if (text)
                parts.push({ type: 'text', value: text });
            return { type: 'template', parts };
        }
        const statements = [];
        while (peek().value !== 'EOF') {
            if (take(';'))
                continue;
            const line = peek().line;
            if (peek().value === 'const' || peek().value === 'let') {
                const kind = tokens[p++].value;
                do {
                    const name = tokens[p++];
                    if (name.type !== 'word' || reserved.has(name.value))
                        fail('nome de variável inválido.', name);
                    if (!take('=')) {
                        if (kind === 'const')
                            fail('const precisa de um inicializador.', name);
                        statements.push({
                            type: 'declare', name: name.value, kind, value: { type: 'literal', value: undefined }, line
                        });
                    }
                    else
                        statements.push({
                            type: 'declare', name: name.value, kind, value: expression(), line
                        });
                } while (take(','));
            }
            else if (peek().value === 'console.log') {
                p++;
                if (!take('('))
                    fail('esperado ( após console.log.');
                const args = [];
                if (!take(')')) {
                    do {
                        args.push(expression());
                    } while (take(','));
                    if (!take(')'))
                        fail('esperado ).');
                }
                statements.push({
                    type: 'log', args, line
                });
            }
            else if (peek().type === 'word' && tokens[p + 1]?.value === '=') {
                const name = tokens[p++].value;
                p++;
                statements.push({
                    type: 'assign', name, value: expression(), line
                });
            }
            else
                fail('use const/let, atribuições e console.log nesta etapa.');
            if (!take(';') && peek().value !== 'EOF' && !peek().nlBefore)
                fail('separe as instruções com ponto e vírgula.');
        }
        return { statements };
    }
    function run(source, fixtures = {}) {
        if (typeof source !== 'string' || source.length > MAX)
            return {
                ok: false, error: 'O código deve ter até 12.000 caracteres.', lines: [], values: [], variables: {}, kinds: {}, trace: [], statements: []
            };
        let ast;
        try {
            ast = parse(source);
        }
        catch (error) {
            return {
                ok: false, error: error.message, lines: [], values: [], variables: {}, kinds: {}, trace: [], statements: []
            };
        }
        const seen = new Set();
        for (const statement of ast.statements)
            if (statement.type === 'declare') {
                if (seen.has(statement.name))
                    return {
                        ok: false, error: `Linha ${statement.line}: Variável ${statement.name} já declarada.`, lines: [], values: [], variables: {}, kinds: {}, trace: [], statements: ast.statements
                    };
                seen.add(statement.name);
            }
        const env = new Map();
        const lines = [];
        const trace = [];
        let operations = 0;
        const snapshot = () => ({ variables: Object.fromEntries([...env].map(([n, x]) => [n, x.value])), kinds: Object.fromEntries([...env].map(([n, x]) => [n, x.kind])) });
        const evaluate = node => {
            if (++operations > 5000)
                throw Error('Divida o código em blocos menores.');
            if (node.type === 'literal')
                return node.value;
            if (node.type === 'name') {
                if (env.has(node.name) && env.get(node.name).initialized)
                    return env.get(node.name).value;
                if (constants.has(node.name))
                    return constants.get(node.name);
                throw Error(`Variável ${node.name} não declarada ou em TDZ.`);
            }
            if (node.type === 'template')
                return node.parts.map(part => part.type === 'text' ? part.value : String(evaluate(part.value))).join('');
            if (node.type === 'unary') {
                const value = evaluate(node.value);
                if (node.op === 'typeof')
                    return typeof value;
                return node.op === '-' ? -value : +value;
            }
            const left = evaluate(node.left);
            const right = evaluate(node.right);
            switch (node.op) {
                case '+': return left + right;
                case '-': return left - right;
                case '*': return left * right;
                case '/': return left / right;
                case '%': return left % right;
                case '==': return left == right;
                case '!=': return left != right;
                case '===': return left === right;
                case '!==': return left !== right;
                case '>': return left > right;
                case '>=': return left >= right;
                case '<': return left < right;
                case '<=': return left <= right;
                default: throw Error('operador não suportado.');
            }
        };
        const fail = (stmt, error) => { throw Error(`Linha ${stmt.line}: ${error.message}`); };
        try {
            for (const stmt of ast.statements) {
                try {
                    if (stmt.type === 'declare') {
                        if (env.has(stmt.name))
                            throw Error(`Variável ${stmt.name} já declarada.`);
                        let value;
                        if (Object.prototype.hasOwnProperty.call(fixtures, stmt.name)) {
                            const literalInitializer = stmt.value.type === 'literal' || (stmt.value.type === 'name' && constants.has(stmt.value.name));
                            if (!literalInitializer)
                                throw Error(`A entrada ${stmt.name} só pode substituir um inicializador literal.`);
                            value = fixtures[stmt.name];
                        }
                        else
                            value = evaluate(stmt.value);
                        env.set(stmt.name, {
                            value, kind: stmt.kind, initialized: true
                        });
                    }
                    else if (stmt.type === 'assign') {
                        if (!env.has(stmt.name))
                            throw Error(`Variável ${stmt.name} não declarada.`);
                        if (env.get(stmt.name).kind === 'const')
                            throw Error(`const ${stmt.name} não pode receber nova atribuição.`);
                        env.get(stmt.name).value = evaluate(stmt.value);
                    }
                    else {
                        const values = stmt.args.map(evaluate);
                        lines.push({ line: stmt.line, values });
                    }
                }
                catch (error) {
                    fail(stmt, error);
                }
                trace.push({ line: stmt.line, ...snapshot() });
            }
            for (const fixtureName of Object.keys(fixtures))
                if (!env.has(fixtureName))
                    throw Error(`Entrada ${fixtureName} não declarada no código.`);
        }
        catch (error) {
            return {
                ok: false, error: error.message, lines, values: lines.flatMap(x => x.values), variables: snapshot().variables, kinds: snapshot().kinds, trace, statements: ast.statements
            };
        }
        return {
            ok: true, lines, values: lines.flatMap(x => x.values), variables: snapshot().variables, kinds: snapshot().kinds, trace, statements: ast.statements
        };
    }
    global.DevPathStage01Runner = { run, format };
})(globalThis);
