# Tetiana Kravchuk Portfolio Website

This is a complete static portfolio starter for `tetianakravchuk.com`.

## Pages included

- `index.html` — homepage
- `pages/about.html` — professional story
- `pages/projects.html` — selected project portfolio
- `pages/world-publishing-houses.html` — flagship WPH case study
- `projects/world-publishing-houses-dataset/index.html` — WPH publishing intelligence dataset case study
- `pages/qa-impact.html` — QA metrics and professional impact
- `pages/data-science.html` — ML/data science projects plus an interactive Data Science Flashcard Study Lab
- `pages/resume.html` — web resume
- `pages/contact.html` — contact page
- `assets/styles.css` — site styling
- `assets/script.js` — footer year script and flashcard study-lab logic
- `assets/data/wph-dataset-summary.json` — dataset summary and small sample rows for the WPH dataset case study

## Recommended next edits

1. Upload your real resume PDF to `assets/resume/Tetiana_Kravchuk_Resume.pdf`. The site already links to this path for resume downloads.
2. To add a real headshot, upload it to `assets/images/headshot.jpg`.
3. The social sharing card is available as `assets/og-card.png`, with the editable source in `assets/og-card.svg`.
4. Add screenshots from World Publishing Houses when you are ready.
5. Replace any project numbers or claims you want softened before publishing.
6. Add more permanent study cards by editing the `baseFlashcards` array in `assets/script.js`.
7. Deploy the folder to Cloudflare Pages, GitHub Pages, Netlify, or Vercel.

## Resume PDF

The downloadable resume file is not committed yet. Upload the real PDF here:

`assets/resume/Tetiana_Kravchuk_Resume.pdf`

Do not rename the file unless you also update the download links in `index.html` and `pages/*.html`.

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
