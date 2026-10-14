export function observar(target, onRead = () => {}) {
  return new Proxy(target, { get(obj, key, receiver) { onRead(key); return Reflect.get(obj, key, receiver); } });
}
export const proxyGetter = observar(Object.create({get dobro(){return this.base*2;}}));
