window.WPH_ACADEMY_PHASE3 = {
  categories: [
    {key:'wph',label:'WPH Defense',modules:[1,2,7,8,9,10,12,14,15,16,17,18,19,20,25,27]},
    {key:'llm',label:'LLM / RAG',modules:[3,4,5,11,23]},
    {key:'agents',label:'Agents',modules:[6,7,12,13,14,16]},
    {key:'evaluation',label:'Evaluation',modules:[13,14,15,16,17]},
    {key:'python',label:'Python',modules:[21]},
    {key:'sql',label:'SQL',modules:[9,22]},
    {key:'system',label:'System Design',modules:[2,8,9,10,18,19,20]},
    {key:'behavioral',label:'Behavioral',modules:[24,25,26,27]}
  ],
  coding: [
    {id:'py-dedupe',moduleId:21,kind:'Python',title:'Newest record per ISBN',prompt:'Write a function that receives publishing records and returns one record per non-empty ISBN, keeping the record with the newest updated_at value.',hints:['A dictionary keyed by ISBN is enough.','Skip missing ISBNs.','Compare updated_at before replacement.'],solution:'def newest_by_isbn(records):\n    latest = {}\n    for record in records:\n        isbn = record.get("isbn")\n        if not isbn:\n            continue\n        if isbn not in latest or record["updated_at"] > latest[isbn]["updated_at"]:\n            latest[isbn] = record\n    return list(latest.values())',explain:'Expected O(n) time and O(n) additional space. In production, normalize identifiers and compare parsed timestamps rather than assuming strings are always comparable.'},
    {id:'py-evidence',moduleId:21,kind:'Python',title:'Evidence validation',prompt:'Return only records that contain both a non-empty title and a non-empty source_url. Explain how you would report rejected rows rather than silently discarding them.',hints:['Use dict.get for optional fields.','Consider returning valid rows plus validation errors.'],solution:'def valid_records(records):\n    return [r for r in records if r.get("title") and r.get("source_url")]',explain:'The compact version filters valid rows, but production ingestion should retain validation reasons so missing evidence is observable and reviewable.'},
    {id:'sql-latest',moduleId:22,kind:'SQL',title:'Latest verified source per publisher',prompt:'Given publisher_sources(publisher_id, source_url, verified_at), return the latest verified source for every publisher.',hints:['Use ROW_NUMBER().','Partition by publisher_id and order verified_at descending.'],solution:'WITH ranked AS (\n  SELECT publisher_id, source_url, verified_at,\n         ROW_NUMBER() OVER (PARTITION BY publisher_id ORDER BY verified_at DESC) AS rn\n  FROM publisher_sources\n  WHERE verified_at IS NOT NULL\n)\nSELECT publisher_id, source_url, verified_at\nFROM ranked\nWHERE rn = 1;',explain:'A window function preserves row detail while ranking records within each publisher. Add a deterministic tie-breaker if verified_at may repeat.'},
    {id:'sql-duplicates',moduleId:22,kind:'SQL',title:'Find duplicate ISBNs',prompt:'Return ISBN values that occur more than once, with their counts. Ignore null ISBNs.',hints:['GROUP BY ISBN.','Use HAVING after aggregation.'],solution:'SELECT isbn, COUNT(*) AS occurrences\nFROM books\nWHERE isbn IS NOT NULL\nGROUP BY isbn\nHAVING COUNT(*) > 1\nORDER BY occurrences DESC;',explain:'This detects duplicate identifiers, not necessarily duplicate works. WPH still needs evidence-aware entity resolution for editions and format variants.'}
  ],
  mockPrompts: [
    'Give me your two-minute WPH architecture walkthrough.',
    'Why did you choose deterministic safety rules after probabilistic extraction?',
    'I think WPH has too many agents. Defend the design or tell me where you agree.',
    'How do you know an AI-generated publishing claim is safe to present?',
    'Explain how prompt promotion and rollback work in WPH.',
    'Your AI cost increased 300% this week. Walk me through the investigation.',
    'What is the difference between a registry entry and an implemented agent?',
    'How would WPH change at 100× the current data volume?',
    'How much of WPH was written with AI assistance, and how do you validate generated code?',
    'Why are you moving from QA automation into AI Engineering?',
    'Design an asynchronous API for a long-running AI job.',
    'Explain RAG, then tell me what parts of WPH are actually evidenced as RAG versus source-backed collection.',
    'How is testing an LLM application different from testing a deterministic API?',
    'A model returns schema-valid JSON containing an unsupported rights claim. What happens next?',
    'Tell me about a failure or architecture decision you changed after learning new information.'
  ]
};