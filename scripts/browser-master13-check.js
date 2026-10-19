// Run with browser_run_code_unsafe while the local DevPath server is open.
async (page) => {
  const origin = new URL(page.url()).origin;
  const context = await page.context().browser().newContext();
  const p = await context.newPage();
  const summarize = result => ({
    kind: result.kind,
    tests: result.tests && {total: result.tests.total, passed: result.tests.passed, failed: result.tests.failed, firstFailure: result.tests.firstFailure},
    text: String(result.text || '').slice(0, 700),
  });
  try {
    await p.goto(origin + '/devpath.html#/catalog');
    await p.waitForFunction(() => window.DevPathAssessment, undefined, {timeout: 20000});
    const data = await p.evaluate(async () => {
      const [cr, ar, sr] = await Promise.all([
        fetch('/course-catalog.json'),
        fetch('/course-assessments.json'),
        fetch('/__gate/solutions/11.08/app.js'),
      ]);
      if (!cr.ok || !ar.ok || !sr.ok) throw Error('Published catalog/assessment or real solution fetch failed');
      const [catalog, manifest, app] = await Promise.all([cr.json(), ar.json(), sr.text()]);
      const item = catalog.find(value => value.id === '11.08');
      const assessment = manifest['11.08'];
      if (!item || !assessment) throw Error('Published 11.08 item or assessment absent');
      const files = new Map((item.starterFiles || []).map(file => [file.path, file]));
      files.set('app.js', {path: 'app.js', content: app});
      const reference = await DevPathAssessment.run({item, assessment, files: [...files.values()], fingerprint: 'master13-reference'});
      const starter = await DevPathAssessment.run({item, assessment, files: item.starterFiles || [], fingerprint: 'master13-starter'});
      return {
        html: item.starterFiles.find(file => file.path === 'index.html')?.content || '',
        app,
        reference: {kind: reference.kind, tests: reference.tests, text: String(reference.text || '').slice(0, 700)},
        starter: {kind: starter.kind, tests: starter.tests, text: String(starter.text || '').slice(0, 700)},
      };
    });
    if (!data.html || !data.app) throw Error('Published 11.08 HTML or app.js absent');
    if (data.reference.kind !== 'passed') throw Error('Published 11.08 reference failed: ' + JSON.stringify(data.reference));
    if (data.starter.kind === 'passed') throw Error('Published 11.08 starter unexpectedly passed');
    const fixturePath = origin + '/__master13/';
    const appModule = 'data:text/javascript;base64,' + Buffer.from(data.app, 'utf8').toString('base64');
    const kanbanHtml = data.html
      .replace(/<link\b[^>]*>/gi, '')
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
      + '<script type="module">import {montarKanban} from "' + appModule + '"; montarKanban(document, localStorage);</script>';
    await p.route(fixturePath + '**', async route => {
      const url = new URL(route.request().url());
      const body = url.searchParams.get('entry') === '11.10'
        ? '<!doctype html><ul id="todo"></ul><script type="module" src="/__gate/solutions/11.10/main.js?master13=11.10"></script>'
        : kanbanHtml;
      await route.fulfill({status: 200, contentType: 'text/html; charset=utf-8', body});
    });
    await p.goto(fixturePath + 'kanban.html');
    await p.locator('#nova-tarefa').waitFor();
    await p.locator('#texto').fill('  Revisar pauta  ');
    await p.locator('#nova-tarefa button[type=submit]').click();
    await p.getByRole('button', {name: 'Mover para Em curso'}).click();
    const saved = await p.evaluate(() => JSON.parse(localStorage.getItem('kanban:v1')));
    if (saved.tasks?.[0]?.text !== 'Revisar pauta' || saved.tasks[0].status !== 'doing') throw Error('Kanban save mismatch: ' + JSON.stringify(saved));
    await p.reload();
    const restored = await p.locator('#doing li span').textContent();
    if (restored !== 'Revisar pauta') throw Error('11.08 reload mismatch: ' + restored);
    await p.goto(fixturePath + 'module.html?entry=11.10');
    await p.getByText('Revisar pauta').waitFor();
    const moduleFirst = await p.locator('#todo li').textContent();
    await p.reload();
    const moduleRestored = await p.locator('#todo li').textContent();
    if (moduleRestored !== 'Revisar pauta') throw Error('11.10 module reload mismatch: ' + moduleRestored);
    return {id: '11.08/11.10', reference: summarize(data.reference), incorrectStarter: summarize(data.starter), saved, restored, moduleFirst, moduleRestored};
  } finally {
    await context.close();
  }
}
