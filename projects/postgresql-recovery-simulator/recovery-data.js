// Educational deterministic simulation; not a PostgreSQL connection or production test.
export const scenarios={
 crash:{name:'Worker crashes before commit',description:'A worker stages a batch but crashes before committing. No partial data should be visible.',events:[
 {name:'Claim batch',action:'checkpoint locked',state:{committed:0,checkpoint:0,attempts:1},status:'ok'},
 {name:'Stage records',action:'BEGIN; insert 3 rows (uncommitted)',state:{committed:0,checkpoint:0,attempts:1},status:'pending'},
 {name:'Worker crash',action:'connection lost; transaction rolled back',state:{committed:0,checkpoint:0,attempts:1},status:'failed'},
 {name:'Retry batch',action:'new worker claims same checkpoint',state:{committed:0,checkpoint:0,attempts:2},status:'retry'},
 {name:'Atomic commit',action:'COMMIT rows + checkpoint together',state:{committed:3,checkpoint:3,attempts:2},status:'ok'}
 ]},
 concurrent:{name:'Concurrent checkpoint writers',description:'Two workers race to advance one checkpoint. The second stale update must be rejected.',events:[
 {name:'Read checkpoint',action:'workers A and B both observe version 1',state:{committed:3,checkpoint:3,version:1},status:'ok'},
 {name:'Worker A commits',action:'conditional UPDATE version=1; COMMIT',state:{committed:6,checkpoint:6,version:2},status:'ok'},
 {name:'Worker B conflicts',action:'stale version=1; 0 rows updated; ROLLBACK',state:{committed:6,checkpoint:6,version:2},status:'blocked'},
 {name:'Worker B reloads',action:'read latest version 2; skip already-processed rows',state:{committed:6,checkpoint:6,version:2},status:'retry'},
 {name:'Idempotent finish',action:'no duplicate writes',state:{committed:6,checkpoint:6,version:2},status:'ok'}
 ]},
 duplicate:{name:'Retry after ambiguous acknowledgment',description:'A commit succeeds but acknowledgment is lost. An idempotency key prevents duplicate rows on retry.',events:[
 {name:'Begin ingestion',action:'write batch key batch-7',state:{committed:0,checkpoint:0,attempts:1},status:'ok'},
 {name:'Commit transaction',action:'3 rows committed with unique batch key',state:{committed:3,checkpoint:3,attempts:1},status:'ok'},
 {name:'ACK lost',action:'worker cannot confirm commit',state:{committed:3,checkpoint:3,attempts:1},status:'warning'},
 {name:'Retry same key',action:'ON CONFLICT DO NOTHING; no duplicate rows',state:{committed:3,checkpoint:3,attempts:2},status:'retry'},
 {name:'Confirm state',action:'checkpoint and row count unchanged',state:{committed:3,checkpoint:3,attempts:2},status:'ok'}
 ]}
};
export function simulate(id='crash'){const s=scenarios[id];if(!s)throw new Error('Unknown scenario');return {synthetic:true,scenario:id,name:s.name,description:s.description,events:s.events.map((e,i)=>({...e,sequence:i+1,state:{...e.state}})),disclaimer:'Conceptual simulation; no PostgreSQL instance, transaction or real worker is executed.'}}
