import {pair,wrap,type Repository} from '../repository.js';
type Equal<A,B>=(<T>()=>T extends A?1:2) extends (<T>()=>T extends B?1:2)?true:false; type Assert<T extends true>=T;
type P=Assert<Equal<ReturnType<typeof pair<string,number>>,readonly [string,number]>>; const w=wrap({id:1,total:10}); const total:number=w.value.total;
type Order={id:number;total:number}; declare const repo:Repository<Order,number>; const found=repo.get(1); if(found) found.total.toFixed();
// @ts-expect-error repository requires an Order
repo.save({id:2});
// @ts-expect-error ID is a number
repo.get('2');
