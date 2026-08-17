(() => {
  const questions = window.WPH_INTERVIEW_QUESTIONS || [];
  const SCORE_KEY='wphQuestionScoresV1';
  const REVIEW_KEY='wphQuestionReviewV1';
  const ATTEMPT_KEY='wphQuestionAttemptsV1';
  const read=(k,f)=>{try{return JSON.parse(localStorage.getItem(k))||f}catch{return f}};
  const write=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
  const scores=read(SCORE_KEY,{}), reviews=read(REVIEW_KEY,{}), attempts=read(ATTEMPT_KEY,{});
  const state={category:'all',source:'all',difficulty:'all',search:''};
  const today=()=>new Date().toISOString().slice(0,10);
  const plusDays=n=>{const d=new Date();d.setDate(d.getDate()+n);return d.toISOString().slice(0,10)};
  const due=q=>!reviews[q.id]||reviews[q.id].due<=today();
  const confidence=q=>scores[q.id]??0;

  function filtered(){return questions.filter(q=>
    (state.category==='all'||q.category===state.category)&&
    (state.source==='all'||q.sourceType===state.source)&&
    (state.difficulty==='all'||q.difficulty===state.difficulty)&&
    (!state.search||[q.question,q.company,q.role,q.category,q.wph,...(q.followUps||[])].join(' ').toLowerCase().includes(state.search))
  );}

  function badge(text,cls=''){const s=document.createElement('span');s.className=`question-badge ${cls}`;s.textContent=text;return s;}
  function scoreQuestion(q,score){scores[q.id]=score;attempts[q.id]=(attempts[q.id]||0)+1;reviews[q.id]={due:plusDays(score>=90?7:score>=65?3:1),last:today()};write(SCORE_KEY,scores);write(REVIEW_KEY,reviews);write(ATTEMPT_KEY,attempts);render();renderStats();}

  function card(q){const el=document.createElement('article');el.className='question-card';
    const meta=document.createElement('div');meta.className='question-meta';meta.append(badge(q.sourceType==='reported'?'Reported':q.sourceType==='wph'?'WPH':'Practice',`source-${q.sourceType}`),badge(q.category),badge(q.difficulty));
    if(q.company){const company=badge(q.company,'company');meta.append(company)}
    const h=document.createElement('h3');h.textContent=q.question;
    const stats=document.createElement('p');stats.className='question-small';stats.textContent=`Attempts ${attempts[q.id]||0} · Confidence ${confidence(q)||'—'}${reviews[q.id]?.due?` · Next ${reviews[q.id].due}`:''}`;
    const details=document.createElement('details');const summary=document.createElement('summary');summary.textContent='Practice this question';details.appendChild(summary);
    const follow=document.createElement('div');follow.className='question-detail-block';follow.innerHTML='<strong>Interviewer follow-ups</strong>';const ul=document.createElement('ul');(q.followUps||[]).forEach(x=>{const li=document.createElement('li');li.textContent=x;ul.appendChild(li)});follow.appendChild(ul);
    const framework=document.createElement('div');framework.className='question-detail-block';framework.innerHTML='<strong>Answer framework</strong>';const ol=document.createElement('ol');(q.framework||[]).forEach(x=>{const li=document.createElement('li');li.textContent=x;ol.appendChild(li)});framework.appendChild(ol);
    const bridge=document.createElement('div');bridge.className='question-wph';bridge.innerHTML='<strong>Connect to WPH</strong>';const bp=document.createElement('p');bp.textContent=q.wph||'';bridge.appendChild(bp);
    const actions=document.createElement('div');actions.className='question-score-actions';[['Needs review',30],['Almost',70],['I know this',100]].forEach(([label,val])=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.addEventListener('click',()=>scoreQuestion(q,val));actions.appendChild(b)});
    details.append(follow,framework,bridge,actions);el.append(meta,h,stats,details);return el;
  }

  function render(){const host=document.getElementById('question-bank');if(!host)return;host.replaceChildren();const rows=filtered();document.getElementById('question-count').textContent=`${rows.length} questions`;rows.forEach(q=>host.appendChild(card(q)));document.getElementById('question-empty').hidden=rows.length>0;}
  function renderStats(){const practiced=Object.keys(attempts).length,strong=Object.values(scores).filter(v=>v>=90).length,weak=Object.values(scores).filter(v=>v<65).length,dueCount=questions.filter(q=>reviews[q.id]&&due(q)).length;[['question-practiced',practiced],['question-strong',strong],['question-weak',weak],['question-due',dueCount]].forEach(([id,v])=>{const el=document.getElementById(id);if(el)el.textContent=v});}
  function randomQuestion(filterFn){const pool=questions.filter(filterFn||(()=>true));return pool[Math.floor(Math.random()*pool.length)];}
  function practiceQuestion(q){if(!q)return;const box=document.getElementById('question-focus');if(!box)return;box.hidden=false;document.getElementById('question-focus-label').textContent=`${q.category.toUpperCase()} · ${q.difficulty.toUpperCase()}`;document.getElementById('question-focus-text').textContent=q.question;const f=document.getElementById('question-focus-followup');f.textContent='';let i=0;document.getElementById('question-focus-next').onclick=()=>{if(i<(q.followUps||[]).length){f.textContent=`Follow-up: ${q.followUps[i++]}`}else{const fw=document.getElementById('question-focus-framework');fw.textContent=(q.framework||[]).join(' → ')}};document.getElementById('question-focus-close').onclick=()=>{box.hidden=true};}

  function wire(){
    document.querySelectorAll('[data-q-category]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-q-category]').forEach(x=>x.classList.remove('is-active'));b.classList.add('is-active');state.category=b.dataset.qCategory;render()}));
    document.getElementById('question-source')?.addEventListener('change',e=>{state.source=e.target.value;render()});
    document.getElementById('question-difficulty')?.addEventListener('change',e=>{state.difficulty=e.target.value;render()});
    document.getElementById('question-search')?.addEventListener('input',e=>{state.search=e.target.value.trim().toLowerCase();render()});
    document.getElementById('question-random')?.addEventListener('click',()=>practiceQuestion(randomQuestion()));
    document.getElementById('question-due-practice')?.addEventListener('click',()=>practiceQuestion(randomQuestion(q=>due(q))));
  }

  window.WPHQuestionEngine={questions,randomQuestion,practiceQuestion,due,confidence};
  document.addEventListener('DOMContentLoaded',()=>{render();renderStats();wire();});
})();