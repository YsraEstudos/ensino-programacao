/* Deterministic, deliberately small interpreter for Stage 03. It never evaluates source as JavaScript. */
(function (global) {
    'use strict';
    const MAX_STEPS = 20000, MAX_LINES = 200, MAX_SOURCE = 12000;
    const constants = new Map([
        ['true', true], ['false', false], ['null', null], ['undefined', undefined], ['NaN', NaN], ['Infinity', Infinity]
    ]);
    const allowedCalls = new Set(['console.log', 'Math.max', 'Math.min']);
    function format(value) {
        if (typeof value === 'string')
            return JSON.stringify(value);
        if (Object.is(value, -0))
            return '-0';
        return String(value);
    }
    function run(source, fixtures = {}) {
        let tokens, at = 0, steps = 0, logs = [], root;
        const precedence = {
            '||': 1, '&&': 2, '==': 3, '!=': 3, '===': 3, '!==': 3, '>': 4, '>=': 4, '<': 4, '<=': 4, '+': 5, '-': 5, '*': 6, '/': 6, '%': 6
        };
        const BREAK = {}, CONTINUE = {};
        function Scope(parent) { this.parent = parent; this.values = new Map(); }
        Scope.prototype.hasOwn = function (n) { return this.values.has(n); };
        Scope.prototype.lookup = function (n) {
            if (this.values.has(n))
                return this;
            if (this.parent)
                return this.parent.lookup(n);
            throw Error(`Variável ${n} não declarada.`);
        };
        Scope.prototype.get = function (n) { return this.lookup(n).values.get(n).value; };
        Scope.prototype.set = function (n, value) { this.lookup(n).values.get(n).value = value; };
        Scope.prototype.declare = function (n, value, kind) {
            if (this.values.has(n))
                throw Error(`Variável ${n} já declarada.`);
            this.values.set(n, { value, kind });
        };
        Scope.prototype.entries = function () { return [...this.values].map(([k, v]) => [k, v.value]); };
        try {
            if (typeof source !== 'string' || source.length > MAX_SOURCE)
                throw Error('O código deve ter até 12.000 caracteres.');
            if (!fixtures || typeof fixtures !== 'object' || Array.isArray(fixtures))
                throw Error('Fixtures inválidas.');
            tokens = lex(source);
            const program = parseProgram();
            expect('EOF');
            root = new Scope(null);
            const fixtureNames = new Set(Object.keys(fixtures));
            execBlock(program, root, fixtureNames);
            for (const name of fixtureNames)
                if (!root.hasOwn(name))
                    throw Error(`Entrada ${name} não declarada no nível superior.`);
            const variables = Object.fromEntries(root.entries());
            return {
                ok: true, lines: logs, values: logs.flatMap(item => item.values), variables
            };
        }
        catch (error) {
            return {
                ok: false, lines: [], values: [], error: error === BREAK ? 'break precisa estar dentro de um loop ou switch.' : error === CONTINUE ? 'continue precisa estar dentro de um loop.' : error.message || String(error), variables: {}
            };
        }
        function tick() {
            if (++steps > MAX_STEPS)
                throw Error('Limite de passos excedido: falta de progresso ou loop sem término.');
        }
        function lex(text) {
            const out = [];
            let i = 0, line = 1;
            while (i < text.length) {
                if (/\s/.test(text[i])) {
                    if (text[i] === '\n')
                        line++;
                    i++;
                    continue;
                }
                if (text.startsWith('//', i)) {
                    const e = text.indexOf('\n', i);
                    i = e < 0 ? text.length : e;
                    continue;
                }
                if (text.startsWith('/*', i)) {
                    const e = text.indexOf('*/', i + 2);
                    if (e < 0)
                        throw Error(`Linha ${line}: comentário sem fechamento.`);
                    const c = text.slice(i, e + 2);
                    line += (c.match(/\n/g) || []).length;
                    i = e + 2;
                    continue;
                }
                const start = line, c = text[i];
                if (c === '"' || c === "'") {
                    const q = c;
                    let s = '', j = i + 1;
                    for (; j < text.length && text[j] !== q; j++) {
                        if (text[j] === '\n')
                            throw Error(`Linha ${line}: string sem fechamento.`);
                        if (text[j] === '\\') {
                            const e = {
                                n: '\n', r: '\r', t: '\t', '\\': '\\', '"': '"', "'": "'"
                            }[text[++j]];
                            if (e === undefined)
                                throw Error(`Linha ${line}: escape não suportado.`);
                            s += e;
                        }
                        else
                            s += text[j];
                    }
                    if (j >= text.length)
                        throw Error(`Linha ${line}: string sem fechamento.`);
                    out.push({
                        type: 'literal', value: s, line: start
                    });
                    i = j + 1;
                    continue;
                }
                const num = text.slice(i).match(/^(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/);
                if (num) {
                    out.push({
                        type: 'literal', value: Number(num[0]), line: start
                    });
                    i += num[0].length;
                    continue;
                }
                const word = text.slice(i).match(/^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*/);
                if (word) {
                    out.push({
                        type: 'word', value: word[0], line: start
                    });
                    i += word[0].length;
                    continue;
                }
                const op = text.slice(i).match(/^(===|!==|==|!=|>=|<=|&&|\|\||\+\+|--|\+=|-=|\*\*|[+\-*/%><!(),;={}:[\]])/);
                if (op) {
                    if (op[0] === '[' || op[0] === ']')
                        throw Error(`Linha ${line}: arrays não são suportados.`);
                    out.push({
                        type: 'symbol', value: op[0], line: start
                    });
                    i += op[0].length;
                    continue;
                }
                throw Error(`Linha ${line}: símbolo ${JSON.stringify(c)} fora da sintaxe da Etapa 03.`);
            }
            out.push({
                type: 'word', value: 'EOF', line
            });
            return out;
        }
        function peek(value) { return tokens[at].value === value; }
        function take(value) {
            if (peek(value))
                return tokens[at++];
            return null;
        }
        function expect(value) {
            const t = take(value);
            if (!t)
                throw Error(`Linha ${tokens[at].line}: esperado ${value}.`);
            return t;
        }
        function parseProgram(stop) {
            const out = [];
            while (!peek('EOF') && (!stop || !peek(stop)))
                out.push(parseStatement());
            return out;
        }
        function parseStatement() {
            if (take(';'))
                return { type: 'empty' };
            if (take('{')) {
                const body = parseProgram('}');
                expect('}');
                return { type: 'block', body };
            }
            if (take('if')) {
                expect('(');
                const test = expression();
                expect(')');
                const yes = parseStatement();
                const no = take('else') ? parseStatement() : { type: 'empty' };
                return {
                    type: 'if', test, yes, no
                };
            }
            if (take('for')) {
                expect('(');
                let init = null;
                if (!peek(';'))
                    init = parseForInit();
                expect(';');
                const test = peek(';') ? { type: 'literal', value: true } : expression();
                expect(';');
                const update = peek(')') ? null : expression();
                expect(')');
                return {
                    type: 'for', init, test, update, body: parseStatement()
                };
            }
            if (take('while')) {
                expect('(');
                const test = expression();
                expect(')');
                return {
                    type: 'while', test, body: parseStatement()
                };
            }
            if (take('switch')) {
                expect('(');
                const value = expression();
                expect(')');
                expect('{');
                const cases = [];
                while (!peek('}')) {
                    let test = null;
                    if (take('case')) {
                        test = expression();
                        expect(':');
                    }
                    else if (take('default'))
                        expect(':');
                    else
                        throw Error(`Linha ${tokens[at].line}: esperado case/default.`);
                    const body = [];
                    while (!peek('case') && !peek('default') && !peek('}'))
                        body.push(parseStatement());
                    cases.push({ test, body });
                }
                expect('}');
                return {
                    type: 'switch', value, cases
                };
            }
            if (take('break')) {
                expect(';');
                return { type: 'break' };
            }
            if (take('continue')) {
                expect(';');
                return { type: 'continue' };
            }
            if (peek('let') || peek('const'))
                return parseDeclaration(true);
            const line = tokens[at].line, left = expression();
            if (take('=') || take('+=') || take('-=')) {
                const op = tokens[at - 1].value;
                const right = expression();
                expect(';');
                return {
                    type: 'assign', left, op, right, line
                };
            }
            if (left.type === 'update' || left.type === 'assignExpr') {
                expect(';');
                return left;
            }
            if (left.type === 'call') {
                expect(';');
                return left;
            }
            throw Error(`Linha ${line}: instrução não suportada.`);
        }
        function parseForInit() { return (peek('let') || peek('const')) ? parseDeclaration(false) : expression(); }
        function parseDeclaration(withSemicolon) {
            const kind = tokens[at++].value, declarations = [];
            do {
                const t = tokens[at++];
                if (!t || t.type !== 'word' || t.value.includes('.') || constants.has(t.value))
                    throw Error(`Linha ${t?.line || tokens[at - 1].line}: nome de variável inválido.`);
                const hasInitializer = Boolean(take('=')), init = hasInitializer ? expression() : { type: 'literal', value: undefined };
                declarations.push({
                    name: t.value, init, line: t.line, hasInitializer
                });
            } while (take(','));
            if (withSemicolon)
                expect(';');
            return {
                type: 'declare', kind, declarations
            };
        }
        function expression(min = 0) {
            let left = prefix();
            while (precedence[tokens[at].value] !== undefined && precedence[tokens[at].value] >= min) {
                const op = tokens[at++].value, right = expression(precedence[op] + 1);
                left = {
                    type: 'binary', op, left, right
                };
            }
            if (min === 0 && ['=', '+=', '-='].includes(tokens[at].value)) {
                const op = tokens[at++].value;
                left = {
                    type: 'assignExpr', left, op, right: expression()
                };
            }
            return left;
        }
        function prefix() {
            const t = tokens[at++];
            if (!t)
                throw Error('Expressão incompleta.');
            if (t.type === 'literal')
                return t;
            if (constants.has(t.value))
                return { type: 'literal', value: constants.get(t.value) };
            if (t.value === '(') {
                const e = expression();
                expect(')');
                return e;
            }
            if (['!', '+', '-'].includes(t.value))
                return {
                    type: 'unary', op: t.value, value: expression(7)
                };
            if (t.type === 'word') {
                if (t.value === 'console.log' || t.value === 'Math.max' || t.value === 'Math.min') {
                    expect('(');
                    const args = [];
                    if (!peek(')')) {
                        do
                            args.push(expression());
                        while (take(','));
                    }
                    expect(')');
                    return {
                        type: 'call', name: t.value, args, line: t.line
                    };
                }
                const node = {
                    type: 'name', name: t.value, line: t.line
                };
                if (take('++') || take('--'))
                    return {
                        type: 'update', op: tokens[at - 1].value, value: node, line: t.line
                    };
                return node;
            }
            throw Error(`Linha ${t.line}: expressão não suportada.`);
        }
        function value(node, scope) {
            tick();
            if (node.type === 'update')
                return update(node, scope);
            if (node.type === 'assignExpr') {
                assign(node.left, node.op, node.right, scope);
                return scope.get(node.left.name);
            }
            if (node.type === 'literal')
                return node.value;
            if (node.type === 'name')
                return scope.get(node.name);
            if (node.type === 'unary') {
                const v = value(node.value, scope);
                return node.op === '!' ? !v : node.op === '-' ? -v : +v;
            }
            if (node.type === 'binary') {
                const a = value(node.left, scope);
                if (node.op === '&&')
                    return a && value(node.right, scope);
                if (node.op === '||')
                    return a || value(node.right, scope);
                const b = value(node.right, scope);
                switch (node.op) {
                    case '+': return a + b;
                    case '-': return a - b;
                    case '*': return a * b;
                    case '/': return a / b;
                    case '%': return a % b;
                    case '==': return a == b;
                    case '!=': return a != b;
                    case '===': return a === b;
                    case '!==': return a !== b;
                    case '>': return a > b;
                    case '>=': return a >= b;
                    case '<': return a < b;
                    case '<=': return a <= b;
                }
            }
            if (node.type === 'call') {
                const args = node.args.map(n => value(n, scope));
                if (!allowedCalls.has(node.name))
                    throw Error(`API ${node.name} não disponível.`);
                if (node.name === 'console.log') {
                    if (logs.length >= MAX_LINES)
                        throw Error('Limite de 200 linhas de log excedido.');
                    logs.push({ line: node.line, values: args });
                    return undefined;
                }
                return node.name === 'Math.max' ? Math.max(...args) : Math.min(...args);
            }
            throw Error('Expressão não suportada.');
        }
        function assign(node, op, right, scope) {
            if (node.type !== 'name')
                throw Error('Atribuição exige uma variável.');
            const owner = scope.lookup(node.name), cell = owner.values.get(node.name);
            if (cell.kind === 'const')
                throw Error(`const ${node.name} não pode receber nova atribuição.`);
            const next = value(right, scope);
            owner.values.set(node.name, { value: bounded(op === '=' ? next : op === '+=' ? cell.value + next : cell.value - next), kind: cell.kind });
        }
        function execBlock(body, scope, fixtureNames) {
            for (const stmt of body)
                exec(stmt, scope, fixtureNames);
        }
        function exec(stmt, scope, fixtureNames) {
            tick();
            switch (stmt.type) {
                case 'empty': return;
                case 'block': return execBlock(stmt.body, new Scope(scope), fixtureNames);
                case 'declare':
                    for (const d of stmt.declarations) {
                        if (stmt.kind === 'const' && !d.hasInitializer)
                            throw Error('const precisa de valor inicial.');
                        const initial = scope === root && Object.hasOwn(fixtures, d.name) ? fixtures[d.name] : value(d.init, scope);
                        scope.declare(d.name, bounded(initial), stmt.kind);
                    }
                    return;
                case 'assign': return assign(stmt.left, stmt.op, stmt.right, scope, fixtureNames);
                case 'assignExpr': return value(stmt, scope);
                case 'call': return value(stmt, scope);
                case 'update': return update(stmt, scope);
                case 'if': return exec(value(stmt.test, scope) ? stmt.yes : stmt.no, scope, fixtureNames);
                case 'while':
                    while (value(stmt.test, scope)) {
                        try {
                            exec(stmt.body, scope, fixtureNames);
                        }
                        catch (error) {
                            if (error === BREAK)
                                break;
                            if (error === CONTINUE)
                                continue;
                            throw error;
                        }
                    }
                    return;
                case 'for': {
                    const local = new Scope(scope);
                    if (stmt.init)
                        if (stmt.init.type === 'declare')
                            exec(stmt.init, local, fixtureNames);
                        else
                            value(stmt.init, local);
                    while (value(stmt.test, local)) {
                        try {
                            exec(stmt.body, local, fixtureNames);
                        }
                        catch (error) {
                            if (error === BREAK)
                                break;
                            if (error !== CONTINUE)
                                throw error;
                        }
                        if (stmt.update)
                            updateOrValue(stmt.update, local);
                    }
                    return;
                }
                case 'break': throw BREAK;
                case 'continue': throw CONTINUE;
                case 'switch': {
                    const target = value(stmt.value, scope), local = new Scope(scope);
                    let first = stmt.cases.findIndex(c => c.test !== null && value(c.test, scope) === target);
                    if (first < 0)
                        first = stmt.cases.findIndex(c => c.test === null);
                    if (first < 0)
                        return;
                    try {
                        for (let index = first; index < stmt.cases.length; index++)
                            execBlock(stmt.cases[index].body, local, fixtureNames);
                    }
                    catch (error) {
                        if (error !== BREAK)
                            throw error;
                    }
                    return;
                }
            }
        }
        function bounded(result) {
            if (typeof result === 'string' && result.length > 12000)
                throw Error('Texto calculado excede o limite de 12.000 caracteres.');
            return result;
        }
        function updateOrValue(node, scope) {
            if (node.type === 'update')
                update(node, scope);
            else
                value(node, scope);
        }
        function update(node, scope) {
            const old = scope.get(node.value.name);
            const owner = scope.lookup(node.value.name), cell = owner.values.get(node.value.name);
            if (cell.kind === 'const')
                throw Error(`const ${node.value.name} não pode receber nova atribuição.`);
            owner.values.set(node.value.name, { value: old + (node.op === '++' ? 1 : -1), kind: cell.kind });
            return old;
        }
    }
    global.DevPathStage03Runner = { run, format };
    if (typeof module !== 'undefined')
        module.exports = { run, format };
})(globalThis);
