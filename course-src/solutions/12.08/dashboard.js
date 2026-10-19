const generations = new WeakMap();

export async function criarDashboard(fetcher, options = {}) {
  const generation = (generations.get(fetcher) || 0) + 1;
  generations.set(fetcher, generation);
  const isCurrent = () => generation === generations.get(fetcher);
  const onState = typeof options.onState === 'function' ? options.onState : null;
  const notify = state => {
    if (isCurrent()) onState?.(state);
  };
  const controller = new AbortController();
  let timeout;
  let removeExternalAbort = () => {};

  notify({status: 'loading'});

  const work = (async () => {
    const responses = await Promise.all([
      fetcher('/profile', {signal: controller.signal}),
      fetcher('/stats', {signal: controller.signal}),
    ]);
    for (const response of responses) {
      if (!response?.ok) {
        const error = new Error('HTTP ' + response?.status);
        error.status = response?.status;
        throw error;
      }
    }
    const [profile, stats] = await Promise.all(responses.map(response => response.json()));
    if (!profile || typeof profile !== 'object' || typeof profile.nome !== 'string' ||
        !stats || typeof stats !== 'object' || !Number.isFinite(stats.total)) {
      throw new TypeError('Payload inválido');
    }
    return {status: 'success', profile, stats};
  })().then(
    result => result,
    error => ({status: 'error', error}),
  );

  const cancellation = new Promise(resolve => {
    const signal = options.signal;
    if (signal) {
      const abort = () => {
        const error = new Error('Dashboard cancelado.');
        error.name = 'AbortError';
        controller.abort(error);
        resolve({status: 'error', error});
      };
      if (signal.aborted) abort();
      else {
        signal.addEventListener('abort', abort, {once: true});
        removeExternalAbort = () => signal.removeEventListener('abort', abort);
      }
    }
    if (Number.isFinite(options.timeoutMs) && options.timeoutMs >= 0) {
      timeout = setTimeout(() => {
        const error = new Error('Tempo limite do dashboard excedido.');
        error.name = 'TimeoutError';
        controller.abort(error);
        resolve({status: 'error', error});
      }, options.timeoutMs);
    }
  });

  const result = await Promise.race([work, cancellation]);
  if (timeout !== undefined) clearTimeout(timeout);
  removeExternalAbort();
  if (!isCurrent()) return {status: 'stale'};
  notify(result);
  return result;
}
