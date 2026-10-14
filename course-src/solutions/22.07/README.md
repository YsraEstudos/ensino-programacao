# Type tests do pacote

Compile `tipos.test.ts` against `index.d.ts`. It checks the accepted parser input, discriminant narrowing, route template and required client configuration. Each negative call has one `@ts-expect-error`; deleting a violation must surface TS2578. This file is compile-only. Run a separate JavaScript test before claiming the runtime agrees with the declaration.

## Transferência independente

Create consumer assertions for a discriminated Result<string> and a client route type constrained to a leading slash, including positive narrowing, invalid route, and runtime parse of success/error values.

## Critérios observáveis da avaliação

- Every expect-error documents one invalid call or illegal branch access; removing it produces TS2578.
- The suite passes the correct declaration and each semantic mutation fails at the learner test path; infra diagnostics never count as kills.
- A separate runtime test checks parser behavior; compile-only evidence is not called execution.

## Verificação

A evidência depende do executor typescript; erros de infraestrutura, suíte vazia ou timeout não aprovam a tentativa.

## Transferência independente

Crie asserções de consumidor para um Result<string> discriminado e um tipo de rota de cliente restrito a barra inicial, incluindo estreitamento positivo, rota inválida e parse em runtime dos valores de sucesso e erro.
