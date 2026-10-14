export function busca(xs, alvo) {
  let lo = 0, hi = xs.length - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (xs[mid] === alvo) return mid;
    if (xs[mid] < alvo) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}
