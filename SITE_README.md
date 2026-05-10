# Tetiana Kravchuk Portfolio Website

This is a complete static portfolio starter for `tetianakravchuk.com`.

## Pages included

- `index.html` — homepage
- `pages/about.html` — professional story
- `pages/projects.html` — selected project portfolio
- `pages/world-publishing-houses.html` — flagship WPH case study
- `pages/qa-impact.html` — QA metrics and professional impact
- `pages/data-science.html` — ML/data science projects plus an interactive Data Science Flashcard Study Lab
- `pages/resume.html` — web resume
- `pages/contact.html` — contact page
- `assets/styles.css` — site styling
- `assets/script.js` — footer year script and flashcard study-lab logic

## Recommended next edits

1. Add your latest resume PDF and link it from `pages/resume.html`.
2. Add screenshots from World Publishing Houses when you are ready.
3. Replace any project numbers or claims you want softened before publishing.
4. Add more permanent study cards by editing the `baseFlashcards` array in `assets/script.js`.
5. Deploy the folder to Cloudflare Pages, GitHub Pages, Netlify, or Vercel.

## Contact currently used

- Email: tetiana.qa.data.jobs@gmail.com
- LinkedIn: https://www.linkedin.com/in/tetianakravchuk


## Flashcard Study Lab

The Data Science page now includes an interactive flashcard feature at:

`pages/data-science.html#flashcards`

What it supports:

- Built-in decks for ML basics, evaluation, NLP & embeddings, QA for ML, and World Publishing Houses applications.
- Flip-card interaction, next/previous navigation, shuffle, category filter, and local progress.
- A browser form for adding custom cards. These custom cards are saved with local storage on the current device.
- To make a card permanent for every visitor, add it to the `baseFlashcards` array in `assets/script.js`.

### Visual memory cues

Each built-in flashcard now supports:

- `visualKey` — chooses a small built-in mini diagram, such as `supervised`, `split`, `folds`, `rmse`, `mae`, `r2`, `embedding`, `classification`, `qa-gates`, `edge-cases`, `entity-resolution`, or `human-review`.
- `memoryHook` — a short “picture this” sentence that helps trigger visual memory before the answer is shown.

Custom cards added in the browser also include a visual memory cue field. Permanent public custom diagrams can be added by extending the `visualTemplates` object in `assets/script.js`.
