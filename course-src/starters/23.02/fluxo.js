// 23.02 · Fluxo de uma requisição pelas camadas.
// Ordene os blocos dentro de criarPedido: entrada -> parse -> validação -> domínio -> persistência -> apresentação.

class ValidationError extends Error {}

const repositorio = {
  itens: [],
  async salvar(pedido) {
    if (pedido.quantidade > 99) throw new Error("disco cheio (simulado)");
    this.itens.push(pedido);
  },
};

async function criarPedido(entrada) {
  /* Blocos (embaralhados)
  [A] const pedido = { produto: dados.produto.trim(), quantidade: dados.quantidade, total: dados.quantidade * 10 };
  [B] return { status: 201, corpo: `Pedido de ${pedido.produto} criado` };
  [C] const dados = JSON.parse(entrada);
  [D] try { await repositorio.salvar(pedido); } catch (erro) { throw new Error("não foi possível salvar o pedido", { cause: erro }); }
  [E] if (typeof dados.produto !== "string" || !Number.isInteger(dados.quantidade) || dados.quantidade < 1) throw new ValidationError("pedido inválido");
  */
}

async function responder(entrada) {
  try {
    return await criarPedido(entrada);
  } catch (erro) {
    if (erro instanceof ValidationError || erro instanceof SyntaxError) return { status: 400, corpo: erro.message };
    return { status: 500, corpo: "Erro interno. Tente de novo.", causa: erro.cause?.message };
  }
}

console.log(await responder('{"produto":"caneca","quantidade":2}'));  // 201
console.log(await responder('{"produto":"caneca","quantidade":0}'));  // 400 e repositório intacto
console.log(await responder('{"produto":"caneca","quantidade":100}')); // 500 com causa preservada, mensagem segura
console.log("itens salvos:", repositorio.itens.length);               // esperado: 1
