# 22.06 — Guard manual e schema local

Complete o TODO de schema.ts para exigir amount como número finito sem coerção. O contrato é id como texto não vazio e amount como número finito. O guard em pagamento.js e o schema com Zod devem aceitar/rejeitar a mesma matriz; mensagens podem diferir.

## Execução local isolada

Copie pagamento.js, schema.ts, verify.mjs e este README para uma pasta temporária. No terminal, entre nessa pasta e execute:

```sh
npm init -y
npm pkg set type=module
npm install --save-exact zod@3.25.76 typescript@6.0.3
npx tsc --strict --target ES2022 --module NodeNext --moduleResolution NodeNext --noEmit schema.ts
node --experimental-strip-types verify.mjs
```

Não instale ferramentas globalmente nem publique um pacote. verify.mjs executa os mesmos sete casos pelos dois caminhos.

| Entrada | Guard manual | Zod 3.25.76 |
|---|---|---|
| {id:'p1',amount:10} | aceita | aceita |
| {id:'p1',amount:'10'} | rejeita sem coerção | rejeita sem coerção |
| {id:'p1',amount:Infinity} | rejeita | rejeita |
| {id:'p1',amount:NaN} | rejeita | rejeita |
| {id:'p1',amount:null} | rejeita | rejeita |
| null | rejeita | rejeita |
| {id:'',amount:1} | rejeita | rejeita |
