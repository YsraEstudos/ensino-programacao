export type SearchState<T>={kind:'idle'}|{kind:'loading'}|{kind:'success';data:T}|{kind:'error';message:string};
