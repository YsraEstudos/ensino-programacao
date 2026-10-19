// 23.04 · Código legado: valide o comportamento antes de refatorar.
// API pública: criarCadastroCliente(repo, nome, email, idade).
// atualização: atualizarCliente(repo, id, nome, email, idade).
// repo: listar() -> clientes; salvar(cliente); atualizar(cliente); registrar(tipo, detalhe).

export const disco = { arquivos: new Map(), escritas: 0 };
function escrever(caminho, texto) { disco.escritas++; disco.arquivos.set(caminho, texto); }
function ler(caminho) { return disco.arquivos.get(caminho); }

export function cadastrarCliente(nome, email, idade) {
  if (nome == null || String(nome).trim() == "") return { ok: false, erro: "nome obrigatório" };
  if (email == null || String(email).indexOf("@") == -1) return { ok: false, erro: "email inválido" };
  if (idade == null || isNaN(idade) || Number(idade) < 18) return { ok: false, erro: "idade mínima 18" };
  var clientes = JSON.parse(ler("clientes.json") || "[]");
  for (var i = 0; i < clientes.length; i++) {
    if (clientes[i].email == String(email).trim().toLowerCase()) return { ok: false, erro: "email já cadastrado" };
  }
  var cliente = { id: clientes.length + 1, nome: String(nome).trim(), email: String(email).trim().toLowerCase(), idade: Number(idade) };
  clientes.push(cliente);
  escrever("clientes.json", JSON.stringify(clientes));
  escrever("log.txt", (ler("log.txt") || "") + "cadastro " + cliente.email + "\n");
  return { ok: true, cliente: cliente };
}

function validarComportamentoAtual(nome, email, idade) {
  if (nome == null || String(nome).trim() == "") return { ok: false, erro: "nome obrigatório" };
  if (email == null || String(email).indexOf("@") == -1) return { ok: false, erro: "email inválido" };
  if (idade == null || isNaN(idade) || Number(idade) < 18) return { ok: false, erro: "idade mínima 18" };
  return { ok: true, value: { nome: String(nome).trim(), email: String(email).trim().toLowerCase(), idade: Number(idade) } };
}

export function criarCadastroCliente(repo, nome, email, idade) {
  const dados = validarComportamentoAtual(nome, email, idade);
  if (!dados.ok) return dados;
  const clientes = repo.listar();
  if (clientes.some(cliente => cliente.email == dados.value.email)) return { ok: false, erro: "email já cadastrado" };
  const cliente = { id: clientes.length + 1, ...dados.value };
  repo.salvar(cliente);
  repo.registrar("cadastro", cliente.email);
  return { ok: true, cliente };
}

function atualizarClienteLegado(id, nome, email, idade) {
  if (nome == null || String(nome).trim() == "") return { ok: false, erro: "nome obrigatório" };
  if (email == null || String(email).indexOf("@") == -1) return { ok: false, erro: "email inválido" };
  if (idade == null || isNaN(idade) || Number(idade) < 18) return { ok: false, erro: "idade mínima 18" };
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

export function atualizarCliente(repoOuId, idOuNome, nomeOuEmail, emailOuIdade, idade) {
  if (!repoOuId || typeof repoOuId.listar !== "function") return atualizarClienteLegado(repoOuId, idOuNome, nomeOuEmail, emailOuIdade);
  const [id, nome, email, idadeCliente] = [idOuNome, nomeOuEmail, emailOuIdade, idade];
  const dados = validarComportamentoAtual(nome, email, idadeCliente);
  if (!dados.ok) return dados;
  const atual = repoOuId.listar().find(cliente => cliente.id == id);
  if (!atual) return { ok: false, erro: "cliente não encontrado" };
  repoOuId.atualizar({ id: atual.id, ...dados.value });
  repoOuId.registrar("atualização", id);
  return { ok: true };
}

// Passos sugeridos: registre primeiro as coercões observadas; extraia a validação;
// depois reduza o acoplamento ao disco e só então substitua var, == e isNaN.
