// 20.04 · Proxy que reentra no próprio trap.
// Hipótese (antes de editar): por que `receiver[key]` chama o trap de novo? ___

const target = { x: 2 };
const proxy = new Proxy(target, {
  get(target, key, receiver) {
    return receiver[key]; // bug: receiver é o próprio proxy
  },
});

try {
  console.log(proxy.x);
} catch (erro) {
  console.log("falhou:", erro.name, erro.message);
}

// Corrija o trap de forma localizada, preservando receiver (use Reflect.get).
// Depois confira dois casos:
const base = {
  get dobro() {
    return this.x * 2; // `this` precisa ser o proxy (receiver), não o target
  },
};
const comGetter = Object.assign(Object.create(base), { x: 5 });
// const proxyGetter = new Proxy(comGetter, { get: ___ });
// console.log(proxyGetter.dobro);              // esperado: 10
// console.log(proxy[Symbol.toStringTag]);      // símbolo não deve quebrar: undefined
