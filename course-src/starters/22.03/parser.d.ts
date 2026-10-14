// Complete a declaração. parse aceita só string e devolve uma union discriminada por `ok`.

export type ParseResult =
  | { ok: true; value: ___ }
  | { ok: false; error: ___ };

export declare function parse(input: ___): ParseResult;

// on devolve uma função que remove o listener.
export declare function on(evento: string, listener: (resultado: ___) => void): ___;
