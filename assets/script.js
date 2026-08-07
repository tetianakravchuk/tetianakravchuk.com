// ===================================================================
// Analytics — set this ONE value after creating a free GoatCounter
// account (https://www.goatcounter.com). If your dashboard lives at
// https://tetianakravchuk.goatcounter.com, the code is "tetianakravchuk".
// While this is empty, no analytics requests are made anywhere.
// ===================================================================
const GOATCOUNTER_CODE = 'tetianakravchuk';

document.addEventListener('DOMContentLoaded', () => {
  const year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();

  // --- Load GoatCounter (page views) once a code is configured ---
  if (GOATCOUNTER_CODE) {
    const gc = document.createElement('script');
    gc.async = true;
    gc.src = '//gc.zgo.at/count.js';
    gc.setAttribute('data-goatcounter', `https://${GOATCOUNTER_CODE}.goatcounter.com/count`);
    document.head.appendChild(gc);
  }

  // --- Count outbound / download clicks as GoatCounter events ---
  // Fires on resume-PDF downloads and outbound LinkedIn / GitHub links.
  // Analytics must never block navigation, so every path is guarded.
  const trackEvent = (name, title) => {
    if (!GOATCOUNTER_CODE) return;
    try {
      if (window.goatcounter && typeof window.goatcounter.count === 'function') {
        window.goatcounter.count({ path: name, title: title || name, event: true });
        return;
      }
      // Fallback if the GoatCounter script has not finished loading yet:
      // a beacon survives the page navigating away.
      if (navigator.sendBeacon) {
        const url = `https://${GOATCOUNTER_CODE}.goatcounter.com/count`
          + `?p=${encodeURIComponent(name)}`
          + `&t=${encodeURIComponent(title || name)}`
          + '&e=true';
        navigator.sendBeacon(url);
      }
    } catch (_) { /* never break the click */ }
  };

  const classifyLink = (link) => {
    const href = (link.getAttribute('href') || '').toLowerCase();
    if (link.hasAttribute('download') || href.endsWith('.pdf')) {
      return { name: 'resume-download', title: 'Resume PDF' };
    }
    if (href.includes('linkedin.com')) return { name: 'linkedin-click', title: 'LinkedIn click' };
    if (href.includes('github.com')) return { name: 'github-click', title: 'GitHub click' };
    if (href.includes('youtube.com') || href.includes('youtu.be')) return { name: 'wph-video-play', title: 'WPH walkthrough' };
    return null;
  };

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a');
    if (!link) return;
    const hit = classifyLink(link);
    if (hit) trackEvent(hit.name, hit.title);
  }, true);

  // --- Video: click-to-load player (no third-party frame until asked) ---
  const videoEmbed = document.querySelector('[data-video]');
  if (videoEmbed) {
    const facade = videoEmbed.querySelector('[data-video-play]');
    if (facade) {
      facade.addEventListener('click', () => {
        const id = videoEmbed.dataset.video;
        const iframe = document.createElement('iframe');
        iframe.className = 'video-frame';
        iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
        iframe.title = 'World Publishing Houses walkthrough';
        iframe.setAttribute('allow', 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen');
        iframe.setAttribute('allowfullscreen', '');
        iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
        videoEmbed.replaceChildren(iframe);
        trackEvent('wph-video-play', 'WPH walkthrough');
      });
    }
  }

  // --- Booking button: only show it once a real URL is configured ---
  // Until you replace the placeholder with your Calendly / Cal.com link,
  // the button stays hidden so no broken link ever ships.
  const booking = document.querySelector('[data-booking]');
  if (booking) {
    const url = booking.getAttribute('href') || '';
    if (url && !url.includes('YOUR-HANDLE')) booking.hidden = false;
  }

  // --- Contact form: AJAX submit to Web3Forms, no page reload ---
  const contactForm = document.querySelector('[data-contact-form]');
  if (contactForm) {
    const statusEl = contactForm.querySelector('[data-form-status]');
    const submitBtn = contactForm.querySelector('[data-form-submit]');
    const keyField = contactForm.querySelector('input[name="access_key"]');
    const configured = !!keyField && !keyField.value.includes('YOUR_');

    const setStatus = (message, kind) => {
      if (!statusEl) return;
      statusEl.textContent = message;
      statusEl.className = 'form-status' + (kind ? ` ${kind}` : '');
    };

    contactForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      // Not configured yet — guide to email instead of a failing request.
      if (!configured) {
        setStatus('Email me directly at tetiana.kravchukqa@gmail.com and I’ll reply personally.', '');
        return;
      }
      // Honeypot tripped — silently drop.
      if (contactForm.querySelector('[name="botcheck"]')?.checked) return;
      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }

      if (submitBtn) submitBtn.disabled = true;
      setStatus('Sending…', '');
      try {
        const response = await fetch(contactForm.action, {
          method: 'POST',
          body: new FormData(contactForm),
          headers: { Accept: 'application/json' }
        });
        const result = await response.json().catch(() => ({}));
        if (response.ok && result.success) {
          contactForm.reset();
          setStatus('Thanks — your message was sent. I’ll get back to you soon.', 'success');
          if (window.goatcounter?.count) {
            window.goatcounter.count({ path: 'contact-form-submit', title: 'Contact form submit', event: true });
          }
        } else {
          throw new Error(result.message || 'Send failed');
        }
      } catch (_) {
        setStatus('Sorry — something went wrong. Please email me at tetiana.kravchukqa@gmail.com.', 'error');
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

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
});
