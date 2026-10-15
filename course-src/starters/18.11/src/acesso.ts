import type { RotaId } from './rotas.js';

export const ROTA_PADRAO: RotaId = 'inicio';

export function destinoAposLogin(pedido: string | undefined): RotaId {
  return pedido === 'perfil' ? 'perfil' : ROTA_PADRAO;
}
