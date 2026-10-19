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

## Transferência independente

# Transfer 22.06

Comparar o guard de pagamento com Zod 3.25.76 em pasta temporária. Fixe typescript@6.0.3 e zod@3.25.76 no package.json local; execute o guard e validarComSchema com a mesma matriz: payload válido, amount '10', Infinity, NaN e null, payload null e id vazio. Não use coerção nem publique o pacote.

## Critérios observáveis da avaliação

- Guard e schema aceitam {id:"p1",amount:10} e rejeitam as mesmas seis entradas inválidas sem coerção.
- A execução local fixa Zod 3.25.76 e TypeScript 6.0.3 numa pasta temporária; npm install e compilação não usam dependências globais.
- A explicação separa z.infer, validação de runtime e regra de negócio; registra trade-off de mensagens, tamanho/custo sem exigir publicação.

## Verificação

A evidência depende do executor javascript; erros de infraestrutura, suíte vazia ou timeout não aprovam a tentativa.
