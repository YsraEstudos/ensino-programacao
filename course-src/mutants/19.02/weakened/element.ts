export type ElementOrSelf<T>=[T] extends [readonly (infer U)[]]?U:T;
