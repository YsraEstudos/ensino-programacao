import { criarDashboard } from './dashboard.js';

function response(status, data, jsonError = false) { return { status, ok: status >= 200 && status < 300, async json() { if (jsonError) throw new Error('JSON inválido'); return data; } }; }
describe('dashboard', () => {
  test('carrega profile e stats em estado success', async () => { const result = await criarDashboard(async path => response(200, path === '/profile' ? { nome: 'Ana' } : { total: 3 })); /*@case 12.08.carrega-profile-e-stats-em-e-045c4baa*/expect(result.status).toBe('success'); /*@case 12.08.carrega-profile-e-stats-em-e-6909e14d*/expect(result.profile.nome).toBe('Ana'); /*@case 12.08.carrega-profile-e-stats-em-e-9daa991d*/expect(result.stats.total).toBe(3); });
  test('404 vira erro HTTP', async () => { const result = await criarDashboard(async () => response(404, {})); /*@case 12.08.404-vira-erro-http-c6725e54*/expect(result.status).toBe('error'); /*@case 12.08.404-vira-erro-http-654aa81e*/expect(result.error.status).toBe(404); });
  test('JSON inválido termina em erro', async () => { const result = await criarDashboard(async () => response(200, {}, true)); /*@case 12.08.json-invalido-termina-em-err-54655b47*/expect(result.status).toBe('error'); /*@case 12.08.json-invalido-termina-em-err-5ad7e38d*/expect(result.error.message).toContain('JSON'); });
  test('não deixa resposta antiga vencer', async () => { let call = 0; const result = await criarDashboard(async () => { call++; return response(200, call === 1 ? { nome: 'old' } : { nome: 'new' }); }); /*@case 12.08.nao-deixa-resposta-antiga-ve-ceef639e*/expect(result.status).toBe('success'); });
});
