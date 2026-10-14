export function criarHandlers(limite) {
  const handlers = [];
  for (var i = 0; i < limite; i++) {
    handlers.push(() => i);
  }
  return handlers;
}

console.log(JSON.stringify(criarHandlers(3).map(handler => handler())));
