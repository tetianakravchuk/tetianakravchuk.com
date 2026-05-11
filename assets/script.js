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
            ['Nordic countries', summary.pilotCountries.length, 'Denmark, Iceland, Norway, Sweden, and Finland.'],
            ['Works', summary.works, 'Books and works represented across the Nordic dataset.'],
            ['Publishers', summary.publishers, 'Publisher and imprint records across Nordic markets.'],
            ['Translation records', summary.translationRecords, 'Translation records with attribution and availability fields.'],
            ['Events', summary.events, 'Release, award, market, and publishing signal events.'],
            ['Rights-watchlist rows', summary.rightsSignals, 'Rights and acquisition signals for professional workflows.']
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

  const explorerRoot = document.querySelector('[data-wph-explorer]');
  if (explorerRoot) {
    const panel = explorerRoot.querySelector('[data-explorer-panel]');
    const tabButtons = Array.from(explorerRoot.querySelectorAll('[data-explorer-tab]'));
    const source = explorerRoot.dataset.source || '../../assets/data/wph-dataset-summary.json';
    let activeTab = 'explore';
    let explorerData = null;
    let filters = { country: 'all', verificationStatus: 'all', readerBucket: 'all' };
    const plannedCountries = [];

    const aggregate = {
      totalWorks: 70,
      countries: { Denmark: 'Nordic dataset', Iceland: 'Nordic dataset', Norway: 'Nordic dataset', Sweden: 'Nordic dataset', Finland: 'Nordic dataset' },
      readerBuckets: {
        'Read now in English': 'Review in dataset',
        'Not yet confirmed': 'Review in dataset',
        'Coming soon': 'Review in dataset'
      },
      verificationStatus: {
        verified_public_source: 'Tracked in source register',
        curated_needs_check: 'Tracked in source register'
      },
      translationLag: { min: 1, median: 3, mean: 9.2, max: 88 },
      translationPath: { Direct: 52, Unknown: 3 }
    };

    const statusClass = (status) => status.toLowerCase();

    const renderDistribution = (items) => Object.entries(items).map(([label, value]) => `
      <div class="table-row">
        <strong>${escapeHtml(label)}</strong>
        <span>${typeof value === 'number' ? `${escapeHtml(value)} records` : escapeHtml(value)}</span>
      </div>
    `).join('');

    const renderCheck = ({ status, title, detail, why }) => `
      <article class="quality-check ${statusClass(status)}">
        <span class="status-pill ${statusClass(status)}">${escapeHtml(status)}</span>
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(detail)}</p>
        <p class="small-note"><strong>Why it matters:</strong> ${escapeHtml(why)}</p>
      </article>
    `;

    const filteredRows = () => {
      const rows = explorerData?.sampleRows || [];
      return rows.filter((row) => {
        const readerBucket = row.readerBucket === 'Coming soon in English' ? 'Coming soon' : row.readerBucket;
        const countryOk = filters.country === 'all' || row.country === filters.country;
        const verificationOk = filters.verificationStatus === 'all' || row.verificationStatus === filters.verificationStatus;
        const bucketOk = filters.readerBucket === 'all' || readerBucket === filters.readerBucket;
        return countryOk && verificationOk && bucketOk;
      });
    };

    const selectedCountryIsPlanned = () => plannedCountries.includes(filters.country);

    const selectMarkup = (label, name, options) => `
      <label class="field-label">${escapeHtml(label)}
        <select class="input" data-explorer-filter="${escapeHtml(name)}">
          ${options.map((option) => `<option value="${escapeHtml(option.value)}"${filters[name] === option.value ? ' selected' : ''}>${escapeHtml(option.label)}</option>`).join('')}
        </select>
      </label>
    `;

    const renderExplore = () => {
      const rows = filteredRows();
      const plannedMessage = selectedCountryIsPlanned()
        ? `<p class="small-note"><strong>${escapeHtml(filters.country)}:</strong> This country is included in the Nordic scope but has limited embedded preview rows on this page.</p>`
        : '';
      return `
        <div class="explorer-grid">
          <article>
            <h3>Dataset Summary</h3>
            <div class="grid-3 compact-stats">
              <div class="mini-stat"><strong>5</strong><span>Nordic countries</span></div>
              <div class="mini-stat"><strong>${aggregate.totalWorks}</strong><span>Total works</span></div>
              <div class="mini-stat"><strong>6 of 70</strong><span>Preview records shown</span></div>
            </div>
            <div class="table-like">
              <div class="table-row"><strong>Nordic scope</strong><span>Denmark, Iceland, Norway, Sweden, Finland</span></div>
              <div class="table-row"><strong>Reader bucket distribution</strong><span>Tracked for ML-readiness and class-balance review</span></div>
              <div class="table-row"><strong>Verification status</strong><span>Tracked through verified_public_source and curated_needs_check values</span></div>
              <div class="table-row"><strong>Translation lag</strong><span>Min ${aggregate.translationLag.min}, median ${aggregate.translationLag.median}, mean ${aggregate.translationLag.mean}, max ${aggregate.translationLag.max} years</span></div>
            </div>
          </article>
          <article>
            <h3>Distributions</h3>
            <div class="table-like">${renderDistribution(aggregate.countries)}${renderDistribution(aggregate.readerBuckets)}${renderDistribution(aggregate.verificationStatus)}</div>
          </article>
        </div>
        <div class="explorer-filters">
          ${selectMarkup('Country', 'country', [{ value: 'all', label: 'All Nordic' }, { value: 'Denmark', label: 'Denmark' }, { value: 'Iceland', label: 'Iceland' }, { value: 'Norway', label: 'Norway' }, { value: 'Sweden', label: 'Sweden' }, { value: 'Finland', label: 'Finland' }])}
          ${selectMarkup('Verification Status', 'verificationStatus', [{ value: 'all', label: 'All statuses' }, { value: 'verified_public_source', label: 'verified_public_source' }, { value: 'curated_needs_check', label: 'curated_needs_check' }])}
          ${selectMarkup('Reader Bucket', 'readerBucket', [{ value: 'all', label: 'All buckets' }, { value: 'Read now in English', label: 'Read now in English' }, { value: 'Not yet confirmed', label: 'Not yet confirmed' }, { value: 'Coming soon', label: 'Coming soon' }])}
        </div>
        ${plannedMessage}
        <p class="small-note">Prototype preview table: showing ${rows.length} filtered preview records from the embedded 6-row sample, out of 70 total works.</p>
        <div class="responsive-table"><table><thead><tr><th>Country</th><th>Work</th><th>Author</th><th>Publisher</th><th>Reader Bucket</th><th>Verification</th><th>Rights Signal</th></tr></thead><tbody>
          ${rows.map((row) => `<tr><td>${escapeHtml(row.country)}</td><td>${escapeHtml(row.workTitle)}</td><td>${escapeHtml(row.author)}</td><td>${escapeHtml(row.publisher)}</td><td>${escapeHtml(row.readerBucket)}</td><td><span class="status-pill ${row.verificationStatus === 'verified_public_source' ? 'verified' : 'needs-check'}">${escapeHtml(row.verificationStatus)}</span></td><td>${escapeHtml(row.rightsSignal)}</td></tr>`).join('') || `<tr><td colspan="7">${selectedCountryIsPlanned() ? `${escapeHtml(filters.country)} has limited embedded preview rows on this page.` : 'No preview rows match the selected filters.'}</td></tr>`}
        </tbody></table></div>
      `;
    };

    const renderQuality = () => {
      const checks = [
        { status: 'Pass', title: 'Missing required fields', detail: 'The preview rows include country, work title, author, publisher, language, reader bucket, and verification status.', why: 'Required-field checks prevent broken cards, empty filters, and misleading dataset summaries.' },
        { status: 'Warning', title: 'Verification coverage', detail: 'Rows are separated by verified_public_source and curated_needs_check status.', why: 'Records needing review should keep visible provenance in analysis and UI.' },
        { status: 'Warning', title: 'Translation path cardinality', detail: 'Translation-path values should be checked for enough variation before training.', why: 'A near-constant categorical feature will not teach a model much and should be flagged before training.' },
        { status: 'Warning', title: 'Reader bucket imbalance', detail: 'Reader-bucket distribution should be checked before modeling.', why: 'A classifier can look accurate while ignoring minority classes.' },
        { status: 'Warning', title: 'Outlier translation lag', detail: 'Translation lag ranges from 1 to 88 years, with a median of 3 and a mean of 9.2.', why: 'Outliers can distort averages and should be reviewed before summary reporting.' },
        { status: 'Warning', title: 'Country coverage', detail: 'The current scope covers the Nordic region: Denmark, Iceland, Norway, Sweden, and Finland.', why: 'Model scope should still be documented before applying predictions outside the represented region.' }
      ];
      return `<div class="quality-grid">${checks.map(renderCheck).join('')}</div>`;
    };

    const renderReadiness = () => {
      const checks = [
        { status: 'Fail', title: 'Sample size', detail: '70 works is still too small for reliable supervised model evaluation.', why: 'A small holdout set can make accuracy unstable and overstate model confidence.' },
        { status: 'Warning', title: 'Class balance', detail: 'Reader-bucket balance needs review before classifier training.', why: 'Accuracy is misleading when one class dominates the target.' },
        { status: 'Warning', title: 'Minority class count', detail: 'Minority reader buckets need enough examples for precision and recall estimates.', why: 'Small minority classes can make model evaluation unreliable.' },
        { status: 'Warning', title: 'Feature cardinality', detail: 'translation_path should be reviewed for enough variation before modeling.', why: 'Low-variation features add little predictive signal and can create false confidence.' },
        { status: 'Warning', title: 'Verification coverage', detail: 'Training rows should preserve verified_public_source or curated_needs_check status.', why: 'Training data quality should be disclosed and reviewed before model claims.' },
        { status: 'Warning', title: 'Scope/domain coverage', detail: 'Current scope is Nordic: Denmark, Iceland, Norway, Sweden, and Finland.', why: 'Predictions outside the represented region should return a warning or be blocked.' }
      ];
      return `
        <div class="readiness-summary">
          <span class="status-pill fail">Prototype / Not production-ready</span>
          <p>The current dataset is suitable for exploratory analysis, metadata QA, trust/provenance design, and dashboard prototyping. Predictive ML should wait until the dataset has broader country coverage, more negative examples, and stronger class balance.</p>
        </div>
        <div class="quality-grid">${checks.map(renderCheck).join('')}</div>
      `;
    };

    const renderExplorer = () => {
      if (!panel) return;
      panel.innerHTML = activeTab === 'quality'
        ? renderQuality()
        : activeTab === 'readiness'
          ? renderReadiness()
          : renderExplore();
      panel.querySelectorAll('[data-explorer-filter]').forEach((filter) => {
        filter.addEventListener('change', () => {
          filters[filter.dataset.explorerFilter] = filter.value;
          renderExplorer();
        });
      });
    };

    tabButtons.forEach((button) => {
      button.addEventListener('click', () => {
        activeTab = button.dataset.explorerTab;
        tabButtons.forEach((tab) => {
          const isActive = tab === button;
          tab.classList.toggle('active', isActive);
          tab.setAttribute('aria-selected', String(isActive));
        });
        renderExplorer();
      });
    });

    fetch(source)
      .then((response) => {
        if (!response.ok) throw new Error('Dataset explorer unavailable');
        return response.json();
      })
      .then((data) => {
        explorerData = data;
        renderExplorer();
      })
      .catch(() => {
        if (panel) panel.innerHTML = '<p>Dataset explorer could not load. The static case study summary remains available on this page.</p>';
      });
  }

  const flashcardRoot = document.querySelector('[data-flashcards]');
  if (!flashcardRoot) return;

  const baseFlashcards = [
    {
      id: 'wph-readiness-class-imbalance',
      deck: 'WPH Dataset Readiness',
      level: 'Level 4: Failure Case',
      visualKey: 'classification',
      visualCue: 'A majority bucket can make a weak classifier look accurate.',
      front: 'WPH has 70 works across the Nordic dataset. You want to train a classifier to predict whether a book will reach English readers. What is the immediate validation risk?',
      back: 'The immediate risk is class imbalance and small sample size. A model can look accurate if most records fall into the same reader bucket, even when it learns little about the minority cases. Accuracy is the wrong metric by itself; precision, recall, and minority-class counts matter more.',
      qaAngle: 'This is a data quality and validation problem before it is a modeling problem. An ML QA review should check class balance before training and flag the dataset if minority classes are too small to support meaningful evaluation.',
      projectLinkLabel: 'wph_works.csv → reader_bucket value counts',
      projectLinkHref: '../projects/world-publishing-houses-dataset/#dataset-explorer'
    },
    {
      id: 'wph-readiness-small-holdout',
      deck: 'WPH Dataset Readiness',
      level: 'Level 4: Failure Case',
      visualKey: 'split',
      visualCue: 'With only 11 test rows, one row changes accuracy by about 9 points.',
      front: 'You split the WPH dataset, n=70, into an 80/20 train/test split. A Random Forest gives high test accuracy. Should this be presented as a strong model result?',
      back: 'Not as a performance claim. A 20% test set on 70 rows has only 14 examples, so one record can move accuracy by about 7 percentage points. The better portfolio framing is that the dataset is still too small for a reliable holdout evaluation and should be discussed as an ML-readiness case.',
      qaAngle: '“It ran without errors” is not the same as validation. A QA-minded review asks whether the test set is large enough to detect meaningful performance differences.',
      projectLinkLabel: 'wph_works.csv row count',
      projectLinkHref: '../projects/world-publishing-houses-dataset/#dataset-explorer'
    },
    {
      id: 'wph-readiness-lag-tail',
      deck: 'WPH Dataset Readiness',
      level: 'Level 4: Failure Case',
      visualKey: 'rmse',
      visualCue: 'A long right tail means the average alone does not tell the full story.',
      front: 'WPH translation lag ranges from 1 to 88 years, with a median of 3 and a mean of 9.2. What does the gap between median and mean tell you?',
      back: 'The distribution has a long right tail. Most books reach English readers relatively quickly, but a few are translated decades later because of rediscovery, classics, awards, or posthumous interest. A histogram or boxplot is more honest than a single average.',
      qaAngle: 'Reporting only the mean would be misleading. Data quality review should inspect distributions before summarizing them, especially when outliers change the story.',
      projectLinkLabel: 'wph_works.csv → english_publication_year minus original_publication_year',
      projectLinkHref: '../projects/world-publishing-houses-dataset/#dataset-explorer'
    },
    {
      id: 'wph-readiness-provenance',
      deck: 'WPH Trust & Provenance',
      level: 'Level 4: Failure Case',
      visualType: 'translationTrust',
      visualCue: 'Trust metadata should travel with model inputs and outputs.',
      front: 'WPH separates records by verification level, including verified_public_source and curated_needs_check. What should happen if these rows are used for ML?',
      back: 'The model should not treat all rows as equally trustworthy without disclosure. Options include training only on verified rows, using verification status as a feature, or weighting verified rows more heavily. The wrong choice is mixing verified and unverified rows silently.',
      qaAngle: 'Provenance must travel with predictions. If nearly half the training data needs review, the model card and any prediction output should make that limitation visible.',
      projectLinkLabel: 'wph_works.csv → verification_status',
      projectLinkHref: '../projects/world-publishing-houses-dataset/#dataset-explorer'
    },
    {
      id: 'wph-readiness-feature-variation',
      deck: 'WPH Feature Readiness',
      level: 'Level 4: Failure Case',
      visualKey: 'qa-gates',
      visualCue: 'A feature can exist in the schema and still have too little variation to learn from.',
      front: 'WPH has a translation_path field, but the values may have limited variation. You want to build a feature called is_pivot_translation. What should you check first?',
      back: 'First, check cardinality and value distribution. The schema can support pivot-translation analysis, but the model cannot learn that behavior unless the dataset contains enough examples of different translation paths.',
      qaAngle: 'Schema completeness is not the same as data completeness. Every categorical feature should get a cardinality check before training. Constant or near-constant features should be flagged or dropped.',
      projectLinkLabel: 'wph_works.csv and wph_translations.csv → translation_path',
      projectLinkHref: '../projects/world-publishing-houses-dataset/#dataset-explorer'
    },
    {
      id: 'wph-readiness-domain-scope',
      deck: 'WPH Scope & Generalization',
      level: 'Level 4: Failure Case',
      visualKey: 'edge-cases',
      visualCue: 'A two-country pilot should not claim full Nordic prediction coverage.',
      front: 'WPH covers a Nordic dataset scope: Denmark, Iceland, Norway, Sweden, and Finland. Can a model trained on this predict translation likelihood for any European book?',
      back: 'No. The supported domain is Nordic publishing data. A Portuguese, Romanian, Polish, or Greek book would be outside the represented scope unless the dataset is expanded and validated for those markets.',
      qaAngle: 'Every model needs a domain of validity. Predictions outside the represented scope should return a warning or be blocked rather than presented as reliable scores.',
      projectLinkLabel: 'wph_countries.csv and wph_works.csv → country_iso distribution',
      projectLinkHref: '../projects/world-publishing-houses-dataset/#dataset-explorer'
    },
    {
      id: 'wph-dq-entity-resolution',
      deck: 'WPH Feature Readiness',
      level: 'Level 4: Failure Case',
      visualType: 'entityResolution',
      visualCue: 'Publisher variants should be reviewed before merging into one trusted entity.',
      front: 'WPH has “Penguin Random House UK” and “Penguin Books Ltd” as separate publisher entries. What ML/data problem is this?',
      back: 'This is entity resolution, also called record linkage. A simple baseline would normalize publisher names, remove legal suffixes like Ltd or AB, compare country and imprint information, and check overlap in authors or ISBN prefixes before using heavier ML methods.',
      qaAngle: 'False merges are more dangerous than false splits. Merging two real publishers can permanently corrupt lineage and attribution, while splitting one publisher into two records is usually easier to detect and repair.',
      projectLinkLabel: 'WPH Dataset — Publishers',
      projectLinkHref: '../projects/world-publishing-houses-dataset/#publishers'
    },
    {
      id: 'wph-dq-language-code',
      deck: 'WPH Feature Readiness',
      level: 'Level 4: Failure Case',
      visualType: 'conflictDetection',
      visualCue: 'A small code casing issue can change meaning for users.',
      front: 'A book page shows “UK” as the original language for a Ukrainian work. What kind of data quality bug is this?',
      back: 'This is a code-mapping and display-label bug. The ISO language code “uk” means Ukrainian, but visually “UK” reads as United Kingdom. The system needs to distinguish language codes from country codes and render human-readable labels.',
      qaAngle: 'This is exactly the kind of bug QA should catch with real multilingual test data. I would test Ukrainian, Norwegian Bokmål, Danish, Icelandic, and English examples to make sure backend codes display correctly in the UI.',
      projectLinkLabel: 'WPH Trust & Verification',
      projectLinkHref: '../projects/world-publishing-houses-dataset/#trust'
    },
    {
      id: 'wph-dq-translator-conflict',
      deck: 'WPH Trust & Provenance',
      level: 'Level 4: Failure Case',
      visualType: 'translationTrust',
      visualCue: 'Conflicting translator metadata needs provenance, not silent overwrite.',
      front: 'Two sources disagree about the translator of the same book edition. What should the system do?',
      back: 'The system should not overwrite one value silently. It should store both claims with source provenance and mark the translator attribution as verified, unverified, or disputed.',
      qaAngle: 'Conflicting metadata is not just a content issue; it is a trust issue. I would test that disputed records show a visible warning, source trail, and no false verified badge.',
      projectLinkLabel: 'WPH Translation Trust',
      projectLinkHref: '../projects/world-publishing-houses-dataset/#translations'
    },
    {
      id: 'wph-dq-count-mismatch',
      deck: 'WPH Feature Readiness',
      level: 'Level 4: Failure Case',
      visualKey: 'qa-gates',
      visualCue: 'Hero metrics and rendered content must agree under the same filters.',
      front: 'A WPH country page has 0 translations in the hero but translation cards lower on the page. What type of bug is this?',
      back: 'This is a metric-content mismatch. The aggregate count and the visible module are likely using different filters, data sources, or month logic.',
      qaAngle: 'I would add regression checks comparing hero counts against rendered module counts for the same country, month, and view mode. If the page says 0, the user should not see contradictory records below.',
      projectLinkLabel: 'WPH Country Page QA',
      projectLinkHref: '../projects/world-publishing-houses-dataset/#dashboard'
    },
    {
      id: 'wph-dq-availability-confidence',
      deck: 'WPH Trust & Provenance',
      level: 'Level 4: Failure Case',
      visualType: 'classificationWph',
      visualCue: 'Reader-facing availability labels need source evidence.',
      front: 'A book is listed as “Coming soon in English,” but there is no release date or publisher source. What should happen?',
      back: 'The system should downgrade the confidence level. It can show the item as a potential signal, but it should not present it as a confirmed upcoming English release without source evidence.',
      qaAngle: 'Reader-facing labels need stricter standards than internal research notes. I would test that uncertain records appear as unverified signals, not confirmed availability.',
      projectLinkLabel: 'WPH Reader Mode',
      projectLinkHref: '../projects/world-publishing-houses-dataset/#reader-professional'
    },
    {
      id: 'wph-dq-evidence-levels',
      deck: 'WPH Trust & Provenance',
      level: 'Level 4: Failure Case',
      visualType: 'translationTrust',
      visualCue: 'Verified rows and curated research leads should never share the same trust badge.',
      front: 'Why should WPH separate verified public-source rows from curated demonstration rows?',
      back: 'Because the product depends on trust. Verified rows can support user-facing claims, while curated rows are useful for prototyping, demos, and schema testing but need manual review before production use.',
      qaAngle: 'A data product should make uncertainty visible. I would test that curated_needs_check records never receive the same trust badge as verified_public_source records.',
      projectLinkLabel: 'WPH Source Register',
      projectLinkHref: '../projects/world-publishing-houses-dataset/#verification'
    },
    {
      id: 'wph-ml-rights-ranking',
      deck: 'WPH Scope & Generalization',
      level: 'Level 3: Applied Reasoning',
      visualType: 'modelEvaluationWph',
      visualCue: 'A rights watchlist model should support decisions, not replace editorial judgment.',
      front: 'How could WPH predict which untranslated books may be good candidates for English translation?',
      back: 'A ranking model could use awards, publisher activity, author visibility, prior translation history, genre, market events, country momentum, and similar-title signals.',
      qaAngle: 'This should be decision-support, not an automatic truth engine. I would test whether the model over-ranks already famous markets and under-ranks smaller-language authors or publishers.',
      projectLinkLabel: 'WPH Rights Watchlist',
      projectLinkHref: '../projects/world-publishing-houses-dataset/#rights'
    },
    {
      id: 'wph-ml-publisher-clusters',
      deck: 'WPH Feature Readiness',
      level: 'Level 3: Applied Reasoning',
      visualType: 'embeddingsWph',
      visualCue: 'Embeddings can group publishers, but clusters still need human-readable reasons.',
      front: 'How could embeddings help WPH organize publishers?',
      back: 'Publisher descriptions, catalogs, genres, author lists, and rights activity could be embedded and clustered to identify similar publishers or market niches.',
      qaAngle: 'Clusters need editorial sense, not just mathematical closeness. I would review examples from each cluster and check whether the grouping is explainable to a publishing user.',
      projectLinkLabel: 'WPH Publisher Intelligence',
      projectLinkHref: '../projects/world-publishing-houses-dataset/#publishers'
    },
    {
      id: 'wph-ml-reader-buckets',
      deck: 'WPH Feature Readiness',
      level: 'Level 3: Applied Reasoning',
      visualType: 'classificationWph',
      visualCue: 'Reader-facing availability buckets are high-trust labels.',
      front: 'How could WPH classify books into reader buckets like “Read now,” “Coming soon,” and “Not yet in English”?',
      back: 'A rule-based classifier or ML model could use translation records, release dates, publisher announcements, language paths, and source confidence to assign reader-facing availability buckets.',
      qaAngle: 'Bucket labels are high-trust UI. I would test edge cases where rights are acquired but no English release exists, because those should not be shown as available to readers.',
      projectLinkLabel: 'WPH Reader Buckets',
      projectLinkHref: '../projects/world-publishing-houses-dataset/#reader-professional'
    },
    {
      id: 'wph-ml-recommendation-baseline',
      deck: 'WPH Scope & Generalization',
      level: 'Level 2: Tradeoff',
      visualKey: 'split',
      visualCue: 'Transparent rules are the baseline before claiming ML adds value.',
      front: 'What is the simplest baseline before building an ML recommendation model for WPH?',
      back: 'A transparent rule-based baseline: prioritize verified English availability, recent awards, active publishers, known translators, recent market events, and source-backed translation signals.',
      qaAngle: 'Before claiming ML value, I would compare model recommendations against this baseline. If the ML model cannot beat simple rules, it is not ready.',
      projectLinkLabel: 'WPH Recommendation Logic',
      projectLinkHref: '../projects/world-publishing-houses-dataset/#product-insight'
    },
    {
      id: 'capstone-r2-production',
      deck: 'Capstone: Model Validation',
      level: 'Level 4: Failure Case',
      visualKey: 'r2',
      visualCue: 'R² around 0.517 is useful signal, not production appraisal confidence.',
      front: 'The housing model has R² ≈ 0.517. Is that good enough for production appraisal?',
      back: 'No. It shows meaningful signal, but it is not strong enough for high-stakes valuation without more validation, feature engineering, fairness checks, market-specific testing, and monitoring.',
      qaAngle: 'A QA-minded model review asks where the model fails, for whom, and under what market conditions. The result is useful as a validation case study, not as a production-ready appraisal tool.',
      projectLinkLabel: 'Capstone Results',
      projectLinkHref: 'data-science.html#housing'
    },
    {
      id: 'capstone-rmse-risk',
      deck: 'Capstone: Model Validation',
      level: 'Level 4: Failure Case',
      visualKey: 'rmse',
      visualCue: 'RMSE makes large valuation mistakes more visible.',
      front: 'Why is RMSE useful in the property-value capstone?',
      back: 'RMSE penalizes large prediction errors more heavily, which matters when expensive valuation mistakes create higher business risk.',
      qaAngle: 'I would still inspect MAE and residuals. A model can look acceptable on average while failing badly for high-end homes, rural properties, or underrepresented regions.',
      projectLinkLabel: 'Capstone Metrics',
      projectLinkHref: 'data-science.html#housing'
    },
    {
      id: 'capstone-naive-baseline',
      deck: 'Capstone: Model Validation',
      level: 'Level 4: Failure Case',
      visualKey: 'split',
      visualCue: 'A simple baseline keeps model claims honest.',
      front: 'Why should the capstone include a naive mean-prediction baseline?',
      back: 'A baseline shows whether the ML model improves over a simple non-ML approach. Without it, model metrics lack context.',
      qaAngle: 'Every model evaluation should include a simple benchmark before claiming model value. This is a release-readiness requirement, not just a notebook improvement.',
      projectLinkLabel: 'Capstone Model Comparison',
      projectLinkHref: 'data-science.html#housing'
    },
    {
      id: 'capstone-location-fairness',
      deck: 'Capstone: Model Validation',
      level: 'Level 4: Failure Case',
      visualKey: 'edge-cases',
      visualCue: 'Location can act as a proxy feature and create uneven error patterns.',
      front: 'Why can location features create fairness risk in a housing model?',
      back: 'Latitude, longitude, region, and ZIP-like fields can proxy socioeconomic patterns. The model may learn historical inequality or market segmentation instead of only property characteristics.',
      qaAngle: 'I would compare residuals by region, price band, and property type. If one group has much higher error, the model needs scope limits, feature review, or separate treatment.',
      projectLinkLabel: 'Capstone Ethics Lens',
      projectLinkHref: 'data-science.html#model-validation'
    },
    {
      id: 'qa-ml-vs-software',
      deck: 'QA for ML',
      level: 'Level 4: Failure Case',
      visualKey: 'qa-gates',
      visualCue: 'ML QA checks model behavior, not just whether code executes.',
      front: 'How is testing an ML model different from testing regular software?',
      back: 'Traditional software often has deterministic expected outputs. ML systems produce probabilistic outputs, so QA must validate data quality, metrics, drift, edge cases, failure patterns, and monitoring.',
      qaAngle: 'A passing unit test does not mean the model is trustworthy. ML QA needs statistical checks, production-risk review, and clear acceptance criteria.',
      projectLinkLabel: 'ML QA Case Study',
      projectLinkHref: 'data-science.html#model-validation'
    },
    {
      id: 'qa-ml-golden-dataset',
      deck: 'QA for ML',
      level: 'Level 4: Failure Case',
      visualKey: 'qa-gates',
      visualCue: 'A small trusted dataset can catch behavior regressions over time.',
      front: 'What is a golden dataset?',
      back: 'A golden dataset is a small, trusted set of verified examples used to test model behavior and catch regressions over time.',
      qaAngle: 'For WPH, a golden dataset could include verified publisher names, language labels, translator credits, and known translation paths. For the capstone, it could include carefully reviewed property records.',
      projectLinkLabel: 'QA for ML',
      projectLinkHref: 'data-science.html#model-validation'
    },
    {
      id: 'qa-ml-data-drift',
      deck: 'QA for ML',
      level: 'Level 4: Failure Case',
      visualKey: 'edge-cases',
      visualCue: 'Production data can move away from the training distribution.',
      front: 'What is data drift?',
      back: 'Data drift happens when production data changes from the training data distribution. In housing, market conditions, interest rates, and regional demand can shift quickly.',
      qaAngle: 'I would monitor input distributions, prediction errors, and residuals over time. A model that worked last year may become unreliable after market changes.',
      projectLinkLabel: 'Capstone Monitoring',
      projectLinkHref: 'data-science.html#model-validation'
    },
    {
      id: 'qa-ml-release-checklist',
      deck: 'QA for ML',
      level: 'Level 4: Failure Case',
      visualKey: 'qa-gates',
      visualCue: 'Release readiness means the model is understood, monitored, and bounded by use case.',
      front: 'What should be checked before releasing an ML model?',
      back: 'Baseline comparison, validation split, data quality, fairness review, residual analysis, monitoring plan, rollback plan, and documentation.',
      qaAngle: 'Release readiness for ML is not just “the model runs.” It means the model is understood, monitored, limited to a safe use case, and documented well enough for others to challenge.',
      projectLinkLabel: 'ML QA Checklist',
      projectLinkHref: 'data-science.html#model-validation'
    },
    {
      id: 'fundamentals-supervised-learning',
      deck: 'Fundamentals for Study',
      level: 'Level 1: Definition',
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
      level: 'Level 1: Definition',
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
      level: 'Level 1: Definition',
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
      level: 'Level 1: Definition',
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
      <p class="visual-caption">Highlighted step shows the predicted output or classification target.</p>
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

  const deckMeta = {
    'WPH Dataset Readiness': { style: 'dataset', icon: '▦' },
    'WPH Trust & Provenance': { style: 'trust', icon: '✓' },
    'WPH Feature Readiness': { style: 'feature', icon: '☷' },
    'WPH Scope & Generalization': { style: 'scope', icon: '⌾' },
    'Capstone: Model Validation': { style: 'capstone', icon: '⌁' },
    'QA for ML': { style: 'qa', icon: '⌕' },
    'Fundamentals for Study': { style: 'fundamentals', icon: '◇' },
    Custom: { style: 'qa', icon: '+' }
  };

  const getDeckMeta = (item) => deckMeta[item.deck] || deckMeta.Custom;

  const dataReferenceFor = (item) => {
    const references = {
      'wph-readiness-class-imbalance': 'reader_bucket.value_counts()\\nReview majority bucket size\\nReview minority bucket counts\\nCompare accuracy with precision / recall',
      'wph-readiness-small-holdout': 'len(wph_works) = 70\\ntest_size = 0.20\\nheld_out_rows = 14',
      'wph-readiness-lag-tail': 'translation_lag_years.describe()\\nmin: 1\\nmedian: 3\\nmean: 9.2\\nmax: 88',
      'wph-readiness-provenance': 'verification_status.value_counts()\\nverified_public_source: 29\\ncurated_needs_check: 26',
      'wph-readiness-feature-variation': 'translation_path.value_counts()\\nCheck cardinality\\nFlag near-constant values',
      'wph-readiness-domain-scope': 'country_iso.value_counts()\\nDK / IS / NO / SE / FI\\nregion_group: Nordic'
    };
    return references[item.id] || item.projectLinkLabel || 'Portfolio project reference';
  };

  const renderAnswer = (item) => {
    if (item.front || item.back || item.qaAngle || item.projectLinkLabel) {
      const sections = [];
      if (item.back) {
        sections.push(`<section id="flashcard-answer-section" class="answer-section reveal-section" data-reveal-section="answer"><h4>Answer</h4><p>${escapeHtml(item.back)}</p></section>`);
      }
      if (item.qaAngle) {
        sections.push(`<section id="qa-angle-panel" class="answer-section qa-angle reveal-section" data-reveal-section="qa"><h4>QA Angle</h4><p>${escapeHtml(item.qaAngle)}</p></section>`);
      }
      if (item.projectLinkLabel && item.projectLinkHref) {
        sections.push(`<section id="data-reference-panel" class="answer-section project-connection reveal-section" data-reveal-section="reference"><h4>Where This Shows Up</h4><pre class="data-reference"><code>${escapeHtml(dataReferenceFor(item))}</code></pre><p><a href="${escapeHtml(item.projectLinkHref)}">${escapeHtml(item.projectLinkLabel)}</a></p></section>`);
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
    customCards: 'tkPortfolioCustomFlashcards',
    learnedCards: 'tkPortfolioLearnedFlashcards'
  };

  const getCustomCards = () => {
    try { return JSON.parse(localStorage.getItem(storageKeys.customCards) || '[]'); }
    catch { return []; }
  };

  const setCustomCards = (cards) => localStorage.setItem(storageKeys.customCards, JSON.stringify(cards));

  const getLearnedCards = () => {
    try { return new Set(JSON.parse(localStorage.getItem(storageKeys.learnedCards) || '[]')); }
    catch { return new Set(); }
  };

  const setLearnedCards = (cards) => localStorage.setItem(storageKeys.learnedCards, JSON.stringify([...cards]));

  const el = (selector) => document.querySelector(selector);
  const searchInput = el('[data-card-search]');
  const deckFilter = el('[data-deck-filter]');
  const levelFilter = el('[data-level-filter]');
  const card = el('[data-card-flip]');
  const question = el('[data-card-question]');
  const answer = el('[data-card-answer]');
  const deck = el('[data-card-deck]');
  const level = el('[data-card-level]');
  const cardIcon = el('[data-card-icon]');
  const cardCounter = el('[data-card-counter]');
  const learnedBadge = el('[data-learned-badge]');
  const hint = el('[data-card-hint]');
  const memory = el('[data-card-memory]');
  const visual = el('[data-card-visual]');
  const position = el('[data-card-position]');
  const progress = el('[data-card-progress]');
  const toggleAnswer = el('[data-toggle-answer]');
  const showProjectBtn = el('[data-show-project]');
  const revealAnswerBtn = el('[data-reveal-answer]');
  const revealQaBtn = el('[data-reveal-qa]');
  const revealReferenceBtn = el('[data-reveal-reference]');
  const markLearnedBtn = el('[data-mark-learned]');
  const learnedCount = el('[data-learned-count]');
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
  let revealStage = 0;
  let learnedCards = getLearnedCards();

  const setButtonState = (button, disabled) => {
    if (!button) return;
    button.disabled = disabled;
    button.setAttribute('aria-disabled', String(disabled));
  };

  const applyFilter = () => {
    const selectedDeck = deckFilter?.value || 'all';
    const selectedLevel = levelFilter?.value || 'all';
    const query = (searchInput?.value || '').trim().toLowerCase();
    allCards = [...baseFlashcards, ...getCustomCards()];
    filteredCards = allCards.filter((item) => {
      const deckMatches = selectedDeck === 'all' || item.deck === selectedDeck;
      const levelMatches = selectedLevel === 'all' || item.level === selectedLevel;
      const searchText = [
        item.deck,
        item.level,
        item.front || item.question,
        item.back || item.answer,
        item.qaAngle,
        item.projectLinkLabel,
        item.visualCue,
        item.memoryHook
      ].filter(Boolean).join(' ').toLowerCase();
      return deckMatches && levelMatches && (!query || searchText.includes(query));
    });
    currentIndex = 0;
    revealStage = 0;
    renderCard();
  };

  const updateLearnedCount = () => {
    if (!learnedCount) return;
    const builtInIds = new Set(baseFlashcards.map((item) => item.id));
    const learnedTotal = [...learnedCards].filter((id) => builtInIds.has(id)).length;
    learnedCount.textContent = `${learnedTotal} / ${baseFlashcards.length} cards learned`;
  };

  const setRevealSection = (name, isVisible) => {
    const section = answer?.querySelector(`[data-reveal-section="${name}"]`);
    if (section) section.hidden = !isVisible;
  };

  const updateRevealControls = () => {
    setRevealSection('answer', revealStage >= 1);
    setRevealSection('qa', revealStage >= 2);
    setRevealSection('reference', revealStage >= 3);

    if (card) card.dataset.revealStage = String(revealStage);
    if (revealAnswerBtn) {
      revealAnswerBtn.textContent = revealStage >= 1 ? 'Hide Answer' : 'Reveal Answer';
      revealAnswerBtn.setAttribute('aria-expanded', String(revealStage >= 1));
    }
    if (revealQaBtn) {
      revealQaBtn.textContent = revealStage >= 2 ? 'Hide QA Angle' : 'Show QA Angle';
      revealQaBtn.setAttribute('aria-expanded', String(revealStage >= 2));
      setButtonState(revealQaBtn, revealStage < 1);
    }
    if (revealReferenceBtn) {
      revealReferenceBtn.textContent = revealStage >= 3 ? 'Hide Data Reference' : 'Show Data Reference';
      revealReferenceBtn.setAttribute('aria-expanded', String(revealStage >= 3));
      setButtonState(revealReferenceBtn, revealStage < 2);
    }
    if (toggleAnswer) {
      toggleAnswer.textContent = revealStage >= 2 ? 'Hide QA Angle' : 'Show QA Angle';
      toggleAnswer.setAttribute('aria-expanded', String(revealStage >= 2));
    }
    if (hint) {
      const hints = [
        'Start with the question. Reveal the answer when you are ready.',
        'Answer visible. Next, open the QA angle to see the validation risk.',
        'QA angle visible. Open the data reference to connect this to the portfolio work.',
        'Answer, QA angle, and dataset reference are visible.'
      ];
      hint.textContent = hints[revealStage] || hints[0];
    }
  };

  const renderCard = () => {
    if (!filteredCards.length) {
      if (question) question.textContent = 'No matching cards. Try another concept or deck.';
      if (answer) answer.innerHTML = '';
      if (deck) deck.textContent = 'No match';
      if (level) level.textContent = 'Adjust filters';
      if (cardIcon) cardIcon.textContent = '◇';
      if (cardCounter) cardCounter.textContent = '0 / 0';
      if (memory) memory.textContent = 'Try clearing the search field or choosing All decks.';
      if (visual) visual.innerHTML = visualTemplates.custom;
      if (position) position.textContent = '0 / 0';
      if (progress) progress.style.width = '0%';
      if (card) card.classList.remove('is-learned');
      if (learnedBadge) learnedBadge.hidden = true;
      if (hint) hint.textContent = 'No matching cards. Try another concept or deck.';
      setButtonState(prevBtn, true);
      setButtonState(nextBtn, true);
      setButtonState(revealAnswerBtn, true);
      setButtonState(revealQaBtn, true);
      setButtonState(revealReferenceBtn, true);
      setButtonState(markLearnedBtn, true);
      updateLearnedCount();
      return;
    }

    const active = filteredCards[currentIndex];
    const meta = getDeckMeta(active);
    const isLearned = learnedCards.has(active.id);
    if (question) question.textContent = active.front || active.question;
    if (answer) answer.innerHTML = renderAnswer(active);
    if (deck) deck.textContent = active.deck;
    if (level) level.textContent = active.level || 'Study';
    if (cardIcon) cardIcon.textContent = meta.icon;
    if (cardCounter) cardCounter.textContent = `${currentIndex + 1} / ${filteredCards.length}`;
    if (memory) memory.textContent = active.visualCue || active.memoryHook || 'Visual cue: connect the concept to a product failure mode or validation check.';
    if (visual) visual.innerHTML = renderVisual(active);
    if (position) position.textContent = `${currentIndex + 1} / ${filteredCards.length}`;
    if (progress) progress.style.width = `${((currentIndex + 1) / filteredCards.length) * 100}%`;

    if (card) {
      card.dataset.deckStyle = meta.style;
      card.classList.toggle('is-learned', isLearned);
    }
    if (learnedBadge) learnedBadge.hidden = !isLearned;
    if (markLearnedBtn) markLearnedBtn.textContent = isLearned ? 'Mark as Unlearned' : 'Mark as Learned';
    updateRevealControls();
    updateLearnedCount();
    setButtonState(prevBtn, currentIndex === 0);
    setButtonState(nextBtn, currentIndex === filteredCards.length - 1);
    setButtonState(revealAnswerBtn, false);
    setButtonState(markLearnedBtn, false);
  };

  const moveCard = (step) => {
    if (!filteredCards.length) return;
    const nextIndex = currentIndex + step;
    if (nextIndex < 0 || nextIndex >= filteredCards.length) return;
    currentIndex = nextIndex;
    revealStage = 0;
    renderCard();
  };

  const setStage = (stage) => {
    revealStage = Math.max(0, Math.min(3, stage));
    renderCard();
  };

  const toggleLearned = () => {
    const active = filteredCards[currentIndex];
    if (!active) return;
    if (learnedCards.has(active.id)) {
      learnedCards.delete(active.id);
    } else {
      learnedCards.add(active.id);
    }
    setLearnedCards(learnedCards);
    renderCard();
  };

  if (deckFilter) deckFilter.addEventListener('change', applyFilter);
  if (searchInput) searchInput.addEventListener('input', applyFilter);
  if (levelFilter) levelFilter.addEventListener('change', applyFilter);
  if (revealAnswerBtn) {
    revealAnswerBtn.addEventListener('click', () => {
      setStage(revealStage >= 1 ? 0 : 1);
    });
  }
  if (revealQaBtn) {
    revealQaBtn.addEventListener('click', () => {
      if (revealQaBtn.disabled) return;
      setStage(revealStage >= 2 ? 1 : 2);
    });
  }
  if (revealReferenceBtn) {
    revealReferenceBtn.addEventListener('click', () => {
      if (revealReferenceBtn.disabled) return;
      setStage(revealStage >= 3 ? 2 : 3);
    });
  }
  if (toggleAnswer) toggleAnswer.addEventListener('click', () => setStage(revealStage >= 2 ? 1 : 2));
  if (showProjectBtn) {
    showProjectBtn.addEventListener('click', () => {
      revealStage = 3;
      renderCard();
      answer.querySelector('.project-connection')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }
  if (markLearnedBtn) markLearnedBtn.addEventListener('click', toggleLearned);
  if (prevBtn) prevBtn.addEventListener('click', () => moveCard(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => moveCard(1));
  if (authorToggle && authorPanel) {
    authorToggle.addEventListener('click', () => {
      const isHidden = authorPanel.hidden;
      authorPanel.hidden = !isHidden;
      authorToggle.setAttribute('aria-expanded', String(isHidden));
    });
  }

  if (addForm) {
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
      deckFilter.value = Array.from(deckFilter.options).some((option) => option.value === d) ? d : 'WPH Dataset Readiness';
      applyFilter();
    });
  }

  if (clearCustomBtn) {
    clearCustomBtn.addEventListener('click', () => {
      const confirmed = window.confirm('Clear all custom flashcards saved in this browser?');
      if (!confirmed) return;
      setCustomCards([]);
      formMessage.textContent = 'Custom cards cleared from this device.';
      if (deckFilter.value === 'Custom') deckFilter.value = 'WPH Dataset Readiness';
      applyFilter();
    });
  }

  applyFilter();
});
