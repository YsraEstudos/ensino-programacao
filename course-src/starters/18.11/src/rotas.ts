export interface Rota {
  caminho: string;
  protegida: boolean;
}

// Tabela de rotas: cada chave é um identificador usado na navegação.
export const rotas = {
  inicio: { caminho: '/', protegida: false },
  perfil: { caminho: '/perfil', protegida: true },
  relatorios: { caminho: '/relatorios', protegida: true },
} satisfies Record<string, Rota>;

export type RotaId = keyof typeof rotas;
