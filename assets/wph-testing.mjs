import { evaluate } from '../projects/ai-agent-evaluation/evaluator.js?v=20261106r2';

export const expectedTasks = {
  tasks: [
    { action: 'find_sources', client_id: 'demo' },
    { action: 'summarize_evidence', client_id: 'demo' },
  ],
};

const formatTasks = tasks => `{"tasks":[\n${tasks.map(task => `  ${JSON.stringify(task)}`).join(',\n')}\n]}`;

export const agentExamples = {
  match: formatTasks(expectedTasks.tasks),
  extra: formatTasks([...expectedTasks.tasks, { action: 'publish_record', client_id: 'demo' }]),
  missing: formatTasks([expectedTasks.tasks[0]]),
  schema: '{ "tasks": [ missing closing brackets',
};

export const ragExamples = {
  supported: {
    sourceLabel: 'Synthetic source excerpt',
    source: '“The Winter Atlas was published in March 2026.”',
    answer: 'The Winter Atlas was published in March 2026. [S1]',
    status: 'answered',
    citation: '[S1] Fictional publisher page · document demo-doc-01 · chunk demo-chunk-01',
  },
  missing: {
    sourceLabel: 'Retrieval result',
    source: 'No relevant evidence passages returned for this question.',
    answer: 'Insufficient evidence to answer the publication-date question.',
    status: 'insufficient_evidence',
    citation: 'No citation available. The publication date remains unknown.',
  },
  rights: {
    sourceLabel: 'Synthetic question',
    source: '“Are Japanese translation rights available for this book?”',
    answer: 'Rights status must be confirmed with the publisher or agency.',
    status: 'Rights confirmation required',
    citation: 'A publication-date excerpt cannot establish licensing availability.',
  },
};

function selectButton(group, selected) {
  for (const button of group.querySelectorAll('button')) {
    button.setAttribute('aria-pressed', String(button === selected));
  }
}

function renderAgent(panel, caseName) {
  const actual = agentExamples[caseName];
  const result = evaluate(expectedTasks, actual);
  const metric = value => value === null ? 'N/A' : `${Math.round(value * 100)}%`;
  const values = {
    output: actual,
    verdict: result.pass ? 'PASS' : 'FAIL',
    reason: result.reason,
    schema: result.schema ? 'Valid' : 'Invalid',
    precision: metric(result.precision),
    recall: metric(result.recall),
    f1: metric(result.f1),
  };
  for (const [key, value] of Object.entries(values)) {
    panel.querySelector(`[data-agent-${key}]`).textContent = value;
  }
  panel.dataset.result = result.pass ? 'pass' : 'fail';
}

if (typeof document !== 'undefined') {
  const ragPanel = document.querySelector('[data-rag-demo]');
  const agentPanel = document.querySelector('[data-agent-demo]');
  if (ragPanel) {
    for (const button of ragPanel.querySelectorAll('[data-rag-case]')) {
      button.addEventListener('click', () => {
        const example = ragExamples[button.dataset.ragCase];
        ragPanel.querySelector('[data-rag-source-label]').textContent = example.sourceLabel;
        for (const key of ['source', 'answer', 'status', 'citation']) {
          ragPanel.querySelector(`[data-rag-${key}]`).textContent = example[key];
        }
        selectButton(button.parentElement, button);
      });
    }
  }
  if (agentPanel) {
    renderAgent(agentPanel, 'match');
    for (const button of agentPanel.querySelectorAll('[data-agent-case]')) {
      button.addEventListener('click', () => {
        renderAgent(agentPanel, button.dataset.agentCase);
        selectButton(button.parentElement, button);
      });
    }
  }
}
