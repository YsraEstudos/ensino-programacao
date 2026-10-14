async page => {
  const context = await page.context().browser().newContext();
  const tab = await context.newPage();
  const requests = [], errors = [];
  tab.on('request', request => {if (request.url().includes('/compiler-runtime/')) requests.push(request.url());});
  tab.on('pageerror', error => errors.push(error.message));
  try {
    await tab.goto('http://127.0.0.1:8765/devpath.html#/home');
    await tab.waitForFunction(() => window.DevPathCaseMarkers && window.DevPathAssessment);
    const result = await tab.evaluate(async () => {
      const source = marker => `test('regex',()=>{let matched=false;if(true) /[/*@case 04.04.${marker}*/]/.test('b') && (matched=true);expect(matched).toBe(false);});`;
      const fingerprint = tests => DevPathAssessment.canonicalFingerprint({activityId: '04.04', files: [], assessment: {environment: 'javascript', version: 1, checks: ['behavior'], testPath: '__devpath_tests__.js', tests}});
      const marked = `test('value',()=>{/*@case 04.04.a*/expect(3).toBe(3);});`;
      const [a,b,withMarker,withoutMarker] = await Promise.all([fingerprint(source('a')),fingerprint(source('b')),fingerprint(marked),fingerprint(marked.replace('/*@case 04.04.a*/',''))]);
      return {regexChangePreserved: a !== b, annotationOnlyHashEqual: withMarker === withoutMarker};
    });
    const wasmRequests = requests.filter(url => url.includes('.wasm'));
    const scriptRequests = requests.filter(url => url.includes('.js'));
    if (!result.regexChangePreserved || !result.annotationOnlyHashEqual || wasmRequests.length || scriptRequests.length !== 1 || errors.length) throw Error(JSON.stringify({result,requests,errors}));
    return {...result, compilerScriptRequests: scriptRequests.length, wasmRequests: wasmRequests.length, browserVersion: await context.browser().version(), pageErrors: errors};
  } finally {await context.close();}
}
