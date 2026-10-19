// Run this callback with the Playwright connector while serve-master456-browser.mjs
// serves the generated public assets. This exercises DevPathAssessment in Chromium.
// The query parameter ids=11.04,11.05 can select a smaller set for diagnosis.
// eslint-disable-next-line @typescript-eslint/no-unused-expressions
async (page) => {
  const origin = new URL(page.url()).origin;
  const selected = new URL(page.url()).searchParams.get('ids')?.split(',').filter(Boolean)
    || ['11.04', '11.05', '11.08', '13.13', '21.05', '21.09'];
  const p = await page.context().newPage();
  try {
    await p.goto(`${origin}/devpath.html#/catalog`);
    await p.waitForFunction(() => window.DevPathAssessment && window.DevPathDomRunner, undefined, {timeout: 20000});
    return await p.evaluate(async ids => {
      const [catalogResponse, manifestResponse] = await Promise.all([
        fetch('/course-catalog.json', {cache: 'no-store'}),
        fetch('/course-assessments.json', {cache: 'no-store'}),
      ]);
      if (!catalogResponse.ok || !manifestResponse.ok) throw Error('Published catalog/assessment fetch failed');
      const [catalog, manifest] = await Promise.all([catalogResponse.json(), manifestResponse.json()]);
      const sourcePaths = {
        '11.04': ['form.js'],
        '11.05': ['app.js'],
        '11.08': ['app.js'],
        '13.13': ['app.js', 'tests/13.13.test.js'],
        '21.05': ['main.js', 'primos.js', 'worker.js'],
        '21.09': ['lab.js', 'index.html'],
      };
      const summarize = result => ({
        kind: result.kind,
        tests: result.tests && {total: result.tests.total, passed: result.tests.passed, failed: result.tests.failed, firstFailure: result.tests.firstFailure},
        text: String(result.text || '').slice(0, 850),
      });
      const results = [];
      for (const id of ids) {
        const item = catalog.find(candidate => candidate.id === id);
        const assessment = manifest[id];
        if (!item || !assessment) throw Error(`Published item/assessment absent: ${id}`);
        if (assessment.environment !== 'dom') throw Error(`Unexpected environment for ${id}: ${assessment.environment}`);
        const sourceFiles = [];
        for (const path of sourcePaths[id] || []) {
          const response = await fetch(`/__gate/solutions/${id}/${path}`, {cache: 'no-store'});
          if (!response.ok) throw Error(`Source solution absent: ${id}/${path}`);
          sourceFiles.push({path, content: await response.text()});
        }
        const starter = item.starterFiles || [];
        const sourceMap = new Map(sourceFiles.map(file => [file.path, file]));
        const reference = new Map(starter.map(file => [file.path, file]));
        for (const file of sourceFiles) reference.set(file.path, file);
        const publishedCorrect = assessment.correctFiles || [];
        const normalizeSourceContent = content => content.replace(/\r\n/g, '\n').replace(/\n+$/, '');
        const sourceMatchesPublishedCorrect = publishedCorrect
          .filter(file => sourceMap.has(file.path))
          .map(file => ({path: file.path, equal: normalizeSourceContent(sourceMap.get(file.path).content) === normalizeSourceContent(file.content)}));
        for (const file of publishedCorrect) reference.set(file.path, file);
        const files = [...reference.values()];
        const accepted = summarize(await DevPathAssessment.run({item, assessment, files, fingerprint: `master456-reference-${id}`}));
        const record = {id, accepted, sourceMatchesPublishedCorrect};
        if (id === '21.09') {
          const direct = await DevPathDomRunner.run({files, entryPath: assessment.entryPath, testCode: assessment.tests, fixtures: assessment.fixtures || {}}, {assertionCases: assessment.assertionCases || []});
          record.protectedSuiteDirect = summarize(direct);
          record.protectedAssertionCases = assessment.assertionCases?.length || 0;
        }
        if (id === '11.04' || id === '11.05' || id === '11.08') {
          record.starter = summarize(await DevPathAssessment.run({item, assessment, files: starter, fingerprint: `master456-starter-${id}`}));
        }
        if (id === '11.05') {
          const code = sourceMap.get('app.js').content;
          const remountTest = `\ntest('remount does not duplicate listener', () => { mount(); mount(); render(['probe']); click(document.querySelector('button')); expect(getAcoes()).toBe(1); });`;
          const probeAssessment = {...assessment, tests: `${assessment.tests}${remountTest}`};
          record.duplicateListenerControl = summarize(await DevPathAssessment.run({item, assessment: probeAssessment, files, fingerprint: 'master456-remount-control'}));
          const reverted = code.replace(/\n\s*destroy\(\);(?=\s*\n\s*lista\s*=\s*root)/, '\n  void 0;');
          if (reverted === code) throw Error('11.05 mount cleanup call absent; update browser probe');
          const bad = [...reference.values()].map(file => file.path === 'app.js' ? {...file, content: reverted} : file);
          record.duplicateListener = summarize(await DevPathAssessment.run({item, assessment: probeAssessment, files: bad, fingerprint: 'master456-duplicate-listener'}));
        }
        if (id === '21.09') {
          const code = reference.get('lab.js').content;
          const evenMedianTest = `\ntest('even sample count uses the midpoint of both middle values', async () => { const medianApi = await import('./lab.js'); const times = [0, 1, 3, 6, 16, 26, 46, 66]; let i = 0; const result = medianApi.medir(() => {}, [1], {runs: 4, warmups: 0, now: () => times[i++]}); expect(result.samples).toEqual([1, 3, 10, 20]); expect(result.median).toBe(6.5); });`;
          const probeAssessment = {...assessment, checks: ['behavior'], tests: `${assessment.tests}${evenMedianTest}`};
          record.evenMedianControl = summarize(await DevPathAssessment.run({item, assessment: probeAssessment, files, fingerprint: 'master456-even-median-control'}));
          const reverted = code.replace(/median\s*:\s*[^,]+,/, 'median:s[Math.floor(s.length/2)],');
          if (reverted === code) {
            record.oldMedianProbe = {kind: 'already-present-in-reference'};
          } else {
            const bad = [...reference.values()].map(file => file.path === 'lab.js' ? {...file, content: reverted} : file);
            record.oldMedianProbe = summarize(await DevPathAssessment.run({item, assessment: probeAssessment, files: bad, fingerprint: 'master456-upper-median'}));
          }
        }
        if (id === '21.05') {
          const mutant = assessment.mutantDirs?.find(candidate => candidate.id === 'response-ignores-id');
          if (!mutant) throw Error('21.05 response-ignores-id mutant absent');
          const bad = new Map(reference);
          for (const file of mutant.files) bad.set(file.path, file);
          record.wrongWorkerId = summarize(await DevPathAssessment.run({item, assessment: {...assessment, checks: ['behavior']}, files: [...bad.values()], fingerprint: 'master456-wrong-worker-id'}));
        }
        results.push(record);
      }
      const failures = [];
      for (const record of results) {
        if (record.accepted.kind !== 'passed' || record.accepted.tests?.failed !== 0 || !(record.accepted.tests?.total > 0)) failures.push(`${record.id}: reference ${record.accepted.kind} ${record.accepted.text}`);
        if (record.protectedSuiteDirect && (record.protectedSuiteDirect.kind !== 'passed' || record.protectedSuiteDirect.tests?.failed !== 0 || record.protectedSuiteDirect.tests?.total !== 3 || record.protectedAssertionCases !== 4)) failures.push(`${record.id}: direct protected suite ${record.protectedSuiteDirect.kind} ${record.protectedSuiteDirect.text}`);
        if (record.sourceMatchesPublishedCorrect.some(file => !file.equal)) failures.push(`${record.id}: published correctFiles differ from source solution`);
        if (['11.04', '11.05'].includes(record.id) && record.starter?.kind !== 'failed') failures.push(`${record.id}: starter ${record.starter?.kind || 'absent'}`);
        if (record.duplicateListener && record.duplicateListener.kind !== 'failed') failures.push(`${record.id}: duplicate listener ${record.duplicateListener.kind}`);
        if (record.duplicateListenerControl && record.duplicateListenerControl.kind !== 'passed') failures.push(`${record.id}: remount control ${record.duplicateListenerControl.kind}`);
        if (record.evenMedianControl && record.evenMedianControl.kind !== 'passed') failures.push(`${record.id}: even-median control ${record.evenMedianControl.kind}`);
        if (record.oldMedianProbe && record.oldMedianProbe.kind !== 'failed') failures.push(`${record.id}: old median ${record.oldMedianProbe.kind}`);
        if (record.wrongWorkerId && record.wrongWorkerId.kind !== 'failed') failures.push(`${record.id}: wrong worker ID ${record.wrongWorkerId.kind}`);
      }
      const report = {userAgent: navigator.userAgent, href: location.href, results, failures};
      if (failures.length) throw Error(JSON.stringify(report));
      return report;
    }, selected);
  } finally {
    await p.close();
  }
}
