export const rotasAnotadas:Record<string,{path:string}>={home:{path:"/"},about:{path:"/about"}};
export const rotas={home:{path:"/"},about:{path:"/about"}} as const satisfies Record<string,{path:string}>;
export type RouteNameAnotada=keyof typeof rotasAnotadas; export type RouteName=keyof typeof rotas;
export function dispatch(name:RouteName):string {return rotas[name].path;}
