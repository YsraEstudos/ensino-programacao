type User={name:string};
export function nomeEmCaixaAlta(json:string):string {
  let parsed: unknown; try { parsed=JSON.parse(json); } catch { throw new SyntaxError('JSON inválido'); }
  if (typeof parsed!=='object'||parsed===null||!('name' in parsed)||typeof parsed.name!=='string') throw new TypeError('Perfil inválido: name deve ser texto');
  return parsed.name.toUpperCase();
}
