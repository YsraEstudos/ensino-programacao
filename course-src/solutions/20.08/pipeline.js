export function pipeline(source) {
  return {
    map(fn) {
      const input = this;
      return pipeline({ *[Symbol.iterator]() { for (const value of input) yield fn(value); } });
    },
    filter(predicate) {
      const input = this;
      return pipeline({ *[Symbol.iterator]() { for (const value of input) if (predicate(value)) yield value; } });
    },
    take(count) {
      if (!Number.isInteger(count) || count < 0) throw new RangeError('take requer inteiro não negativo');
      const input = this;
      return pipeline({ *[Symbol.iterator]() {
        if (count === 0) return;
        const iterator = input[Symbol.iterator]();
        try {
          for (let accepted = 0; accepted < count; accepted++) {
            const step = iterator.next();
            if (step.done) return;
            yield step.value;
          }
        } finally { iterator.return?.(); }
      } });
    },
    [Symbol.iterator]() { return source[Symbol.iterator](); },
  };
}
