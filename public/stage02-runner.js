/* Restricted expression interpreter. Student source is never passed to eval,
   Function, DOM, network or a JavaScript worker. Only the stage's grammar runs. */
(function (global) {
    'use strict';
    const APIs = new Map([
        ['Number', Number], ['String', String], ['Boolean', Boolean],
        ['Number.isFinite', Number.isFinite], ['Number.isNaN', Number.isNaN],
        ['Number.isSafeInteger', Number.isSafeInteger], ['Number.isInteger', Number.isInteger],
        ['Object.is', Object.is],
        ...[
            'floor', 'ceil', 'round', 'trunc', 'min', 'max', 'abs', 'random'
        ].map(key => [`Math.${key}`, Math[key]]),
    ]);
    const constants = new Map([
        ['true', true], ['false', false], ['null', null], ['undefined', undefined], ['NaN', NaN], ['Infinity', Infinity], ['Number.EPSILON', Number.EPSILON]
    ]);
    const format = global.DevPathTeachingUtils.formatValue;
    function run(source, fixtures = {}) {
        let cursor = 0, line = 1, tokens = [], position = 0, operations = 0;
        try {
            if (typeof source !== 'string' || source.length > 12000)
                throw Error('O código deve ter até 12.000 caracteres.');
            function fail(message, token = tokens[position]) { throw Error(`Linha ${token?.line || line}: ${message}`); }
            while (cursor < source.length) {
                const rest = source.slice(cursor);
                let match;
                if ((match = /^\s+/.exec(rest))) {
                    line += (match[0].match(/\n/g) || []).length;
                    cursor += match[0].length;
                    continue;
                }
                if (rest.startsWith('//')) {
                    cursor += rest.indexOf('\n') < 0 ? rest.length : rest.indexOf('\n');
                    continue;
                }
                if (rest.startsWith('/*')) {
                    const end = rest.indexOf('*/');
                    if (end < 0)
                        fail('Comentário sem fechamento.');
                    const comment = rest.slice(0, end + 2);
                    line += (comment.match(/\n/g) || []).length;
                    cursor += comment.length;
                    continue;
                }
                if (rest[0] === '"' || rest[0] === "'") {
                    const quote = rest[0];
                    let end = 1, value = '';
                    for (; end < rest.length && rest[end] !== quote; end++) {
                        if (rest[end] === '\n')
                            fail('Feche a string na mesma linha.');
                        if (rest[end] === '\\') {
                            end++;
                            const escapes = {
                                n: '\n', r: '\r', t: '\t', '\\': '\\', '"': '"', "'": "'"
                            };
                            if (!(rest[end] in escapes))
                                fail('Escape de string não suportado.');
                            value += escapes[rest[end]];
                        }
                        else
                            value += rest[end];
                    }
                    if (end === rest.length)
                        fail('String sem fechamento.');
                    tokens.push({
                        type: 'literal', value, line
                    });
                    cursor += end + 1;
                }
                else if ((match = /^(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?n?/.exec(rest))) {
                    const text = match[0];
                    if (text.endsWith('n') && !/^\d+n$/.test(text))
                        fail('BigInt aceita apenas inteiros.');
                    tokens.push({
                        type: 'literal', value: text.endsWith('n') ? BigInt(text.slice(0, -1)) : Number(text), line
                    });
                    cursor += text.length;
                }
                else if ((match = /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*/.exec(rest))) {
                    tokens.push({
                        type: 'word', value: match[0], line
                    });
                    cursor += match[0].length;
                }
                else if ((match = /^(?:===|!==|==|!=|>=|<=|&&|\|\||\?\?|\*\*|[+\-*/%><!(),;=])/.exec(rest))) {
                    tokens.push({
                        type: 'symbol', value: match[0], line
                    });
                    cursor += match[0].length;
                }
                else
                    fail(`Símbolo ${JSON.stringify(rest[0])} fora da sintaxe desta etapa.`);
                if (tokens.length > 2500)
                    fail('Divida o código em um bloco menor.');
            }
            tokens.push({ value: 'EOF', line });
            const peek = () => tokens[position].value;
            const take = value => {
                if (peek() === value) {
                    position++;
                    return true;
                }
                return false;
            };
            const expect = value => {
                if (!take(value))
                    fail(`Esperado ${value}.`);
            };
            const precedence = {
                '??': 1, '||': 2, '&&': 3, '==': 4, '!=': 4, '===': 4, '!==': 4, '>': 5, '>=': 5, '<': 5, '<=': 5, '+': 6, '-': 6, '*': 7, '/': 7, '%': 7, '**': 8
            };
            function expression(min = 0) {
                let node;
                const token = tokens[position++];
                if (token.type === 'literal')
                    node = { type: 'literal', value: token.value };
                else if ([
                    '!', '+', '-', 'typeof'
                ].includes(token.value))
                    node = {
                        type: 'unary', op: token.value, value: expression(9)
                    };
                else if (token.value === '(') {
                    node = expression();
                    node.parenthesized = true;
                    expect(')');
                }
                else if (token.type === 'word') {
                    if (take('(')) {
                        const args = [];
                        if (!take(')')) {
                            do {
                                args.push(expression());
                            } while (take(','));
                            expect(')');
                        }
                        node = {
                            type: 'call', name: token.value, args
                        };
                    }
                    else
                        node = { type: 'name', name: token.value };
                }
                else
                    fail('Escreva uma expressão completa.', token);
                while (precedence[peek()] !== undefined && precedence[peek()] >= min) {
                    const op = tokens[position++].value;
                    const right = expression(precedence[op] + (op === '**' ? 0 : 1));
                    const mixed = child => child.type === 'binary' && !child.parenthesized && (op === '??' && ['||', '&&'].includes(child.op) || ['||', '&&'].includes(op) && child.op === '??');
                    if (mixed(node) || mixed(right))
                        fail('Use parênteses ao misturar ?? com || ou &&.');
                    if (op === '**' && node.type === 'unary' && !node.parenthesized)
                        fail('Coloque a base negativa entre parênteses antes de **.');
                    node = {
                        type: 'binary', op, left: node, right
                    };
                }
                return node;
            }
            const statements = [];
            while (peek() !== 'EOF') {
                const sourceLine = tokens[position].line;
                if (take(';'))
                    continue;
                if (peek() === 'const' || peek() === 'let') {
                    const kind = tokens[position++].value;
                    do {
                        const name = tokens[position++];
                        if (name.type !== 'word' || name.value.includes('.') || constants.has(name.value) || APIs.has(name.value))
                            fail('Nome de variável inválido.', name);
                        expect('=');
                        statements.push({
                            type: 'declare', name: name.value, kind, value: expression(), line: sourceLine
                        });
                    } while (take(','));
                }
                else if (take('console.log')) {
                    expect('(');
                    const args = [];
                    if (!take(')')) {
                        do {
                            args.push(expression());
                        } while (take(','));
                        expect(')');
                    }
                    statements.push({
                        type: 'log', args, line: sourceLine
                    });
                }
                else if (tokens[position].type === 'word' && tokens[position + 1].value === '=') {
                    const name = tokens[position++].value;
                    expect('=');
                    statements.push({
                        type: 'assign', name, value: expression(), line: sourceLine
                    });
                }
                else
                    fail('Use declarações const/let, atribuições e console.log nesta etapa.');
                if (!take(';') && peek() !== 'EOF' && tokens[position].line <= sourceLine)
                    fail('Separe as instruções com ponto e vírgula.');
            }
            const env = new Map(), declared = new Set(), logs = [], calls = [];
            function evaluate(node) {
                const value = evaluateValue(node);
                if (typeof value === 'string' && value.length > 12000)
                    throw Error('Texto calculado muito longo para este bloco.');
                if (typeof value === 'bigint' && String(value).length > 1000)
                    throw Error('BigInt calculado muito grande para este bloco.');
                return value;
            }
            function evaluateValue(node) {
                if (++operations > 5000)
                    fail('Divida o código em blocos menores.');
                if (node.type === 'literal')
                    return node.value;
                if (node.type === 'name') {
                    if (env.has(node.name))
                        return env.get(node.name).value;
                    if (constants.has(node.name))
                        return constants.get(node.name);
                    throw Error(`Variável ${node.name} não declarada. Declare a entrada antes de usá-la.`);
                }
                if (node.type === 'call') {
                    if (!APIs.has(node.name))
                        throw Error(`API ${node.name} não disponível nesta etapa.`);
                    calls.push(node.name);
                    return APIs.get(node.name)(...node.args.map(evaluate));
                }
                if (node.type === 'unary') {
                    const v = evaluate(node.value);
                    if (node.op === '!')
                        return !v;
                    if (node.op === '-')
                        return -v;
                    if (node.op === '+')
                        return +v;
                    return typeof v;
                }
                const a = evaluate(node.left);
                if (node.op === '&&')
                    return a && evaluate(node.right);
                if (node.op === '||')
                    return a || evaluate(node.right);
                if (node.op === '??')
                    return a ?? evaluate(node.right);
                const b = evaluate(node.right);
                switch (node.op) {
                    case '+': return a + b;
                    case '-': return a - b;
                    case '*': return a * b;
                    case '/': return a / b;
                    case '%': return a % b;
                    case '**':
                        if (typeof a === 'bigint' && (b < 0n || b > 128n))
                            throw Error('Use um expoente BigInt entre 0 e 128 neste ambiente didático.');
                        return a ** b;
                    case '===': return a === b;
                    case '!==': return a !== b;
                    case '==': return a == b;
                    case '!=': return a != b;
                    case '>': return a > b;
                    case '>=': return a >= b;
                    case '<': return a < b;
                    case '<=': return a <= b;
                }
            }
            for (const stmt of statements) {
                try {
                    if (stmt.type === 'declare') {
                        if (env.has(stmt.name))
                            throw Error(`Variável ${stmt.name} já declarada.`);
                        const value = Object.hasOwn(fixtures, stmt.name) ? fixtures[stmt.name] : evaluate(stmt.value);
                        env.set(stmt.name, { value, kind: stmt.kind });
                        declared.add(stmt.name);
                    }
                    else if (stmt.type === 'assign') {
                        if (!env.has(stmt.name))
                            throw Error(`Variável ${stmt.name} não declarada.`);
                        if (env.get(stmt.name).kind === 'const')
                            throw Error(`const ${stmt.name} não pode receber nova atribuição.`);
                        if (Object.hasOwn(fixtures, stmt.name))
                            throw Error('Não altere as entradas do caso durante a execução.');
                        env.get(stmt.name).value = evaluate(stmt.value);
                    }
                    else
                        logs.push({ line: stmt.line, values: stmt.args.map(evaluate) });
                }
                catch (error) {
                    throw Error(`Linha ${stmt.line}: ${error.message}`);
                }
            }
            for (const name of Object.keys(fixtures))
                if (!declared.has(name))
                    throw Error(`Entrada ${name} não declarada no código. Mantenha as entradas do starter.`);
            return {
                ok: true, lines: logs, calls, values: logs.flatMap(entry => entry.values), variables: Object.fromEntries([...env].map(([key, value]) => [key, value.value]))
            };
        }
        catch (error) {
            return {
                ok: false, error: error.message, lines: [], values: []
            };
        }
    }
    global.DevPathStage02Runner = { run, format };
})(globalThis);
