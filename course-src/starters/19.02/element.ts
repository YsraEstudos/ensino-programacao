export type ElementOrSelf<T> = T extends readonly (infer U)[] ? U : T;

// Preveja array mutável, tupla readonly, escalar e união; prove com type tests.
