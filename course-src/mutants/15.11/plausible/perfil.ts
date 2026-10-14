type User={name:string}; export function nomeEmCaixaAlta(json:string):string { const user=JSON.parse(json) as User; return user.name.toUpperCase(); }
