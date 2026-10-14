// 19.05 · Eventos por template literal.
// Complete a assinatura para ligar cada evento ao tipo do campo correspondente.
// O nome do evento segue a forma `${K}Changed`.

type Model = { name: string; age: number };

declare function on(event: string, listener: (value: unknown) => void): void;

// Devem compilar depois da correção:
on("nameChanged", (value) => value.toUpperCase());
on("ageChanged", (value) => value.toFixed());

// Devem ser rejeitadas (descomente e confirme o diagnóstico):
// on("otherChanged", (value) => value);
// on("ageChanged", (value: string) => value.trim());
