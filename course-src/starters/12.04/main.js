console.log('A');
Promise.resolve().then(() => { console.log('P1'); Promise.resolve().then(() => console.log('P2')); });
queueMicrotask(() => console.log('Q'));
setTimeout(() => console.log('T'), 0);
console.log('B');
