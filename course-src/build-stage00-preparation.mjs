import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { stage00 } from './stage00-preparation.mjs';

const generatedDir = new URL('.generated/', import.meta.url);
mkdirSync(generatedDir, { recursive: true });
const outputPath = fileURLToPath(new URL('.generated/stage00-preparation.json', import.meta.url));
writeFileSync(outputPath, `${JSON.stringify(stage00, null, 2)}\n`, 'utf8');
console.log(`Generated ${outputPath} from the canonical source at course-src/stage00-preparation.mjs.`);
