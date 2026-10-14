// 23.01 · "God object": um módulo que faz tudo. Não edite ainda: leia e desenhe as dependências em diagrama.md.

export const Pedidos = {
  itens: [],

  async carregar() {
    const resposta = await fetch("/api/pedidos");                       // HTTP
    if (!resposta.ok) throw new Error("falha");                         // erro sem contexto
    this.itens = await resposta.json();                                 // dado externo sem validação
    localStorage.setItem("pedidos", JSON.stringify(this.itens));       // storage
    this.render();                                                      // DOM
  },

  adicionar(form) {
    const dados = new FormData(form);                                   // DOM/form
    const quantidade = Number(dados.get("quantidade"));
    if (!dados.get("produto") || !(quantidade > 0)) {                   // validação
      alert("Pedido inválido");                                         // UI
      return;
    }
    const total = quantidade * (dados.get("produto") === "caneca" ? 39.9 : 59.9); // regra de domínio
    this.itens.push({ produto: dados.get("produto"), quantidade, total });
    localStorage.setItem("pedidos", JSON.stringify(this.itens));       // storage de novo
    this.render();
  },

  render() {
    document.querySelector("#lista").innerHTML = this.itens            // DOM + innerHTML com dado externo
      .map((p) => `<li>${p.produto} x${p.quantidade}: R$ ${p.total}</li>`)
      .join("");
  },
};
