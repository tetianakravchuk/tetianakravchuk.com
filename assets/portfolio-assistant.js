import { records, requiresHandoff } from "./portfolio-assistant-records.mjs";

const endpoint = document.querySelector('meta[name="assistant-api"]').content;
document.getElementById("model-notice").hidden = !endpoint;
let pending;

function findAnswer(question) {
  const query = " " + question.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim() + " ";
  const matches = (phrase) => query.includes(" " + phrase + " ");
  if (requiresHandoff(query)) return null;

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
  pending?.abort();
  const mode = location.hash === "#recruiter" ? "recruiter" : "work";
  title.textContent = mode === "recruiter" ? "Recruiter FAQ" : "Ask about Tetiana’s work";
  const buttons = records.filter((record) => record.mode === mode).slice(0, 3).map((record) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "button";
    button.textContent = record.question;
    button.addEventListener("click", () => {
      pending?.abort();
      input.value = record.question;
      showAnswer(record);
    });
    return button;
  });
  starters.replaceChildren(...buttons);
  input.value = "";
  result.replaceChildren();
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  pending?.abort();
  const question = input.value.trim();
  if (!endpoint || !question || requiresHandoff(question)) {
    showAnswer(findAnswer(question));
    return;
  }

  const request = new AbortController();
  pending = request;
  result.textContent = "Finding a verified answer…";
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(12000)])
    });
    if (!response.ok) throw new Error("Assistant service unavailable");
    const { id } = await response.json();
    if (!request.signal.aborted) showAnswer(records.find((record) => record.id === id));
  } catch {
    if (!request.signal.aborted) showAnswer(findAnswer(question));
  } finally {
    if (pending === request) pending = undefined;
  }
});
window.addEventListener("hashchange", showMode);
showMode();
form.hidden = false;
