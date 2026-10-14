// 23.04 · Código legado: funciona, mas validação duplicada e I/O misturado com regra.
// Refatore em passos pequenos; rode legado.test.js depois de CADA passo.
// `disco` simula o sistema de arquivos para que o exemplo rode em qualquer lugar.

export const disco = { arquivos: new Map(), escritas: 0 };
function escrever(caminho, texto) { disco.escritas++; disco.arquivos.set(caminho, texto); }
function ler(caminho) { return disco.arquivos.get(caminho); }

export function cadastrarCliente(nome, email, idade) {
  if (nome == null || String(nome).trim() == "") {
    return { ok: false, erro: "nome obrigatório" };
  }
  if (email == null || String(email).indexOf("@") == -1) {
    return { ok: false, erro: "email inválido" };
  }
  if (idade == null || isNaN(idade) || Number(idade) < 18) {
    return { ok: false, erro: "idade mínima 18" };
  }
  var clientes = JSON.parse(ler("clientes.json") || "[]");
  for (var i = 0; i < clientes.length; i++) {
    if (clientes[i].email == String(email).trim().toLowerCase()) {
      return { ok: false, erro: "email já cadastrado" };
    }
  }
  var cliente = {
    id: clientes.length + 1,
    nome: String(nome).trim(),
    email: String(email).trim().toLowerCase(),
    idade: Number(idade),
  };
  clientes.push(cliente);
  escrever("clientes.json", JSON.stringify(clientes));
  escrever("log.txt", (ler("log.txt") || "") + "cadastro " + cliente.email + "\n");
  return { ok: true, cliente: cliente };
}

export function atualizarCliente(id, nome, email, idade) {
  if (nome == null || String(nome).trim() == "") {
    return { ok: false, erro: "nome obrigatório" };
  }
  if (email == null || String(email).indexOf("@") == -1) {
    return { ok: false, erro: "email inválido" };
  }
  if (idade == null || isNaN(idade) || Number(idade) < 18) {
    return { ok: false, erro: "idade mínima 18" };
  }
  var clientes = JSON.parse(ler("clientes.json") || "[]");
  var achou = false;
  for (var i = 0; i < clientes.length; i++) {
    if (clientes[i].id == id) {
      clientes[i].nome = String(nome).trim();
      clientes[i].email = String(email).trim().toLowerCase();
      clientes[i].idade = Number(idade);
      achou = true;
    }
  }
  if (!achou) return { ok: false, erro: "cliente não encontrado" };
  escrever("clientes.json", JSON.stringify(clientes));
  escrever("log.txt", (ler("log.txt") || "") + "atualização " + id + "\n");
  return { ok: true };
}

// Passos sugeridos (um por vez, testes verdes entre eles):
// 1. Extrair validarDadosCliente(nome, email, idade) usada pelas duas funções.
// 2. Separar a regra (puro) do I/O (ler/escrever) com um repositório injetável.
// 3. Trocar var/== por const/let/===, documentando qualquer mudança de comportamento intencional.
