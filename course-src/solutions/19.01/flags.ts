export type User = { id: number; name: string; active: boolean };
export type Flags<T> = { [K in keyof T]: boolean };
export type UserFlags = Flags<User>;
