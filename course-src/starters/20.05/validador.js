// Contrato visível 20.05:
// Exporte validarUser(user): Proxy e updateUser(current, patch): novo objeto validado sem mutar current.
// age deve ser inteiro entre 0 e 150, inclusive; qualquer outro valor lança RangeError antes de gravar. A validação do Proxy é superficial.

// 20.05 · Validação escondida num Proxy versus função explícita.
// Regra: age é inteiro de 0 a 150; outro valor lança RangeError.

const user = { age: 20, endereco: { cidade: "Recife" } };

const proxy = new Proxy(user, {
  set(target, key, value, receiver) {
    // TODO: valide age e delegue a escrita com Reflect.set (que devolve boolean).
  },
});

export function updateUser(current, patch) {
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

// Avaliação visível: implementação pendente
export function validarUser(user) { return new Proxy(user, {set(target,key,value,receiver) { /* TODO: validar age antes de gravar. */ return Reflect.set(target,key,value,receiver); }}); }
