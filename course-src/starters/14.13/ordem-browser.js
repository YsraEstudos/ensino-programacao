// Browser evergreen
console.log('A síncrono');setTimeout(()=>console.log('T timer'),0);Promise.resolve().then(()=>console.log('P promise'));console.log('B síncrono');
// Node ESM/CJS usa também process.nextTick: execute localmente e registre versão/contexto.
