// 18.04 · Um alias que ninguém consegue ler.
// Substitua ProfileCard por um tipo nomeado de domínio, ProfileSummary, com só os campos públicos decididos.

type UserRecord = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  avatarUrl: string;
  lastLoginIp: string;
  createdAt: string;
};

export type ProfileCard = Pick<Omit<Partial<UserRecord>, "passwordHash" | "lastLoginIp">, "id" | "name" | "avatarUrl"> &
  Required<Pick<UserRecord, "id" | "name">>;

// Escreva:
// export type ProfileSummary = { ___ };

// Teste de tipo: um resumo com campo secreto deve ser rejeitado.
// const vazado: ProfileSummary = { id: "u1", name: "Ana", passwordHash: "x" }; // esperado: erro

// Se UserRecord ganhar o campo `phone`, o que acontece com ProfileCard e com ProfileSummary? ___
