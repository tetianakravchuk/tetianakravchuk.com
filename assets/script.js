document.addEventListener('DOMContentLoaded', () => {
  const year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();

  const flashcardRoot = document.querySelector('[data-flashcards]');
  if (!flashcardRoot) return;

  // Permanent public cards live here. Add new public cards to this list.
  // visualKey controls the mini diagram. memoryHook is the visual-memory phrase.
  const baseFlashcards = [
    {
      id: 'ml-supervised-learning',
      deck: 'ML Basics',
      level: 'Foundation',
      visualKey: 'supervised',
      memoryHook: 'Picture WPH book metadata rows with a verified English-availability outcome attached.',
      question: 'What is supervised learning in a WPH context?',
      answer: 'In World Publishing Houses, supervised learning could use known book outcomes — such as available in English, coming soon, or not yet translated — to learn patterns from metadata like original language, publisher, genre, translator credits, country, and release history.'
    },
    {
      id: 'ml-train-test-split',
      deck: 'ML Basics',
      level: 'Foundation',
      visualKey: 'split',
      memoryHook: 'Picture one dataset cut into two boxes: practice data and final exam data.',
      question: 'Why do we split data into training and test sets?',
      answer: 'The training set is used to fit the model. The test set estimates how the model may perform on new, unseen data and helps detect overfitting.'
    },
    {
      id: 'ml-cross-validation',
      deck: 'ML Basics',
      level: 'Interview',
      visualKey: 'folds',
      memoryHook: 'Picture the validation block moving across the dataset like a spotlight.',
      question: 'What is cross-validation?',
      answer: 'Cross-validation repeats training and validation across multiple folds of the data, giving a more stable estimate of model performance than one single split.'
    },
    {
      id: 'eval-rmse',
      deck: 'Evaluation',
      level: 'Capstone',
      visualKey: 'rmse',
      memoryHook: 'Picture big errors becoming visually heavier because they are squared first.',
      question: 'What does RMSE measure?',
      answer: 'RMSE is the square root of average squared prediction error. It is in the same units as the target and penalizes larger errors more strongly.'
    },
    {
      id: 'eval-mae',
      deck: 'Evaluation',
      level: 'Capstone',
      visualKey: 'mae',
      memoryHook: 'Picture measuring straight distances from predictions to truth, then averaging them.',
      question: 'How is MAE different from RMSE?',
      answer: 'MAE measures the average absolute error and is easier to interpret. RMSE gives extra weight to large errors, so it is more sensitive to outliers.'
    },
    {
      id: 'eval-r2',
      deck: 'Evaluation',
      level: 'Capstone',
      visualKey: 'r2',
      memoryHook: 'Picture the model explaining part of the total variation cloud.',
      question: 'What does R² explain in a regression model?',
      answer: 'R² describes the share of target variance explained by the model compared with a simple baseline. Higher is usually better, but it must be interpreted with error metrics and business context.'
    },
    {
      id: 'nlp-embeddings',
      deck: 'NLP & Embeddings',
      level: 'Applied',
      visualKey: 'embedding',
      memoryHook: 'Picture words becoming points on a meaning map; similar ideas sit close together.',
      question: 'What is a text embedding?',
      answer: 'A text embedding converts words, sentences, or documents into numeric vectors so algorithms can compare meaning, similarity, or patterns in text.'
    },
    {
      id: 'nlp-classification',
      deck: 'NLP & Embeddings',
      level: 'Applied',
      visualKey: 'classification',
      memoryHook: 'Picture text moving through a small pipeline and receiving a category label.',
      question: 'How could text classification help a publishing platform?',
      answer: 'It could classify publisher descriptions, detect children’s books, identify translation-related language, group titles by theme, or route uncertain metadata for human review.'
    },
    {
      id: 'qa-ml-data-quality',
      deck: 'QA for ML',
      level: 'Professional',
      visualKey: 'qa-gates',
      memoryHook: 'Picture QA gates before the model, around evaluation, and after release.',
      question: 'Why is QA important for machine learning projects?',
      answer: 'ML systems depend on data quality, stable pipelines, correct labels, reproducible evaluation, and monitored behavior. QA helps catch silent failures before users or business decisions are affected.'
    },
    {
      id: 'qa-ml-edge-cases',
      deck: 'QA for ML',
      level: 'Professional',
      visualKey: 'edge-cases',
      memoryHook: 'Picture a test checklist catching rare but dangerous cases at the edges.',
      question: 'What kind of edge cases should be tested in ML products?',
      answer: 'Missing values, unusual categories, outliers, stale data, duplicate records, changed schemas, biased samples, low-confidence predictions, and user flows where the model returns no result.'
    },
    {
      id: 'wph-entity-resolution',
      deck: 'WPH Applications',
      level: 'Portfolio',
      visualKey: 'entity-resolution',
      memoryHook: 'Picture messy publisher names merging into one clean canonical record.',
      question: 'What is entity resolution in WPH?',
      answer: 'Entity resolution identifies when different names refer to the same real-world entity. In WPH, this helps merge publisher, translator, author, or imprint variants into one trustworthy profile.'
    },
    {
      id: 'wph-classification',
      deck: 'WPH Applications',
      level: 'Portfolio',
      visualKey: 'wph-classification',
      memoryHook: 'Picture one book moving into the right reader-facing availability shelf.',
      question: 'What is classification in WPH?',
      answer: 'Classification assigns an item to a category. In WPH, a model could classify books into reader-facing buckets such as Read now in English, Coming soon in English, or Not yet in English based on verified metadata.'
    },
    {
      id: 'wph-metadata-conflict',
      deck: 'WPH Applications',
      level: 'Portfolio',
      visualKey: 'metadata-conflict',
      memoryHook: 'Picture three sources disagreeing, then a review flag appearing.',
      question: 'How can ML help detect metadata conflicts?',
      answer: 'A model or rule-based system can compare metadata sources and flag conflicts, such as missing translators, inconsistent names, unclear publication dates, or suspicious translation paths that need human review.'
    },
    {
      id: 'wph-embeddings-search',
      deck: 'WPH Applications',
      level: 'Portfolio',
      visualKey: 'wph-embeddings',
      memoryHook: 'Picture descriptions becoming vectors that pull similar books and publishers closer together.',
      question: 'How could embeddings support WPH search?',
      answer: 'Embeddings turn text into numeric vectors. In WPH, embeddings could help match similar book descriptions, cluster publishers by themes, improve discovery, and connect readers with related translated works.'
    },
    {
      id: 'wph-translation-trust',
      deck: 'WPH Applications',
      level: 'Portfolio',
      visualKey: 'translation-trust',
      memoryHook: 'Picture each edition carrying a small trust label beside the translator credit.',
      question: 'What is a translation trust signal?',
      answer: 'A translation trust signal shows how reliable a translation credit or translation path is. WPH can label edition-level translator attribution as verified, unverified, or disputed based on source quality and consistency.'
    }
  ];

  const visualTemplates = {
    supervised: `
      <div class="visual-flow">
        <span class="visual-pill">book metadata</span><span class="visual-arrow">→</span><span class="visual-pill strong">known target / label</span><span class="visual-arrow">→</span><span class="visual-pill">model learns pattern</span>
      </div>
      <div class="wph-mini-table"><span>x₁ language</span><strong>Danish</strong><span>x₂ publisher</span><strong>Gyldendal</strong><span>x₃ category</span><strong>literary fiction</strong><span>x₄ translator?</span><strong>yes</strong><span>y English status</span><strong>read now / coming soon / not yet</strong></div>
    `,
    split: `
      <div class="split-bars"><span style="--w:70%">train 80%</span><span style="--w:30%">test 20%</span></div>
      <div class="visual-flow"><span class="visual-pill">fit</span><span class="visual-arrow">→</span><span class="visual-pill strong">final check</span></div>
    `,
    folds: `
      <div class="fold-strip"><span></span><span></span><span class="active"></span><span></span><span></span></div>
      <div class="fold-strip"><span></span><span class="active"></span><span></span><span></span><span></span></div>
      <div class="fold-strip"><span class="active"></span><span></span><span></span><span></span><span></span></div>
    `,
    rmse: `
      <div class="formula-chip">RMSE = √mean(error²)</div>
      <div class="error-bars"><span class="small"></span><span class="medium"></span><span class="large"></span></div>
    `,
    mae: `
      <div class="formula-chip">MAE = mean(|error|)</div>
      <div class="axis-plot"><span class="truth">truth</span><span class="prediction left">prediction</span><span class="prediction right">prediction</span></div>
    `,
    r2: `
      <div class="variance-card"><span class="total">total variance</span><span class="explained">explained by model</span></div>
    `,
    embedding: `
      <div class="scatter-map"><span class="dot book">book</span><span class="dot novel">novel</span><span class="dot recipe">recipe</span><span class="dot car">car</span></div>
    `,
    classification: `
      <div class="visual-flow wide"><span class="visual-pill">text</span><span class="visual-arrow">→</span><span class="visual-pill">embedding</span><span class="visual-arrow">→</span><span class="visual-pill strong">label</span></div>
      <div class="label-row"><span>children’s</span><span>translation</span><span>rights</span></div>
    `,
    'qa-gates': `
      <div class="gate-flow"><span>data QA</span><span>model QA</span><span>release QA</span></div>
      <div class="signal-row"><span>schema</span><span>metrics</span><span>monitoring</span></div>
    `,
    'edge-cases': `
      <div class="edge-grid"><span>missing</span><span>outlier</span><span>duplicate</span><span>stale</span></div>
      <div class="warning-chip">edge cases change model behavior</div>
    `,
    'entity-resolution': `
      <div class="merge-map"><span>Gyldendal</span><span>Gyldendal DK</span><span>Gyldendalske</span><strong>one publisher entity</strong></div>
    `,
    'wph-classification': `
      <div class="review-flow"><span>Book</span><span class="visual-arrow">→</span><strong>Read now</strong><span>Coming soon</span><span>Not yet in English</span></div>
    `,
    'metadata-conflict': `
      <div class="conflict-map"><span>Retailer A<br><strong>Anna</strong></span><span>Retailer B<br><strong>missing</strong></span><span>Publisher<br><strong>Ana</strong></span><em>conflict flag</em></div>
    `,
    'wph-embeddings': `
      <div class="review-flow"><span>Book description</span><span class="visual-arrow">→</span><strong>vector</strong><span class="visual-arrow">→</span><span>similar books</span><span>themes</span><span>publishers</span></div>
    `,
    'translation-trust': `
      <div class="trust-flow"><span>Edition</span><span>translator credit</span><span>source</span><strong>verified / unverified / disputed</strong></div>
    `,
    custom: `
      <div class="visual-flow wide"><span class="visual-pill">question</span><span class="visual-arrow">→</span><span class="visual-pill strong">memory cue</span><span class="visual-arrow">→</span><span class="visual-pill">answer</span></div>
    `
  };

  const storageKeys = {
    customCards: 'tkPortfolioCustomFlashcards',
    knownCards: 'tkPortfolioKnownFlashcards'
  };

  const getCustomCards = () => {
    try { return JSON.parse(localStorage.getItem(storageKeys.customCards) || '[]'); }
    catch { return []; }
  };

  const setCustomCards = (cards) => localStorage.setItem(storageKeys.customCards, JSON.stringify(cards));

  const getKnownCards = () => {
    try { return new Set(JSON.parse(localStorage.getItem(storageKeys.knownCards) || '[]')); }
    catch { return new Set(); }
  };

  const setKnownCards = (knownSet) => localStorage.setItem(storageKeys.knownCards, JSON.stringify([...knownSet]));

  const el = (selector) => document.querySelector(selector);
  const deckFilter = el('[data-deck-filter]');
  const card = el('[data-card-flip]');
  const question = el('[data-card-question]');
  const answer = el('[data-card-answer]');
  const deck = el('[data-card-deck]');
  const level = el('[data-card-level]');
  const hint = el('[data-card-hint]');
  const memory = el('[data-card-memory]');
  const visual = el('[data-card-visual]');
  const position = el('[data-card-position]');
  const knownCount = el('[data-known-count]');
  const progressBar = el('[data-progress-bar]');
  const toggleAnswer = el('[data-toggle-answer]');
  const prevBtn = el('[data-prev-card]');
  const nextBtn = el('[data-next-card]');
  const knownBtn = el('[data-known-card]');
  const shuffleBtn = el('[data-shuffle]');
  const resetBtn = el('[data-reset-progress]');
  const addForm = el('[data-add-card-form]');
  const newQuestion = el('[data-new-question]');
  const newAnswer = el('[data-new-answer]');
  const newDeck = el('[data-new-deck]');
  const newMemory = el('[data-new-memory]');
  const formMessage = el('[data-form-message]');
  const clearCustomBtn = el('[data-clear-custom]');

  let knownCards = getKnownCards();
  let allCards = [...baseFlashcards, ...getCustomCards()];
  let filteredCards = [...allCards];
  let currentIndex = 0;
  let isFlipped = false;

  const applyFilter = () => {
    const selectedDeck = deckFilter.value;
    allCards = [...baseFlashcards, ...getCustomCards()];
    filteredCards = selectedDeck === 'all' ? [...allCards] : allCards.filter((item) => item.deck === selectedDeck);
    currentIndex = 0;
    isFlipped = false;
    renderCard();
  };

  const renderCard = () => {
    if (!filteredCards.length) {
      question.textContent = 'No cards in this deck yet.';
      answer.textContent = 'Add a custom card below or switch to another deck.';
      deck.textContent = deckFilter.value === 'all' ? 'Empty' : deckFilter.value;
      level.textContent = 'Add cards';
      memory.textContent = 'Visual cue: create one small picture in your mind before checking the answer.';
      visual.innerHTML = visualTemplates.custom;
      position.textContent = 'Card 0 of 0';
      knownCount.textContent = `${knownCards.size} known`;
      progressBar.style.width = '0%';
      card.classList.add('is-flipped');
      toggleAnswer.textContent = 'Show answer';
      hint.textContent = 'Add a card below';
      return;
    }

    const active = filteredCards[currentIndex];
    question.textContent = active.question;
    answer.textContent = active.answer;
    deck.textContent = active.deck;
    level.textContent = active.level || 'Study';
    memory.textContent = active.memoryHook || 'Picture the idea as a simple flow: input → process → result.';
    visual.innerHTML = visualTemplates[active.visualKey] || visualTemplates.custom;
    position.textContent = `Card ${currentIndex + 1} of ${filteredCards.length}`;

    const filteredKnown = filteredCards.filter((item) => knownCards.has(item.id)).length;
    knownCount.textContent = `${filteredKnown} known`;
    progressBar.style.width = `${Math.round((filteredKnown / filteredCards.length) * 100)}%`;

    card.classList.toggle('is-flipped', isFlipped);
    toggleAnswer.textContent = isFlipped ? 'Hide answer' : 'Show answer';
    hint.textContent = isFlipped ? 'Answer is visible. Use “Hide answer” below to return to the question.' : 'Click “Show answer” below to reveal the explanation.';
    knownBtn.textContent = knownCards.has(active.id) ? 'Marked known' : 'I knew this';
  };

  const moveCard = (step) => {
    if (!filteredCards.length) return;
    currentIndex = (currentIndex + step + filteredCards.length) % filteredCards.length;
    isFlipped = false;
    renderCard();
  };

  const flipCard = () => {
    isFlipped = !isFlipped;
    renderCard();
  };

  deckFilter.addEventListener('change', applyFilter);
  card.addEventListener('click', flipCard);
  card.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      flipCard();
    }
  });
  toggleAnswer.addEventListener('click', flipCard);
  prevBtn.addEventListener('click', () => moveCard(-1));
  nextBtn.addEventListener('click', () => moveCard(1));

  knownBtn.addEventListener('click', () => {
    if (!filteredCards.length) return;
    const active = filteredCards[currentIndex];
    knownCards.add(active.id);
    setKnownCards(knownCards);
    isFlipped = true;
    renderCard();
  });

  shuffleBtn.addEventListener('click', () => {
    filteredCards = filteredCards
      .map((item) => ({ item, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ item }) => item);
    currentIndex = 0;
    isFlipped = false;
    renderCard();
  });

  resetBtn.addEventListener('click', () => {
    knownCards = new Set();
    setKnownCards(knownCards);
    isFlipped = false;
    renderCard();
  });

  addForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const q = newQuestion.value.trim();
    const a = newAnswer.value.trim();
    const d = newDeck.value.trim() || 'Custom';
    const m = newMemory.value.trim() || 'Picture the idea as a simple flow: input → process → result.';

    if (!q || !a) {
      formMessage.textContent = 'Please add both a question and an answer.';
      return;
    }

    const customCards = getCustomCards();
    const cardToAdd = {
      id: `custom-${Date.now()}`,
      deck: d,
      level: 'Custom',
      visualKey: 'custom',
      memoryHook: m,
      question: q,
      answer: a
    };

    customCards.push(cardToAdd);
    setCustomCards(customCards);
    newQuestion.value = '';
    newAnswer.value = '';
    newMemory.value = '';
    newDeck.value = 'Custom';
    formMessage.textContent = 'Flashcard added on this device with a visual memory cue.';
    deckFilter.value = d === 'Custom' ? 'Custom' : 'all';
    applyFilter();
  });

  clearCustomBtn.addEventListener('click', () => {
    setCustomCards([]);
    formMessage.textContent = 'Custom cards cleared from this device.';
    if (deckFilter.value === 'Custom') deckFilter.value = 'all';
    applyFilter();
  });

  renderCard();
});
