(() => {
  const dialog = document.getElementById('module-dialog');
  const loop = dialog?.querySelector('.academy-learning-loop');
  if (!dialog || !loop) return;

  const STEP_KEY = 'wphAcademyModuleTabProgressV1';
  const steps = ['learn', 'evidence', 'code', 'quiz', 'interview', 'mastery'];
  const labels = {
    learn: 'Learn',
    evidence: 'WPH evidence',
    code: 'Code',
    quiz: 'Quiz',
    interview: 'Interview',
    mastery: 'Mastery'
  };

  let activeStep = 'learn';
  let activeModuleId = null;

  function readProgress() {
    try { return JSON.parse(localStorage.getItem(STEP_KEY)) || {}; }
    catch { return {}; }
  }

  function saveProgress(progress) {
    localStorage.setItem(STEP_KEY, JSON.stringify(progress));
  }

  function moduleIdFromDialog() {
    const text = document.getElementById('dialog-number')?.textContent || '';
    const match = text.match(/(\d+)/);
    return match ? String(Number(match[1])) : null;
  }

  const original = [...loop.children];
  loop.replaceChildren();
  loop.setAttribute('role', 'tablist');
  loop.setAttribute('aria-label', 'Module learning steps');

  const tabs = steps.map((step, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'academy-module-tab';
    button.dataset.moduleTab = step;
    button.id = `academy-module-tab-${step}`;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
    button.setAttribute('tabindex', index === 0 ? '0' : '-1');
    button.innerHTML = `<span class="academy-module-tab-label">${labels[step]}</span><span class="academy-module-tab-check" aria-hidden="true">✓</span>`;
    loop.appendChild(button);
    return button;
  });

  // Reuse the existing Phase 2 content rather than duplicating curriculum data.
  const gridSections = [...dialog.querySelectorAll('.academy-dialog-grid > section')];
  const panels = {
    learn: [gridSections[0]].filter(Boolean),
    evidence: [gridSections[1]].filter(Boolean),
    code: [gridSections[2]].filter(Boolean),
    interview: [gridSections[3], dialog.querySelector('.academy-truth-section')].filter(Boolean),
    quiz: [dialog.querySelector('.academy-quiz-section')].filter(Boolean),
    mastery: [dialog.querySelector('.academy-notes-section'), dialog.querySelector('.academy-status-actions')].filter(Boolean)
  };

  Object.entries(panels).forEach(([step, elements]) => {
    elements.forEach((element, index) => {
      element.dataset.modulePanel = step;
      element.id ||= `academy-module-panel-${step}-${index}`;
    });
  });

  const content = dialog.querySelector('.academy-dialog-content');
  const footer = document.createElement('div');
  footer.className = 'academy-module-footer';
  footer.innerHTML = `
    <button type="button" class="academy-module-footer-back" data-module-back>← Previous step</button>
    <div class="academy-module-footer-status" aria-live="polite"></div>
    <button type="button" class="academy-module-footer-next" data-module-next>Continue →</button>
  `;
  content?.appendChild(footer);

  const progressCard = document.createElement('section');
  progressCard.className = 'academy-module-mastery-summary';
  progressCard.dataset.modulePanel = 'mastery';
  progressCard.innerHTML = `
    <div>
      <p class="eyebrow">MODULE PROGRESS</p>
      <h3>Finish the learning loop</h3>
      <p class="academy-evidence-intro">Open each step, practice the material, then choose the module status below.</p>
    </div>
    <div class="academy-module-step-progress" aria-label="Learning step progress"></div>
  `;
  const notes = dialog.querySelector('.academy-notes-section');
  if (notes?.parentNode) notes.parentNode.insertBefore(progressCard, notes);
  panels.mastery.unshift(progressCard);

  function visitedForModule() {
    if (!activeModuleId) return new Set();
    return new Set(readProgress()[activeModuleId] || []);
  }

  function markVisited(step) {
    if (!activeModuleId) return;
    const progress = readProgress();
    const visited = new Set(progress[activeModuleId] || []);
    visited.add(step);
    progress[activeModuleId] = [...visited];
    saveProgress(progress);
  }

  function renderMasteryProgress() {
    const target = progressCard.querySelector('.academy-module-step-progress');
    if (!target) return;
    const visited = visitedForModule();
    target.replaceChildren();
    steps.forEach(step => {
      const row = document.createElement('div');
      row.className = 'academy-module-step-row';
      row.innerHTML = `<span class="academy-module-step-dot ${visited.has(step) ? 'is-done' : ''}" aria-hidden="true">${visited.has(step) ? '✓' : ''}</span><span>${labels[step]}</span><strong>${visited.has(step) ? 'Visited' : 'Not yet'}</strong>`;
      target.appendChild(row);
    });
  }

  function renderTabs() {
    const visited = visitedForModule();
    tabs.forEach(tab => {
      const selected = tab.dataset.moduleTab === activeStep;
      const done = visited.has(tab.dataset.moduleTab);
      tab.classList.toggle('is-active', selected);
      tab.classList.toggle('is-visited', done);
      tab.setAttribute('aria-selected', String(selected));
      tab.setAttribute('tabindex', selected ? '0' : '-1');
      tab.querySelector('.academy-module-tab-check').style.visibility = done ? 'visible' : 'hidden';
    });
  }

  function showStep(step, { focus = false, record = true } = {}) {
    if (!steps.includes(step)) return;
    activeStep = step;
    if (record) markVisited(step);

    Object.entries(panels).forEach(([panelStep, elements]) => {
      elements.forEach(element => { element.hidden = panelStep !== step; });
    });

    const grid = dialog.querySelector('.academy-dialog-grid');
    if (grid) grid.hidden = !['learn', 'evidence', 'code', 'interview'].includes(step);

    renderTabs();
    renderMasteryProgress();

    const index = steps.indexOf(step);
    const back = footer.querySelector('[data-module-back]');
    const next = footer.querySelector('[data-module-next]');
    const status = footer.querySelector('.academy-module-footer-status');
    back.disabled = index === 0;
    back.textContent = index === 0 ? '← Previous step' : `← ${labels[steps[index - 1]]}`;
    next.textContent = index === steps.length - 1 ? 'Back to Learn' : `Continue to ${labels[steps[index + 1]]} →`;
    status.textContent = `${index + 1} of ${steps.length} · ${labels[step]}`;

    if (focus) tabs[index]?.focus();
    dialog.querySelector('.academy-dialog-content')?.scrollTo?.({ top: 0, behavior: 'smooth' });
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => showStep(tab.dataset.moduleTab));
    tab.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let nextIndex = index;
      if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = tabs.length - 1;
      showStep(tabs[nextIndex].dataset.moduleTab, { focus: true });
    });
  });

  footer.querySelector('[data-module-back]').addEventListener('click', () => {
    const index = steps.indexOf(activeStep);
    if (index > 0) showStep(steps[index - 1], { focus: true });
  });

  footer.querySelector('[data-module-next]').addEventListener('click', () => {
    const index = steps.indexOf(activeStep);
    showStep(index === steps.length - 1 ? steps[0] : steps[index + 1], { focus: true });
  });

  const observer = new MutationObserver(() => {
    if (!dialog.open) return;
    const moduleId = moduleIdFromDialog();
    if (moduleId && moduleId !== activeModuleId) {
      activeModuleId = moduleId;
      activeStep = 'learn';
      showStep('learn', { record: true });
    }
  });
  observer.observe(dialog, { attributes: true, attributeFilter: ['open'] });

  dialog.addEventListener('close', () => {
    activeModuleId = null;
    activeStep = 'learn';
  });

  // If another script opens the dialog before this script finishes loading.
  if (dialog.open) {
    activeModuleId = moduleIdFromDialog();
    showStep('learn', { record: true });
  } else {
    showStep('learn', { record: false });
  }

  // Silence an unused-variable warning in strict static checks while documenting
  // that the old visual chips were intentionally replaced by real controls.
  void original;
})();