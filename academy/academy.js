(() => {
  const modules = [
    {id:1,title:'WPH Product & Story',outcome:'Explain what WPH is, who it serves, why you built it, and what makes it technically interesting.',topics:['Problem and user need','Your role and ownership','Core product workflow','30-second, 2-minute, and 10-minute project stories'],interview:'Tell me about an AI system you built and what problem it solves.'},
    {id:2,title:'System Architecture',outcome:'Draw the WPH architecture from source ingestion to user experience and explain every boundary.',topics:['Frontend, API, data layer, AI layer','Request and data flow','Service boundaries','Tradeoffs and failure points'],interview:'Walk me through the architecture and explain why you separated the system this way.'},
    {id:3,title:'LLM Fundamentals',outcome:'Explain the LLM concepts that matter when building production applications.',topics:['Tokens and context windows','Inference and temperature','Structured outputs','Hallucinations and model limitations'],interview:'What does the model know, what does it not know, and how do you control its behavior?'},
    {id:4,title:'Embeddings & Vector Search',outcome:'Explain how text becomes searchable semantic representations and how retrieval is ranked.',topics:['Embeddings','Similarity search','Top-k retrieval','Relevance and ranking'],interview:'What is an embedding and how would you evaluate whether semantic retrieval is working?'},
    {id:5,title:'RAG',outcome:'Explain and defend retrieval-augmented generation using WPH examples.',topics:['Retrieval pipeline','Context construction','Grounding and freshness','RAG failure modes'],interview:'Why RAG instead of relying on the base model or fine-tuning?'},
    {id:6,title:'AI Agents',outcome:'Understand when an agent is useful and when a deterministic workflow is better.',topics:['Agent loop','Tools and tool calling','State and orchestration','Agent failure modes'],interview:'What makes something an agent rather than a normal workflow?'},
    {id:7,title:'WPH Multi-Agent System',outcome:'Explain the purpose, inputs, outputs, and boundaries of each WPH agent.',topics:['Research responsibilities','Rights and safety checks','Verification responsibilities','Agent handoffs and shared state'],interview:'Why did you use multiple agents, and what would you combine or keep separate?'},
    {id:8,title:'Data Ingestion',outcome:'Explain how WPH discovers, extracts, validates, and promotes publisher data.',topics:['Source discovery','Extraction and normalization','Validation gates','Idempotency and retries'],interview:'What happens when an upstream source changes format or returns incomplete data?'},
    {id:9,title:'PostgreSQL & Data Model',outcome:'Explain how WPH stores publishers, sources, provenance, evaluations, and operational state.',topics:['Entities and relationships','Keys and constraints','Indexes and query patterns','Data quality rules'],interview:'How would you design the schema so that duplicate or conflicting publisher records are manageable?'},
    {id:10,title:'APIs & Backend',outcome:'Explain backend request handling, validation, errors, and integration boundaries.',topics:['REST API design','Request validation','Error handling','Async work and service integration'],interview:'Design an endpoint for retrieving verified publisher information and explain failure behavior.'},
    {id:11,title:'Prompt Engineering',outcome:'Explain how prompts are designed for reliable, structured behavior instead of one-off demos.',topics:['System vs user instructions','Few-shot examples','Output schemas','Prompt failure analysis'],interview:'How do you make an LLM response more reliable without simply making the prompt longer?'},
    {id:12,title:'Prompt Governance',outcome:'Explain versioning, evaluation, approval, promotion, and rollback of prompts.',topics:['Prompt versions','Draft vs production','Promotion gates','Rollback and audit history'],interview:'A new prompt looks better manually. What must happen before you promote it?'},
    {id:13,title:'AI Evaluation',outcome:'Explain how you measure whether an AI system is actually improving.',topics:['Evaluation datasets','Deterministic metrics','LLM-as-judge','Regression testing and thresholds'],interview:'Your score increased from 82% to 91%. How do you know the new system is truly better?'},
    {id:14,title:'AI Safety',outcome:'Explain WPH guardrails and how unsafe or rights-sensitive outputs are blocked or escalated.',topics:['Policy gates','Prohibited outputs','Human review','False positive / false negative tradeoffs'],interview:'Where do you put safety checks, and what happens when a check is uncertain?'},
    {id:15,title:'Provenance & Trust',outcome:'Explain how WPH distinguishes claims, evidence, and trusted official sources.',topics:['Source provenance','Official-source verification','Confidence and evidence','Conflicting sources'],interview:'How do you prevent an AI-generated claim from being presented as verified fact?'},
    {id:16,title:'Observability',outcome:'Explain how you monitor AI behavior, latency, cost, quality, and source health.',topics:['Tracing','Latency metrics','Token and cost telemetry','Source-health and quality signals'],interview:'LLM cost rises 300% this week. How do you investigate?'},
    {id:17,title:'Testing AI Systems',outcome:'Connect your QA background to deterministic and probabilistic AI testing.',topics:['Unit and integration tests','Golden datasets','Non-deterministic assertions','Regression and edge-case testing'],interview:'How is testing an LLM application different from testing a traditional API?'},
    {id:18,title:'Docker, CI/CD & Deployment',outcome:'Explain how code becomes a reproducible deployed service and how you reduce release risk.',topics:['Containers','Environment configuration','CI checks','Deployment and rollback'],interview:'What would your production deployment pipeline look like for WPH?'},
    {id:19,title:'Debugging',outcome:'Practice diagnosing realistic production failures across data, APIs, models, and UI.',topics:['Reproduce and isolate','Logs and traces','Data vs model failures','Root-cause communication'],interview:'Users report wrong publisher answers but the API is healthy. What do you check first?'},
    {id:20,title:'AI System Design',outcome:'Redesign WPH for larger traffic, more countries, more sources, and stricter reliability goals.',topics:['Scaling reads and ingestion','Queues and background work','Caching','Reliability and cost tradeoffs'],interview:'How would WPH change at 100× the current data volume?'},
    {id:21,title:'Python Interview Prep',outcome:'Solve practical Python exercises connected to retrieval, validation, ranking, and API data.',topics:['Collections and transformations','Functions and error handling','Data structures','Complexity and clean code'],interview:'Implement a small data-processing function, then explain complexity and edge cases.'},
    {id:22,title:'SQL Interview Prep',outcome:'Query WPH-style datasets confidently and explain correctness and performance.',topics:['Joins and grouping','Window functions','CTEs','Indexes and query reasoning'],interview:'Find the latest verified source per publisher and explain how you avoid duplicates.'},
    {id:23,title:'AI Engineer Fundamentals',outcome:'Fill theory gaps that may not be obvious from WPH but commonly appear in interviews.',topics:['Model APIs and inference','Fine-tuning vs RAG','Caching and batching','Security and production concerns'],interview:'When would you choose prompting, RAG, fine-tuning, or a traditional deterministic solution?'},
    {id:24,title:'Behavioral Interviews',outcome:'Turn your experience into concise STAR stories that show ownership, conflict handling, and impact.',topics:['Ownership','Ambiguity','Failure and learning','Leadership and collaboration'],interview:'Tell me about a difficult technical problem where you changed the approach after learning new information.'},
    {id:25,title:'WPH Project Defense',outcome:'Practice answering skeptical senior-engineer challenges without becoming defensive or vague.',topics:['Architecture tradeoffs','Build vs buy','Agent necessity','Quality, cost, and scale'],interview:'I do not think this system needs agents. Convince me—or tell me where you agree.'},
    {id:26,title:'Full Mock Interviews',outcome:'Simulate complete interview loops under realistic time pressure.',topics:['Recruiter screen','Hiring-manager deep dive','Technical interview','System design and follow-ups'],interview:'Complete a timed interview and review strengths, gaps, and follow-up actions.'},
    {id:27,title:'Final Interview Cheat Sheet',outcome:'Create a compact last-day review covering your strongest stories, architecture, metrics, and weak spots.',topics:['Project elevator pitch','Architecture map','Key metrics and decisions','Questions to ask the interviewer'],interview:'Give your strongest two-minute WPH explanation without notes.'}
  ];

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

  function readJson(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; }
    catch { return fallback; }
  }

  function saveProgress() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  function saveNotes() { localStorage.setItem(NOTES_KEY, JSON.stringify(notes)); }
  function statusFor(id) { return state[id] || 'not-started'; }
  function labelFor(status) { return status === 'mastered' ? 'Mastered' : status === 'learning' ? 'Learning' : 'Not started'; }

  function render() {
    const query = search.value.trim().toLowerCase();
    const visible = modules.filter(module => {
      const status = statusFor(module.id);
      const matchesFilter = activeFilter === 'all' || status === activeFilter;
      const haystack = [module.title,module.outcome,...module.topics].join(' ').toLowerCase();
      return matchesFilter && (!query || haystack.includes(query));
    });

    grid.innerHTML = visible.map(module => {
      const status = statusFor(module.id);
      return `<article class="academy-module-card" data-status="${status}">
        <div class="academy-module-topline">
          <span class="academy-module-number">${String(module.id).padStart(2,'0')}</span>
          <span class="academy-status academy-status-${status}">${labelFor(status)}</span>
        </div>
        <h3>${module.title}</h3>
        <p>${module.outcome}</p>
        <button class="academy-open-module" type="button" data-open-module="${module.id}">${status === 'not-started' ? 'Start module' : 'Continue module'} <span aria-hidden="true">→</span></button>
      </article>`;
    }).join('');

    document.getElementById('academy-empty').hidden = visible.length !== 0;
    grid.querySelectorAll('[data-open-module]').forEach(button => button.addEventListener('click', () => openModule(Number(button.dataset.openModule))));
    updateSummary();
  }

  function updateSummary() {
    const mastered = modules.filter(m => statusFor(m.id) === 'mastered').length;
    const learning = modules.filter(m => statusFor(m.id) === 'learning').length;
    const percent = Math.round((mastered / modules.length) * 100);
    document.getElementById('completed-count').textContent = mastered;
    document.getElementById('progress-count').textContent = learning;
    document.getElementById('academy-progress-bar').style.width = `${percent}%`;
    document.getElementById('academy-progress-label').textContent = `${percent}% mastered`;

    const next = modules.find(m => statusFor(m.id) === 'learning') || modules.find(m => statusFor(m.id) === 'not-started');
    const recommended = document.getElementById('recommended-card');
    if (!next) {
      recommended.innerHTML = `<div><p class="eyebrow">READY</p><h2>All 27 modules mastered.</h2><p>Use Module 26 for another mock interview and Module 27 for rapid review.</p></div>`;
      return;
    }
    recommended.innerHTML = `<div>
      <p class="eyebrow">RECOMMENDED NEXT</p>
      <h2>${String(next.id).padStart(2,'0')} — ${next.title}</h2>
      <p>${next.outcome}</p>
    </div><button type="button" class="button primary" id="recommended-open">${statusFor(next.id) === 'learning' ? 'Continue' : 'Start'}</button>`;
    document.getElementById('recommended-open').addEventListener('click', () => openModule(next.id));
  }

  function openModule(id) {
    const module = modules.find(m => m.id === id);
    if (!module) return;
    activeModuleId = id;
    document.getElementById('dialog-number').textContent = `MODULE ${String(id).padStart(2,'0')}`;
    document.getElementById('dialog-title').textContent = module.title;
    document.getElementById('dialog-outcome').textContent = module.outcome;
    document.getElementById('dialog-topics').innerHTML = module.topics.map(topic => `<li>${topic}</li>`).join('');
    document.getElementById('dialog-interview').textContent = module.interview;
    noteBox.value = notes[id] || '';
    document.getElementById('notes-status').textContent = 'Saved only on this device.';
    dialog.showModal();
  }

  noteBox.addEventListener('input', () => {
    if (!activeModuleId) return;
    notes[activeModuleId] = noteBox.value;
    saveNotes();
    document.getElementById('notes-status').textContent = 'Saved.';
  });

  document.querySelectorAll('[data-set-status]').forEach(button => {
    button.addEventListener('click', () => {
      if (!activeModuleId) return;
      state[activeModuleId] = button.dataset.setStatus;
      saveProgress();
      render();
      document.getElementById('notes-status').textContent = `${labelFor(button.dataset.setStatus)} · progress saved.`;
    });
  });

  document.querySelectorAll('.academy-filter').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.academy-filter').forEach(item => item.classList.remove('is-active'));
      button.classList.add('is-active');
      activeFilter = button.dataset.filter;
      render();
    });
  });

  search.addEventListener('input', render);
  render();
})();
