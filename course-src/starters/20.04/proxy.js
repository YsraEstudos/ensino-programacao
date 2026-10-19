// Contrato visível 20.04:
// Exporte observar(target, onRead = () => {}): Proxy; o trap get chama onRead(key) e delega com Reflect.get(target, key, receiver).
// O getter herdado deve receber o Proxy como this; leituras de símbolo também funcionam.

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

// Avaliação visível: implementação pendente
export function observar(target, onRead = () => {}) { return new Proxy(target, {get(obj,key,receiver) { onRead(key); return receiver[key]; }}); }
