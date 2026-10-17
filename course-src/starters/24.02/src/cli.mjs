import {createApplication} from './service.mjs';
import {startNode, startHono} from './server.mjs';
const password = process.env.DEMO_PASSWORD;
if (!password || password.length < 12 || password.length > 128) throw new Error('Set DEMO_PASSWORD with 12..128 characters; local demo users: ana and bruno.');
const port = Number(process.env.PORT || 3000);
if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('PORT must be an integer from 0 to 65535');
const app = createApplication({dbPath: process.env.DB_PATH || 'demo.sqlite', users: {ana: password, bruno: password}, log: entry => console.log(JSON.stringify(entry))});
const server = await (process.argv.includes('--hono') ? startHono : startNode)(app, {port});
console.log(JSON.stringify({event: 'ready', url: server.url}));
const shutdown = async () => { try { await server.close(); } catch { process.exitCode = 1; } };
process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
// Windows automation can use IPC; Ctrl+C maps to SIGINT in a console.
process.on('message', value => { if (value === 'shutdown') { void shutdown().then(() => { if (process.connected) process.disconnect(); }); } });
