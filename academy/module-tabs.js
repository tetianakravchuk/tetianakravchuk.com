(() => {
  const dialog = document.getElementById('module-dialog');
  const loop = dialog?.querySelector('.academy-learning-loop');
  if (!dialog || !loop) return;

  const COMPLETION_KEY = 'wphAcademyModuleStepCompletionV1';
  const steps = ['learn', 'visual', 'evidence', 'code', 'quiz', 'interview', 'mastery'];
  const labels = { learn: 'Learn', visual: 'Visual', evidence: 'WPH evidence', code: 'Code', quiz: 'Quiz', interview: 'Interview', mastery: 'Mastery' };
  const symbols = { learn: '▱', visual: '◇', evidence: '◉', code: '</>', quiz: '?', interview: '◯', mastery: '✦' };
  let activeStep = 'learn';
  let activeModuleId = null;

  const read = () => { try { return JSON.parse(localStorage.getItem(COMPLETION_KEY)) || {}; } catch { return {}; } };
  const write = value => localStorage.setItem(COMPLETION_KEY, JSON.stringify(value));
  const moduleIdFromDialog = () => { const match = (document.getElementById('dialog-number')?.textContent || '').match(/(\d+)/); return match ? String(Number(match[1])) : null; };
  const completedForModule = () => activeModuleId ? new Set(read()[activeModuleId] || []) : new Set();
  const setStepComplete = (step, complete) => { if (!activeModuleId) return; const state = read(); const completed = new Set(state[activeModuleId] || []); complete ? completed.add(step) : completed.delete(step); state[activeModuleId] = [...completed]; write(state); };

  loop.replaceChildren();
  loop.setAttribute('role', 'tablist');
  loop.setAttribute('aria-label', 'Module learning steps');
  const tabs = steps.map((step, index) => {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'academy-module-tab'; button.dataset.moduleTab = step;
    button.setAttribute('role', 'tab'); button.setAttribute('aria-selected', index === 0 ? 'true' : 'false'); button.setAttribute('tabindex', index === 0 ? '0' : '-1');
    button.innerHTML = `<span class="academy-module-tab-symbol" aria-hidden="true">${symbols[step]}</span><span>${labels[step]}</span>`;
    loop.appendChild(button); return button;
  });

  const grid = dialog.querySelector('.academy-dialog-grid');
  const gridSections = [...dialog.querySelectorAll('.academy-dialog-grid > section')];
  const quizSection = dialog.querySelector('.academy-quiz-section');
  const truthSection = dialog.querySelector('.academy-truth-section');
  const notesSection = dialog.querySelector('.academy-notes-section');
  const statusActions = dialog.querySelector('.academy-status-actions');
  const visualSection = document.createElement('section');
  visualSection.className = 'academy-visual-section';
  visualSection.dataset.modulePanel = 'visual';
  const panels = {
    learn: [gridSections[0]].filter(Boolean), visual: [visualSection], evidence: [gridSections[1]].filter(Boolean), code: [gridSections[2]].filter(Boolean), quiz: [quizSection].filter(Boolean), interview: [gridSections[3], truthSection].filter(Boolean), mastery: [notesSection, statusActions].filter(Boolean)
  };
  Object.entries(panels).forEach(([step, elements]) => elements.forEach(el => el.dataset.modulePanel = step));

  const content = dialog.querySelector('.academy-dialog-content');
  const layout = document.createElement('div'); layout.className = 'academy-clean-layout';
  const main = document.createElement('div'); main.className = 'academy-clean-main';
  const sidebar = document.createElement('aside'); sidebar.className = 'academy-clean-sidebar'; sidebar.setAttribute('aria-label', 'Module progress and information');
  if (grid) main.appendChild(grid);
  main.appendChild(visualSection);
  [quizSection, truthSection, notesSection, statusActions].forEach(el => { if (el) main.appendChild(el); });

  const progressCard = document.createElement('section'); progressCard.className = 'academy-clean-card academy-clean-progress';
  progressCard.innerHTML = `<h3>Your progress</h3><div class="academy-clean-progress-body"><div class="academy-clean-ring"><strong>0%</strong><span>Not started</span></div><div class="academy-clean-progress-list"></div></div>`;
  const infoCard = document.createElement('section'); infoCard.className = 'academy-clean-card academy-clean-info';
  infoCard.innerHTML = `<h3>About this module</h3><dl><div><dt>Estimated time</dt><dd>15–20 min</dd></div><div><dt>Learning mode</dt><dd><span>Concept + visual + practice</span></dd></div><div><dt>Focus</dt><dd>Interview readiness</dd></div></dl><div class="academy-clean-tip"><strong>Learning tip</strong><p>Read the concept, rebuild the Visual from memory, inspect real WPH evidence, then practice Code → Quiz → Interview.</p></div>`;
  sidebar.append(progressCard, infoCard); layout.append(main, sidebar); content?.appendChild(layout);

  const stepAction = document.createElement('div'); stepAction.className = 'academy-clean-step-action'; stepAction.innerHTML = `<button type="button" data-step-complete>Mark this step complete</button>`; main.appendChild(stepAction);
  const footer = document.createElement('div'); footer.className = 'academy-clean-footer'; footer.innerHTML = `<button type="button" class="academy-clean-back" data-module-back>← Previous</button><button type="button" class="academy-clean-module-complete" data-module-complete>Mark module complete</button><button type="button" class="academy-clean-next" data-module-next>Continue →</button>`; content?.appendChild(footer);

  function renderProgress() {
    const completed = completedForModule(); const pct = Math.round((completed.size / steps.length) * 100);
    const ring = progressCard.querySelector('.academy-clean-ring'); ring.style.setProperty('--pct', `${pct * 3.6}deg`); ring.querySelector('strong').textContent = `${pct}%`; ring.querySelector('span').textContent = pct === 100 ? 'Complete' : pct ? 'In progress' : 'Not started';
    const list = progressCard.querySelector('.academy-clean-progress-list'); list.replaceChildren();
    steps.forEach(step => { const row = document.createElement('div'); row.className = 'academy-clean-progress-row'; row.innerHTML = `<span class="academy-clean-dot ${completed.has(step) ? 'is-done' : ''}" aria-hidden="true">${completed.has(step) ? '✓' : ''}</span><span>${labels[step]}</span>`; list.appendChild(row); });
    tabs.forEach(tab => tab.classList.toggle('is-complete', completed.has(tab.dataset.moduleTab)));
    const action = stepAction.querySelector('[data-step-complete]'); action.textContent = completed.has(activeStep) ? '✓ Step complete' : 'Mark this step complete'; action.classList.toggle('is-complete', completed.has(activeStep));
  }

  function renderVisual() { if (!activeModuleId) return; window.WPH_ACADEMY_VISUALS?.render?.(visualSection, activeModuleId); }

  function showStep(step, { focus = false } = {}) {
    if (!steps.includes(step)) return; activeStep = step;
    Object.entries(panels).forEach(([panelStep, elements]) => elements.forEach(el => { el.hidden = panelStep !== step; }));
    if (grid) grid.hidden = !['learn', 'evidence', 'code', 'interview'].includes(step);
    if (step === 'visual') renderVisual();
    tabs.forEach(tab => { const selected = tab.dataset.moduleTab === step; tab.classList.toggle('is-active', selected); tab.setAttribute('aria-selected', String(selected)); tab.setAttribute('tabindex', selected ? '0' : '-1'); });
    const index = steps.indexOf(step); const back = footer.querySelector('[data-module-back]'); const next = footer.querySelector('[data-module-next]');
    back.disabled = index === 0; back.textContent = index === 0 ? '← Previous' : `← ${labels[steps[index - 1]]}`; next.textContent = index === steps.length - 1 ? 'Back to Learn' : `Continue to ${labels[steps[index + 1]]} →`;
    stepAction.hidden = step === 'mastery'; renderProgress(); if (focus) tabs[index]?.focus();
  }

  tabs.forEach((tab, index) => { tab.addEventListener('click', () => showStep(tab.dataset.moduleTab)); tab.addEventListener('keydown', event => { if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return; event.preventDefault(); let nextIndex=index; if(event.key==='ArrowRight')nextIndex=(index+1)%tabs.length;if(event.key==='ArrowLeft')nextIndex=(index-1+tabs.length)%tabs.length;if(event.key==='Home')nextIndex=0;if(event.key==='End')nextIndex=tabs.length-1;showStep(tabs[nextIndex].dataset.moduleTab,{focus:true}); }); });
  stepAction.querySelector('[data-step-complete]').addEventListener('click', () => { const completed=completedForModule(); setStepComplete(activeStep,!completed.has(activeStep)); renderProgress(); });
  footer.querySelector('[data-module-back]').addEventListener('click',()=>{const index=steps.indexOf(activeStep);if(index>0)showStep(steps[index-1],{focus:true});});
  footer.querySelector('[data-module-next]').addEventListener('click',()=>{const index=steps.indexOf(activeStep);showStep(index===steps.length-1?steps[0]:steps[index+1],{focus:true});});
  footer.querySelector('[data-module-complete]').addEventListener('click',()=>{const completed=completedForModule();if(steps.slice(0,6).some(step=>!completed.has(step))){const b=footer.querySelector('[data-module-complete]');b.textContent='Complete the 6 study steps first';setTimeout(()=>b.textContent='Mark module complete',1800);return;}setStepComplete('mastery',true);dialog.querySelector('[data-set-status="mastered"]')?.click();renderProgress();footer.querySelector('[data-module-complete]').textContent='✓ Module completed';});

  const observer = new MutationObserver(() => { if (!dialog.open) return; const moduleId=moduleIdFromDialog(); if(moduleId&&moduleId!==activeModuleId){activeModuleId=moduleId;activeStep='learn';footer.querySelector('[data-module-complete]').textContent='Mark module complete';showStep('learn');} });
  observer.observe(dialog,{attributes:true,attributeFilter:['open']}); dialog.addEventListener('close',()=>{activeModuleId=null;activeStep='learn';}); if(dialog.open){activeModuleId=moduleIdFromDialog();showStep('learn');}else showStep('learn');
})();