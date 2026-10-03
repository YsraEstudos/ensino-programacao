(function (global) {
  'use strict';
  let detach = () => {};
  // Only D and 01 opt in. Stage 00 keeps its own reading navigation.
  function sync(container) {
    detach();
    const lesson = container.querySelector('[data-learning-journey]');
    if (!lesson) return;
    const nav = lesson.querySelector('.s00-journey');
    const buttons = [...nav.querySelectorAll('[data-learning-target]')];
    const sections = buttons.map(button => lesson.querySelector('#' + button.dataset.learningTarget));
    const update = () => {
      const offset = nav.getBoundingClientRect().bottom + 40;
      let current = 0;
      sections.forEach((section, index) => {
        section.style.scrollMarginTop = `${nav.offsetHeight + 40}px`;
        if (section.getBoundingClientRect().top <= offset) current = index;
      });
      buttons.forEach((button, index) => {
        if (index === current) button.setAttribute('aria-current', 'step');
        else button.removeAttribute('aria-current');
      });
      lesson.querySelector('[data-learning-caption]').textContent = buttons[current].querySelector('strong').textContent;
    };
    global.addEventListener('scroll', update, { passive: true, capture: true });
    global.addEventListener('resize', update, { passive: true });
    detach = () => { global.removeEventListener('scroll', update, true); global.removeEventListener('resize', update); };
    update();
  }
  global.DevPathLearningJourney = { sync };
})(globalThis);
