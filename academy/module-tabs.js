(() => {
  const dialog = document.getElementById('module-dialog');
  const loop = dialog?.querySelector('.academy-learning-loop');
  if (!dialog || !loop) return;

  const STEP_KEY = 'wphAcademyModuleTabProgressV1';
  const steps = ['learn', 'evidence', 'code', 'quiz', 'interview', 'mastery'];
  const labels = { learn: 'Learn', evidence: 'WPH evidence', code: 'Code', quiz: 'Quiz', interview: 'Interview', mastery: 'Mastery' };
  const icons = { learn: '▤', evidence: '◉', code: '</>', quiz: '?', interview: '◯', mastery: '✦' };
  let activeStep = 'learn';
  let activeModuleId = null;

  const readProgress = () => { try { return JSON.parse(localStorage.getItem(STEP_KEY)) || {}; } catch { return {}; } };
  const saveProgress = value => localStorage.setItem(STEP_KEY, JSON.stringify(value));
  const moduleIdFromDialog = () => {
    const match = (document.getElementById('dialog-number')?.textContent || '').match(/(\d+)/);
    return match ? String(Number(match[1])) : null;
  };

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
    button.innerHTML = `<span class="academy-module-tab-icon" aria-hidden="true">${icons[step]}</span><span class="academy-module-tab-label">${labels[step]}</span><span class="academy-module-tab-check" aria-hidden="true">✓</span>`;
    loop.appendChild(button);
    return button;
  });

  const grid = dialog.querySelector('.academy-dialog-grid');
  const gridSections = [...dialog.querySelectorAll('.academy-dialog-grid > section')];
  const quizSection = dialog.querySelector('.academy-quiz-section');
  const truthSection = dialog.querySelector('.academy-truth-section');
  const notesSection = dialog.querySelector('.academy-notes-section');
  const statusActions = dialog.querySelector('.academy-status-actions');
  const panels = {
    learn: [gridSections[0]].filter(Boolean),
    evidence: [gridSections[1]].filter(Boolean),
    code: [gridSections[2]].filter(Boolean),
    interview: [gridSections[3], truthSection].filter(Boolean),
    quiz: [quizSection].filter(Boolean),
    mastery: [notesSection, statusActions].filter(Boolean)
  };
  Object.entries(panels).forEach(([step, elements]) => elements.forEach((el, i) => {
    el.dataset.modulePanel = step;
    el.id ||= `academy-module-panel-${step}-${i}`;
  }));

  const content = dialog.querySelector('.academy-dialog-content');
  const layout = document.createElement('div');
  layout.className = 'academy-module-study-layout';
  const main = document.createElement('div');
  main.className = 'academy-module-study-main';
  const sidebar = document.createElement('aside');
  sidebar.className = 'academy-module-study-sidebar';
  sidebar.setAttribute('aria-label', 'Module progress and information');

  const progressCard = document.createElement('section');
  progressCard.className = 'academy-module-side-card academy-module-progress-card';
  progressCard.innerHTML = `
    <h3>Your progress</h3>
    <div class="academy-module-progress-overview">
      <div class="academy-module-progress-ring" aria-label="Module progress"><strong>0%</strong><span>Not started</span></div>
      <div class="academy-module-side-steps"></div>
    </div>`;

  const infoCard = document.createElement('section');
  infoCard.className = 'academy-module-side-card';
  infoCard.innerHTML = `
    <h3>About this module</h3>
    <dl class="academy-module-meta">
      <div><dt>◷ Estimated time</dt><dd>15–20 min</dd></div>
      <div><dt>▥ Difficulty</dt><dd><span class="academy-module-level">Beginner</span></dd></div>
      <div><dt>◎ Focus</dt><dd>Interview readiness</dd></div>
      <div><dt>◇ Prerequisite</dt><dd>None</dd></div>
    </dl>
    <div class="academy-learning-tip"><strong>💡 Learning tip</strong><p>Start with Learn, inspect the WPH evidence, try the exercise yourself, test recall with the Quiz, then practice the Interview answer aloud.</p></div>`;
  sidebar.append(progressCard, infoCard);

  // Move the existing curriculum panels into a focused main column.
  if (grid) main.appendChild(grid);
  [quizSection, truthSection, notesSection, statusActions].forEach(el => { if (el) main.appendChild(el); });
  layout.append(main, sidebar);
  content?.appendChild(layout);

  const footer = document.createElement('div');
  footer.className = 'academy-module-footer';
  footer.innerHTML = `
    <button type="button" class="academy-module-footer-back" data-module-back>← Previous</button>
    <button type="button" class="academy-module-mark-complete" data-module-complete>✓ Mark complete</button>
    <button type="button" class="academy-module-footer-next" data-module-next>Continue to evidence →</button>`;
  content?.appendChild(footer);

  const visitedForModule = () => activeModuleId ? new Set(readProgress()[activeModuleId] || []) : new Set();
  function markVisited(step) {
    if (!activeModuleId) return;
    const progress = readProgress();
    const visited = new Set(progress[activeModuleId] || []);
    visited.add(step);
    progress[activeModuleId] = [...visited];
    saveProgress(progress);
  }

  function renderSidebar() {
    const visited = visitedForModule();
    const pct = Math.round((visited.size / steps.length) * 100);
    const ring = progressCard.querySelector('.academy-module-progress-ring');
    ring.style.setProperty('--module-progress', `${pct * 3.6}deg`);
    ring.querySelector('strong').textContent = `${pct}%`;
    ring.querySelector('span').textContent = pct === 100 ? 'Learning loop complete' : pct ? 'In progress' : 'Not started';
    const target = progressCard.querySelector('.academy-module-side-steps');
    target.replaceChildren();
    steps.forEach(step => {
      const row = document.createElement('div');
      row.className = 'academy-module-side-step';
      row.innerHTML = `<span class="academy-module-side-dot ${visited.has(step) ? 'is-done' : ''}">${visited.has(step) ? '✓' : ''}</span><span>${labels[step]}</span><strong>${visited.has(step) ? '✓' : '0%'}</strong>`;
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
    Object.entries(panels).forEach(([panelStep, elements]) => elements.forEach(el => { el.hidden = panelStep !== step; }));
    if (grid) grid.hidden = !['learn', 'evidence', 'code', 'interview'].includes(step);
    renderTabs();
    renderSidebar();
    const index = steps.indexOf(step);
    const back = footer.querySelector('[data-module-back]');
    const next = footer.querySelector('[data-module-next]');
    back.disabled = index === 0;
    back.textContent = index === 0 ? '← Previous' : `← ${labels[steps[index - 1]]}`;
    next.textContent = index === steps.length - 1 ? 'Back to Learn ↺' : `Continue to ${labels[steps[index + 1]]} →`;
    if (focus) tabs[index]?.focus();
    main.scrollTo?.({ top: 0, behavior: 'smooth' });
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
    const index = steps.indexOf(activeStep); if (index > 0) showStep(steps[index - 1], { focus: true });
  });
  footer.querySelector('[data-module-next]').addEventListener('click', () => {
    const index = steps.indexOf(activeStep); showStep(index === steps.length - 1 ? steps[0] : steps[index + 1], { focus: true });
  });
  footer.querySelector('[data-module-complete]').addEventListener('click', () => {
    const mastered = dialog.querySelector('[data-set-status="mastered"]');
    mastered?.click();
    footer.querySelector('[data-module-complete]').textContent = '✓ Module completed';
  });

  const observer = new MutationObserver(() => {
    if (!dialog.open) return;
    const moduleId = moduleIdFromDialog();
    if (moduleId && moduleId !== activeModuleId) {
      activeModuleId = moduleId;
      activeStep = 'learn';
      footer.querySelector('[data-module-complete]').textContent = '✓ Mark complete';
      showStep('learn', { record: true });
    }
  });
  observer.observe(dialog, { attributes: true, attributeFilter: ['open'] });
  dialog.addEventListener('close', () => { activeModuleId = null; activeStep = 'learn'; });
  if (dialog.open) { activeModuleId = moduleIdFromDialog(); showStep('learn', { record: true }); }
  else showStep('learn', { record: false });
})();