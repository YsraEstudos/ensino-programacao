export function defineRoutesComum<T extends Record<string,string>>(rotas:T):T{return rotas;}
export function defineRoutes<const T extends Record<string,string>>(rotas:T):T{return rotas;}
export const comum=defineRoutesComum({home:"/",sobre:"/sobre"});
