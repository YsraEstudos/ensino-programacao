// 21.08 · De try/finally para using / await using.
// Node.js 24 suporta `using`; em navegadores, confira o suporte. Sem suporte, mantenha try/finally.

const log = [];

function abrir(nome) {
  log.push(`abriu ${nome}`);
  return {
    nome,
    [Symbol.dispose]() {
      log.push(`fechou ${nome}`);
    },
  };
}

// Versão atual com try/finally:
function processar() {
  const a = abrir("A");
  try {
    const b = abrir("B");
    try {
      log.push("trabalho");
    } finally {
      b[Symbol.dispose]();
    }
  } finally {
    a[Symbol.dispose]();
  }
}

// Reescreva com `using` (os recursos devem fechar em ordem LIFO: B antes de A):
function processarComUsing() {
  // using a = abrir("A");
  // ...
}

processar();
console.log(log.join(" | "));
log.length = 0;

// Depois crie abrirAsync(nome) com [Symbol.asyncDispose]() async e use `await using`.
// Confirme: dispose chamado uma vez, mesmo quando o corpo lança.
if (typeof Symbol.dispose !== "symbol") {
  console.log("Este runtime não tem Symbol.dispose: use try/finally.");
}
