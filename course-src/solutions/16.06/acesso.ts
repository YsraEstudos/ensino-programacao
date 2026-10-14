export const NIVEIS = ["leitor", "editor", "admin"] as const;
export type Nivel = (typeof NIVEIS)[number];
