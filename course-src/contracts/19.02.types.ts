import type {ElementOrSelf} from '../element.js'; type Equal<A,B>=(<T>()=>T extends A?1:2) extends (<T>()=>T extends B?1:2)?true:false; type Assert<T extends true>=T;
type A=Assert<Equal<ElementOrSelf<string[]>,string>>; type B=Assert<Equal<ElementOrSelf<readonly [1,2]>,1|2>>; type C=Assert<Equal<ElementOrSelf<number>,number>>; type D=Assert<Equal<ElementOrSelf<boolean[]|number>,boolean|number>>;
