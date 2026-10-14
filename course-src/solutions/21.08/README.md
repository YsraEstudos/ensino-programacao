# 21.08 — Referência de avaliação

## Contrato observado

Avalie este ID com o ambiente local e as verificações declaradas: local, rubric. Os arquivos de referência são: native-using.mjs. A referência preserva o contrato authored indicado nos arquivos e no enunciado.

## Transferência independente

# Transfer 21.08

The reference uses native using and await using with Symbol.dispose/Symbol.asyncDispose. Validate in Node 24 and Node 26; compare try/finally only as an explicit fallback where parsing the native syntax is unsupported. A manual disposal helper does not prove native using.

## Critérios observáveis da avaliação

- Reference source contains native using and await using syntax, not only calls to disposal symbols.
- Execution records acquisition, body, and reverse-order disposal exactly once.
- Record the actual Node version; untested versions are called out and fallback is scoped to unsupported syntax.

## Verificação local

node --test course-src/solutions/21.08/native-using.test.mjs

node --version

Limite: esta evidência é local/contida e não representa aprovação de navegador nem publicação.

## Transferência independente

# Transfer 21.08

A referência usa using e await using nativos com Symbol.dispose e Symbol.asyncDispose. Valide no Node 24 e no Node 26; compare try/finally só como fallback explícito onde a sintaxe nativa não é aceita. Um auxiliar de descarte manual não prova o using nativo.
