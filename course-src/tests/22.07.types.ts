import{parse,Client,type Result}from'./index.js';type Equal<A,B>=(<T>()=>T extends A?1:2)extends(<T>()=>T extends B?1:2)?true:false;type Assert<T extends true>=T;const parsed:Result<number>=parse('x');if(parsed.ok){parsed.value.toFixed();// @ts-expect-error error is not present for success
  const error:string=parsed.error;}
new Client('https://api.example').get('/orders');
// @ts-expect-error parse accepts string only
parse(2);
// @ts-expect-error route must begin with slash
new Client('https://api.example').get('orders');
// @ts-expect-error baseUrl is required
new Client();
type SuccessValue=Assert<Equal<Extract<Result<number>,{ok:true}>['value'],number>>;
