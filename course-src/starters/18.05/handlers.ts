// 18.05 · Tabela de handlers completa por construção.
// Hoje todos os handlers recebem `unknown`. Crie uma union de comandos própria e um mapa em que
// cada comando tenha o payload correto.

type EventName = "open" | "close" | "error";
type Handler = (payload: unknown) => void;

export const handlers: Record<EventName, Handler> = {
  open: (payload) => console.log("abriu", payload),
  close: () => console.log("fechou"),
  error: (payload) => console.log("erro", payload),
};

export function handle(nome: EventName, payload: unknown): void {
  handlers[nome](payload);
}

// Tarefa:
// 1. Descreva os payloads: type Payloads = { open: { id: string }; close: undefined; error: { message: string } };
// 2. Tipar o mapa: { [K in keyof Payloads]: (payload: Payloads[K]) => void }
// 3. Remova `error` do mapa e anote o diagnóstico. Depois acrescente "retry" a Payloads e anote de novo.
// Quando um callback comum `(payload: unknown) => void` não basta? ___
