// 20.05 · Validação escondida num Proxy versus função explícita.
// Regra: age é inteiro de 0 a 150; outro valor lança RangeError.

const user = { age: 20, endereco: { cidade: "Recife" } };

const proxy = new Proxy(user, {
  set(target, key, value, receiver) {
    // TODO: valide age e delegue a escrita com Reflect.set (que devolve boolean).
  },
});

function updateUser(atual, patch) {
  // TODO: alternativa explícita: devolve um novo objeto validado, sem mutar `atual`.
}

// Teste da versão Proxy:
proxy.age = 30;
console.log(user.age); // esperado: 30
try { proxy.age = -1; } catch (erro) { console.log("proxy:", erro.name); } // esperado: RangeError

// Teste da versão explícita:
// console.log(updateUser({ age: 20 }, { age: 21 }));   // esperado: { age: 21 }
// updateUser({ age: 20 }, { age: -1 })                 // esperado: RangeError

// Borda: proxy.endereco.cidade = 42 passa pelo trap? ___
// Qual abordagem deixa a regra mais visível para quem lê o código que chama? ___
