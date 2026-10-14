export class Range {
  constructor(start, end) { this.start = start; this.end = end; }
  [Symbol.iterator]() {
    let cursor = this.start;
    const end = this.end;
    return { next() { return cursor > end ? {value: undefined, done: true} : {value: cursor++, done: false}; } };
  }
}
