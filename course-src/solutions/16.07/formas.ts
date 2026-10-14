export function assertNever(valor: never): never { throw new Error("Forma não tratada: "+JSON.stringify(valor)); }
export type Shape={kind:"circle";radius:number}|{kind:"square";side:number}|{kind:"triangle";base:number;height:number};
export function area(shape:Shape):number { switch(shape.kind){case "circle":return Math.PI*shape.radius**2;case "square":return shape.side**2;case "triangle":return shape.base*shape.height/2;default:return assertNever(shape);} }
