export type MutableRequired<T>={-readonly [K in keyof T]-?:T[K]}; export type Settings=MutableRequired<{readonly theme?:'light'|'dark';readonly retries?:number}>;
