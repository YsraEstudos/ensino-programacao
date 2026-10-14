export async function retry(operation, attempts = 3) {
  let last;
  for (let index = 0; index < attempts - 1; index++) {
    try { return await operation(); } catch (error) { last = error; }
  }
  throw last;
}
