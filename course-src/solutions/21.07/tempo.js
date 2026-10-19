export function debounce(fn, wait, relogio = {setTimeout, clearTimeout}) {
  let timer;
  const schedule = relogio.setTimeout ?? relogio.set;
  const cancel = relogio.clearTimeout ?? relogio.clear;
  const wrapped = (...args) => {
    if (timer !== undefined) cancel(timer);
    timer = schedule(() => { timer = undefined; fn(...args); }, wait);
  };
  wrapped.cancel = () => { if (timer !== undefined) cancel(timer); timer = undefined; };
  return wrapped;
}
export function throttle(fn, wait, relogio = {agora: Date.now}) {
  let last = -Infinity;
  return (...args) => { const now = (relogio.agora ?? relogio.now)(); if (now - last >= wait) { last = now; fn(...args); } };
}
