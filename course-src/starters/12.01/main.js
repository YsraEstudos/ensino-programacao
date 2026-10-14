console.log('A');
setTimeout(() => console.log('T'), 0);
Promise.resolve().then(() => console.log('P'));
console.log('B');
