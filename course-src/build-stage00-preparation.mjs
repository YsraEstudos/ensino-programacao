import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { stage00 } from '../devpath-publish/course-src/stage00-preparation.mjs';

const outputPath = fileURLToPath(new URL('stage00-preparation.json', import.meta.url));
writeFileSync(outputPath, `${JSON.stringify(stage00, null, 2)}\n`, 'utf8');
console.log(`Generated ${outputPath} from the Site repository source at devpath-publish/course-src/stage00-preparation.mjs.`);
