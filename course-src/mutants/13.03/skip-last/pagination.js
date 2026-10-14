export function paginar(items, page, size) {
  const start = Math.max(0, (page - 1) * size);
  return items.slice(start, start + size - 1);
}
