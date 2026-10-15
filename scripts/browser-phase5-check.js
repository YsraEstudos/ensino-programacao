// Execute this function with the Playwright connector while serve-phase5-browser.mjs is running.
// eslint-disable-next-line @typescript-eslint/no-unused-expressions -- Callback consumed by the Playwright connector.
async (page) => {
    const p = await page.context().newPage();
    try {
        const origin = new URL(page.url()).origin;
        await p.goto(`${origin}/devpath.html#/javascript/05.16`);
        await p.waitForFunction(() => window.DevPathAssessment && window.DevPathCourseRunner && window.DevPathModuleGraph);
        const learnPath = p.getByRole('button', {name: 'Aprender este conceito'});
        if (await learnPath.count()) await learnPath.click();
        const prediction = p.locator('[id="first-response-05.16"]');
        if (await prediction.count()) {
            await prediction.fill('Não. Um surrogate isolado é malformado; a substituição gera U+FFFD.');
            await p.getByRole('button', {name: 'Registrar resposta'}).click();
        }
        await p.getByText('Sua resposta inicial foi registrada').waitFor({state: 'visible', timeoutMs: 10000});
        await p.locator('[id="course-file-05.16-0"]').fill([
            'export function estaBemFormado(texto) {',
            '  return texto.isWellFormed();',
            '}',
            '',
            'export function prepararParaEnvio(texto) {',
            '  return { ok: estaBemFormado(texto), texto: texto.toWellFormed() };',
            '}',
        ].join('\n'));
        await p.getByRole('button', {name: 'Executar testes'}).click();
        await p.getByText(/3 de 3 testes passaram\./).waitFor({state: 'visible', timeoutMs: 30000});
        const feedback = await p.getByText(/3 de 3 testes passaram\./).innerText();
        const results = await p.evaluate(async () => {
            const ids = ['05.16', '06.12', '07.14', '09.10', '10.10', '12.21', '20.11'];
            const [catalogResponse, assessmentResponse] = await Promise.all([
                fetch('/course-catalog.json', {cache: 'no-store'}),
                fetch('/course-assessments.json', {cache: 'no-store'}),
            ]);
            if (!catalogResponse.ok || !assessmentResponse.ok) throw new Error('Os catálogos publicados não carregaram.');
            const [catalog, manifest] = await Promise.all([catalogResponse.json(), assessmentResponse.json()]);
            const results = [];
            for (const id of ids) {
                const item = catalog.find(candidate => candidate.id === id);
                const assessment = manifest[id];
                if (!item || !assessment) throw new Error(`Atividade ou avaliação ausente: ${id}`);
                const referenceResponse = await fetch(`/__gate/solutions/${id}/main.js`, {cache: 'no-store'});
                if (!referenceResponse.ok) throw new Error(`Referência não carregou: ${id}`);
                const files = [{path: 'main.js', content: await referenceResponse.text()}];
                const reference = await DevPathAssessment.run({item, assessment, files, fingerprint: `phase5-browser-reference-${id}`});
                const starter = await DevPathAssessment.run({item, assessment, files: item.starterFiles, fingerprint: `phase5-browser-starter-${id}`});
                results.push({id, reference: reference.kind, referenceFailures: reference.tests?.failed, starter: starter.kind, starterFailures: starter.tests?.failed});
            }
            return results;
        });
        const failed = results.filter(result => result.reference !== 'passed' || result.referenceFailures !== 0 || result.starter !== 'failed' || !(result.starterFailures > 0));
        if (failed.length) throw new Error(`Falha no avaliador do navegador: ${JSON.stringify(failed)}`);
        return {flow: {activity: '05.16', feedback}, evaluatorPairs: results};
    }
    finally {
        await p.close();
    }
}
