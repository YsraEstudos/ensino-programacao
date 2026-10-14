# PR simulado: resumo do inventário

```diff
+ export function summarize(items) {
+   items.sort((a, b) => a.name.localeCompare(b.name));
+   const total = items.reduce((sum, item) => sum + parseInt(item.price, 10), 0);
+   document.querySelector("#summary").innerHTML = `Total: ${total}`;
+   return { total, count: items.length, average: total / items.length };
+ }
```

Revisão recebida no projeto autoral: R1 sugere adicionar um teste para lista vazia; R2 sugere remover a validação de entrada porque “o chamador sempre manda certo”.
