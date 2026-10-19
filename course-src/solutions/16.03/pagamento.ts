type Pix={metodo:"pix";chave:string}; type Cartao={metodo:"cartao";ultimos4:string}; type Boleto={metodo:"boleto";linha:string}; export type Pagamento=Pix|Cartao|Boleto;
export function resumo(p:Pagamento):string {switch(p.metodo){case "pix":return "Pix para "+p.chave;case "cartao":return "Cartão final "+p.ultimos4;case "boleto":return "Boleto "+p.linha;}}
