import {existsSync, readdirSync, readFileSync} from 'node:fs';

// Fase 6 (6.1): o banco editorial é o piloto em variant-bank.json mais um arquivo por lote em course-src/variants/*.json
// (mesmo envelope {version: 1, variants}). Lotes separados deixam autores trabalharem sem editar o mesmo arquivo.
const BANK_URL = new URL('./variant-bank.json', import.meta.url);
const BATCH_DIR = new URL('./variants/', import.meta.url);

export function loadVariantBank() {
  const pilot = JSON.parse(readFileSync(BANK_URL, 'utf8'));
  const batches = existsSync(BATCH_DIR)
    ? readdirSync(BATCH_DIR).filter(name => name.endsWith('.json')).sort().map(name => {
      const batch = JSON.parse(readFileSync(new URL(name, BATCH_DIR), 'utf8'));
      if (!batch || batch.version !== pilot.version || !Array.isArray(batch.variants)) throw new Error(`Invalid variant batch envelope: ${name}`);
      return batch.variants;
    })
    : [];
  return {version: pilot.version, variants: [...pilot.variants, ...batches.flat()]};
}
