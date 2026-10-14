import assert from 'node:assert/strict';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {writeFile} from 'node:fs/promises';

const packageRoot = 'C:/Users/israe/AppData/Local/npm-cache/_npx/31e32ef8478fbf80/node_modules';
const playwrightPath = resolve(packageRoot, 'playwright/index.mjs');
const {chromium} = await import(pathToFileURL(playwrightPath).href);
const baseUrl = process.env.DEVPATH_TASK6_URL || 'http://127.0.0.1:8765/devpath.html';
const storageKey = 'devpath-study-time-v1';
const evidence = {kind: 'controlled-browser-qa', browser: 'Microsoft Edge (msedge)', startedAt: new Date().toISOString(), baseUrl, focusMethod: 'Disabled Playwright per-page focus emulation with CDP Emulation.setFocusEmulationEnabled(false) before navigation; no focus/blur events were synthesized.', scenarios: [], limits: ['QA controlado; não é amostra de aluno nem calibração de carga.']};

const browser = await chromium.launch({channel: 'msedge', headless: false});
try {
  const context = await browser.newContext();
  const first = await context.newPage();
  const second = await context.newPage();
  for (const page of [first, second]) {
    const session = await context.newCDPSession(page);
    await session.send('Emulation.setFocusEmulationEnabled', {enabled: false});
  }
  const appUrl = hash => `${baseUrl}#${hash}`;
  const readStore = page => page.evaluate(key => {
    try { return JSON.parse(localStorage.getItem(key) || 'null'); }
    catch { return null; }
  }, storageKey);
  const milliseconds = (state, id) => state?.activities?.[id]?.milliseconds || 0;
  const checkbox = page => page.locator('[data-study-time-consent]');
  const waitForStatus = (page, text) => page.locator('[data-study-time-status]').filter({hasText: text}).waitFor({state: 'attached', timeout: 3000});
  const openPanel = async page => {
    await page.locator('.study-time-panel').evaluate(panel => {
      if (!panel.open) panel.querySelector('summary').click();
    });
    await checkbox(page).waitFor({state: 'visible'});
  };
  const waitForPanel = async page => {
    await page.goto(appUrl('/javascript/04.01'));
    await page.locator('.study-time-panel').waitFor({state: 'attached', timeout: 15000});
    await openPanel(page);
  };
  const scenario = async (name, run) => {
    const result = await run();
    evidence.scenarios.push({name, ...result});
  };

  await waitForPanel(first);
  await waitForPanel(second);
  await first.evaluate(() => localStorage.removeItem('devpath-study-time-v1'));
  await first.reload();
  await openPanel(first);
  await first.bringToFront();

  await scenario('opt-in e duração por atividade', async () => {
    assert.equal(await checkbox(first).isChecked(), false, 'consentimento inicia desligado');
    await checkbox(first).check();
    const optedInAt = Date.now();
    await first.waitForTimeout(1400);
    await first.evaluate(() => { location.hash = '#/javascript/04.02'; });
    await first.waitForFunction(() => location.hash === '#/javascript/04.02');
    await first.waitForTimeout(1400);
    await first.waitForFunction(() => /04\.02 · Tempo com foco: [1-9]\d* s/.test(document.querySelector('[data-study-time-measured]')?.textContent || ''), null, {timeout: 3000});
    const routeEvidence = await first.evaluate(() => ({hash: location.hash, focused: document.hasFocus(), visibility: document.visibilityState, panel: document.querySelector('.study-time-panel')?.textContent, heading: document.querySelector('#view h1')?.textContent}));
    await first.evaluate(() => { location.hash = '#/catalog'; });
    await waitForStatus(first, 'Medição aguardando');
    const state = await readStore(first);
    assert.equal(state?.consent, true);
    assert.ok(milliseconds(state, '04.01') >= 1000, 'atividade inicial acumulou tempo real');
    assert.ok(milliseconds(state, '04.02') >= 1000, `atividade seguinte acumulou seu próprio tempo: ${JSON.stringify({state, routeEvidence})}`);
    return {elapsedWallMilliseconds: Date.now() - optedInAt, activityMilliseconds: {'04.01': milliseconds(state, '04.01'), '04.02': milliseconds(state, '04.02')}, routeEvidence};
  });

  await scenario('pausa ao sair da atividade e retomada após reload', async () => {
    await first.evaluate(() => { location.hash = '#/javascript/04.02'; });
    await waitForStatus(first, 'Medindo tempo com foco');
    await first.waitForTimeout(1300);
    await first.evaluate(() => { location.hash = '#/catalog'; });
    await waitForStatus(first, 'Medição aguardando');
    const stopped = await readStore(first);
    await first.waitForTimeout(1300);
    const afterCatalog = await readStore(first);
    assert.equal(milliseconds(afterCatalog, '04.02'), milliseconds(stopped, '04.02'), 'rota não ativa não acumula');
    await first.evaluate(() => { location.hash = '#/javascript/04.02'; });
    await waitForStatus(first, 'Medindo tempo com foco');
    const beforeReload = await readStore(first);
    await first.reload();
    await openPanel(first);
    await waitForStatus(first, 'Medindo tempo com foco');
    await first.waitForTimeout(1300);
    await first.evaluate(() => { location.hash = '#/catalog'; });
    await waitForStatus(first, 'Medição aguardando');
    const afterReload = await readStore(first);
    assert.ok(milliseconds(afterReload, '04.02') > milliseconds(beforeReload, '04.02'), 'a sessão retomou após reload');
    return {pausedOnCatalog: milliseconds(afterCatalog, '04.02') - milliseconds(stopped, '04.02'), beforeReload: milliseconds(beforeReload, '04.02'), afterReload: milliseconds(afterReload, '04.02')};
  });

  await scenario('pausa quando a janela do Edge fica oculta', async () => {
    await first.evaluate(() => { location.hash = '#/javascript/04.02'; });
    await waitForStatus(first, 'Medindo tempo com foco');
    const before = await readStore(first);
    await first.evaluate(() => {
      window.__studyTimeFocusEvents = [];
      for (const name of ['focus', 'blur']) window.addEventListener(name, () => window.__studyTimeFocusEvents.push({name, focused: document.hasFocus(), at: Date.now()}));
      document.addEventListener('visibilitychange', () => window.__studyTimeFocusEvents.push({name: 'visibilitychange', visible: document.visibilityState, at: Date.now()}));
    });
    const windowSession = await context.newCDPSession(first);
    const {windowId} = await windowSession.send('Browser.getWindowForTarget');
    const stateBeforeHide = await first.evaluate(() => ({focused: document.hasFocus(), visibility: document.visibilityState}));
    try {
      await windowSession.send('Browser.setWindowBounds', {windowId, bounds: {windowState: 'minimized'}});
      await first.waitForTimeout(800);
      const focusEvidence = await first.evaluate(() => ({focused: document.hasFocus(), visibility: document.visibilityState, status: document.querySelector('[data-study-time-status]')?.textContent, events: window.__studyTimeFocusEvents}));
      if (focusEvidence.visibility !== 'hidden' && focusEvidence.focused !== false) {
        await first.evaluate(() => { location.hash = '#/catalog'; });
        await waitForStatus(first, 'Medição aguardando');
        return {firstPageBefore: stateBeforeHide, firstPageAfterMinimizeRequest: focusEvidence, verdict: 'not-observable', note: 'Browser.setWindowBounds(minimized) não produziu mudança de foco/visibilidade observável no Edge controlado; nenhuma alegação de pausa por foco.'};
      }
      await waitForStatus(first, 'Medição pausada');
      assert.match(focusEvidence.status || '', /pausad/i, 'UI informa pausa na página oculta/sem foco');
      const whileUnfocused = await readStore(first);
      await first.waitForTimeout(1500);
      const stillUnfocused = await readStore(first);
      assert.equal(milliseconds(stillUnfocused, '04.02'), milliseconds(whileUnfocused, '04.02'), 'página oculta não acumula');
      await windowSession.send('Browser.setWindowBounds', {windowId, bounds: {windowState: 'normal'}});
      await first.bringToFront();
      await waitForStatus(first, 'Medindo tempo com foco');
      await first.waitForTimeout(1200);
      await first.evaluate(() => { location.hash = '#/catalog'; });
      await waitForStatus(first, 'Medição aguardando');
      const afterSwitch = await readStore(first);
      assert.ok(milliseconds(afterSwitch, '04.02') > milliseconds(stillUnfocused, '04.02'), 'tempo retoma quando a página fica visível e ativa');
      assert.ok(focusEvidence.events.some(event => event.name === 'visibilitychange' && event.visible === 'hidden'), 'evento visibilitychange real foi observado');
      return {beforeSwitch: milliseconds(before, '04.02'), whileHidden: milliseconds(whileUnfocused, '04.02'), afterSwitch: milliseconds(afterSwitch, '04.02'), firstPageBefore: stateBeforeHide, firstPageHidden: focusEvidence, pauseMethod: 'janela nativa do Edge minimizada via Browser.setWindowBounds; eventos DOM nativos sem dispatch sintético', verdict: 'verified-hidden-pause'};
    } finally {
      await windowSession.send('Browser.setWindowBounds', {windowId, bounds: {windowState: 'normal'}}).catch(() => {});
      await first.bringToFront().catch(() => {});
    }
  });

  await scenario('atualização entre abas não é ecoada e revogação é imediata', async () => {
    await second.reload();
    await openPanel(second);
    await first.evaluate(key => {
      const original = Storage.prototype.setItem;
      Storage.prototype.setItem = function(name, value) {
        if (name === key && window.__studyTimeRemoteEvent) window.__studyTimeEchoWrites++;
        return original.call(this, name, value);
      };
      window.__studyTimeEchoWrites = 0;
      window.__studyTimeRemoteEvents = 0;
      window.addEventListener('storage', event => {
        if (event.key !== key) return;
        window.__studyTimeRemoteEvents++;
        window.__studyTimeRemoteEvent = true;
        queueMicrotask(() => { window.__studyTimeRemoteEvent = false; });
      }, {capture: true});
    }, storageKey);
    await second.bringToFront();
    const prior = await readStore(second);
    await second.evaluate(({key, prior}) => localStorage.setItem(key, JSON.stringify({...prior, activities: {...prior.activities, '04.02': {milliseconds: 9000}}})), {key: storageKey, prior});
    await first.waitForFunction(() => window.__studyTimeRemoteEvents > 0 && !window.__studyTimeRemoteEvent, null, {timeout: 2000});
    const {writes, remoteEvents} = await first.evaluate(() => ({writes: window.__studyTimeEchoWrites, remoteEvents: window.__studyTimeRemoteEvents}));
    assert.equal(writes, 0, 'escrita remota de consentimento ativo não é regravada pelo listener');
    assert.ok(remoteEvents > 0, 'aba recebeu o evento de storage remoto');
    assert.equal(await checkbox(first).isChecked(), true);
    await checkbox(second).uncheck();
    await first.waitForFunction(() => !document.querySelector('[data-study-time-consent]')?.checked, null, {timeout: 3000});
    assert.equal(await readStore(first), null, 'revogação da outra aba removeu o registro compartilhado');
    await first.waitForTimeout(1200);
    assert.equal(await readStore(first), null, 'a aba remota não recriou o registro revogado');
    return {remoteUpdateEchoWrites: writes, remoteEvents, remoteRevocationPropagated: true, storageAfterRevocation: null};
  });

  evidence.finishedAt = new Date().toISOString();
  evidence.result = evidence.scenarios.some(result => result.verdict === 'not-observable') ? 'passed-with-limits' : 'passed';
  await writeFile(new URL('./task6-qa.json', import.meta.url), `${JSON.stringify(evidence, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify(evidence, null, 2));
} catch (error) {
  evidence.finishedAt = new Date().toISOString();
  evidence.result = 'failed';
  evidence.error = String(error?.stack || error);
  await writeFile(new URL('./task6-qa.json', import.meta.url), `${JSON.stringify(evidence, null, 2)}\n`, 'utf8');
  console.error(JSON.stringify(evidence, null, 2));
  process.exitCode = 1;
} finally {
  await browser.close();
}
