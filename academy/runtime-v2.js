(() => {
  const modules = window.WPH_ACADEMY_MODULES || [];
  const STORAGE_KEY = 'wphAcademyProgressV1';
  const NOTES_KEY = 'wphAcademyNotesV1';
  let activeFilter = 'all';
  let activeModuleId = null;
  const state = readJson(STORAGE_KEY, {});
  const notes = readJson(NOTES_KEY, {});
  const grid = document.getElementById('academy-module-grid');
  const search = document.getElementById('academy-search');
  const dialog = document.getElementById('module-dialog');
  const noteBox = document.getElementById('module-notes');

  function readJson(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; } }
  function saveProgress() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  function saveNotes() { localStorage.setItem(NOTES_KEY, JSON.stringify(notes)); }
  function statusFor(id) { return state[id] || 'not-started'; }
  function labelFor(status) { return status === 'mastered' ? 'Mastered' : status === 'learning' ? 'Learning' : 'Not started'; }
  function addList(id, values, codeStyle) {
    const target = document.getElementById(id); target.replaceChildren();
    (values || []).forEach(value => { const li = document.createElement('li'); if (codeStyle) { const code = document.createElement('code'); code.textContent = value; li.appendChild(code); } else li.textContent = value; target.appendChild(li); });
  }

  function render() {
    const query = search.value.trim().toLowerCase();
    const visible = modules.filter(module => {
      const status = statusFor(module.id);
      const quizText = (module.quiz || []).flatMap(item => [item.q, item.a]);
      const text = [module.title,module.outcome,...(module.lesson || []),...(module.sources || []),module.exercise,module.interview,module.truth,...quizText].join(' ').toLowerCase();
      return (activeFilter === 'all' || status === activeFilter) && (!query || text.includes(query));
    });
    grid.replaceChildren();
    visible.forEach(module => {
      const status = statusFor(module.id);
      const card = document.createElement('article'); card.className = 'academy-module-card'; card.dataset.status = status;
      const top = document.createElement('div'); top.className = 'academy-module-topline';
      const number = document.createElement('span'); number.className = 'academy-module-number'; number.textContent = String(module.id).padStart(2,'0');
      const statusEl = document.createElement('span'); statusEl.className = `academy-status academy-status-${status}`; statusEl.textContent = labelFor(status);
      top.append(number,statusEl);
      const title = document.createElement('h3'); title.textContent = module.title;
      const outcome = document.createElement('p'); outcome.textContent = module.outcome;
      const open = document.createElement('button'); open.className = 'academy-open-module'; open.type = 'button'; open.textContent = status === 'not-started' ? 'Start module →' : 'Continue module →'; open.addEventListener('click', () => openModule(module.id));
      card.append(top,title,outcome,open); grid.appendChild(card);
    });
    document.getElementById('academy-empty').hidden = visible.length !== 0;
    updateSummary();
  }

  function updateSummary() {
    const mastered = modules.filter(m => statusFor(m.id) === 'mastered').length;
    const learning = modules.filter(m => statusFor(m.id) === 'learning').length;
    const percent = modules.length ? Math.round(mastered / modules.length * 100) : 0;
    document.getElementById('completed-count').textContent = mastered;
    document.getElementById('progress-count').textContent = learning;
    document.getElementById('academy-progress-bar').style.width = `${percent}%`;
    document.getElementById('academy-progress-label').textContent = `${percent}% mastered`;
    const next = modules.find(m => statusFor(m.id) === 'learning') || modules.find(m => statusFor(m.id) === 'not-started');
    const card = document.getElementById('recommended-card'); card.replaceChildren();
    const copy = document.createElement('div'); const eyebrow = document.createElement('p'); eyebrow.className = 'eyebrow';
    const title = document.createElement('h2'); const desc = document.createElement('p');
    if (!next) { eyebrow.textContent = 'READY'; title.textContent = 'All 27 modules mastered.'; desc.textContent = 'Use Module 26 for another mock interview and Module 27 for rapid review.'; copy.append(eyebrow,title,desc); card.appendChild(copy); return; }
    eyebrow.textContent = 'RECOMMENDED NEXT'; title.textContent = `${String(next.id).padStart(2,'0')} — ${next.title}`; desc.textContent = next.outcome; copy.append(eyebrow,title,desc);
    const button = document.createElement('button'); button.type = 'button'; button.className = 'button primary'; button.textContent = statusFor(next.id) === 'learning' ? 'Continue' : 'Start'; button.addEventListener('click', () => openModule(next.id));
    card.append(copy,button);
  }

  function openModule(id) {
    const module = modules.find(m => m.id === id); if (!module) return; activeModuleId = id;
    document.getElementById('dialog-number').textContent = `MODULE ${String(id).padStart(2,'0')}`;
    document.getElementById('dialog-title').textContent = module.title;
    document.getElementById('dialog-outcome').textContent = module.outcome;
    addList('dialog-lesson', module.lesson, false); addList('dialog-sources', module.sources, true);
    document.getElementById('dialog-exercise').textContent = module.exercise;
    document.getElementById('dialog-interview').textContent = module.interview;
    document.getElementById('dialog-truth').textContent = module.truth;
    const quiz = document.getElementById('dialog-quiz'); quiz.replaceChildren();
    (module.quiz || []).forEach((item,index) => { const details = document.createElement('details'); details.className = 'academy-quiz-item'; const summary = document.createElement('summary'); summary.textContent = `${index + 1}. ${item.q}`; const answer = document.createElement('p'); answer.textContent = item.a; details.append(summary,answer); quiz.appendChild(details); });
    noteBox.value = notes[id] || ''; document.getElementById('notes-status').textContent = 'Saved only on this device.'; dialog.showModal();
  }

  noteBox.addEventListener('input', () => { if (!activeModuleId) return; notes[activeModuleId] = noteBox.value; saveNotes(); document.getElementById('notes-status').textContent = 'Saved.'; });
  document.querySelectorAll('[data-set-status]').forEach(button => button.addEventListener('click', () => { if (!activeModuleId) return; state[activeModuleId] = button.dataset.setStatus; saveProgress(); render(); document.getElementById('notes-status').textContent = `${labelFor(button.dataset.setStatus)} · progress saved.`; }));
  document.querySelectorAll('.academy-filter').forEach(button => button.addEventListener('click', () => { document.querySelectorAll('.academy-filter').forEach(item => item.classList.remove('is-active')); button.classList.add('is-active'); activeFilter = button.dataset.filter; render(); }));
  search.addEventListener('input', render);
  render();
})();
