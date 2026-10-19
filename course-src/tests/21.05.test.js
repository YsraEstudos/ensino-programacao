import {calcular, encerrar} from './main.js';
import {contarPrimos} from './primos.js';

function observeWorker({reorder = false} = {}) {
  const exposedPrototype = Worker.prototype;
  const postDescriptor = Object.getOwnPropertyDescriptor(exposedPrototype, 'postMessage');
  const terminateDescriptor = Object.getOwnPropertyDescriptor(exposedPrototype, 'terminate');
  const NativeWorker = Object.getPrototypeOf(exposedPrototype).constructor;
  const nativePostMessage = NativeWorker.prototype.postMessage;
  const nativeTerminate = terminateDescriptor?.value;
  const sent = [];
  const received = [];
  let resolveTwoResponses;
  const twoResponses = new Promise(resolve => { resolveTwoResponses = resolve; });
  let worker;
  let held;
  let terminateCalls = 0;

  Object.defineProperty(exposedPrototype, 'postMessage', {
    configurable: true,
    writable: true,
    value(message, ...options) {
      worker ||= this;
      if (worker !== this) throw new Error('A suíte esperava uma única instância Worker.');
      if (sent.length === 0) this.addEventListener('message', event => {
        received.push(event.data);
        if (received.length >= 2) resolveTwoResponses(received);
      });
      sent.push(message);
      if (!reorder) return nativePostMessage.call(this, message, ...options);
      if (!held) { held = {message, options}; return; }
      if (sent.length !== 2) throw new Error('A fixture de reordenação aceita exatamente duas mensagens.');
      nativePostMessage.call(this, message, ...options);
      nativePostMessage.call(this, held.message, ...held.options);
    },
  });
  if (terminateDescriptor) {
    Object.defineProperty(exposedPrototype, 'terminate', {
      ...terminateDescriptor,
      value(...args) { return nativeTerminate.apply(this, args); },
    });
  }

  return {
    sent,
    received,
    twoResponses,
    terminateCalls: () => terminateCalls,
    countTerminateCalls() {
      if (!terminateDescriptor) throw new Error('Worker.terminate não é observável nesta implementação do runner.');
      Object.defineProperty(exposedPrototype, 'terminate', {
        ...terminateDescriptor,
        value(...args) { terminateCalls += 1; return nativeTerminate.apply(this, args); },
      });
    },
    restore() {
      if (postDescriptor) Object.defineProperty(exposedPrototype, 'postMessage', postDescriptor);
      else delete exposedPrototype.postMessage;
      if (terminateDescriptor) Object.defineProperty(exposedPrototype, 'terminate', terminateDescriptor);
      else delete exposedPrototype.terminate;
    },
  };
}

test('contarPrimos preserves its public values and input boundary', () => {
  /*@case 21.05.primes-public-api*/ expect(contarPrimos(0)).toBe(0);
  /*@case 21.05.primes-public-api*/ expect(contarPrimos(1)).toBe(0);
  /*@case 21.05.primes-public-api*/ expect(contarPrimos(2)).toBe(1);
  /*@case 21.05.primes-public-api*/ expect(contarPrimos(10)).toBe(4);
  /*@case 21.05.primes-public-api*/ expect(contarPrimos(100)).toBe(25);
  /*@case 21.05.primes-public-api*/ expect(() => contarPrimos(-1)).toThrow(RangeError);
  /*@case 21.05.primes-public-api*/ expect(() => contarPrimos(2.5)).toThrow(RangeError);
  /*@case 21.05.invalid-inputs*/ expect(() => contarPrimos(NaN)).toThrow(RangeError);
  /*@case 21.05.invalid-inputs*/ expect(() => contarPrimos(Infinity)).toThrow(RangeError);
  /*@case 21.05.invalid-inputs*/ expect(() => contarPrimos('10')).toThrow(RangeError);
  /*@case 21.05.invalid-inputs*/ expect(() => contarPrimos(-1)).toThrow(RangeError);
  /*@case 21.05.invalid-inputs*/ expect(() => contarPrimos(2.5)).toThrow(RangeError);
});

