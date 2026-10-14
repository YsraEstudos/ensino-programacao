export class Retangulo {
  constructor(largura, altura) { this.largura = largura; this.altura = altura; }
  get area() { return this.largura * this.altura; }
}

export class Quadrado extends Retangulo {
  set largura(valor) { this._largura = valor; this._altura = valor; }
  get largura() { return this._largura; }
  set altura(valor) { this._largura = valor; this._altura = valor; }
  get altura() { return this._altura; }
}

export function criarNotificador(canal) {
  return {enviar(mensagem) { return canal.enviar(mensagem); }};
}

console.log(new Retangulo(3, 4).area);
