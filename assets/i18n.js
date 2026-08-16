/* ============================================================================
   i18n.js — language switcher for tetianakravchuk.com
   Languages: English (en), Español (es), Polski (pl), Українська (uk), Français (fr)

   How it works:
   - Translatable nodes carry data-i18n="key" (textContent), data-i18n-html="key"
     (innerHTML, for strings with <br>), or data-i18n-attr="attr:key;attr2:key2".
   - The chosen language persists in localStorage ('tk-lang') and sets <html lang>.
   - Tech tokens / proper nouns (Applied AI, tech stacks, product names) are left
     untranslated on purpose so they read consistently across languages.

   Add a language: extend STR[<code>] and LANGS. Every key falls back to English
   if a translation is missing, so partial coverage never blanks the page.
   ========================================================================== */
(function () {
  'use strict';
  if (window.__i18nLoaded) return;
  window.__i18nLoaded = true;

  var LANGS = [
    { code: 'en', label: 'English',    short: 'EN' },
    { code: 'es', label: 'Español',    short: 'ES' },
    { code: 'pl', label: 'Polski',     short: 'PL' },
    { code: 'uk', label: 'Українська', short: 'UK' },
    { code: 'fr', label: 'Français',   short: 'FR' }
  ];
  var STORE = 'tk-lang';

  // ── Dictionary ──────────────────────────────────────────────────────────────
  var STR = {
    en: {
      'a11y.skip': 'Skip to main content',
      'nav.about': 'About', 'nav.resume': 'Resume', 'nav.projects': 'Projects',
      'nav.data': 'Data Science', 'nav.qa': 'QA Impact', 'nav.contact': 'Contact', 'nav.menu': 'Menu',
      'lang.aria': 'Change language',

      'hero.badge': 'Open to Applied AI · AI Evaluation · AI Platform roles',
      'hero.h1': 'I build AI systems that are reliable, observable, and testable.',
      'hero.lead': 'I combine 10+ years of software quality engineering with an M.S. in Data Science, AI & Machine Learning to build and evaluate AI systems across data pipelines, agents, prompt governance, telemetry, regression testing, and safety.',
      'hero.cred': 'M.S. Data Science, AI & ML — Boston University<br />Massachusetts · open to US remote roles',
      'btn.built': 'See what I built', 'btn.demo': 'Watch 6-minute demo ↗', 'btn.resume': 'Download résumé',

      'snap.label': 'Recruiter snapshot',
      'snap.primary': 'PRIMARY', 'snap.quality': 'QUALITY SPECIALTY', 'snap.stack': 'CORE STACK', 'snap.experience': 'EXPERIENCE',
      'snap.expVal': '10+ years Software Quality Engineering → Applied AI',

      'stats.s1': 'years in software quality, automation, release, and reliability engineering',
      'stats.s2': 'reviewed AI evaluation cases in the WPH evaluation platform',
      'stats.s3': 'backend tests passing at a completed WPH stabilization milestone',

      'feat.eyebrow': 'Featured AI project',
      'feat.h2': 'World Publishing Houses — source-grounded AI intelligence platform',
      'feat.p': 'I designed and built a full-stack AI and data platform combining controlled research agents, source-backed publishing data, prompt governance, execution telemetry, AI evaluation, deterministic safety, and human review.',
      'feat.videoLabel': 'What I Built: AI Platform Demo', 'feat.videoSub': '6:18 · product walkthrough',
      'feat.kicker': 'Production-oriented engineering', 'feat.h3': 'More than a chatbot',
      'feat.p2': 'The model is not the source of truth. WPH separates structured data, evidence, model output, deterministic safety, prompt versions, telemetry, evaluation, and human review so behavior can be reproduced and investigated.',
      'btn.case': 'Explore case study', 'btn.live': 'Live platform ↗',

      'work.eyebrow': 'Additional evidence', 'work.h2': 'Data science and engineering quality',
      'work.p': 'WPH is the flagship above. These projects show the modeling and quality-engineering foundation behind how I build AI systems.',
      'work.c1kicker': 'ML capstone · model validation', 'work.c1h3': 'Where a housing-price model breaks, and why',
      'work.c1p': 'I compared a Random Forest against a linear baseline, then focused on residual behavior and production limits rather than only headline accuracy.',
      'work.c1outLabel': 'Outcome:', 'work.c1out': 'residuals exposed systematic error on high-end homes, so I documented that limitation instead of presenting R² alone.',
      'work.c1read': 'Read the case study →',
      'work.c2kicker': 'Professional impact · 10+ years', 'work.c2h3': 'Software quality as an AI engineering advantage',
      'work.c2p': 'Release testing, automation, APIs, CI/CD, failure analysis, and evidence-based triage shaped how I now design AI evaluations, regression gates, and observability.',
      'work.c2link': 'See the engineering record →',
      'work.rowQuality': 'Regression, release, mobile, API, automation',
      'work.rowAI': 'Evals, safety, provenance, telemetry, quality gates',
      'work.rowData': 'Python, SQL, PostgreSQL, analytics, validation',

      'about.eyebrow': 'About', 'about.h2': 'Software quality engineering → Applied AI',
      'about.lead': 'I spent more than a decade asking what happens when software is wrong. I now apply the same discipline to AI systems: what evidence supports the answer, what changes between prompt versions, how do we detect regressions, and what happens when confidence is low?',
      'about.p': 'My M.S. in Data Science, AI, and Machine Learning added the modeling and analytics layer. WPH became the place where I combined both backgrounds into one production-oriented system.',
      'about.edu': 'EDUCATION', 'about.exp': 'EXPERIENCE', 'about.ai': 'APPLIED AI', 'about.data': 'DATA',
      'about.expVal': '10+ years software quality engineering and automation',
      'btn.more': 'More about me →',

      'contact.h2': 'Building reliable AI systems?',
      'contact.lead': "I'm interested in full-time US remote roles across Applied AI, AI Evaluation, AI Platform, and advanced data/ML quality.",
      'btn.email': 'Email me',
      'contact.location': 'LOCATION', 'contact.mode': 'WORK MODE', 'contact.focus': 'FOCUS', 'contact.resume': 'RÉSUMÉ',
      'contact.locationVal': 'Massachusetts, US', 'contact.modeVal': 'US remote', 'contact.download': 'Download PDF',

      'footer.featured': 'Featured AI project', 'footer.about': 'About', 'footer.resume': 'Résumé'
    },

    es: {
      'a11y.skip': 'Saltar al contenido principal',
      'nav.about': 'Sobre mí', 'nav.resume': 'CV', 'nav.projects': 'Proyectos',
      'nav.data': 'Data Science', 'nav.qa': 'Impacto QA', 'nav.contact': 'Contacto', 'nav.menu': 'Menú',
      'lang.aria': 'Cambiar idioma',
      'hero.badge': 'Disponible para puestos de Applied AI · AI Evaluation · AI Platform',
      'hero.h1': 'Construyo sistemas de IA fiables, observables y testeables.',
      'hero.lead': 'Combino más de 10 años de ingeniería de calidad de software con un máster en Ciencia de Datos, IA y Machine Learning para construir y evaluar sistemas de IA en pipelines de datos, agentes, gobernanza de prompts, telemetría, pruebas de regresión y seguridad.',
      'hero.cred': 'Máster en Ciencia de Datos, IA y ML — Boston University<br />Massachusetts · disponible para trabajo remoto en EE. UU.',
      'btn.built': 'Mira lo que construí', 'btn.demo': 'Ver demo de 6 minutos ↗', 'btn.resume': 'Descargar CV',
      'snap.label': 'Resumen para reclutadores',
      'snap.primary': 'PRINCIPAL', 'snap.quality': 'ESPECIALIDAD EN CALIDAD', 'snap.stack': 'STACK PRINCIPAL', 'snap.experience': 'EXPERIENCIA',
      'snap.expVal': '10+ años de Ingeniería de Calidad de Software → Applied AI',
      'stats.s1': 'años en calidad de software, automatización, releases e ingeniería de fiabilidad',
      'stats.s2': 'casos de evaluación de IA revisados en la plataforma de evaluación WPH',
      'stats.s3': 'pruebas de backend superadas en un hito de estabilización de WPH completado',
      'feat.eyebrow': 'Proyecto de IA destacado',
      'feat.h2': 'World Publishing Houses — plataforma de inteligencia de IA fundamentada en fuentes',
      'feat.p': 'Diseñé y construí una plataforma full-stack de IA y datos que combina agentes de investigación controlados, datos editoriales respaldados por fuentes, gobernanza de prompts, telemetría de ejecución, evaluación de IA, seguridad determinista y revisión humana.',
      'feat.videoLabel': 'Lo que construí: demo de la plataforma de IA', 'feat.videoSub': '6:18 · recorrido del producto',
      'feat.kicker': 'Ingeniería orientada a producción', 'feat.h3': 'Más que un chatbot',
      'feat.p2': 'El modelo no es la fuente de verdad. WPH separa datos estructurados, evidencia, salida del modelo, seguridad determinista, versiones de prompts, telemetría, evaluación y revisión humana para que el comportamiento pueda reproducirse e investigarse.',
      'btn.case': 'Ver caso de estudio', 'btn.live': 'Plataforma en vivo ↗',
      'work.eyebrow': 'Evidencia adicional', 'work.h2': 'Ciencia de datos y calidad de ingeniería',
      'work.p': 'WPH es el proyecto insignia de arriba. Estos proyectos muestran la base de modelado e ingeniería de calidad que respalda cómo construyo sistemas de IA.',
      'work.c1kicker': 'Proyecto final de ML · validación de modelos', 'work.c1h3': 'Dónde falla un modelo de precios de vivienda, y por qué',
      'work.c1p': 'Comparé un Random Forest con una línea base lineal y luego me centré en el comportamiento de los residuos y los límites de producción, no solo en la precisión de titular.',
      'work.c1outLabel': 'Resultado:', 'work.c1out': 'los residuos revelaron un error sistemático en viviendas de alta gama, así que documenté esa limitación en lugar de presentar solo el R².',
      'work.c1read': 'Leer el caso de estudio →',
      'work.c2kicker': 'Impacto profesional · 10+ años', 'work.c2h3': 'La calidad de software como ventaja en ingeniería de IA',
      'work.c2p': 'Las pruebas de release, la automatización, las APIs, el CI/CD, el análisis de fallos y el triaje basado en evidencia moldearon cómo diseño hoy evaluaciones de IA, gates de regresión y observabilidad.',
      'work.c2link': 'Ver el historial de ingeniería →',
      'work.rowQuality': 'Regresión, release, móvil, API, automatización',
      'work.rowAI': 'Evals, seguridad, procedencia, telemetría, gates de calidad',
      'work.rowData': 'Python, SQL, PostgreSQL, analítica, validación',
      'about.eyebrow': 'Sobre mí', 'about.h2': 'Ingeniería de calidad de software → Applied AI',
      'about.lead': 'Pasé más de una década preguntándome qué ocurre cuando el software falla. Ahora aplico la misma disciplina a los sistemas de IA: qué evidencia respalda la respuesta, qué cambia entre versiones de prompt, cómo detectamos regresiones y qué pasa cuando la confianza es baja.',
      'about.p': 'Mi máster en Ciencia de Datos, IA y Machine Learning añadió la capa de modelado y analítica. WPH fue el lugar donde combiné ambas trayectorias en un único sistema orientado a producción.',
      'about.edu': 'EDUCACIÓN', 'about.exp': 'EXPERIENCIA', 'about.ai': 'APPLIED AI', 'about.data': 'DATOS',
      'about.expVal': '10+ años de ingeniería de calidad de software y automatización',
      'btn.more': 'Más sobre mí →',
      'contact.h2': '¿Construyendo sistemas de IA fiables?',
      'contact.lead': 'Me interesan puestos remotos a tiempo completo en EE. UU. en Applied AI, AI Evaluation, AI Platform y calidad avanzada de datos/ML.',
      'btn.email': 'Escríbeme',
      'contact.location': 'UBICACIÓN', 'contact.mode': 'MODALIDAD', 'contact.focus': 'ENFOQUE', 'contact.resume': 'CV',
      'contact.locationVal': 'Massachusetts, EE. UU.', 'contact.modeVal': 'Remoto en EE. UU.', 'contact.download': 'Descargar PDF',
      'footer.featured': 'Proyecto de IA destacado', 'footer.about': 'Sobre mí', 'footer.resume': 'CV'
    },

    pl: {
      'a11y.skip': 'Przejdź do treści głównej',
      'nav.about': 'O mnie', 'nav.resume': 'CV', 'nav.projects': 'Projekty',
      'nav.data': 'Data Science', 'nav.qa': 'Wpływ QA', 'nav.contact': 'Kontakt', 'nav.menu': 'Menu',
      'lang.aria': 'Zmień język',
      'hero.badge': 'Otwarta na role Applied AI · AI Evaluation · AI Platform',
      'hero.h1': 'Tworzę systemy AI, które są niezawodne, obserwowalne i testowalne.',
      'hero.lead': 'Łączę ponad 10 lat inżynierii jakości oprogramowania z tytułem magistra Data Science, AI i uczenia maszynowego, aby budować i oceniać systemy AI w potokach danych, agentach, zarządzaniu promptami, telemetrii, testach regresji i bezpieczeństwie.',
      'hero.cred': 'Magister Data Science, AI i ML — Boston University<br />Massachusetts · otwarta na pracę zdalną w USA',
      'btn.built': 'Zobacz, co zbudowałam', 'btn.demo': 'Obejrzyj 6-minutowe demo ↗', 'btn.resume': 'Pobierz CV',
      'snap.label': 'Podsumowanie dla rekrutera',
      'snap.primary': 'GŁÓWNE', 'snap.quality': 'SPECJALIZACJA JAKOŚCI', 'snap.stack': 'GŁÓWNY STACK', 'snap.experience': 'DOŚWIADCZENIE',
      'snap.expVal': '10+ lat inżynierii jakości oprogramowania → Applied AI',
      'stats.s1': 'lat w jakości oprogramowania, automatyzacji, wydaniach i inżynierii niezawodności',
      'stats.s2': 'przejrzanych przypadków oceny AI na platformie ewaluacyjnej WPH',
      'stats.s3': 'testów backendu zaliczonych na ukończonym kamieniu milowym stabilizacji WPH',
      'feat.eyebrow': 'Wyróżniony projekt AI',
      'feat.h2': 'World Publishing Houses — platforma inteligencji AI oparta na źródłach',
      'feat.p': 'Zaprojektowałam i zbudowałam pełnostosową platformę AI i danych, łączącą kontrolowane agenty badawcze, dane wydawnicze oparte na źródłach, zarządzanie promptami, telemetrię wykonania, ocenę AI, deterministyczne bezpieczeństwo i weryfikację przez człowieka.',
      'feat.videoLabel': 'Co zbudowałam: demo platformy AI', 'feat.videoSub': '6:18 · prezentacja produktu',
      'feat.kicker': 'Inżynieria zorientowana na produkcję', 'feat.h3': 'Więcej niż chatbot',
      'feat.p2': 'Model nie jest źródłem prawdy. WPH oddziela dane strukturalne, dowody, wyjście modelu, deterministyczne bezpieczeństwo, wersje promptów, telemetrię, ocenę i weryfikację przez człowieka, aby zachowanie można było odtworzyć i zbadać.',
      'btn.case': 'Zobacz studium przypadku', 'btn.live': 'Platforma na żywo ↗',
      'work.eyebrow': 'Dodatkowe dowody', 'work.h2': 'Data science i jakość inżynierii',
      'work.p': 'WPH to flagowy projekt powyżej. Te projekty pokazują fundament modelowania i inżynierii jakości, na którym opieram budowę systemów AI.',
      'work.c1kicker': 'Projekt dyplomowy ML · walidacja modelu', 'work.c1h3': 'Gdzie i dlaczego model cen mieszkań zawodzi',
      'work.c1p': 'Porównałam Random Forest z liniową bazą odniesienia, a następnie skupiłam się na zachowaniu reszt i ograniczeniach produkcyjnych, a nie tylko na nagłówkowej dokładności.',
      'work.c1outLabel': 'Wynik:', 'work.c1out': 'reszty ujawniły systematyczny błąd dla drogich domów, więc udokumentowałam to ograniczenie zamiast przedstawiać samo R².',
      'work.c1read': 'Przeczytaj studium przypadku →',
      'work.c2kicker': 'Wpływ zawodowy · 10+ lat', 'work.c2h3': 'Jakość oprogramowania jako przewaga w inżynierii AI',
      'work.c2p': 'Testy wydań, automatyzacja, API, CI/CD, analiza awarii i triage oparty na dowodach ukształtowały to, jak projektuję dziś oceny AI, bramki regresji i obserwowalność.',
      'work.c2link': 'Zobacz dorobek inżynierski →',
      'work.rowQuality': 'Regresja, wydania, mobile, API, automatyzacja',
      'work.rowAI': 'Ewaluacje, bezpieczeństwo, proweniencja, telemetria, bramki jakości',
      'work.rowData': 'Python, SQL, PostgreSQL, analityka, walidacja',
      'about.eyebrow': 'O mnie', 'about.h2': 'Inżynieria jakości oprogramowania → Applied AI',
      'about.lead': 'Przez ponad dekadę pytałam, co się dzieje, gdy oprogramowanie działa błędnie. Tę samą dyscyplinę stosuję teraz do systemów AI: jakie dowody wspierają odpowiedź, co zmienia się między wersjami promptów, jak wykrywamy regresje i co dzieje się, gdy pewność jest niska.',
      'about.p': 'Mój magister z Data Science, AI i uczenia maszynowego dodał warstwę modelowania i analityki. WPH stało się miejscem, w którym połączyłam oba doświadczenia w jeden system zorientowany na produkcję.',
      'about.edu': 'WYKSZTAŁCENIE', 'about.exp': 'DOŚWIADCZENIE', 'about.ai': 'APPLIED AI', 'about.data': 'DANE',
      'about.expVal': '10+ lat inżynierii jakości oprogramowania i automatyzacji',
      'btn.more': 'Więcej o mnie →',
      'contact.h2': 'Budujesz niezawodne systemy AI?',
      'contact.lead': 'Interesują mnie pełnoetatowe, zdalne role w USA w obszarach Applied AI, AI Evaluation, AI Platform oraz zaawansowanej jakości danych/ML.',
      'btn.email': 'Napisz do mnie',
      'contact.location': 'LOKALIZACJA', 'contact.mode': 'TRYB PRACY', 'contact.focus': 'SPECJALIZACJA', 'contact.resume': 'CV',
      'contact.locationVal': 'Massachusetts, USA', 'contact.modeVal': 'Zdalnie (USA)', 'contact.download': 'Pobierz PDF',
      'footer.featured': 'Wyróżniony projekt AI', 'footer.about': 'O mnie', 'footer.resume': 'CV'
    },

    uk: {
      'a11y.skip': 'Перейти до основного вмісту',
      'nav.about': 'Про мене', 'nav.resume': 'Резюме', 'nav.projects': 'Проєкти',
      'nav.data': 'Data Science', 'nav.qa': 'Вплив QA', 'nav.contact': 'Контакти', 'nav.menu': 'Меню',
      'lang.aria': 'Змінити мову',
      'hero.badge': 'Відкрита до ролей Applied AI · AI Evaluation · AI Platform',
      'hero.h1': 'Я створюю надійні, спостережувані та тестовані системи ШІ.',
      'hero.lead': 'Я поєдную понад 10 років інженерії якості програмного забезпечення зі ступенем магістра з Data Science, ШІ та машинного навчання, щоб створювати й оцінювати системи ШІ в конвеєрах даних, агентах, керуванні промптами, телеметрії, регресійному тестуванні та безпеці.',
      'hero.cred': 'Магістр з Data Science, ШІ та ML — Boston University<br />Массачусетс · відкрита до віддаленої роботи в США',
      'btn.built': 'Подивіться, що я створила', 'btn.demo': 'Дивитися 6-хвилинне демо ↗', 'btn.resume': 'Завантажити резюме',
      'snap.label': 'Стисло для рекрутера',
      'snap.primary': 'ОСНОВНЕ', 'snap.quality': 'СПЕЦІАЛІЗАЦІЯ З ЯКОСТІ', 'snap.stack': 'ОСНОВНИЙ СТЕК', 'snap.experience': 'ДОСВІД',
      'snap.expVal': '10+ років інженерії якості ПЗ → Applied AI',
      'stats.s1': 'років у якості ПЗ, автоматизації, релізах та інженерії надійності',
      'stats.s2': 'перевірених кейсів оцінювання ШІ на платформі оцінювання WPH',
      'stats.s3': 'пройдених backend-тестів на завершеному етапі стабілізації WPH',
      'feat.eyebrow': 'Обраний проєкт зі ШІ',
      'feat.h2': 'World Publishing Houses — платформа ШІ-аналітики з опорою на джерела',
      'feat.p': 'Я спроєктувала та побудувала повностекову платформу ШІ та даних, що поєднує керовані дослідницькі агенти, видавничі дані з опорою на джерела, керування промптами, телеметрію виконання, оцінювання ШІ, детерміновану безпеку та людську перевірку.',
      'feat.videoLabel': 'Що я створила: демо ШІ-платформи', 'feat.videoSub': '6:18 · огляд продукту',
      'feat.kicker': 'Інженерія, орієнтована на продакшн', 'feat.h3': 'Більше, ніж чат-бот',
      'feat.p2': 'Модель не є джерелом істини. WPH розділяє структуровані дані, докази, вихід моделі, детерміновану безпеку, версії промптів, телеметрію, оцінювання та людську перевірку, щоб поведінку можна було відтворити й дослідити.',
      'btn.case': 'Переглянути кейс', 'btn.live': 'Платформа наживо ↗',
      'work.eyebrow': 'Додаткові докази', 'work.h2': 'Data science та інженерна якість',
      'work.p': 'WPH — флагман вище. Ці проєкти показують основу з моделювання та інженерії якості, на якій я будую системи ШІ.',
      'work.c1kicker': 'Дипломний проєкт з ML · валідація моделі', 'work.c1h3': 'Де і чому ламається модель цін на житло',
      'work.c1p': 'Я порівняла Random Forest із лінійною базовою моделлю, а потім зосередилася на поведінці залишків та обмеженнях у продакшні, а не лише на загальній точності.',
      'work.c1outLabel': 'Результат:', 'work.c1out': 'залишки виявили систематичну похибку для дорогого житла, тож я задокументувала це обмеження замість того, щоб наводити лише R².',
      'work.c1read': 'Читати кейс →',
      'work.c2kicker': 'Професійний вплив · 10+ років', 'work.c2h3': 'Якість ПЗ як перевага в інженерії ШІ',
      'work.c2p': 'Тестування релізів, автоматизація, API, CI/CD, аналіз збоїв і сортування на основі доказів сформували те, як я тепер проєктую оцінювання ШІ, регресійні бар’єри та спостережуваність.',
      'work.c2link': 'Переглянути інженерний доробок →',
      'work.rowQuality': 'Регресія, релізи, мобільні, API, автоматизація',
      'work.rowAI': 'Оцінювання, безпека, походження, телеметрія, бар’єри якості',
      'work.rowData': 'Python, SQL, PostgreSQL, аналітика, валідація',
      'about.eyebrow': 'Про мене', 'about.h2': 'Інженерія якості ПЗ → Applied AI',
      'about.lead': 'Понад десять років я запитувала, що стається, коли програмне забезпечення помиляється. Тепер я застосовую ту саму дисципліну до систем ШІ: які докази підтверджують відповідь, що змінюється між версіями промптів, як виявляти регресії та що робити, коли впевненість низька.',
      'about.p': 'Мій магістр з Data Science, ШІ та машинного навчання додав шар моделювання й аналітики. WPH став місцем, де я поєднала обидва напрями в одну систему, орієнтовану на продакшн.',
      'about.edu': 'ОСВІТА', 'about.exp': 'ДОСВІД', 'about.ai': 'APPLIED AI', 'about.data': 'ДАНІ',
      'about.expVal': '10+ років інженерії якості ПЗ та автоматизації',
      'btn.more': 'Більше про мене →',
      'contact.h2': 'Будуєте надійні системи ШІ?',
      'contact.lead': 'Мене цікавлять повноставкові віддалені ролі в США в напрямах Applied AI, AI Evaluation, AI Platform та розширеної якості даних/ML.',
      'btn.email': 'Написати мені',
      'contact.location': 'ЛОКАЦІЯ', 'contact.mode': 'ФОРМАТ РОБОТИ', 'contact.focus': 'ФОКУС', 'contact.resume': 'РЕЗЮМЕ',
      'contact.locationVal': 'Массачусетс, США', 'contact.modeVal': 'Віддалено (США)', 'contact.download': 'Завантажити PDF',
      'footer.featured': 'Обраний проєкт зі ШІ', 'footer.about': 'Про мене', 'footer.resume': 'Резюме'
    },

    fr: {
      'a11y.skip': 'Aller au contenu principal',
      'nav.about': 'À propos', 'nav.resume': 'CV', 'nav.projects': 'Projets',
      'nav.data': 'Data Science', 'nav.qa': 'Impact QA', 'nav.contact': 'Contact', 'nav.menu': 'Menu',
      'lang.aria': 'Changer de langue',
      'hero.badge': 'Ouverte aux postes Applied AI · AI Evaluation · AI Platform',
      'hero.h1': "Je conçois des systèmes d'IA fiables, observables et testables.",
      'hero.lead': "Je combine plus de 10 ans d'ingénierie de la qualité logicielle avec un master en Data Science, IA et Machine Learning pour concevoir et évaluer des systèmes d'IA à travers les pipelines de données, les agents, la gouvernance des prompts, la télémétrie, les tests de régression et la sûreté.",
      'hero.cred': 'Master en Data Science, IA et ML — Boston University<br />Massachusetts · ouverte au télétravail aux États-Unis',
      'btn.built': "Voir ce que j'ai créé", 'btn.demo': 'Voir la démo de 6 minutes ↗', 'btn.resume': 'Télécharger le CV',
      'snap.label': 'Aperçu pour recruteurs',
      'snap.primary': 'PRINCIPAL', 'snap.quality': 'SPÉCIALITÉ QUALITÉ', 'snap.stack': 'STACK PRINCIPALE', 'snap.experience': 'EXPÉRIENCE',
      'snap.expVal': "10+ ans d'ingénierie qualité logicielle → Applied AI",
      'stats.s1': 'ans en qualité logicielle, automatisation, livraisons et ingénierie de fiabilité',
      'stats.s2': "cas d'évaluation d'IA examinés dans la plateforme d'évaluation WPH",
      'stats.s3': 'tests backend réussis à un jalon de stabilisation WPH achevé',
      'feat.eyebrow': 'Projet IA à la une',
      'feat.h2': 'World Publishing Houses — plateforme d’intelligence IA ancrée dans les sources',
      'feat.p': "J'ai conçu et développé une plateforme full-stack d'IA et de données combinant des agents de recherche contrôlés, des données éditoriales adossées à des sources, la gouvernance des prompts, la télémétrie d'exécution, l'évaluation d'IA, une sûreté déterministe et une revue humaine.",
      'feat.videoLabel': "Ce que j'ai créé : démo de la plateforme IA", 'feat.videoSub': '6:18 · présentation du produit',
      'feat.kicker': 'Ingénierie orientée production', 'feat.h3': "Plus qu'un chatbot",
      'feat.p2': "Le modèle n'est pas la source de vérité. WPH sépare les données structurées, les preuves, la sortie du modèle, la sûreté déterministe, les versions de prompts, la télémétrie, l'évaluation et la revue humaine afin que le comportement puisse être reproduit et analysé.",
      'btn.case': "Voir l'étude de cas", 'btn.live': 'Plateforme en ligne ↗',
      'work.eyebrow': 'Preuves supplémentaires', 'work.h2': "Data science et qualité d'ingénierie",
      'work.p': "WPH est le projet phare ci-dessus. Ces projets montrent la base de modélisation et d'ingénierie qualité sur laquelle je construis des systèmes d'IA.",
      'work.c1kicker': 'Projet de fin d’études ML · validation de modèle', 'work.c1h3': "Où un modèle de prix immobiliers échoue, et pourquoi",
      'work.c1p': "J'ai comparé une forêt aléatoire à une base linéaire, puis je me suis concentrée sur le comportement des résidus et les limites en production plutôt que sur la seule précision affichée.",
      'work.c1outLabel': 'Résultat :', 'work.c1out': "les résidus ont révélé une erreur systématique sur les biens haut de gamme, j'ai donc documenté cette limite au lieu de présenter le seul R².",
      'work.c1read': "Lire l'étude de cas →",
      'work.c2kicker': 'Impact professionnel · 10+ ans', 'work.c2h3': "La qualité logicielle comme atout en ingénierie IA",
      'work.c2p': "Les tests de livraison, l'automatisation, les API, le CI/CD, l'analyse des pannes et le tri fondé sur les preuves ont façonné ma manière de concevoir aujourd'hui les évaluations d'IA, les barrières de régression et l'observabilité.",
      'work.c2link': "Voir le parcours d'ingénierie →",
      'work.rowQuality': 'Régression, livraison, mobile, API, automatisation',
      'work.rowAI': 'Évaluations, sûreté, provenance, télémétrie, barrières qualité',
      'work.rowData': 'Python, SQL, PostgreSQL, analytique, validation',
      'about.eyebrow': 'À propos', 'about.h2': 'Ingénierie qualité logicielle → Applied AI',
      'about.lead': "J'ai passé plus de dix ans à me demander ce qui se passe quand un logiciel se trompe. J'applique désormais la même rigueur aux systèmes d'IA : quelles preuves étayent la réponse, qu'est-ce qui change entre les versions de prompt, comment détecter les régressions et que se passe-t-il quand la confiance est faible ?",
      'about.p': "Mon master en Data Science, IA et Machine Learning a ajouté la couche de modélisation et d'analytique. WPH est devenu l'endroit où j'ai réuni ces deux parcours en un seul système orienté production.",
      'about.edu': 'FORMATION', 'about.exp': 'EXPÉRIENCE', 'about.ai': 'APPLIED AI', 'about.data': 'DONNÉES',
      'about.expVal': "10+ ans d'ingénierie qualité logicielle et d'automatisation",
      'btn.more': 'En savoir plus sur moi →',
      'contact.h2': "Vous construisez des systèmes d'IA fiables ?",
      'contact.lead': "Je recherche des postes en télétravail à temps plein aux États-Unis en Applied AI, AI Evaluation, AI Platform et qualité avancée des données/ML.",
      'btn.email': 'Écrivez-moi',
      'contact.location': 'LOCALISATION', 'contact.mode': 'MODE DE TRAVAIL', 'contact.focus': 'FOCUS', 'contact.resume': 'CV',
      'contact.locationVal': 'Massachusetts, États-Unis', 'contact.modeVal': 'Télétravail (États-Unis)', 'contact.download': 'Télécharger le PDF',
      'footer.featured': 'Projet IA à la une', 'footer.about': 'À propos', 'footer.resume': 'CV'
    }
  };

  // ── Engine ──────────────────────────────────────────────────────────────────
  function t(lang, key) {
    return (STR[lang] && STR[lang][key] != null) ? STR[lang][key] : (STR.en[key] != null ? STR.en[key] : key);
  }

  function apply(lang) {
    if (!STR[lang]) lang = 'en';
    document.documentElement.setAttribute('lang', lang);
    // textContent
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.textContent = t(lang, el.getAttribute('data-i18n'));
    });
    // innerHTML (strings with markup, e.g. <br>)
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      el.innerHTML = t(lang, el.getAttribute('data-i18n-html'));
    });
    // attributes: data-i18n-attr="aria-label:key;placeholder:key2"
    document.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
      el.getAttribute('data-i18n-attr').split(';').forEach(function (pair) {
        var kv = pair.split(':'); if (kv.length === 2) el.setAttribute(kv[0].trim(), t(lang, kv[1].trim()));
      });
    });
    if (switcher) { switcher.value = lang; switcher.setAttribute('data-current', lang); }
  }

  function getLang() {
    var saved; try { saved = localStorage.getItem(STORE); } catch (e) {}
    if (saved && STR[saved]) return saved;
    var nav = (navigator.language || 'en').slice(0, 2).toLowerCase();
    return STR[nav] ? nav : 'en';
  }
  function setLang(lang) {
    if (!STR[lang]) return;
    try { localStorage.setItem(STORE, lang); } catch (e) {}
    apply(lang);
  }

  // ── Switcher UI (accessible <select>) ────────────────────────────────────────
  var switcher = null;
  function buildSwitcher() {
    var host = document.querySelector('[data-nav-links]') || document.querySelector('.nav-inner') || document.body;
    var wrap = document.createElement('div');
    wrap.className = 'lang-switch';
    var sel = document.createElement('select');
    sel.className = 'lang-select';
    sel.setAttribute('aria-label', t(getLang(), 'lang.aria'));
    LANGS.forEach(function (l) {
      var o = document.createElement('option'); o.value = l.code; o.textContent = l.short + ' · ' + l.label; sel.appendChild(o);
    });
    sel.addEventListener('change', function () { setLang(sel.value); });
    var globe = document.createElement('span'); globe.className = 'lang-globe'; globe.setAttribute('aria-hidden', 'true'); globe.textContent = '🌐';
    wrap.appendChild(globe); wrap.appendChild(sel);
    host.appendChild(wrap);
    switcher = sel;
  }

  function boot() {
    buildSwitcher();
    apply(getLang());
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.I18N = { set: setLang, get: getLang, apply: apply, langs: LANGS };
})();
