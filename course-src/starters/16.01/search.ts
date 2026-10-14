export type SearchState<T> = {kind:'idle'}|{kind:'loading';data?:T;message?:string}|{kind:'success';data:T}|{kind:'error';message:string};
export const idle:SearchState<never>={kind:'idle'}; export const loading:SearchState<never>={kind:'loading'}; export const success:SearchState<string[]>={kind:'success',data:['a']}; export const failure:SearchState<never>={kind:'error',message:'offline'};
