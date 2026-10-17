// Manual guard from the 22.06 boundary contract. Compare this corpus with a real schema.
export function isPayment(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    && Object.keys(value).length === 2 && Object.hasOwn(value, 'id') && Object.hasOwn(value, 'amount')
    && typeof value.id === 'string' && value.id.length > 0
    && typeof value.amount === 'number' && Number.isFinite(value.amount);
}
