export function compararMetadados() {
  const a = {};
  const b = {};
  const map = new Map([[a, "visível"]]);
  const weak = new WeakMap([[b, "privado"]]);
  return {
    mapTemA: map.has(a),
    weakTemB: weak.has(b),
    mapIteravel: [...map].length === 1,
    weakTemSize: "size" in weak,
    weakTemIterador: typeof weak[Symbol.iterator] === "function",
  };
}

console.log(JSON.stringify(compararMetadados()));
