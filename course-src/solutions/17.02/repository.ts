export interface Entity { id: string }
export function pair<K, V>(key: K, value: V): [K, V] { return [key, value]; }
export function wrap<T>(value: T): { value: T } { return { value }; }
export interface Repository<T extends Entity> { save(entity: T): T; get(id: Entity["id"]): T | undefined; }
