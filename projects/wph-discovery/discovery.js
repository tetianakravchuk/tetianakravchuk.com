import {discoveryRecords,searchDiscovery,statusLabel} from './discovery-data.js?v=20261106qa';
const get=id=>document.getElementById(id);
const params=new URLSearchParams(location.search);
const initialCountry=params.get('country');
if(['All','Denmark','Iceland','Ukraine'].includes(initialCountry))get('country').value=initialCountry;
get('query').value=params.get('q')||'';
let selected=discoveryRecords[0]?.id;
function updateUrl(){
 const url=new URL(location.href);
 url.searchParams.delete('q');url.searchParams.delete('country');
 if(get('query').value.trim())url.searchParams.set('q',get('query').value.trim());
 if(get('country').value!=='All')url.searchParams.set('country',get('country').value);
 history.replaceState(null,'',url.pathname+(url.search||'')+url.hash);
}
function render(){
 const rows=searchDiscovery({country:get('country').value,query:get('query').value});
 get('count').textContent=rows.length+' illustrative '+(rows.length===1?'record':'records');
 if(!rows.some(record=>record.id===selected))selected=rows[0]?.id;
 const results=get('results');results.replaceChildren();
 for(const record of rows){
  const li=document.createElement('li');const button=document.createElement('button');
  button.type='button';button.className='demo-record';button.setAttribute('aria-pressed',String(record.id===selected));
  button.textContent=record.title+' — '+record.country+' · '+record.language;
  button.addEventListener('click',()=>{selected=record.id;render()});li.append(button);results.append(li);
 }
 const empty=get('empty-state'),detail=get('details');empty.hidden=rows.length!==0;detail.hidden=rows.length===0;
 if(!rows.length){detail.replaceChildren();return;}
 const record=rows.find(item=>item.id===selected);detail.replaceChildren();
 const heading=document.createElement('h3');heading.textContent=record.title;detail.append(heading);
 const badge=document.createElement('span');badge.className='discovery-status';badge.textContent=statusLabel(record.status);detail.append(badge);
 const dl=document.createElement('dl');
 const fields={Author:record.author,Country:record.country,Language:record.language,'Publication year':record.status==='conflicting_evidence'?'Conflicting: 1934 / 1936':record.year??'Unknown','Translation availability':record.translation,Rights:record.rights};
 for(const [name,value] of Object.entries(fields)){const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=name;dd.textContent=value;dl.append(dt,dd)}detail.append(dl);
 const notes=document.createElement('p');notes.textContent=record.notes;detail.append(notes);
 const evidenceTitle=document.createElement('h4');evidenceTitle.textContent='Illustrative source evidence';detail.append(evidenceTitle);
 if(!record.evidence.length){const p=document.createElement('p');p.textContent='No evidence supplied.';detail.append(p)}
 else{const ul=document.createElement('ul');for(const item of record.evidence){const li=document.createElement('li');li.textContent=item.id+' · '+item.type+' · '+item.claim+' · '+(item.verified?'Consistent within fictional fixture':'Unverified or conflicting');ul.append(li)}detail.append(ul)}
}
function onFilter(){updateUrl();render()}
get('country').addEventListener('change',onFilter);
get('query').addEventListener('input',onFilter);
get('clear-filters').addEventListener('click',()=>{get('country').value='All';get('query').value='';onFilter();get('query').focus()});
window.addEventListener('popstate',()=>{const p=new URLSearchParams(location.search);get('country').value=['Denmark','Iceland','Ukraine'].includes(p.get('country'))?p.get('country'):'All';get('query').value=p.get('q')||'';render()});
render();
