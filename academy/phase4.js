(() => {
  const tabs=[...document.querySelectorAll('[data-study-tab]')];
  const views=[...document.querySelectorAll('[data-study-view]')];
  const modules=window.WPH_ACADEMY_MODULES||[];
  const cfg=window.WPH_ACADEMY_PHASE3||{categories:[],mockPrompts:[]};
  const read=(k,f)=>{try{return JSON.parse(localStorage.getItem(k))||f}catch{return f}};
  const progress=read('wphAcademyProgressV1',{}),quiz=read('wphAcademyQuizV1',{}),coding=read('wphAcademyCodingV1',{}),reviews=read('wphAcademyReviewV1',{});
  const status=id=>progress[id]||'not-started';
  const moduleScore=id=>{const base=status(id)==='mastered'?100:status(id)==='learning'?55:20;return quiz[id]===undefined?base:Math.round((base+quiz[id])/2)};
  const setView=name=>{views.forEach(v=>v.hidden=v.dataset.studyView!==name);tabs.forEach(t=>t.classList.toggle('is-active',t.dataset.studyTab===name));history.replaceState(null,'',`#${name}`);window.scrollTo({top:0,behavior:'smooth'})};
  tabs.forEach(t=>t.addEventListener('click',()=>setView(t.dataset.studyTab)));
  const initial=(location.hash||'#home').slice(1);setView(views.some(v=>v.dataset.studyView===initial)?initial:'home');

  function summary(){
    const mastered=modules.filter(m=>status(m.id)==='mastered').length;
    const learning=modules.filter(m=>status(m.id)==='learning').length;
    const quizCount=Object.keys(quiz).length;
    const codingCount=Object.keys(coding).length;
    const due=Object.values(reviews).filter(x=>x&&x.due&&new Date(x.due)<=new Date()).length;
    const values={mastered,learning,quizCount,codingCount,due};
    Object.entries(values).forEach(([k,v])=>document.querySelectorAll(`[data-metric="${k}"]`).forEach(el=>el.textContent=v));
    const bars=document.getElementById('progress-category-bars');if(bars){bars.replaceChildren();cfg.categories.forEach(cat=>{const score=cat.modules.length?Math.round(cat.modules.reduce((s,id)=>s+moduleScore(id),0)/cat.modules.length):0;const row=document.createElement('div');row.className='academy-progress-item';row.innerHTML=`<span>${cat.label}</span><span class="academy-progress-item-track"><i style="width:${score}%"></i></span><strong>${score}%</strong>`;bars.appendChild(row)})}
  }
  summary();

  const focus=document.getElementById('focus-overlay');
  const focusTitle=document.getElementById('focus-title');
  const focusPrompt=document.getElementById('focus-prompt');
  const focusStep=document.getElementById('focus-step');
  const focusTimer=document.getElementById('focus-timer');
  let focusItems=[],focusIndex=0,timer=null,seconds=0;
  const weakest=()=>modules.map(m=>({m,s:moduleScore(m.id)})).sort((a,b)=>a.s-b.s).slice(0,3).map(x=>({kind:'Module review',title:x.m.title,prompt:x.m.interview||x.m.exercise||x.m.outcome}));
  function makeSession(){const mock=(cfg.mockPrompts||[])[Math.floor(Math.random()*Math.max((cfg.mockPrompts||[]).length,1))];focusItems=[...weakest(),{kind:'Mock interview',title:'Answer aloud',prompt:mock||'Give your two-minute WPH project explanation.'}];focusIndex=0;seconds=0;renderFocus()}
  function renderFocus(){const item=focusItems[focusIndex];if(!item)return;focusStep.textContent=`STEP ${focusIndex+1} OF ${focusItems.length} · ${item.kind}`;focusTitle.textContent=item.title;focusPrompt.textContent=item.prompt;focusTimer.textContent='00:00'}
  function openFocus(){makeSession();focus.hidden=false;document.body.style.overflow='hidden';if(timer)clearInterval(timer);timer=setInterval(()=>{seconds++;focusTimer.textContent=`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`},1000)}
  function closeFocus(){focus.hidden=true;document.body.style.overflow='';if(timer){clearInterval(timer);timer=null}}
  document.querySelectorAll('[data-start-focus]').forEach(b=>b.addEventListener('click',openFocus));
  document.getElementById('focus-close')?.addEventListener('click',closeFocus);
  document.getElementById('focus-next')?.addEventListener('click',()=>{if(focusIndex<focusItems.length-1){focusIndex++;seconds=0;renderFocus()}else closeFocus()});
  document.getElementById('surprise-me')?.addEventListener('click',()=>{const choices=[...modules.map(m=>({kind:'Module challenge',title:m.title,prompt:m.interview||m.exercise})),...(cfg.mockPrompts||[]).map(q=>({kind:'Mock interview',title:'Surprise question',prompt:q}))];const item=choices[Math.floor(Math.random()*choices.length)];focusItems=[item];focusIndex=0;seconds=0;renderFocus();focus.hidden=false;document.body.style.overflow='hidden'});
})();

(() => {
  const script=document.createElement('script');
  script.src='/academy/phase5.js';
  document.body.appendChild(script);
})();