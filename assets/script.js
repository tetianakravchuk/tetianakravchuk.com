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

  const baseFlashcards = [
    {
      id: 'wph-dq-entity-resolution',
      deck: 'WPH: Data Quality',
      level: 'Portfolio',
      visualType: 'entityResolution',
      visualCue: 'Publisher variants should be reviewed before merging into one trusted entity.',
      front: 'WPH has “Penguin Random House UK” and “Penguin Books Ltd” as separate publisher entries. What ML/data problem is this?',
      back: 'Entity resolution / record linkage. Start with a heuristic baseline: normalize names, remove suffixes like Ltd/GmbH/AB, compare country, imprint, ISBN prefix, and author overlap. Use embeddings only after simple rules fail.',
      qaAngle: 'False merges are more dangerous than false splits. Merging two real publishers can permanently corrupt lineage; splitting one publisher is easier to repair.',
      projectLinkLabel: 'WPH Dataset / Publishers section',
      projectLinkHref: '../projects/world-publishing-houses-dataset/'
    },
    {
      id: 'wph-dq-language-code',
      deck: 'WPH: Data Quality',
      level: 'Portfolio',
      visualType: 'conflictDetection',
      visualCue: 'A small code casing issue can change meaning for users.',
      front: 'A book page shows “UK” as the original language for a Ukrainian work. What kind of data quality bug is this?',
      back: 'ISO/code mapping error. “uk” can mean Ukrainian as a language code, but “UK” visually reads as United Kingdom. The UI must distinguish language codes from country codes.',
      qaAngle: 'Test language labels with real examples, especially Ukrainian, Norwegian Bokmål, Danish, Icelandic, and English. Check that backend codes render as human-readable names.',
      projectLinkLabel: 'WPH QA / Trust section',
      projectLinkHref: 'world-publishing-houses.html'
    },
    {
      id: 'wph-dq-translator-conflict',
      deck: 'WPH: Data Quality',
      level: 'Portfolio',
      visualType: 'translationTrust',
      visualCue: 'Conflicting translator metadata needs provenance, not silent overwrite.',
      front: 'Two sources disagree about the translator of the same book edition. What should the system do?',
      back: 'Store conflicting attribution with source provenance instead of overwriting one value. Mark the translator field as verified, unverified, or disputed.',
      qaAngle: 'Never silently collapse conflicting metadata. A QA test should verify that disputed records show a warning and source trail.',
      projectLinkLabel: 'WPH Translation Trust section',
      projectLinkHref: 'world-publishing-houses.html'
    },
    {
      id: 'wph-dq-count-mismatch',
      deck: 'WPH: Data Quality',
      level: 'Portfolio',
      visualKey: 'qa-gates',
      visualCue: 'Hero metrics and rendered content must agree under the same filters.',
      front: 'A WPH country page has 0 translations in the hero but translation cards lower on the page. What type of bug is this?',
      back: 'Metric-content mismatch. Aggregated counts and visible page content are being calculated from different sources or filters.',
      qaAngle: 'Add regression tests comparing hero counts against rendered module counts for the same country/month/filter.',
      projectLinkLabel: 'WPH Country Page QA',
      projectLinkHref: 'world-publishing-houses.html'
    },
    {
      id: 'wph-ml-rights-ranking',
      deck: 'WPH: ML Applications',
      level: 'Portfolio',
      visualType: 'modelEvaluationWph',
      visualCue: 'A rights watchlist model should support decisions, not replace editorial judgment.',
      front: 'How could WPH predict which untranslated books may be good candidates for English translation?',
      back: 'A ranking model could use awards, publisher activity, author visibility, prior translations, genre, country momentum, and similar-title signals.',
      qaAngle: 'The model should be decision-support only. Test for over-ranking already famous markets and under-ranking smaller-language authors.',
      projectLinkLabel: 'WPH Rights Watchlist',
      projectLinkHref: '../projects/world-publishing-houses-dataset/'
    },
    {
      id: 'wph-ml-publisher-clusters',
      deck: 'WPH: ML Applications',
      level: 'Portfolio',
      visualType: 'embeddingsWph',
      visualCue: 'Embeddings can group publishers, but clusters still need human-readable reasons.',
      front: 'How could embeddings help WPH organize publishers?',
      back: 'Publisher descriptions, catalogs, genres, and author lists could be embedded and clustered to reveal similar publishers or market niches.',
      qaAngle: 'Clusters must be explainable. QA should check whether clusters make editorial sense, not just mathematical sense.',
      projectLinkLabel: 'WPH Publisher Intelligence',
      projectLinkHref: 'world-publishing-houses.html'
    },
    {
      id: 'wph-ml-reader-buckets',
      deck: 'WPH: ML Applications',
      level: 'Portfolio',
      visualType: 'classificationWph',
      visualCue: 'Reader-facing availability buckets are high-trust labels.',
      front: 'How could WPH classify books into reader buckets?',
      back: 'A classifier or rule-based system could assign: “Read now in English,” “Coming soon in English,” or “Not yet in English” based on release and translation metadata.',
      qaAngle: 'Bucket assignment is user-facing and high trust. Test edge cases where rights are acquired but no release date exists.',
      projectLinkLabel: 'WPH Reader Mode',
      projectLinkHref: 'world-publishing-houses.html'
    },
    {
      id: 'wph-ml-recommendation-baseline',
      deck: 'WPH: ML Applications',
      level: 'Portfolio',
      visualKey: 'split',
      visualCue: 'Transparent rules are the baseline before claiming ML adds value.',
      front: 'What is the simplest baseline before using ML for WPH recommendations?',
      back: 'A rules-based baseline: prioritize verified English availability, recent awards, active publishers, known translators, and recent market events.',
      qaAngle: 'Always compare ML suggestions against a transparent rule-based baseline before claiming the model adds value.',
      projectLinkLabel: 'WPH Recommendation Logic',
      projectLinkHref: 'world-publishing-houses.html'
    },
    {
      id: 'capstone-r2-production',
      deck: 'Capstone: Model Validation',
      level: 'ML QA',
      visualKey: 'r2',
      visualCue: 'R² around 0.517 is useful signal, not production appraisal confidence.',
      front: 'The housing model has R² ≈ 0.517. Is that good enough for production appraisal?',
      back: 'No. It shows meaningful signal, but it is not strong enough for high-stakes valuation without more validation, feature engineering, fairness checks, and monitoring.',
      qaAngle: 'A QA-minded model review asks: where does it fail, for whom, and under what market conditions?',
      projectLinkLabel: 'Capstone Results',
      projectLinkHref: 'data-science.html#housing'
    },
    {
      id: 'capstone-rmse-risk',
      deck: 'Capstone: Model Validation',
      level: 'ML QA',
      visualKey: 'rmse',
      visualCue: 'RMSE makes large valuation mistakes more visible.',
      front: 'Why is RMSE useful in the property-value capstone?',
      back: 'RMSE penalizes large prediction errors more heavily, which matters when expensive valuation mistakes are risky.',
      qaAngle: 'Also inspect MAE and residuals. A model can have acceptable average error but still fail badly on expensive homes or specific regions.',
      projectLinkLabel: 'Capstone Metrics',
      projectLinkHref: 'data-science.html#housing'
    },
    {
      id: 'capstone-naive-baseline',
      deck: 'Capstone: Model Validation',
      level: 'ML QA',
      visualKey: 'split',
      visualCue: 'A simple baseline keeps model claims honest.',
      front: 'Why add a naive mean-prediction baseline?',
      back: 'A baseline shows whether the ML model improves over a simple non-ML approach. Without it, model metrics lack context.',
      qaAngle: 'Every model evaluation should include at least one simple baseline before claiming success.',
      projectLinkLabel: 'Capstone Model Comparison',
      projectLinkHref: 'data-science.html#housing'
    },
    {
      id: 'capstone-location-fairness',
      deck: 'Capstone: Model Validation',
      level: 'ML QA',
      visualKey: 'edge-cases',
      visualCue: 'Location can act as a proxy feature and create uneven error patterns.',
      front: 'Why can location features create fairness risk?',
      back: 'Latitude, longitude, region, and ZIP-like fields can proxy socioeconomic patterns. The model may learn historical inequality rather than property value alone.',
      qaAngle: 'Test error rates by region, price band, and property type. Require fairness review before production use.',
      projectLinkLabel: 'Capstone Ethics Lens',
      projectLinkHref: 'data-science.html#model-validation'
    },
    {
      id: 'qa-ml-vs-software',
      deck: 'QA for ML',
      level: 'ML QA',
      visualKey: 'qa-gates',
      visualCue: 'ML QA checks model behavior, not just whether code executes.',
      front: 'How is testing an ML model different from testing normal software?',
      back: 'Traditional software has expected outputs. ML systems produce probabilistic outputs, so QA must validate data, metrics, drift, edge cases, and failure patterns.',
      qaAngle: 'A passing unit test does not mean the model is trustworthy. Model QA needs statistical and production checks.',
      projectLinkLabel: 'ML QA Case Study',
      projectLinkHref: 'data-science.html#model-validation'
    },
    {
      id: 'qa-ml-golden-dataset',
      deck: 'QA for ML',
      level: 'ML QA',
      visualKey: 'qa-gates',
      visualCue: 'A small trusted dataset can catch behavior regressions over time.',
      front: 'What is a golden dataset?',
      back: 'A small, trusted dataset with verified labels or expected outcomes used to test model behavior over time.',
      qaAngle: 'Golden datasets help catch regressions when retraining or changing features.',
      projectLinkLabel: 'QA for ML',
      projectLinkHref: 'data-science.html#model-validation'
    },
    {
      id: 'qa-ml-data-drift',
      deck: 'QA for ML',
      level: 'ML QA',
      visualKey: 'edge-cases',
      visualCue: 'Production data can move away from the training distribution.',
      front: 'What is data drift?',
      back: 'Data drift happens when production data changes from the training data distribution.',
      qaAngle: 'Monitor input distributions, prediction errors, and business conditions. Housing data is especially drift-prone because markets change.',
      projectLinkLabel: 'Capstone Monitoring',
      projectLinkHref: 'data-science.html#model-validation'
    },
    {
      id: 'qa-ml-release-checklist',
      deck: 'QA for ML',
      level: 'ML QA',
      visualKey: 'qa-gates',
      visualCue: 'Release readiness means the model is understood, monitored, and bounded by use case.',
      front: 'What should be checked before releasing an ML model?',
      back: 'Baseline comparison, validation split, data quality, fairness review, residual analysis, monitoring plan, rollback plan, and documentation.',
      qaAngle: 'Release readiness for ML is not just “model runs.” It is “model is understood, monitored, and safe enough for its use case.”',
      projectLinkLabel: 'ML QA Checklist',
      projectLinkHref: 'data-science.html#model-validation'
    },
    {
      id: 'fundamentals-supervised-learning',
      deck: 'Fundamentals for Study',
      level: 'Foundation',
      visualType: 'supervisedWph',
      visualCue: 'X features plus known y teach the model a prediction pattern.',
      front: 'What is supervised learning?',
      back: 'Supervised learning is a machine learning approach where a model learns from labeled examples: input features X and a known correct output y.',
      qaAngle: 'Check label quality before trusting model quality. Bad labels can make a model look systematic while learning the wrong pattern.',
      projectLinkLabel: 'ML Validation Case Study',
      projectLinkHref: 'data-science.html#housing'
    },
    {
      id: 'fundamentals-train-test',
      deck: 'Fundamentals for Study',
      level: 'Foundation',
      visualKey: 'split',
      visualCue: 'Holdout data is the model’s first reality check.',
      front: 'Why do we split data into training and test sets?',
      back: 'A train/test split separates data used to train the model from data used to evaluate whether the model generalizes to unseen examples.',
      qaAngle: 'Document the split and watch for leakage. If the same entity appears in both sets, the test result may be too optimistic.',
      projectLinkLabel: 'Capstone Model Comparison',
      projectLinkHref: 'data-science.html#housing'
    },
    {
      id: 'fundamentals-rmse-mae',
      deck: 'Fundamentals for Study',
      level: 'Foundation',
      visualKey: 'mae',
      visualCue: 'RMSE highlights large errors; MAE explains average absolute error.',
      front: 'Why compare RMSE and MAE?',
      back: 'RMSE penalizes large errors more strongly, while MAE is easier to interpret as average absolute error.',
      qaAngle: 'Use both metrics to find whether a model has broad average error or a smaller number of severe failures.',
      projectLinkLabel: 'Capstone Metrics',
      projectLinkHref: 'data-science.html#housing'
    },
    {
      id: 'fundamentals-embeddings',
      deck: 'Fundamentals for Study',
      level: 'Foundation',
      visualType: 'embeddingsWph',
      visualCue: 'Embeddings compare meaning, but similarity still needs product validation.',
      front: 'What are embeddings?',
      back: 'Embeddings are numeric vector representations of text, images, or other data that help computers compare similarity in vector space.',
      qaAngle: 'Test whether similar items are useful to the user, not just close in the embedding space.',
      projectLinkLabel: 'WPH Publisher Intelligence',
      projectLinkHref: 'world-publishing-houses.html'
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
    if (item.front || item.back || item.qaAngle || item.projectLinkLabel) {
      const sections = [];
      if (item.back) {
        sections.push(`<section class="answer-section"><h4>Applied Example</h4><p>${escapeHtml(item.back)}</p></section>`);
      }
      if (item.qaAngle) {
        sections.push(`<section class="answer-section qa-angle"><h4>QA Angle</h4><p>${escapeHtml(item.qaAngle)}</p></section>`);
      }
      if (item.projectLinkLabel && item.projectLinkHref) {
        sections.push(`<section class="answer-section project-connection"><h4>Project Connection</h4><p><a href="${escapeHtml(item.projectLinkHref)}">${escapeHtml(item.projectLinkLabel)}</a></p></section>`);
      }
      return sections.join('');
    }
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
    customCards: 'tkPortfolioCustomFlashcards'
  };

  const getCustomCards = () => {
    try { return JSON.parse(localStorage.getItem(storageKeys.customCards) || '[]'); }
    catch { return []; }
  };

  const setCustomCards = (cards) => localStorage.setItem(storageKeys.customCards, JSON.stringify(cards));

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
  const toggleAnswer = el('[data-toggle-answer]');
  const showProjectBtn = el('[data-show-project]');
  const prevBtn = el('[data-prev-card]');
  const nextBtn = el('[data-next-card]');
  const authorToggle = el('[data-author-toggle]');
  const authorPanel = el('[data-author-panel]');
  const addForm = el('[data-add-card-form]');
  const newQuestion = el('[data-new-question]');
  const newAnswer = el('[data-new-answer]');
  const newDeck = el('[data-new-deck]');
  const newMemory = el('[data-new-memory]');
  const formMessage = el('[data-form-message]');
  const clearCustomBtn = el('[data-clear-custom]');

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
      answer.innerHTML = '<p>Choose another deck to continue exploring applied ML and QA examples.</p>';
      deck.textContent = deckFilter.value === 'all' ? 'Empty' : deckFilter.value;
      level.textContent = 'Add cards';
      memory.textContent = 'Visual cue: create one small picture in your mind before checking the answer.';
      visual.innerHTML = visualTemplates.custom;
      position.textContent = 'Card 0 of 0';
      card.classList.add('is-flipped');
      toggleAnswer.textContent = 'Show QA Angle';
      hint.textContent = 'Add a card below';
      return;
    }

    const active = filteredCards[currentIndex];
    question.textContent = active.front || active.question;
    answer.innerHTML = renderAnswer(active);
    deck.textContent = active.deck;
    level.textContent = active.level || 'Study';
    memory.textContent = active.visualCue || active.memoryHook || 'Visual cue: connect the concept to a product failure mode or validation check.';
    visual.innerHTML = renderVisual(active);
    position.textContent = `Card ${currentIndex + 1} of ${filteredCards.length}`;

    card.classList.toggle('is-flipped', isFlipped);
    toggleAnswer.textContent = isFlipped ? 'Hide Answer' : 'Show QA Angle';
    hint.textContent = isFlipped ? 'Answer, QA angle, and project connection are visible.' : 'Click “Show QA Angle” below to reveal the answer, QA angle, and project connection.';
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
  if (showProjectBtn) {
    showProjectBtn.addEventListener('click', () => {
      isFlipped = true;
      renderCard();
      answer.querySelector('.project-connection')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }
  prevBtn.addEventListener('click', () => moveCard(-1));
  nextBtn.addEventListener('click', () => moveCard(1));
  if (authorToggle && authorPanel) {
    authorToggle.addEventListener('click', () => {
      const isHidden = authorPanel.hidden;
      authorPanel.hidden = !isHidden;
      authorToggle.setAttribute('aria-expanded', String(isHidden));
    });
  }

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
      front: q,
      back: a,
      qaAngle: 'Custom author-mode card. Add a QA angle before publishing this card.',
      projectLinkLabel: 'Portfolio project',
      projectLinkHref: 'projects.html'
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
