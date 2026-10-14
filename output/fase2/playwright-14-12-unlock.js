async (page) => {
  await page.getByRole('textbox', { name: /Sua primeira resposta/ }).fill('Espero HTML, CSS, bundle inicial, chunk dinâmico e mapas de origem com proveniência do build.');
  await page.getByRole('button', { name: 'Registrar resposta' }).click();
  await page.waitForTimeout(500);
  return await page.evaluate(() => ({
    text: document.querySelector('article')?.innerText.slice(-1800),
    editors: [...document.querySelectorAll('[data-course-editor]')].map(el => ({id:el.dataset.courseEditor,path:el.dataset.courseFile,tag:el.tagName,readOnly:!!el.readOnly,disabled:!!el.disabled})),
    editorCount:document.querySelectorAll('[data-course-editor]').length,
    readonlyCount:document.querySelectorAll('details.course-readonly-file').length,
    scriptsInReadonly:[...document.querySelectorAll('details.course-readonly-file pre script')].length
  }));
}
