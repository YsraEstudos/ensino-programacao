import{dentroDoLimite}from'../domain/limite.js';export function resumir(repo,limite){return repo.listar().map(x=>({id:x.id,aprovado:dentroDoLimite(x.totalCentavos)}));}
