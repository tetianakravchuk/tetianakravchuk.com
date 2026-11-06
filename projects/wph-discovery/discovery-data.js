import {records} from './fixtures.js';
// Fictional bibliographic scenarios for the portfolio. Verified refers only to internal
// consistency of illustrative evidence, not to real-world books or rights clearance.
export const discoveryRecords=[
 {...records[0],author:'Maren Vestergaard (fictional)',year:1912,translation:'Untranslated (illustrative)',status:'needs_more_evidence',evidence:[{id:'DEMO-CAT-001',type:'Fictional catalog record',claim:'Publication year 1912',verified:true}],notes:'Fictional scenario: one publication-year field is supported by an internally consistent invented source; translation status is illustrative, not a real-world claim.'},
 {...records[1],author:'Elín Hrafnsdóttir (fictional)',translation:'Unknown',notes:'Fictional scenario: no source evidence. Translation availability is unknown, not untranslated.'},
 {...records[2],author:'Olena Bereza (fictional)',year:1934,translation:'Unknown',status:'conflicting_evidence',evidence:[{id:'DEMO-CAT-003A',type:'Fictional catalog A',claim:'Publication year 1934',verified:false},{id:'DEMO-CAT-003B',type:'Fictional catalog B',claim:'Publication year 1936',verified:false}],notes:'Fictional scenario: two invented sources disagree about the publication year; displayed year is disputed, not verified.'}
];
export function searchDiscovery({country='All',query=''}={}){
 const words=query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
 return discoveryRecords.filter(x=>{
  const haystack=[x.title,x.author,x.country,x.language,x.translation,x.status].join(' ').toLocaleLowerCase();
  return (country==='All'||x.country===country)&&words.every(word=>haystack.includes(word));
 });
}
export function statusLabel(status){return ({needs_more_evidence:'Needs more evidence',conflicting_evidence:'Conflicting evidence',rejected:'Rejected'})[status]||status;}
