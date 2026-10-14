export function ler(input: unknown): string {
  if (typeof input !== 'object' || input === null || !('user' in input)) throw new TypeError('Perfil inválido');
  const user = input.user;
  if (typeof user !== 'object' || user === null || !('name' in user) || typeof user.name !== 'string') throw new TypeError('Nome inválido');
  return user.name.toUpperCase();
}
