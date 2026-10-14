// Node.js 24 LTS: registre versão, fonte oficial e data da consulta. Compare Promise.try, fallback síncrono fiel e Promise.resolve().then(callback).
const callback=()=>{throw new Error("falhou");};
console.log(typeof Promise.try);
