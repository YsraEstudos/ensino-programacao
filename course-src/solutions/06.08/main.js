const PADRAO = 50;
const padrao = () => ({ version: 2, audio: { volume: PADRAO } });

export function migrar(texto) {
  let dados;
  try {
    dados = JSON.parse(texto);
  } catch {
    return padrao();
  }
  if (typeof dados !== "object" || dados === null || !Number.isInteger(dados.version)) return padrao();
  if (dados.version > 2) return { status: "unsupported", version: dados.version };
  if (dados.version === 2) {
    const volume = dados.audio?.volume;
    return { version: 2, audio: { volume: typeof volume === "number" ? volume : PADRAO } };
  }
  if (dados.version === 1) {
    return { version: 2, audio: { volume: typeof dados.volume === "number" ? dados.volume : PADRAO } };
  }
  return padrao();
}
