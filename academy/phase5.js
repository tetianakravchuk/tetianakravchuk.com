(() => {
  function addCss(){if(document.querySelector('link[href="/academy/phase5.css"]'))return;const l=document.createElement('link');l.rel='stylesheet';l.href='/academy/phase5.css';document.head.appendChild(l)}
  function injectView(){
    const nav=document.querySelector('.academy-study-nav-inner');const main=document.getElementById('academy-main');if(!nav||!main||document.querySelector('[data-study-tab="questions"]'))return;
    const tab=document.createElement('button');tab.className='academy-study-tab';tab.dataset.studyTab='questions';tab.textContent='Questions';
    const mockTab=document.querySelector('[data-study-tab="mock"]');nav.insertBefore(tab,mockTab||null);
    const section=document.createElement('section');section.className='academy-view';section.dataset.studyView='questions';section.hidden=true;section.innerHTML=`
      <div class="academy-view-header"><div><p class="eyebrow">REAL INTERVIEW QUESTIONS</p><h1>Practice the way interviewers probe.</h1></div><p>Reported questions are labeled separately from common practice and WPH defense prompts. Answer aloud first, then use follow-ups and frameworks.</p></div>
      <div class="question-stats"><div class="question-stat"><span>Practiced</span><strong id="question-practiced">0</strong></div><div class="question-stat"><span>Strong</span><strong id="question-strong">0</strong></div><div class="question-stat"><span>Weak</span><strong id="question-weak">0</strong></div><div class="question-stat"><span>Due review</span><strong id="question-due">0</strong></div></div>
      <div class="question-bank-actions"><button class="button primary" id="question-random" type="button">Surprise interview question</button><button class="button" id="question-due-practice" type="button">Practice due question</button><span id="question-count" class="academy-practice-coding"></span></div>
      <div class="question-category-row"><button class="is-active" data-q-category="all">All</button><button data-q-category="rag">RAG</button><button data-q-category="agents">Agents</button><button data-q-category="evaluation">Evaluation</button><button data-q-category="security">Security</button><button data-q-category="observability">Observability</button><button data-q-category="system-design">System Design</button><button data-q-category="python">Python</button><button data-q-category="sql">SQL</button><button data-q-category="debugging">Debugging</button><button data-q-category="behavioral">Behavioral</button><button data-q-category="wph-defense">WPH Defense</button></div>
      <div class="question-toolbar"><input id="question-search" type="search" placeholder="Search questions, companies, topics…"><select id="question-source"><option value="all">All sources</option><option value="reported">Reported</option><option value="practice">Practice</option><option value="wph">WPH</option></select><select id="question-difficulty"><option value="all">All levels</option><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></div>
      <div id="question-bank" class="question-bank"></div><p id="question-empty" class="question-empty" hidden>No questions match these filters.</p>`;
    main.appendChild(section);
    const overlay=document.createElement('section');overlay.id='question-focus';overlay.className='question-focus';overlay.hidden=true;overlay.innerHTML=`<div class="question-focus-card"><p id="question-focus-label" class="question-focus-label"></p><h2 id="question-focus-text"></h2><p id="question-focus-followup" class="question-focus-followup"></p><div id="question-focus-framework" class="question-focus-framework"></div><div class="question-focus-actions"><button id="question-focus-close" class="button" type="button">Exit</button><button id="question-focus-next" class="button primary" type="button">Interviewer follow-up</button></div></div>`;document.body.appendChild(overlay);
  }
  function wireNavigation(){
    const tabs=[...document.querySelectorAll('[data-study-tab]')],views=[...document.querySelectorAll('[data-study-view]')];
    const setView=name=>{views.forEach(v=>v.hidden=v.dataset.studyView!==name);tabs.forEach(t=>t.classList.toggle('is-active',t.dataset.studyTab===name));history.replaceState(null,'',`#${name}`);window.scrollTo({top:0,behavior:'smooth'})};
    const qtab=document.querySelector('[data-study-tab="questions"]');qtab?.addEventListener('click',()=>setView('questions'));
    if(location.hash==='#questions')setView('questions');
  }
  function load(src){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=reject;document.body.appendChild(s)})}
  function integrateExisting(){
    const useBank=()=>window.WPHQuestionEngine?.randomQuestion?.();
    const mockBtn=document.getElementById('new-mock-question');mockBtn?.addEventListener('click',()=>{const q=useBank();if(q)document.getElementById('mock-question').textContent=q.question});
    const surprise=document.getElementById('surprise-me');surprise?.addEventListener('click',()=>{const q=useBank();setTimeout(()=>{if(!q)return;const title=document.getElementById('focus-title'),prompt=document.getElementById('focus-prompt'),step=document.getElementById('focus-step');if(title&&prompt){step.textContent=`QUESTION BANK · ${q.category.toUpperCase()} · ${q.difficulty.toUpperCase()}`;title.textContent='Surprise interview question';prompt.textContent=q.question}},0)});
    const practice=document.getElementById('practice-today-list');if(practice&&window.WPHQuestionEngine){const due=(window.WPHQuestionEngine.questions||[]).filter(q=>window.WPHQuestionEngine.due(q));const q=due[0]||useBank();if(q){const li=document.createElement('li');li.innerHTML=`<strong>Interview question — ${q.category}</strong><span>${q.question}</span>`;practice.appendChild(li)}}
  }
  async function init(){addCss();injectView();wireNavigation();await load('/academy/questions/bank.js');await load('/academy/question-engine.js');integrateExisting()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();