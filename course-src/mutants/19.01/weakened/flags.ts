export type User={id:number;name:string;active:boolean}; export type Flags<T>=Record<string,boolean>; export type UserFlags=Flags<User>;
