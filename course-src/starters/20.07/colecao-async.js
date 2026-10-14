// 20.07 · Array.fromAsync versus for await...of.
// Registre quando o primeiro item fica disponível e qual versão guarda todos os itens.

const eventos = [];

async function* source() {
  eventos.push("produziu 1");
  yield 1;
  await Promise.resolve();
  eventos.push("produziu 2");
  yield 2;
}

async function collectAll() {
  const todos = await Array.fromAsync(source());
  eventos.push(`fromAsync entregou ${JSON.stringify(todos)}`);
  return todos;
}

async function processIncrementally() {
  for await (const value of source()) {
    eventos.push(`for await processou ${value}`);
  }
}

if (typeof Array.fromAsync !== "function") {
  eventos.push("Array.fromAsync indisponível: colete com for await e push");
} else {
  await collectAll();
}
await processIncrementally();
console.log(eventos.join("\n"));

// Previsões: ordem dos eventos ___; qual versão retém todos os itens na memória? ___
// Se a fonte rejeitar no segundo item, o que cada versão entrega? ___
