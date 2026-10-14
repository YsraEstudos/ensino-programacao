export function clamp(value, minimum, maximum) {
  return Math.min(maximum - 1, Math.max(minimum, value));
}
