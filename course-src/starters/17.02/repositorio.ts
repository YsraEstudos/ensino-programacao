// 17.02 · Do helper ao repositório.
// Reordene os blocos (helpers antes do Repository) e complete as lacunas `___`.
// O tipo da entidade (T) e o tipo do identificador são papéis diferentes: não os junte num só parâmetro.

/* Blocos (embaralhados)
[1] export class Repository<T extends Entity> {
      #itens = new Map<string, T>();
      save(entidade: T): T { this.#itens.set(entidade.id, entidade); return entidade; }
      get(id: Entity["id"]): T | undefined { return this.#itens.get(id); }
    }
[2] export function wrap<T>(valor: T): { valor: T } { return { valor }; }
[3] export interface Entity { id: string }
[4] export function pair<K, V>(chave: K, valor: V): [K, V] { return [chave, valor]; }
*/

// Cole os blocos aqui:


// Uso para conferir no editor (passe o mouse sobre cada nome):
// const p = pair("a", 2);                          // [string, number]
// type Usuario = Entity & { name: string };
// const repo = new Repository<Usuario>();
// repo.save({ id: "u1", name: "A" });
// const achado = repo.get("u1");                   // Usuario | undefined
// const ausente = repo.get("u9");                  // undefined em runtime
