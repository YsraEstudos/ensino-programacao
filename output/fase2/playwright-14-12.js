async (page) => {
  const result = await page.evaluate(() => {
    const article = document.querySelector('article');
    const editors = [...article.querySelectorAll('[data-course-editor="14.12"]')].map(el => ({path: el.dataset.courseFile, tag: el.tagName, readOnly: Boolean(el.readOnly), disabled: Boolean(el.disabled)}));
    const previews = [...article.querySelectorAll('details.course-readonly-file')].map(details => {
      details.open = true;
      const summary = details.querySelector('summary')?.innerText || '';
      const pre = details.querySelector('pre');
      const content = pre?.textContent || '';
      return {
        summary,
        chars: content.length,
        containsLiteralHtmlTag: /<script\b/i.test(content),
        escapedScriptInMarkup: /&lt;script\b/i.test(pre?.innerHTML || ''),
        hasExecutableScriptNode: Boolean(pre?.querySelector('script')),
        provenanceMentionsVite: /vite/i.test(content),
        content
      };
    });
    return {title: document.querySelector('h1')?.textContent, editors, previews};
  });
  return JSON.stringify(result);
}
