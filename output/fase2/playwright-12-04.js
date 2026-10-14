async (page) => {
  await page.getByRole('textbox', { name: 'Ordem dos logs' }).fill('A,B,P1,Q,P2,T');
  await page.getByRole('button', { name: 'Registrar resposta' }).click();
  await page.getByRole('button', { name: 'Executar demonstração' }).click();
  await page.waitForFunction(() => {
    const raw = localStorage.getItem('devpath-local-preview-v1');
    const state = raw ? JSON.parse(raw) : null;
    return Boolean(state?.exerciseEvidence?.['12.04@v2']?.status === 'executed');
  }, null, { timeout: 8000 });
  const before = await page.evaluate(() => {
    const state = JSON.parse(localStorage.getItem('devpath-local-preview-v1'));
    const key = '12.04@v2';
    return {
      output: document.querySelector('[data-course-output="12.04"]')?.textContent,
      evidence: state.exerciseEvidence?.[key],
      prediction: state.exercisePredictions?.[key],
      learning: state.exerciseLearning?.['12.04'],
      visibleVerified: document.body.innerText.includes('verified') || document.body.innerText.includes('Demonstrada')
    };
  });
  await page.reload();
  await page.waitForTimeout(1000);
  const after = await page.evaluate(() => {
    const state = JSON.parse(localStorage.getItem('devpath-local-preview-v1'));
    const key = '12.04@v2';
    return {
      evidence: state.exerciseEvidence?.[key],
      prediction: state.exercisePredictions?.[key],
      learning: state.exerciseLearning?.['12.04'],
      visible: document.body.innerText.includes('rubric-declared') || document.body.innerText.includes('Evidência declarada')
    };
  });
  return JSON.stringify({before, after});
}
