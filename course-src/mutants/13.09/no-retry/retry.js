export async function retry(operation, attempts = 3) {
  return operation();
}
