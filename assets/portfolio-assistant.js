"use strict";

const records = [
  [
    "work",
    "How did Tetiana evaluate agents at Advisor360?",
    "advisor360|parrot|meeting|agent evaluation|golden dataset|regression|transcript|action items",
    "At Advisor360, Tetiana helped develop and evaluate meeting-capture agents. She built Python regression suites and golden datasets to check summaries and action items against source transcripts and expected output schemas. The public Evaluation Lab illustrates these methods with synthetic examples.",
    "Evaluation Lab",
    "/projects/ai-agent-evaluation/"
  ],
  [
    "work",
    "How does WPH verify book evidence?",
    "wph evidence|book evidence|publishing|verify|verification|provenance|human review|review console|edition",
    "In her independent World Publishing Houses project, Tetiana built workflows that preserve source provenance and surface evidence for human review. Reviewers can inspect discrepancies before making decisions. The portfolio demo illustrates the review workflow.",
    "Human Review Console",
    "/projects/wph-review-console/"
  ],
  [
    "work",
    "How does ingestion recover after a failure?",
    "ingestion|checkpoint|recovery|concurrent|retry|worker|postgresql|transaction",
    "In World Publishing Houses, Tetiana used transactional PostgreSQL writes, checkpoints, and bounded workers to support safe retries after interruptions. The simulator shows how a concurrent-worker checkpoint conflict can be detected and recovered from.",
    "PostgreSQL Recovery Simulator",
    "/projects/postgresql-recovery-simulator/"
  ],
  [
    "work",
    "How does Tetiana investigate an AI incident?",
    "incident|investigate|observability|failure diagnosis|trace|monitoring",
    "Tetiana’s public incident lab walks through investigating an AI output by comparing it with source evidence and checking where the workflow failed.",
    "AI Incident Investigation Lab",
    "/projects/ai-incident-investigation/"
  ],
  [
    "work",
    "How does WPH support book discovery?",
    "discovery|literary|book search|retrieval|rag|grounding",
    "World Publishing Houses is Tetiana’s independent book-discovery project. Her public discovery demo illustrates how source evidence supports a recommendation and where the system should surface uncertainty.",
    "WPH Discovery",
    "/projects/wph-discovery/"
  ],
  [
    "recruiter",
    "What roles is Tetiana looking for?",
    "roles|remote|hybrid|onsite|on site|travel|location|massachusetts|grafton|full time|contract",
    "Tetiana is based in Grafton, Massachusetts. She is interested in full-time, direct-hire U.S.-remote roles in AI evaluation, AI reliability, applied AI, and quality engineering.",
    "Contact Tetiana",
    "/pages/contact.html"
  ],
  [
    "recruiter",
    "Does Tetiana need U.S. sponsorship?",
    "sponsorship|sponsor|authorized|authorization|visa|work permit",
    "Tetiana is authorized to work in the United States without employer sponsorship.",
    "Contact Tetiana",
    "/pages/contact.html"
  ],
  [
    "recruiter",
    "How much professional Python experience does she have?",
    "python|experience|years|background|degree|skills",
    "Tetiana has five years of professional Python experience, three years of professional AI and LLM evaluation experience, and more than ten years in quality engineering and test automation. She holds an M.S. in Data Science.",
    "View résumé",
    "/pages/resume.html"
  ]
].map(
  ([mode, question, keywords, answer, label, url]) => ({
    mode, question, keywords: keywords.split("|"), answer, label, url
  })
);

function findAnswer(question) {
  const query = " " + question.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim() + " ";
  const matches = (phrase) => query.includes(" " + phrase + " ");
  const handoff = /\b(salary|compensation|pay range|availability|available|schedule|start date|negotiate|accept offer)\b/;
  if (handoff.test(query)) return null;

  const exact = records.find((record) =>
    query.trim() === record.question.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()
  );
  if (exact) return exact;

  const ranked = records.map((record) => ({
    record,
    score: record.keywords.reduce((score, phrase) =>
      score + (matches(phrase) ? phrase.split(" ").length : 0), 0)
  })).sort((a, b) => b.score - a.score);
  return ranked[0].score > 0 && ranked[0].score > ranked[1].score
    ? ranked[0].record
    : null;
}

const title = document.getElementById("assistant-title");
const starters = document.getElementById("starters");
const form = document.getElementById("ask");
const input = document.getElementById("question");
const result = document.getElementById("result");

function showAnswer(record) {
  const paragraph = document.createElement("p");
  paragraph.textContent = record
    ? record.answer
    : "The portfolio assistant doesn’t have a verified answer to that question. You can ask Tetiana directly.";
  const link = document.createElement("a");
  link.href = record ? record.url : "/pages/contact.html";
  link.textContent = record ? record.label : "Contact Tetiana";
  result.replaceChildren(paragraph, link);
}

function showMode() {
  const mode = location.hash === "#recruiter" ? "recruiter" : "work";
  title.textContent = mode === "recruiter" ? "Recruiter FAQ" : "Ask about Tetiana’s work";
  const buttons = records.filter((record) => record.mode === mode).slice(0, 3).map((record) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "button";
    button.textContent = record.question;
    button.addEventListener("click", () => {
      input.value = record.question;
      showAnswer(record);
    });
    return button;
  });
  starters.replaceChildren(...buttons);
  input.value = "";
  result.replaceChildren();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  showAnswer(findAnswer(input.value));
});
window.addEventListener("hashchange", showMode);
showMode();
form.hidden = false;
