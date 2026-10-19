export const mover = (estado, distancia) => { estado.x += distancia; return estado; };
export const atacar = (estado, alvo) => { alvo.vida -= estado.forca; return alvo; };
export const curar = (estado, quantidade) => { estado.vida += quantidade; return estado; };

class Personagem {
  constructor(dados) {
    Object.assign(this, dados);
  }
}

class Mago extends Personagem {
  constructor(dados) {
    super(dados);
    this.capacidades = {mover, curar};
  }
}

class Guerreiro extends Personagem {
  constructor(dados) {
    super(dados);
    this.capacidades = {mover, atacar};
  }
}

class MagoGuerreiro extends Personagem {
  constructor(dados) {
    super(dados);
    this.capacidades = {mover, atacar, curar};
  }
}

export function criarPersonagem(dados, capacidades) {
  if (capacidades.curar === curar && capacidades.atacar === atacar) return new MagoGuerreiro(dados);
  if (capacidades.curar === curar) return new Mago(dados);
  if (capacidades.atacar === atacar) return new Guerreiro(dados);
  return new Personagem(dados);
}

const personagem = criarPersonagem({nome: "Mira", vida: 5, x: 0}, {mover, curar});
console.log(JSON.stringify(Object.keys(personagem.capacidades)));
