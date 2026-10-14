async (page) => {
  const pages = page.context().browser().contexts().flatMap(c => c.pages());
  const p = pages.find(p => p.url().endsWith('/03.10'));
  return p ? await p.evaluate(() => {
    const progress = JSON.parse(localStorage.getItem('devpath-local-preview-v1') || '{}');
    return {keys: Object.keys(progress), exerciseLearning: progress.exerciseLearning, answers: progress.answers};
  }) : pages.map(p => p.url());
}

