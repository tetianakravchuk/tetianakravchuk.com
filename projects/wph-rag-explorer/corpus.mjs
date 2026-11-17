// All people, titles, publishers, URLs and catalog entries are fictional fixtures.
export const corpusVersion = 'wph-rag-demo-1.0';
export const books = [
  { id: 'winter-atlas', title: 'The Winter Atlas' },
  { id: 'sea-between', title: 'The Sea Between Us' },
  { id: 'amber-orchard', title: 'The Amber Orchard' },
];

export const chunks = [
  { id: 'demo-chunk-01', documentId: 'demo-doc-01', sourceId: 'demo-publisher-a', source: 'Aurora Press · fictional publisher', bookId: 'winter-atlas', state: 'included', captured: '2026-11-17', url: 'https://aurora.example.invalid/winter-atlas', text: 'The Winter Atlas, by Mira Lund, was published in March 2026.' },
  { id: 'demo-chunk-02', documentId: 'demo-doc-02', sourceId: 'demo-catalog', source: 'Northern Catalog · fictional catalog', bookId: 'winter-atlas', state: 'included', captured: '2026-11-17', url: 'https://catalog.example.invalid/winter-atlas', text: 'The Winter Atlas was published in March 2026. A Japanese-language edition is not documented in this demo catalog.' },
  { id: 'demo-chunk-03', documentId: 'demo-doc-01', sourceId: 'demo-publisher-a', source: 'Aurora Press · fictional publisher', bookId: 'winter-atlas', state: 'included', captured: '2026-11-17', url: 'https://aurora.example.invalid/winter-atlas', text: 'The Winter Atlas follows a cartographer through a winter landscape. It is a fictional literary novel.' },
  { id: 'demo-chunk-04', documentId: 'demo-doc-03', sourceId: 'demo-publisher-b', source: 'Harbor House · fictional publisher', bookId: 'sea-between', state: 'included', captured: '2026-11-17', url: 'https://harbor.example.invalid/sea-between-us', text: 'The Sea Between Us, by Anna Vale, was published in May 2024.' },
  { id: 'demo-chunk-05', documentId: 'demo-doc-04', sourceId: 'demo-catalog', source: 'Northern Catalog · fictional catalog', bookId: 'sea-between', state: 'included', captured: '2026-11-17', url: 'https://catalog.example.invalid/sea-between-us', text: 'The Sea Between Us was published in June 2024.' },
  { id: 'demo-chunk-06', documentId: 'demo-doc-05', sourceId: 'demo-pending-source', source: 'Orchard Books · fictional pending source', bookId: 'amber-orchard', state: 'pending', captured: '2026-11-17', url: 'https://orchard.example.invalid/amber-orchard', text: 'The Amber Orchard, by Elin Moss, was published in January 2025.' },
];

export const examples = [
  { label: 'Supported answer', question: 'When was The Winter Atlas published?' },
  { label: 'Conflicting sources', question: 'When was The Sea Between Us published?' },
  { label: 'Pending evidence', question: 'When was The Amber Orchard published?' },
  { label: 'Missing information', question: 'What is the ISBN of The Winter Atlas?' },
  { label: 'Translation gap', question: 'Is The Winter Atlas documented in Japanese?' },
  { label: 'Rights question', question: 'Are Japanese translation rights available for The Winter Atlas?' },
];
