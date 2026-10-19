Arquivo `debug.js` — salve o código abaixo e abra-o no debugger do Node.js:

```js
function somaPositivos(valores) {
  let total = 0;
  for (const valor of valores) {
    if (valor > 0) total += valor;
  }
  return total;
}

console.log(somaPositivos([1, -2, 3]));
```

Antes de executar, preveja o valor de `total` na entrada e após cada iteração. Depois avance o debugger com um breakpoint dentro do laço e registre se houve divergência. Se houve, identifique a primeira e explique a evidência do watch/breakpoint que resolveu a dúvida; se não, explique qual evidência confirmou sua previsão.
