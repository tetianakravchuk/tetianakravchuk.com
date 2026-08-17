(() => {
  const cfg = window.WPH_ACADEMY_PHASE3 || {categories:[],coding:[],mockPrompts:[]};
  const modules = window.WPH_ACADEMY_MODULES || [];
  const PROGRESS_KEY='wphAcademyProgressV1';
  const READINESS_KEY='wphAcademyReadinessV1';
  const QUIZ_KEY='wphAcademyQuizV1';
  const CODING_KEY='wphAcademyCodingV1';
  const PRACTICE_KEY='wphAcademyPracticeV1';
  const read=(k,f)=>{try{return JSON.parse(localStorage.getItem(k))||f}catch{return f}};
  const write=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
  const progress=read(PROGRESS_KEY,{}), readiness=read(READINESS_KEY,{}), quiz=read(QUIZ_KEY,{}), coding=read(CODING_KEY,{}), practice=read(PRACTICE_KEY,{});
  const statusFor=id=>progress[id]||'not-started';
  const moduleScore=id=>{const status=statusFor(id); const base=status==='mastered'?100:status==='learning'?55:20; const q=quiz[id]; return q?Math.round((base+q)/2):base};
  const categoryScore=cat=>cat.modules.length?Math.round(cat.modules.reduce((s,id)=>s+moduleScore(id),0)/cat.modules.length):0;
  const weakModules=()=>modules.map(m=>({m,score:moduleScore(m.id)})).sort((a,b)=>a.score-b.score);

  function renderReadiness(){
    const host=document.getElementById('readiness-grid'); if(!host)return; host.replaceChildren();
    cfg.categories.forEach(cat=>{const score=categoryScore(cat); readiness[cat.key]=score; const card=document.createElement('article');card.className='academy-readiness-card';
      const row=document.createElement('div');row.className='academy-readiness-row'; const h=document.createElement('h3');h.textContent=cat.label; const n=document.createElement('strong');n.textContent=`${score}%`;row.append(h,n);
      const track=document.createElement('div');track.className='academy-readiness-track';const bar=document.createElement('span');bar.style.width=`${score}%`;track.appendChild(bar);
      const p=document.createElement('p');p.textContent=score>=80?'Interview-ready signal':score>=60?'Developing — keep practicing':'Priority practice area'; card.append(row,track,p);host.appendChild(card);
    }); write(READINESS_KEY,readiness);
  }

  function dailyPlan(){
    const today=new Date().toISOString().slice(0,10); if(practice.date===today&&Array.isArray(practice.modules)) return practice.modules;
    const picks=weakModules().slice(0,3).map(x=>x.m.id); practice.date=today;practice.modules=picks;write(PRACTICE_KEY,practice);return picks;
  }
  function renderPractice(){
    const host=document.getElementById('practice-today-list'); if(!host)return;host.replaceChildren();
    dailyPlan().forEach((id,i)=>{const m=modules.find(x=>x.id===id); if(!m)return;const li=document.createElement('li');li.innerHTML=`<strong>${i+1}. ${String(id).padStart(2,'0')} — ${m.title}</strong><span>${m.outcome}</span>`;host.appendChild(li)});
    const codingHost=document.getElementById('practice-coding'); const next=cfg.coding.find(c=>!coding[c.id])||cfg.coding[0]; if(codingHost&&next){codingHost.textContent=`Coding: ${next.kind} — ${next.title}`; codingHost.dataset.challenge=next.id;}
  }

  function renderCoding(){const host=document.getElementById('coding-challenges');if(!host)return;host.replaceChildren();cfg.coding.forEach(ch=>{const card=document.createElement('article');card.className='academy-coding-card';const status=coding[ch.id]?'✓ Practiced':'Not practiced';card.innerHTML=`<p class="eyebrow">${ch.kind}</p><h3>${ch.title}</h3><p>${ch.prompt}</p><p class="academy-coding-status">${status}</p>`;
    const hints=document.createElement('details');const hs=document.createElement('summary');hs.textContent='Show hints';hints.appendChild(hs);const ul=document.createElement('ul');ch.hints.forEach(x=>{const li=document.createElement('li');li.textContent=x;ul.appendChild(li)});hints.appendChild(ul);
    const sol=document.createElement('details');const ss=document.createElement('summary');ss.textContent='Show solution';const pre=document.createElement('pre');pre.textContent=ch.solution;const exp=document.createElement('p');exp.textContent=ch.explain;sol.append(ss,pre,exp);
    const done=document.createElement('button');done.type='button';done.className='button';done.textContent='Mark practiced';done.addEventListener('click',()=>{coding[ch.id]={at:new Date().toISOString()};write(CODING_KEY,coding);renderCoding()});card.append(hints,sol,done);host.appendChild(card)});}

  function nextMock(){const host=document.getElementById('mock-question');if(!host||!cfg.mockPrompts.length)return;const i=Math.floor(Math.random()*cfg.mockPrompts.length);host.textContent=cfg.mockPrompts[i];}
  function setupMock(){const btn=document.getElementById('new-mock-question');if(btn)btn.addEventListener('click',nextMock);nextMock();let timer=null,seconds=0;const display=document.getElementById('mock-timer');const start=document.getElementById('mock-start');if(start)start.addEventListener('click',()=>{if(timer){clearInterval(timer);timer=null;start.textContent='Start timer';return;}seconds=0;start.textContent='Stop timer';timer=setInterval(()=>{seconds++;if(display)display.textContent=`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`},1000)});}

  function augmentQuiz(){const quizHost=document.getElementById('dialog-quiz');if(!quizHost)return;const observer=new MutationObserver(()=>{const number=document.getElementById('dialog-number')?.textContent||'';const id=Number(number.replace(/\D/g,''));if(!id)return;quizHost.querySelectorAll('.academy-quiz-item').forEach((item,index)=>{if(item.querySelector('.academy-quiz-score'))return;const box=document.createElement('div');box.className='academy-quiz-score';const good=document.createElement('button');good.type='button';good.textContent='I knew this';const weak=document.createElement('button');weak.type='button';weak.textContent='Needs review';const save=(score)=>{const current=quiz[id]??50;quiz[id]=Math.round((current+score)/2);write(QUIZ_KEY,quiz);renderReadiness();};good.addEventListener('click',()=>save(100));weak.addEventListener('click',()=>save(20));box.append(good,weak);item.appendChild(box);});});observer.observe(quizHost,{childList:true,subtree:true});}

  document.addEventListener('DOMContentLoaded',()=>{renderReadiness();renderPractice();renderCoding();setupMock();augmentQuiz();document.getElementById('refresh-practice')?.addEventListener('click',()=>{delete practice.date;delete practice.modules;write(PRACTICE_KEY,practice);renderPractice()});});
})();