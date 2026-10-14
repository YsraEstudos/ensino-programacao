async (page) => {
  await page.addInitScript(() => {
    if (sessionStorage.getItem('__phase2_ui_seeded') !== '1') {
      localStorage.clear();
      sessionStorage.clear();
      sessionStorage.setItem('__phase2_ui_seeded', '1');
    }
  });
  await page.goto('http://127.0.0.1:8765');
  return 'title=' + await page.title();
}
