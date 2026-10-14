export const mover = (estado, distancia) => ({...estado, x: estado.x + distancia});
export const atacar = (estado, alvo) => ({...alvo, vida: alvo.vida - estado.forca});
export const curar = (estado, quantidade) => ({...estado, vida: estado.vida + quantidade});
export function criarPersonagem(dados, capacidades) { return {estado: {...dados}, capacidades: {...capacidades}}; }
