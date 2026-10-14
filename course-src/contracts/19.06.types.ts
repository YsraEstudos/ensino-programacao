import type {MutableRequired} from '../mutable.js'; type Input={readonly theme?:'light'|'dark';readonly retries?:number}; type Out=MutableRequired<Input>; let out:Out={theme:'dark',retries:2};out.retries=3;
// @ts-expect-error mapped -? requires theme
const absent:Out={retries:2};
// @ts-expect-error exact value union excludes undefined
const invalid:Out={theme:undefined,retries:2};
