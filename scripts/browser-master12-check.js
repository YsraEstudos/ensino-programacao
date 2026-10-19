async (page) => {
  const base = 'http://127.0.0.1:8019';
  await page.goto(`${base}/devpath.html#/javascript/11.06`);
  await page.waitForFunction(() => Boolean(window.DevPathAssessment?.run && window.DevPathDomRunner?.run));

  const delegation = await page.evaluate(async () => {
    const assessments = await (await fetch('/course-assessments.json')).json();
    const catalog = await (await fetch('/course-catalog.json')).json();
    const assessment = assessments['11.06'];
    const item = catalog.find(activity => activity.id === '11.06');
    if (!assessment) throw new Error('Assessment 11.06 ausente.');
    if (!item) throw new Error('Atividade 11.06 ausente no catálogo.');
    const starter = item.starterFiles?.find(file => file.path === 'app.js');
    if (!starter) throw new Error('Starter app.js de 11.06 ausente no catálogo.');
    const referenceResponse = await fetch('/__gate/solutions/11.06/app.js');
    if (!referenceResponse.ok) throw new Error(`Fonte real 11.06 indisponível: HTTP ${referenceResponse.status}`);
    const referenceFiles = [{path: 'app.js', content: await referenceResponse.text()}];
    const run = files => window.DevPathAssessment.run({
      item,
      files,
      assessment,
    });
    const starterResult = await run([starter]);
    const referenceResult = await run(referenceFiles);
    if (starterResult.kind !== 'failed') throw new Error(`Starter 11.06 deveria ser rejeitado; veio ${starterResult.kind}: ${starterResult.text}`);
    if (referenceResult.kind !== 'passed') throw new Error(`Referência 11.06 deveria passar; veio ${referenceResult.kind}: ${referenceResult.text}`);
    return {
      starter: {kind: starterResult.kind, text: starterResult.text},
      reference: {kind: referenceResult.kind, text: referenceResult.text},
      referenceSource: '/__gate/solutions/11.06/app.js (course-src/solutions/11.06/app.js)',
    };
  });

  await page.goto(`${base}/devpath.html#/javascript/11.12`);
  await page.waitForFunction(() => Boolean(window.DevPathAssessment?.runStudentSuite));
  const dom = await page.evaluate(async () => {
    const assessments = await (await fetch('/course-assessments.json')).json();
    const assessment = assessments['11.12'];
    if (!assessment) throw new Error('Assessment 11.12 ausente.');
    const sourceResponse = await fetch('/__gate/solutions/11.12/render.js');
    if (!sourceResponse.ok) throw new Error(`Fonte real 11.12 indisponível: HTTP ${sourceResponse.status}`);
    const source = await sourceResponse.text();
    const url = URL.createObjectURL(new Blob([source], {type: 'text/javascript'}));
    try {
      const {mostrarTitulo} = await import(url);
      const mount = document.createElement('section');
      document.body.append(mount);
      try {
        const target = document.createElement('div');
        mount.append(target);
        mostrarTitulo(target, '<b>olá</b>');
        if (target.textContent !== '<b>olá</b>' || target.querySelector('b')) throw new Error('A marca <b> deveria permanecer texto literal.');
        const safeText = {text: target.textContent, elementsCreated: target.querySelectorAll('b,img').length};
        const unsafe = document.createElement('div');
        unsafe.innerHTML = '<b>olá</b>';
        mount.append(unsafe);
        if (!unsafe.querySelector('b')) throw new Error('Controle innerHTML não criou o elemento esperado.');
        const hostile = '<img src=x onerror=window.__master12Executed=true>';
        mostrarTitulo(target, hostile);
        if (target.textContent !== hostile || target.querySelector('img')) throw new Error('Conteúdo hostil não ficou como texto literal.');
        mostrarTitulo(target, 'linha 1\nlinha 2');
        if (target.textContent !== 'linha 1\nlinha 2' || target.firstChild?.nodeType !== Node.TEXT_NODE) throw new Error('Newline não foi preservado como nó de texto.');
        mostrarTitulo(target, '');
        if (target.textContent !== '' || target.childNodes.length !== 1 || target.firstChild?.nodeType !== Node.COMMENT_NODE) throw new Error('String vazia não produziu o comentário vazio esperado.');
        return {
          referenceSource: '/__gate/solutions/11.12/render.js (course-src/solutions/11.12/render.js)',
          safeMarkup: safeText,
          innerHTMLControlCreatedElement: Boolean(unsafe.querySelector('b')),
          hostileTextCreatedImage: Boolean(target.querySelector('img')),
          newlinePreserved: true,
          emptyValueNodeType: target.firstChild.nodeType,
        };
      } finally {
        mount.remove();
      }
    } finally {
      URL.revokeObjectURL(url);
    }
  });
  return {id: 'master-phase12', delegation, dom};
}
