export const records = [
  [
    "work",
    "How did Tetiana evaluate agents at Advisor360?",
    "advisor360|parrot|meeting|agent evaluation|golden dataset|regression|transcript|action items",
    "I helped develop and evaluate meeting-capture agents at Advisor360. I built Python regression suites and golden datasets to check summaries and action items against source transcripts and expected output schemas. My public Evaluation Lab illustrates these methods with synthetic examples.",
    "Evaluation Lab",
    "/projects/ai-agent-evaluation/"
  ],
  [
    "work",
    "How does WPH verify book evidence?",
    "wph evidence|book evidence|publishing|verify|verification|provenance|human review|review console|edition",
    "I built evidence workflows for my independent World Publishing Houses project that preserve source provenance and surface discrepancies for human review. My public review console illustrates that workflow.",
    "Human Review Console",
    "/projects/wph-review-console/"
  ],
  [
    "work",
    "How does ingestion recover after a failure?",
    "ingestion|checkpoint|recovery|concurrent|retry|worker|postgresql|transaction",
    "For World Publishing Houses, I used transactional PostgreSQL writes, checkpoints, and bounded workers to support safe retries after interruptions. My simulator shows how a concurrent-worker checkpoint conflict can be detected and recovered from.",
    "PostgreSQL Recovery Simulator",
    "/projects/postgresql-recovery-simulator/"
  ],
  [
    "work",
    "How does Tetiana investigate an AI incident?",
    "incident|investigate|observability|failure diagnosis|trace|monitoring",
    "In my public incident lab, I walk through an AI incident by comparing the output with source evidence and checking where the workflow failed.",
    "AI Incident Investigation Lab",
    "/projects/ai-incident-investigation/"
  ],
  [
    "work",
    "How does WPH support book discovery?",
    "discovery|literary|book search|retrieval|rag|grounding",
    "I built World Publishing Houses as an independent book-discovery project. My public discovery demo illustrates how source evidence supports recommendations and where the system should surface uncertainty.",
    "WPH Discovery",
    "/projects/wph-discovery/"
  ],
  [
    "recruiter",
    "What roles is Tetiana looking for?",
    "roles|remote|hybrid|onsite|on site|travel|location|massachusetts|grafton|full time|contract",
    "I’m based in Grafton, Massachusetts, and interested in full-time, direct-hire U.S.-remote roles in AI evaluation, AI reliability, applied AI, and quality engineering.",
    "Contact Tetiana",
    "/pages/contact.html"
  ],
  [
    "recruiter",
    "Does Tetiana need U.S. sponsorship?",
    "sponsorship|sponsor|authorized|authorization|visa|work permit",
    "I’m authorized to work in the United States without employer sponsorship.",
    "Contact Tetiana",
    "/pages/contact.html"
  ],
  [
    "recruiter",
    "How much professional Python experience does she have?",
    "python|llm evaluation|quality engineering|test automation|data science degree",
    "I have five years of professional Python experience, three years of professional AI and LLM evaluation experience, and more than ten years in quality engineering and test automation. I hold an M.S. in Data Science.",
    "View résumé",
    "/pages/resume.html"
  ]
].map(
  ([mode, question, keywords, answer, label, url], index) => ({
    id: String(index + 1), mode, question, keywords: keywords.split("|"), answer, label, url
  })
);

export const requiresHandoff = (question) =>
  /\b(salary|compensation|pay range|availability|available|schedule|start date|negotiate|accept offer|direct reports?)\b/i.test(question);