test('an independent sieve checks the full range and fixed-seed samples', () => {
  const N = 20011;
  const sieve = new Uint8Array(N + 1).fill(1);
  sieve[0] = 0;
  sieve[1] = 0;
  for (let i = 2; i * i <= N; i += 1) {
    if (sieve[i]) for (let j = i * i; j <= N; j += i) sieve[j] = 0;
  }
  const expected = new Array(N + 1);
  let count = 0;
  for (let n = 0; n <= N; n += 1) {
    count += sieve[n];
    expected[n] = count;
  }
  const actualRange = Array.from({length: 1501}, (_, n) => contarPrimos(n));
  /*@case 21.05.sieve-range-and-deterministic-samples*/ expect(actualRange).toEqual(expected.slice(0, 1501));
  let seed = 7;
  const samples = [];
  for (let k = 0; k < 12; k += 1) {
    seed = (seed * 48271) % 2147483647;
    samples.push(1501 + seed % (N - 1500));
  }
  /*@case 21.05.sieve-range-and-deterministic-samples*/ expect(samples).toEqual([6200, 1976, 13815, 2677, 15038, 15794, 4350, 13141, 5812, 9009, 16689, 19503]);
  /*@case 21.05.sieve-range-and-deterministic-samples*/ expect(samples.map(n => contarPrimos(n))).toEqual(samples.map(n => expected[n]));
  /*@case 21.05.sieve-range-and-deterministic-samples*/ expect(contarPrimos(N)).toBe(expected[N]);
});

test('native Worker message IDs route out-of-order responses to their own promises', async () => {
  const spy = observeWorker({reorder: true});
  try {
    const first = calcular(10);
    const second = calcular(100);
    const outcome = await Promise.race([
      Promise.all([first, second]).then(values => ({kind: 'completed', values})),
      new Promise(resolve => setTimeout(() => resolve({kind: 'timeout'}), 1500)),
    ]);
    /*@case 21.05.real-worker-response-ids*/ expect(outcome.kind).toBe('completed');
    const values = outcome.kind === 'completed' ? outcome.values : [];
    const twoResponsesArrived = await Promise.race([
      spy.twoResponses.then(() => true),
      new Promise(resolve => setTimeout(() => resolve(false), 1500)),
    ]);
    /*@case 21.05.real-worker-response-ids*/ expect(twoResponsesArrived).toBe(true);
    /*@case 21.05.real-worker-response-ids*/ expect(spy.sent).toHaveLength(2);
    /*@case 21.05.real-worker-response-ids*/ expect(spy.received.map(message => message.id)).toEqual([spy.sent[1].id, spy.sent[0].id]);
    /*@case 21.05.real-worker-response-ids*/ expect(spy.received.map(message => message.result)).toEqual([25, 4]);
    /*@case 21.05.real-worker-response-ids*/ expect(values).toEqual([4, 25]);
  } finally {
    spy.restore();
  }
});

test('a task error rejects only its request and the Worker stays usable', async () => {
  const spy = observeWorker();
  try {
    const invalid = calcular(-1).then(() => null, error => error.message);
    const valid = calcular(10);
    /*@case 21.05.task-error-is-isolated*/ expect(await invalid).toBe('n must be a nonnegative integer');
    /*@case 21.05.task-error-is-isolated*/ expect(await valid).toBe(4);
    /*@case 21.05.task-error-is-isolated*/ expect(spy.received.some(message => message.error === 'n must be a nonnegative integer')).toBe(true);
    /*@case 21.05.task-error-is-isolated*/ expect(await calcular(2)).toBe(1);
  } finally {
    spy.restore();
  }
});

test('closing terminates once, rejects pending work, and rejects future work', async () => {
  const spy = observeWorker();
  spy.countTerminateCalls();
  try {
    const pending = calcular(100).then(() => null, error => error.message);
    encerrar();
    encerrar();
    const pendingResult = await pending;
    const afterClose = await calcular(10).then(() => null, error => error.message);
    /*@case 21.05.close-terminates-and-cleans-pending*/ expect(pendingResult).toBe('Cálculo cancelado pelo encerramento.');
    /*@case 21.05.close-terminates-and-cleans-pending*/ expect(afterClose).toBe('Worker encerrado.');
    /*@case 21.05.close-terminates-and-cleans-pending*/ expect(spy.terminateCalls()).toBe(1);
  } finally {
    spy.restore();
  }
});
