export async function retry(operation, max = 3, delay = 0, timer = (fn, ms) => setTimeout(fn, ms)) {
  let last;
  for (let attempt = 0; attempt < max; attempt++) {
    try { return await operation(); } catch (error) { last = error; if (attempt === max - 1) break; await new Promise(resolve => timer(resolve, delay)); }
  }
  throw last;
}
