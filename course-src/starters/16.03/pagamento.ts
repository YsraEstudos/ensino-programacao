// 16.03 · Pagamentos como union discriminada por `metodo`.
// Complete as lacunas: cada variante tem o discriminante literal e o campo exclusivo obrigatório.

type Pix = { metodo: "pix"; chave: string };
type Cartao = { metodo: ___; ultimos4: string };
type Boleto = { metodo: ___; ___: string };

export type Pagamento = Pix | Cartao | Boleto;

export function resumo(pagamento: Pagamento): string {
  switch (pagamento.metodo) {
    case "pix":
      return `Pix para ${pagamento.chave}`;
    case ___:
      return `Cartão final ${pagamento.___}`;
    case ___:
      return `Boleto ${pagamento.___}`;
  }
}

// Depois de completar, estas linhas devem falhar no typecheck (descomente uma por vez):
// const semChave: Pagamento = { metodo: "pix" };
// const misturado: Pagamento = { metodo: "boleto", linha: "123", ultimos4: "4242" };
