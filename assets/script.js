document.addEventListener('DOMContentLoaded', () => {
  const year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();

  const nav = document.querySelector('.nav');
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const navLinks = document.querySelector('[data-nav-links]');

  if (nav && menuToggle && navLinks) {
    const closeMenu = () => {
      nav.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    };

    menuToggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });

    navLinks.addEventListener('click', (event) => {
      if (event.target.closest('a')) closeMenu();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMenu();
    });
  }

  const escapeHtml = (value) => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const datasetStats = document.querySelector('[data-wph-stats]');
  const datasetRows = document.querySelector('[data-wph-sample-rows]');

  if (datasetStats || datasetRows) {
    const datasetSource = datasetStats?.dataset.source || datasetRows?.dataset.source || '../assets/data/wph-dataset-summary.json';
    fetch(datasetSource)
      .then((response) => {
        if (!response.ok) throw new Error('Dataset summary unavailable');
        return response.json();
      })
      .then((data) => {
        if (datasetStats && data.summary) {
          const summary = data.summary;
          datasetStats.innerHTML = [
            ['Works', summary.works, 'Books and works represented in the pilot dataset.'],
            ['Publishers', summary.publishers, 'Publisher and imprint records across the pilot markets.'],
            ['Translations', summary.translationRecords, 'Translation records with attribution and availability fields.'],
            ['Events', summary.events, 'Release, award, market, and publishing signal events.'],
            ['Rights Signals', summary.rightsSignals, 'Rows designed for watchlist and acquisition workflows.'],
            ['Pilot Countries', summary.pilotCountries.length, summary.pilotCountries.join(' and ') + ' as early country templates.']
          ].map(([label, value, detail]) => `
            <article class="card">
              <h3>${escapeHtml(label)}</h3>
              <p><strong class="metric-number">${escapeHtml(value)}</strong>${escapeHtml(detail)}</p>
            </article>
          `).join('');
        }

        if (datasetRows && Array.isArray(data.sampleRows)) {
          datasetRows.innerHTML = data.sampleRows.map((row) => `
            <tr>
              <td>${escapeHtml(row.country)}</td>
              <td>${escapeHtml(row.workTitle)}</td>
              <td>${escapeHtml(row.author)}</td>
              <td>${escapeHtml(row.publisher)}</td>
              <td>${escapeHtml(row.originalLanguage)}</td>
              <td>${escapeHtml(row.englishAvailability)}</td>
              <td>${escapeHtml(row.translator)}</td>
              <td><span class="status-pill ${row.verificationStatus === 'verified_public_source' ? 'verified' : 'needs-check'}">${escapeHtml(row.verificationStatus)}</span></td>
              <td>${escapeHtml(row.readerBucket)}</td>
              <td>${escapeHtml(row.rightsSignal)}</td>
            </tr>
          `).join('');
        }
      })
      .catch(() => {
        if (datasetRows) {
          datasetRows.innerHTML = '<tr><td colspan="10">Dataset sample could not load. The case study summary remains available above.</td></tr>';
        }
      });
  }

  const flashcardRoot = document.querySelector('[data-flashcards]');
  if (!flashcardRoot) return;

  // Permanent public cards live here. Add new public cards to this list.
  // visualKey controls the mini diagram. memoryHook is the visual-memory phrase.
  const baseFlashcards = [
    {
      id: 'ml-supervised-learning',
      deck: 'ML Basics',
      level: 'Foundation',
      visualType: 'supervisedWph',
      memoryHook: 'Picture WPH book metadata rows with a verified English-availability outcome attached.',
      question: 'What is supervised learning?',
      visualCaption: 'General idea: X features + known y → model learns a prediction pattern. WPH example: book metadata + known English status → availability prediction.',
      generalIdea: 'Supervised learning is a machine learning approach where a model learns from labeled examples. Each training example includes input features, called X, and a known correct output, called y. The model learns patterns from X to y so it can make predictions on new, unseen data.',
      simpleExample: 'A housing model can learn from features like square footage, number of rooms, and location, paired with a known sale price. After training, it can estimate the price of a new house.',
      wphApplication: 'In World Publishing Houses, supervised learning could use known book outcomes — such as available in English, coming soon, or not yet translated — and learn patterns from metadata like original language, publisher, genre, translator credits, country, and release history.'
    },
    {
      id: 'ml-train-test-split',
      deck: 'ML Basics',
      level: 'Foundation',
      visualKey: 'split',
      memoryHook: 'Picture one dataset cut into two boxes: practice data and final exam data.',
      question: 'Why do we split data into training and test sets?',
      generalIdea: 'A train/test split separates data into one part used to train the model and another part used to evaluate it. This helps estimate whether the model can generalize to data it has not seen before.',
      simpleExample: 'If you have 10,000 property records, you might train the model on 8,000 records and test it on 2,000 records that were held back.',
      wphApplication: 'In WPH, a model that predicts reader availability or flags metadata conflicts should be tested on held-out book records. This helps verify that the model is learning real patterns rather than memorizing known publishers or titles.'
    },
    {
      id: 'ml-cross-validation',
      deck: 'ML Basics',
      level: 'Interview',
      visualKey: 'folds',
      memoryHook: 'Picture the validation block moving across the dataset like a spotlight.',
      question: 'What is cross-validation?',
      generalIdea: 'Cross-validation evaluates a model by repeatedly training and validating it on different portions of the data. It gives a more stable estimate of performance than one single train/test split.',
      simpleExample: 'In 5-fold cross-validation, the dataset is split into five parts. The model trains five times, each time using a different fold for validation.',
      wphApplication: 'In WPH, cross-validation would be useful when data is limited, especially for smaller countries or niche publishers. It can help evaluate whether a model performs consistently across different subsets of books and metadata sources.'
    },
    {
      id: 'eval-rmse',
      deck: 'Evaluation',
      level: 'Capstone',
      visualKey: 'rmse',
      memoryHook: 'Picture big errors becoming visually heavier because they are squared first.',
      question: 'What does RMSE measure?',
      generalIdea: 'RMSE, or root mean squared error, measures the typical prediction error in the same units as the target. Because errors are squared before averaging, RMSE penalizes large errors more strongly.',
      simpleExample: 'In a property value model, RMSE estimates how far predictions are from actual values on average, with very large mistakes weighing more heavily.',
      wphApplication: 'If WPH later predicts numeric signals, such as translation likelihood scores, confidence scores, or demand estimates, RMSE could help evaluate how close those predictions are to known outcomes.'
    },
    {
      id: 'eval-mae',
      deck: 'Evaluation',
      level: 'Capstone',
      visualKey: 'mae',
      memoryHook: 'Picture measuring straight distances from predictions to truth, then averaging them.',
      question: 'How is MAE different from RMSE?',
      generalIdea: 'MAE, or mean absolute error, measures the average absolute difference between predictions and true values. It is easier to interpret than RMSE because it treats each error as a direct distance.',
      simpleExample: 'If a home value model has an MAE of about $184,569, predictions are off by about that amount on average, ignoring whether each error is above or below the true value.',
      wphApplication: 'In WPH, MAE could be useful for numeric prediction tasks where interpretability matters. For example, it could explain average error in estimated release timing, ranking score, or other future quantitative signals.'
    },
    {
      id: 'eval-r2',
      deck: 'Evaluation',
      level: 'Capstone',
      visualKey: 'r2',
      memoryHook: 'Picture the model explaining part of the total variation cloud.',
      question: 'What does R² explain in a regression model?',
      generalIdea: 'R² describes how much of the variation in the target variable is explained by the model compared with a simple baseline. Higher values usually mean better fit, but R² should be interpreted with error metrics and business context.',
      simpleExample: 'An R² of 0.517 means the model explains about 51.7% of the variation in the target, while the remaining variation is still unexplained.',
      wphApplication: 'If WPH uses regression-style predictions later, R² could help explain whether metadata features meaningfully explain outcomes such as translation activity, publisher activity, or estimated demand.'
    },
    {
      id: 'eval-model-evaluation',
      deck: 'Evaluation',
      level: 'Applied',
      visualType: 'modelEvaluationWph',
      memoryHook: 'Picture a model passing through a metrics checkpoint before it can guide product decisions.',
      question: 'What is model evaluation?',
      visualCaption: 'General idea: predictions + true outcomes → metrics. WPH example: model output + verified metadata → reliability check.',
      generalIdea: 'Model evaluation measures how well a model performs using metrics such as accuracy, precision, recall, RMSE, MAE, or R² depending on the task.',
      simpleExample: 'A classifier can be evaluated by comparing its predicted labels with known correct labels and checking whether it makes too many false positives or false negatives.',
      wphApplication: 'In WPH, evaluation would help check whether a classification or recommendation model is reliable enough to support reader discovery, metadata review, or publisher intelligence without misleading users.'
    },
    {
      id: 'nlp-embeddings',
      deck: 'NLP & Embeddings',
      level: 'Applied',
      visualKey: 'embedding',
      memoryHook: 'Picture words becoming points on a meaning map; similar ideas sit close together.',
      question: 'What are embeddings?',
      generalIdea: 'Embeddings are numeric vector representations of text, images, or other data. They help computers compare meaning by placing similar items close together in vector space.',
      simpleExample: 'Two book descriptions about Nordic crime fiction may have embeddings that are close together, while a cookbook description would be farther away.',
      wphApplication: 'In WPH, embeddings could support semantic book search, similar-title discovery, publisher clustering, theme detection, and recommendations across translated works.'
    },
    {
      id: 'nlp-classification',
      deck: 'NLP & Embeddings',
      level: 'Applied',
      visualKey: 'classification',
      memoryHook: 'Picture text moving through a small pipeline and receiving a category label.',
      question: 'What is text classification?',
      generalIdea: 'Text classification is the process of assigning text to predefined categories. It can be done with traditional machine learning, embeddings, or modern language models.',
      simpleExample: 'A model can read a short description and classify it as news, fiction, children’s literature, academic text, or marketing copy.',
      wphApplication: 'In WPH, text classification could classify publisher descriptions, detect children’s books, identify translation-related language, group titles by theme, or route uncertain metadata for human review.'
    },
    {
      id: 'qa-ml-data-quality',
      deck: 'QA for ML',
      level: 'Professional',
      visualKey: 'qa-gates',
      memoryHook: 'Picture QA gates before the model, around evaluation, and after release.',
      question: 'Why is QA important for machine learning projects?',
      generalIdea: 'QA is important for ML because model behavior depends on data quality, stable pipelines, correct labels, reproducible evaluation, and monitored outputs. A model can appear accurate while still failing silently in production.',
      simpleExample: 'If a feature column changes meaning or labels are inconsistent, the model may produce unreliable predictions even if the code still runs.',
      wphApplication: 'In WPH, QA thinking protects translation metadata, publisher identity, reader-facing buckets, and trust badges. It helps prevent misleading users when data is incomplete, conflicting, or uncertain.'
    },
    {
      id: 'qa-ml-edge-cases',
      deck: 'QA for ML',
      level: 'Professional',
      visualKey: 'edge-cases',
      memoryHook: 'Picture a test checklist catching rare but dangerous cases at the edges.',
      question: 'What kind of edge cases should be tested in ML products?',
      generalIdea: 'ML edge cases are unusual inputs or data conditions that can cause poor predictions, confusing outputs, or hidden failures. They should be tested because real users often encounter messy cases.',
      simpleExample: 'Common edge cases include missing values, duplicate records, outliers, rare categories, stale data, changed schemas, and low-confidence predictions.',
      wphApplication: 'In WPH, edge cases include missing translator credits, indirect translation paths, publisher name variants, low-data countries, contradictory retailer metadata, and books that do not fit clean reader buckets.'
    },
    {
      id: 'wph-entity-resolution',
      deck: 'WPH Applications',
      level: 'Portfolio',
      visualType: 'entityResolution',
      memoryHook: 'Picture messy publisher names merging into one clean canonical record.',
      question: 'What is entity resolution?',
      visualCaption: 'General idea: variant records → one real-world entity. WPH example: publisher name variants → trusted profile.',
      generalIdea: 'Entity resolution is the process of identifying when different records, names, or spellings refer to the same real-world entity.',
      simpleExample: 'A database may contain “Gyldendal,” “Gyldendal DK,” and “Gyldendalske.” Entity resolution helps determine whether these should be linked, merged, or reviewed as related records.',
      wphApplication: 'In WPH, entity resolution can merge publisher, translator, author, or imprint variants into one trustworthy profile while preserving evidence and avoiding careless over-merging.'
    },
    {
      id: 'wph-classification',
      deck: 'WPH Applications',
      level: 'Portfolio',
      visualType: 'classificationWph',
      memoryHook: 'Picture one book moving into the right reader-facing availability shelf.',
      question: 'What is classification?',
      visualCaption: 'General idea: input → predefined category. WPH example: book metadata → English availability bucket.',
      generalIdea: 'Classification is a supervised learning task where a model assigns an input to one of several predefined categories.',
      simpleExample: 'An email classifier can sort messages into categories like primary, promotion, update, or junk.',
      wphApplication: 'In WPH, classification could help place books into reader-facing buckets such as Read now in English, Coming soon in English, or Not yet in English based on verified metadata.'
    },
    {
      id: 'wph-metadata-conflict',
      deck: 'WPH Applications',
      level: 'Portfolio',
      visualType: 'conflictDetection',
      memoryHook: 'Picture three sources disagreeing, then a review flag appearing.',
      question: 'What is metadata conflict detection?',
      visualCaption: 'General idea: compare sources → flag inconsistency. WPH example: conflicting translator credits → human review.',
      generalIdea: 'Metadata conflict detection finds inconsistent, missing, or contradictory information across multiple data sources.',
      simpleExample: 'One source may list a translator as Anna Smith, another may omit the translator, and a publisher page may show Ana Smith. The record should not be treated as fully verified without review.',
      wphApplication: 'In WPH, conflict detection can flag translator discrepancies, unclear publication dates, inconsistent publisher names, suspicious translation paths, and records that need human verification.'
    },
    {
      id: 'wph-embeddings-search',
      deck: 'WPH Applications',
      level: 'Portfolio',
      visualType: 'embeddingsWph',
      memoryHook: 'Picture descriptions becoming vectors that pull similar books and publishers closer together.',
      question: 'How could embeddings support search?',
      visualCaption: 'General idea: text → vector → similarity. WPH example: book descriptions → related books, themes, and publishers.',
      generalIdea: 'Embeddings support search by comparing meaning instead of only exact keyword matches. They can retrieve related content even when users use different wording.',
      simpleExample: 'A search for “Nordic family mystery” might find books described with words like “Icelandic domestic suspense” because the meanings are similar.',
      wphApplication: 'In WPH, embeddings could improve discovery across translated works, connect similar books and publishers, cluster themes, and help readers find relevant titles even when metadata wording differs by source.'
    },
    {
      id: 'wph-translation-trust',
      deck: 'WPH Applications',
      level: 'Portfolio',
      visualType: 'translationTrust',
      memoryHook: 'Picture each edition carrying a small trust label beside the translator credit.',
      question: 'What is a translation trust signal?',
      generalIdea: 'A trust signal is a visible indicator that tells users how reliable a piece of information is and what evidence supports it.',
      simpleExample: 'A product page might label information as verified, unverified, or disputed depending on source quality and consistency.',
      wphApplication: 'In WPH, translation trust signals can label edition-level translator attribution and translation paths as verified, unverified, or disputed based on source evidence, conflicts, and human review.'
    }
  ];

  const visualDiagrams = {
    supervisedWph: `
      <div class="visual-diagram vertical" role="img" aria-label="Book metadata flows to a known English status target, then the model learns a pattern.">
        <div class="dual-flow-row">
          <span class="visual-chip">X features</span>
          <span class="visual-chip">known y</span>
          <span class="visual-chip strong">prediction pattern</span>
        </div>
        <div class="visual-box">
          <strong>Book metadata</strong>
          <span>Original language: Danish</span>
          <span>Publisher: Gyldendal</span>
          <span>Genre: Literary fiction</span>
          <span>Translator known: Yes</span>
        </div>
        <span class="visual-arrow" aria-hidden="true">→</span>
        <div class="visual-box target">
          <strong>Known target / label</strong>
          <span>English status:</span>
          <span>Read now / Coming soon / Not yet</span>
        </div>
        <span class="visual-arrow" aria-hidden="true">→</span>
        <div class="visual-box model"><strong>Model learns pattern</strong></div>
      </div>
    `,
    classificationWph: `
      <div class="visual-diagram vertical" role="img" aria-label="A book card is classified into one of three English availability buckets.">
        <div class="dual-flow-row">
          <span class="visual-chip">input</span>
          <span class="visual-chip strong">predefined category</span>
        </div>
        <div class="visual-box book-card"><strong>Input</strong><span>book + verified metadata</span></div>
        <span class="visual-arrow" aria-hidden="true">→</span>
        <div class="visual-buckets">
          <span class="visual-bucket">Read now in English</span>
          <span class="visual-bucket">Coming soon in English</span>
          <span class="visual-bucket">Not yet in English</span>
        </div>
      </div>
    `,
    entityResolution: `
      <div class="visual-diagram vertical" role="img" aria-label="Three publisher name variants merge into one trusted publisher profile.">
        <div class="dual-flow-row">
          <span class="visual-chip">record A</span>
          <span class="visual-chip">record B</span>
          <span class="visual-chip strong">same entity?</span>
        </div>
        <div class="chip-row">
          <span class="visual-chip">Gyldendal</span>
          <span class="visual-chip">Gyldendal DK</span>
          <span class="visual-chip">Gyldendalske</span>
        </div>
        <span class="visual-arrow" aria-hidden="true">→</span>
        <div class="visual-box target"><strong>One trusted publisher profile</strong></div>
      </div>
    `,
    conflictDetection: `
      <div class="visual-diagram vertical" role="img" aria-label="Three metadata sources disagree about translator credit, creating a conflict flag for human review.">
        <div class="dual-flow-row">
          <span class="visual-chip">source 1</span>
          <span class="visual-chip">source 2</span>
          <span class="visual-chip strong">conflict?</span>
        </div>
        <div class="source-grid">
          <div class="source-card"><strong>Retailer A</strong><span>Translator = Anna Smith</span></div>
          <div class="source-card"><strong>Retailer B</strong><span>Translator = missing</span></div>
          <div class="source-card"><strong>Publisher</strong><span>Translator = Ana Smith</span></div>
        </div>
        <span class="visual-arrow" aria-hidden="true">→</span>
        <div class="visual-box review"><strong>Conflict flag</strong><span>Human review</span></div>
      </div>
    `,
    translationTrust: `
      <div class="visual-diagram vertical" role="img" aria-label="Edition information, translator credit, and source evidence produce translation trust badges.">
        <div class="trust-steps">
          <span class="visual-box">Edition</span>
          <span class="visual-arrow" aria-hidden="true">→</span>
          <span class="visual-box">Translator credit</span>
          <span class="visual-arrow" aria-hidden="true">→</span>
          <span class="visual-box">Source evidence</span>
        </div>
        <div class="trust-badges" aria-label="Trust badge options">
          <span class="trust-badge verified">Verified</span>
          <span class="trust-badge unverified">Unverified</span>
          <span class="trust-badge disputed">Disputed</span>
        </div>
      </div>
    `,
    embeddingsWph: `
      <div class="visual-diagram vertical" role="img" aria-label="A book description becomes a numeric vector that supports similar books, themes, and publisher discovery.">
        <div class="dual-flow-row">
          <span class="visual-chip">text</span>
          <span class="visual-chip">vector space</span>
          <span class="visual-chip strong">similarity</span>
        </div>
        <div class="visual-box"><strong>Book description</strong><span>text about plot, themes, country, publisher</span></div>
        <span class="visual-arrow" aria-hidden="true">→</span>
        <div class="visual-box vector"><strong>Vector</strong><code>[0.12, -0.44, 0.87]</code></div>
        <span class="visual-arrow" aria-hidden="true">→</span>
        <div class="visual-buckets">
          <span class="visual-bucket">Similar books</span>
          <span class="visual-bucket">Themes</span>
          <span class="visual-bucket">Publishers</span>
        </div>
      </div>
    `,
    modelEvaluationWph: `
      <div class="visual-diagram vertical" role="img" aria-label="Model predictions are compared with true outcomes to produce metrics and a WPH reliability check.">
        <div class="dual-flow-row">
          <span class="visual-chip">predictions</span>
          <span class="visual-chip">true outcomes</span>
          <span class="visual-chip strong">metrics</span>
        </div>
        <div class="visual-box"><strong>Model output</strong><span>availability bucket or recommendation</span></div>
        <span class="visual-arrow" aria-hidden="true">→</span>
        <div class="visual-box target"><strong>Verified metadata</strong><span>known status, translator, source evidence</span></div>
        <span class="visual-arrow" aria-hidden="true">→</span>
        <div class="visual-buckets">
          <span class="visual-bucket">accuracy</span>
          <span class="visual-bucket">precision / recall</span>
          <span class="visual-bucket">RMSE / MAE / R²</span>
        </div>
      </div>
    `
  };

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

  const renderVisual = (item) => {
    const visualMarkup = visualDiagrams[item.visualType] || visualTemplates[item.visualKey];
    const caption = item.visualCaption
      ? `<p class="visual-caption">${escapeHtml(item.visualCaption)}</p>`
      : '';
    if (visualMarkup) return `${visualMarkup}${caption}`;
    if (item.visualText) {
      return `<div class="visual-diagram" role="img" aria-label="${escapeHtml(item.visualText)}"><div class="visual-box"><strong>${escapeHtml(item.visualText)}</strong></div></div>`;
    }
    return visualTemplates.custom;
  };

  const renderAnswer = (item) => {
    if (item.generalIdea || item.simpleExample || item.wphApplication) {
      const sections = [];
      if (item.generalIdea) {
        sections.push(`<section class="answer-section"><h4>General idea</h4><p>${escapeHtml(item.generalIdea)}</p></section>`);
      }
      if (item.simpleExample) {
        sections.push(`<section class="answer-section"><h4>Simple example</h4><p>${escapeHtml(item.simpleExample)}</p></section>`);
      }
      if (item.wphApplication) {
        sections.push(`<section class="answer-section wph-answer"><h4>How it applies to WPH</h4><p>${escapeHtml(item.wphApplication)}</p></section>`);
      }
      return sections.join('');
    }
    return `<p>${escapeHtml(item.answer || '')}</p>`;
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
      answer.innerHTML = '<p>Add a custom card below or switch to another deck.</p>';
      deck.textContent = deckFilter.value === 'all' ? 'Empty' : deckFilter.value;
      level.textContent = 'Add cards';
      memory.textContent = 'Visual cue: create one small picture in your mind before checking the answer.';
      visual.innerHTML = visualTemplates.custom;
      position.textContent = 'Card 0 of 0';
      knownCount.textContent = `${knownCards.size} known`;
      progressBar.style.width = '0%';
      card.classList.add('is-flipped');
      toggleAnswer.textContent = 'Show Answer';
      hint.textContent = 'Add a card below';
      return;
    }

    const active = filteredCards[currentIndex];
    question.textContent = active.question;
    answer.innerHTML = renderAnswer(active);
    deck.textContent = active.deck;
    level.textContent = active.level || 'Study';
    memory.textContent = active.memoryHook || 'Picture the idea as a simple flow: input → process → result.';
    visual.innerHTML = renderVisual(active);
    position.textContent = `Card ${currentIndex + 1} of ${filteredCards.length}`;

    const filteredKnown = filteredCards.filter((item) => knownCards.has(item.id)).length;
    knownCount.textContent = `${filteredKnown} known`;
    progressBar.style.width = `${Math.round((filteredKnown / filteredCards.length) * 100)}%`;

    card.classList.toggle('is-flipped', isFlipped);
    toggleAnswer.textContent = isFlipped ? 'Hide Answer' : 'Show Answer';
    hint.textContent = isFlipped ? 'Answer is visible. Use “Hide Answer” below to return to the question.' : 'Click “Show Answer” below to reveal the explanation.';
    knownBtn.textContent = knownCards.has(active.id) ? 'Marked Known' : 'I Knew This';
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
