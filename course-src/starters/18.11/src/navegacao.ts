import { rotas, type RotaId } from './rotas.js';

export function caminhoDe(id: RotaId): string {
  return rotas[id].caminho;
}

export function exigeLogin(id: string): boolean {
  if (!Object.hasOwn(rotas, id)) return false;
  return rotas[id as RotaId].protegida;
}

export function rotasProtegidas(): RotaId[] {
  return (Object.keys(rotas) as RotaId[]).filter(id => rotas[id].protegida);
}
