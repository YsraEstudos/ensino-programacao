import { initialize, build, transform } from 'esbuild-wasm/lib/browser.js';
import { parse } from 'acorn';
globalThis.DevPathCompilerEngine = { initialize, build, transform, parse };
