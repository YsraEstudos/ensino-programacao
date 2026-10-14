export function ler(payload: unknown): string { return (payload as {user:{name:string}}).user.name.toUpperCase(); }
