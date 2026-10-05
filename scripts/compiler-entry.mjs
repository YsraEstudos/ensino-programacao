import { initialize, build } from 'esbuild-wasm/lib/browser.js';
import { parse } from 'acorn';
globalThis.DevPathCompilerEngine = { initialize, build, parse };
