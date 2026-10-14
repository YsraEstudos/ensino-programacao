export const mover = (estado, distancia) => { estado.x += distancia; return estado; };
export const atacar = (estado, alvo) => { alvo.vida -= estado.forca; return alvo; };
export const curar = (estado, quantidade) => { estado.vida += quantidade; return estado; };

export function criarPersonagem(dados, capacidades) {
  return {estado: {...dados}, capacidades: {...capacidades}};
}

const personagem = criarPersonagem({nome: "Mira", vida: 5, x: 0}, {mover, curar});
console.log(JSON.stringify(Object.keys(personagem.capacidades)));
