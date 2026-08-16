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
    { code: 'fr', label: 'Français',   short: 'FR' },
    { code: 'ro', label: 'Română',     short: 'RO' },
    { code: 'cs', label: 'Čeština',    short: 'CS' },
    { code: 'no', label: 'Norsk',      short: 'NO' },
    { code: 'is', label: 'Íslenska',   short: 'IS' },
    { code: 'sv', label: 'Svenska',    short: 'SV' },
    { code: 'da', label: 'Dansk',      short: 'DA' },
    { code: 'fi', label: 'Suomi',      short: 'FI' },
    { code: 'et', label: 'Eesti',      short: 'ET' },
    { code: 'lv', label: 'Latviešu',   short: 'LV' },
    { code: 'lt', label: 'Lietuvių',   short: 'LT' }
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
      'stats.s3': "pruebas de backend superadas en un hito completado de estabilización de WPH",
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
      'work.c1p': "Comparé un Random Forest con un modelo lineal de referencia y luego me centré en el comportamiento de los residuos y los límites de producción, no solo en la precisión general.",
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
      'contact.h2': "¿Construyes sistemas de IA fiables?",
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
      'snap.primary': 'GŁÓWNE', 'snap.quality': "SPECJALIZACJA: JAKOŚĆ", 'snap.stack': 'GŁÓWNY STACK', 'snap.experience': 'DOŚWIADCZENIE',
      'snap.expVal': '10+ lat inżynierii jakości oprogramowania → Applied AI',
      'stats.s1': 'lat w jakości oprogramowania, automatyzacji, wydaniach i inżynierii niezawodności',
      'stats.s2': 'przejrzanych przypadków oceny AI na platformie ewaluacyjnej WPH',
      'stats.s3': 'testów backendu zaliczonych na ukończonym kamieniu milowym stabilizacji WPH',
      'feat.eyebrow': 'Wyróżniony projekt AI',
      'feat.h2': 'World Publishing Houses — platforma inteligencji AI oparta na źródłach',
      'feat.p': "Zaprojektowałam i zbudowałam platformę AI i danych typu full-stack, łączącą kontrolowane agenty badawcze, dane wydawnicze oparte na źródłach, zarządzanie promptami, telemetrię wykonania, ocenę AI, deterministyczne bezpieczeństwo i weryfikację przez człowieka.",
      'feat.videoLabel': 'Co zbudowałam: demo platformy AI', 'feat.videoSub': '6:18 · prezentacja produktu',
      'feat.kicker': 'Inżynieria zorientowana na produkcję', 'feat.h3': 'Więcej niż chatbot',
      'feat.p2': "Model nie jest źródłem prawdy. WPH oddziela dane ustrukturyzowane, dowody, wyjście modelu, deterministyczne bezpieczeństwo, wersje promptów, telemetrię, ocenę i weryfikację przez człowieka, aby zachowanie można było odtworzyć i zbadać.",
      'btn.case': 'Zobacz studium przypadku', 'btn.live': 'Platforma na żywo ↗',
      'work.eyebrow': 'Dodatkowe dowody', 'work.h2': "Data science i jakość inżynierska",
      'work.p': 'WPH to flagowy projekt powyżej. Te projekty pokazują fundament modelowania i inżynierii jakości, na którym opieram budowę systemów AI.',
      'work.c1kicker': 'Projekt dyplomowy ML · walidacja modelu', 'work.c1h3': 'Gdzie i dlaczego model cen mieszkań zawodzi',
      'work.c1p': "Porównałam Random Forest z liniową bazą odniesienia, a następnie skupiłam się na zachowaniu reszt i ograniczeniach produkcyjnych, a nie tylko na ogólnej dokładności.",
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
      'hero.h1': "Я створюю надійні, спостережувані та придатні для тестування системи ШІ.",
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
      'work.c2p': "Тестування релізів, автоматизація, API, CI/CD, аналіз збоїв і тріаж на основі доказів сформували те, як я тепер проєктую оцінювання ШІ, регресійні бар’єри та спостережуваність.",
      'work.c2link': 'Переглянути інженерний доробок →',
      'work.rowQuality': 'Регресія, релізи, мобільні, API, автоматизація',
      'work.rowAI': 'Оцінювання, безпека, походження, телеметрія, бар’єри якості',
      'work.rowData': 'Python, SQL, PostgreSQL, аналітика, валідація',
      'about.eyebrow': 'Про мене', 'about.h2': 'Інженерія якості ПЗ → Applied AI',
      'about.lead': 'Понад десять років я запитувала, що стається, коли програмне забезпечення помиляється. Тепер я застосовую ту саму дисципліну до систем ШІ: які докази підтверджують відповідь, що змінюється між версіями промптів, як виявляти регресії та що робити, коли впевненість низька.',
      'about.p': "Мій магістерський ступінь з Data Science, ШІ та машинного навчання додав шар моделювання й аналітики. WPH став місцем, де я поєднала обидва напрями в одну систему, орієнтовану на продакшн.",
      'about.edu': 'ОСВІТА', 'about.exp': 'ДОСВІД', 'about.ai': 'APPLIED AI', 'about.data': 'ДАНІ',
      'about.expVal': '10+ років інженерії якості ПЗ та автоматизації',
      'btn.more': 'Більше про мене →',
      'contact.h2': 'Будуєте надійні системи ШІ?',
      'contact.lead': "Мене цікавлять повноставкові віддалені ролі в США в напрямах Applied AI, AI Evaluation, AI Platform та поглибленої якості даних/ML.",
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
      'hero.lead': "Je combine plus de 10 ans d'ingénierie de la qualité logicielle avec un master en Data Science, IA et Machine Learning pour concevoir et évaluer des systèmes d'IA couvrant les pipelines de données, les agents, la gouvernance des prompts, la télémétrie, les tests de régression et la sûreté.",
      'hero.cred': 'Master en Data Science, IA et ML — Boston University<br />Massachusetts · ouverte au télétravail aux États-Unis',
      'btn.built': "Voir ce que j'ai créé", 'btn.demo': 'Voir la démo de 6 minutes ↗', 'btn.resume': 'Télécharger le CV',
      'snap.label': 'Aperçu pour recruteurs',
      'snap.primary': 'PRINCIPAL', 'snap.quality': 'SPÉCIALITÉ QUALITÉ', 'snap.stack': 'STACK PRINCIPALE', 'snap.experience': 'EXPÉRIENCE',
      'snap.expVal': "10+ ans d'ingénierie qualité logicielle → Applied AI",
      'stats.s1': 'ans en qualité logicielle, automatisation, livraisons et ingénierie de fiabilité',
      'stats.s2': "cas d'évaluation d'IA examinés sur la plateforme d'évaluation WPH",
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
      'work.c1p': "J'ai comparé un Random Forest à un modèle linéaire de référence, puis je me suis concentrée sur le comportement des résidus et les limites en production plutôt que sur la seule précision affichée.",
      'work.c1outLabel': 'Résultat :', 'work.c1out': "les résidus ont révélé une erreur systématique sur les biens haut de gamme, j'ai donc documenté cette limite au lieu de présenter le seul R².",
      'work.c1read': "Lire l'étude de cas →",
      'work.c2kicker': 'Impact professionnel · 10+ ans', 'work.c2h3': "La qualité logicielle comme atout en ingénierie IA",
      'work.c2p': "Les tests de livraison, l'automatisation, les API, le CI/CD, l'analyse des défaillances et le triage fondé sur les preuves ont façonné ma manière de concevoir aujourd'hui les évaluations d'IA, les barrières de régression et l'observabilité.",
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
    },

    ro: {
      'a11y.skip': 'Sari la conținutul principal',
      'nav.about': 'Despre', 'nav.resume': 'CV', 'nav.projects': 'Proiecte', 'nav.data': 'Data Science', 'nav.qa': 'Impact QA', 'nav.contact': 'Contact', 'nav.menu': 'Meniu',
      'lang.aria': 'Schimbă limba',
      'hero.badge': "Deschisă către roluri Applied AI · AI Evaluation · AI Platform",
      'hero.h1': 'Construiesc sisteme AI fiabile, observabile și testabile.',
      'hero.lead': 'Combin peste 10 ani de inginerie a calității software cu un masterat în Data Science, AI și Machine Learning pentru a construi și evalua sisteme AI în pipeline-uri de date, agenți, guvernanța prompturilor, telemetrie, testare de regresie și siguranță.',
      'hero.cred': "Masterat în Data Science, AI și ML — Boston University<br />Massachusetts · deschisă către roluri remote în SUA",
      'btn.built': 'Vezi ce am construit', 'btn.demo': "Urmărește demoul de 6 minute ↗", 'btn.resume': 'Descarcă CV-ul',
      'snap.label': 'Rezumat pentru recrutori',
      'snap.primary': 'PRINCIPAL', 'snap.quality': 'SPECIALIZARE CALITATE', 'snap.stack': 'STACK PRINCIPAL', 'snap.experience': 'EXPERIENȚĂ',
      'snap.expVal': "10+ ani de inginerie a calității software → Applied AI",
      'stats.s1': 'ani în calitatea software, automatizare, release și ingineria fiabilității',
      'stats.s2': 'cazuri de evaluare AI analizate în platforma de evaluare WPH',
      'stats.s3': 'teste de backend trecute la un jalon de stabilizare WPH finalizat',
      'feat.eyebrow': 'Proiect AI evidențiat',
      'feat.h2': 'World Publishing Houses — platformă de inteligență AI ancorată în surse',
      'feat.p': 'Am proiectat și construit o platformă full-stack de AI și date care combină agenți de cercetare controlați, date editoriale susținute de surse, guvernanța prompturilor, telemetrie de execuție, evaluare AI, siguranță deterministă și revizuire umană.',
      'feat.videoLabel': "Ce am construit: demo al platformei AI", 'feat.videoSub': '6:18 · prezentarea produsului',
      'feat.kicker': 'Inginerie orientată spre producție', 'feat.h3': 'Mai mult decât un chatbot',
      'feat.p2': 'Modelul nu este sursa adevărului. WPH separă datele structurate, dovezile, ieșirea modelului, siguranța deterministă, versiunile de prompt, telemetria, evaluarea și revizuirea umană, astfel încât comportamentul să poată fi reprodus și investigat.',
      'btn.case': 'Vezi studiul de caz', 'btn.live': 'Platformă live ↗',
      'work.eyebrow': 'Dovezi suplimentare', 'work.h2': 'Data science și calitatea ingineriei',
      'work.p': "WPH este proiectul emblematic de mai sus. Aceste proiecte arată fundamentul de modelare și inginerie a calității din spatele modului în care construiesc sisteme AI.",
      'work.c1kicker': 'Proiect final ML · validarea modelului', 'work.c1h3': 'Unde cedează un model de prețuri imobiliare și de ce',
      'work.c1p': "Am comparat un Random Forest cu o bază liniară, apoi m-am concentrat pe comportamentul reziduurilor și pe limitele de producție, nu doar pe acuratețea globală.",
      'work.c1outLabel': 'Rezultat:', 'work.c1out': "reziduurile au evidențiat o eroare sistematică la locuințele de lux, așa că am documentat această limitare în loc să prezint doar R².",
      'work.c1read': 'Citește studiul de caz →',
      'work.c2kicker': 'Impact profesional · 10+ ani', 'work.c2h3': 'Calitatea software ca avantaj în ingineria AI',
      'work.c2p': 'Testarea de release, automatizarea, API-urile, CI/CD, analiza defectelor și triajul bazat pe dovezi au modelat felul în care proiectez acum evaluări AI, bariere de regresie și observabilitate.',
      'work.c2link': 'Vezi parcursul de inginerie →',
      'work.rowQuality': 'Regresie, release, mobil, API, automatizare',
      'work.rowAI': 'Evaluări, siguranță, proveniență, telemetrie, bariere de calitate',
      'work.rowData': 'Python, SQL, PostgreSQL, analiză, validare',
      'about.eyebrow': 'Despre', 'about.h2': 'Inginerie a calității software → Applied AI',
      'about.lead': 'Am petrecut peste un deceniu întrebându-mă ce se întâmplă când software-ul greșește. Acum aplic aceeași disciplină sistemelor AI: ce dovezi susțin răspunsul, ce se schimbă între versiunile de prompt, cum detectăm regresiile și ce se întâmplă când încrederea este scăzută?',
      'about.p': 'Masteratul meu în Data Science, AI și Machine Learning a adăugat stratul de modelare și analiză. WPH a devenit locul unde am combinat ambele experiențe într-un singur sistem orientat spre producție.',
      'about.edu': 'EDUCAȚIE', 'about.exp': 'EXPERIENȚĂ', 'about.ai': 'APPLIED AI', 'about.data': 'DATE',
      'about.expVal': '10+ ani de inginerie a calității software și automatizare',
      'btn.more': 'Mai multe despre mine →',
      'contact.h2': 'Construiești sisteme AI fiabile?',
      'contact.lead': 'Sunt interesată de roluri remote full-time în SUA în Applied AI, AI Evaluation, AI Platform și calitate avansată a datelor/ML.',
      'btn.email': 'Scrie-mi',
      'contact.location': 'LOCAȚIE', 'contact.mode': 'MOD DE LUCRU', 'contact.focus': 'FOCUS', 'contact.resume': 'CV',
      'contact.locationVal': 'Massachusetts, SUA', 'contact.modeVal': 'Remote (SUA)', 'contact.download': 'Descarcă PDF',
      'footer.featured': 'Proiect AI evidențiat', 'footer.about': 'Despre', 'footer.resume': 'CV'
    },

    cs: {
      'a11y.skip': "Přeskočit na hlavní obsah",
      'nav.about': 'O mně', 'nav.resume': 'Životopis', 'nav.projects': 'Projekty', 'nav.data': 'Data Science', 'nav.qa': 'Přínos QA', 'nav.contact': 'Kontakt', 'nav.menu': 'Menu',
      'lang.aria': 'Změnit jazyk',
      'hero.badge': 'Otevřená rolím Applied AI · AI Evaluation · AI Platform',
      'hero.h1': 'Vytvářím AI systémy, které jsou spolehlivé, pozorovatelné a testovatelné.',
      'hero.lead': 'Spojuji více než 10 let inženýrství kvality softwaru s magisterským titulem v oboru Data Science, AI a strojové učení, abych budovala a hodnotila AI systémy napříč datovými toky, agenty, správou promptů, telemetrií, regresním testováním a bezpečností.',
      'hero.cred': 'Magistr Data Science, AI a ML — Boston University<br />Massachusetts · otevřená práci na dálku v USA',
      'btn.built': 'Podívejte se, co jsem vytvořila', 'btn.demo': 'Přehrát 6minutové demo ↗', 'btn.resume': 'Stáhnout životopis',
      'snap.label': 'Přehled pro náboráře',
      'snap.primary': 'HLAVNÍ', 'snap.quality': 'SPECIALIZACE NA KVALITU', 'snap.stack': 'HLAVNÍ STACK', 'snap.experience': 'ZKUŠENOSTI',
      'snap.expVal': '10+ let inženýrství kvality softwaru → Applied AI',
      'stats.s1': 'let v kvalitě softwaru, automatizaci, releasech a inženýrství spolehlivosti',
      'stats.s2': 'zkontrolovaných případů hodnocení AI na platformě WPH',
      'stats.s3': 'backendových testů prošlo v dokončeném milníku stabilizace WPH',
      'feat.eyebrow': 'Vybraný AI projekt',
      'feat.h2': 'World Publishing Houses — platforma AI inteligence ukotvená ve zdrojích',
      'feat.p': 'Navrhla a vytvořila jsem full-stack platformu AI a dat kombinující řízené výzkumné agenty, vydavatelská data podložená zdroji, správu promptů, telemetrii běhu, hodnocení AI, deterministickou bezpečnost a lidskou kontrolu.',
      'feat.videoLabel': 'Co jsem vytvořila: demo AI platformy', 'feat.videoSub': '6:18 · průvodce produktem',
      'feat.kicker': 'Inženýrství zaměřené na produkci', 'feat.h3': "Víc než jen chatbot",
      'feat.p2': 'Model není zdrojem pravdy. WPH odděluje strukturovaná data, důkazy, výstup modelu, deterministickou bezpečnost, verze promptů, telemetrii, hodnocení a lidskou kontrolu, aby bylo chování možné reprodukovat a prozkoumat.',
      'btn.case': 'Prozkoumat případovou studii', 'btn.live': 'Živá platforma ↗',
      'work.eyebrow': 'Další důkazy', 'work.h2': 'Data science a kvalita inženýrství',
      'work.p': 'WPH je vlajkový projekt výše. Tyto projekty ukazují základ modelování a inženýrství kvality, na němž stavím AI systémy.',
      'work.c1kicker': 'Závěrečný ML projekt · validace modelu', 'work.c1h3': 'Kde a proč selhává model cen nemovitostí',
      'work.c1p': "Porovnala jsem Random Forest s lineárním základním modelem a pak se zaměřila na chování reziduí a produkční limity, ne jen na hlavní přesnost.",
      'work.c1outLabel': 'Výsledek:', 'work.c1out': "rezidua odhalila systematickou chybu u drahých domů, proto jsem toto omezení zdokumentovala místo uvádění samotného R².",
      'work.c1read': 'Přečíst případovou studii →',
      'work.c2kicker': 'Profesní přínos · 10+ let', 'work.c2h3': 'Kvalita softwaru jako výhoda v inženýrství AI',
      'work.c2p': 'Testování releasů, automatizace, API, CI/CD, analýza selhání a triáž založená na důkazech utvářely, jak dnes navrhuji hodnocení AI, regresní brány a pozorovatelnost.',
      'work.c2link': 'Zobrazit inženýrské portfolio →',
      'work.rowQuality': 'Regrese, release, mobil, API, automatizace',
      'work.rowAI': 'Hodnocení, bezpečnost, původ, telemetrie, brány kvality',
      'work.rowData': 'Python, SQL, PostgreSQL, analytika, validace',
      'about.eyebrow': 'O mně', 'about.h2': 'Inženýrství kvality softwaru → Applied AI',
      'about.lead': 'Přes deset let jsem se ptala, co se stane, když software chybuje. Stejnou disciplínu teď uplatňuji na AI systémy: jaké důkazy podporují odpověď, co se mění mezi verzemi promptů, jak odhalit regrese a co se stane, když je jistota nízká?',
      'about.p': 'Můj magisterský titul v oboru Data Science, AI a strojové učení přidal vrstvu modelování a analytiky. WPH se stalo místem, kde jsem obě zázemí spojila do jednoho systému zaměřeného na produkci.',
      'about.edu': 'VZDĚLÁNÍ', 'about.exp': 'ZKUŠENOSTI', 'about.ai': 'APPLIED AI', 'about.data': 'DATA',
      'about.expVal': '10+ let inženýrství kvality softwaru a automatizace',
      'btn.more': 'Více o mně →',
      'contact.h2': 'Stavíte spolehlivé AI systémy?',
      'contact.lead': 'Mám zájem o práci na plný úvazek na dálku v USA v oblastech Applied AI, AI Evaluation, AI Platform a pokročilé kvality dat/ML.',
      'btn.email': 'Napište mi',
      'contact.location': 'LOKALITA', 'contact.mode': 'REŽIM PRÁCE', 'contact.focus': 'ZAMĚŘENÍ', 'contact.resume': 'ŽIVOTOPIS',
      'contact.locationVal': 'Massachusetts, USA', 'contact.modeVal': 'Na dálku (USA)', 'contact.download': 'Stáhnout PDF',
      'footer.featured': 'Vybraný AI projekt', 'footer.about': 'O mně', 'footer.resume': 'Životopis'
    },

    no: {
      'a11y.skip': 'Gå til hovedinnhold',
      'nav.about': 'Om meg', 'nav.resume': 'CV', 'nav.projects': 'Prosjekter', 'nav.data': 'Data Science', 'nav.qa': 'QA-innvirkning', 'nav.contact': 'Kontakt', 'nav.menu': 'Meny',
      'lang.aria': 'Bytt språk',
      'hero.badge': 'Åpen for roller innen Applied AI · AI Evaluation · AI Platform',
      'hero.h1': 'Jeg bygger AI-systemer som er pålitelige, observerbare og testbare.',
      'hero.lead': 'Jeg kombinerer over 10 års erfaring med programvarekvalitet og en mastergrad i Data Science, AI og maskinlæring for å bygge og evaluere AI-systemer på tvers av datapipelines, agenter, promptstyring, telemetri, regresjonstesting og sikkerhet.',
      'hero.cred': 'Master i Data Science, AI og ML — Boston University<br />Massachusetts · åpen for fjernarbeid i USA',
      'btn.built': 'Se hva jeg har bygd', 'btn.demo': 'Se 6-minutters demo ↗', 'btn.resume': 'Last ned CV',
      'snap.label': 'Oversikt for rekrutterere',
      'snap.primary': 'PRIMÆRT', 'snap.quality': 'KVALITETSSPESIALITET', 'snap.stack': 'KJERNESTACK', 'snap.experience': 'ERFARING',
      'snap.expVal': '10+ år med programvarekvalitet → Applied AI',
      'stats.s1': "år innen programvarekvalitet, automatisering, release og pålitelighetsarbeid",
      'stats.s2': 'gjennomgåtte AI-evalueringssaker i WPH-evalueringsplattformen',
      'stats.s3': 'backend-tester bestått ved en fullført WPH-stabiliseringsmilepæl',
      'feat.eyebrow': 'Utvalgt AI-prosjekt',
      'feat.h2': 'World Publishing Houses — kildeforankret AI-intelligensplattform',
      'feat.p': 'Jeg designet og bygde en full-stack AI- og dataplattform som kombinerer kontrollerte forskningsagenter, kildebaserte forlagsdata, promptstyring, kjøretelemetri, AI-evaluering, deterministisk sikkerhet og menneskelig gjennomgang.',
      'feat.videoLabel': 'Det jeg bygde: demo av AI-plattformen', 'feat.videoSub': '6:18 · produktgjennomgang',
      'feat.kicker': 'Produksjonsrettet ingeniørarbeid', 'feat.h3': 'Mer enn en chatbot',
      'feat.p2': 'Modellen er ikke sannhetskilden. WPH skiller strukturerte data, bevis, modellutdata, deterministisk sikkerhet, promptversjoner, telemetri, evaluering og menneskelig gjennomgang slik at atferd kan reproduseres og undersøkes.',
      'btn.case': 'Utforsk casestudien', 'btn.live': 'Live plattform ↗',
      'work.eyebrow': 'Ytterligere bevis', 'work.h2': 'Data science og ingeniørkvalitet',
      'work.p': 'WPH er flaggskipet over. Disse prosjektene viser modellerings- og kvalitetsgrunnlaget bak måten jeg bygger AI-systemer på.',
      'work.c1kicker': "Avsluttende ML-prosjekt · modellvalidering", 'work.c1h3': 'Hvor en boligprismodell svikter, og hvorfor',
      'work.c1p': "Jeg sammenlignet en Random Forest med en lineær baseline, og fokuserte deretter på residualatferd og produksjonsgrenser fremfor bare den overordnede nøyaktigheten.",
      'work.c1outLabel': 'Resultat:', 'work.c1out': 'residualene avdekket systematisk feil på dyre boliger, så jeg dokumenterte denne begrensningen i stedet for å presentere kun R².',
      'work.c1read': 'Les casestudien →',
      'work.c2kicker': 'Faglig innvirkning · 10+ år', 'work.c2h3': 'Programvarekvalitet som fortrinn i AI-ingeniørarbeid',
      'work.c2p': 'Release-testing, automatisering, API-er, CI/CD, feilanalyse og bevisbasert triage formet hvordan jeg nå utformer AI-evalueringer, regresjonsporter og observerbarhet.',
      'work.c2link': 'Se ingeniørhistorikken →',
      'work.rowQuality': 'Regresjon, release, mobil, API, automatisering',
      'work.rowAI': 'Evalueringer, sikkerhet, opphav, telemetri, kvalitetsporter',
      'work.rowData': 'Python, SQL, PostgreSQL, analyse, validering',
      'about.eyebrow': 'Om meg', 'about.h2': 'Programvarekvalitet → Applied AI',
      'about.lead': "Jeg brukte mer enn et tiår på å spørre hva som skjer når programvare tar feil. Nå bruker jeg samme disiplin på AI-systemer: hvilke bevis støtter svaret, hva endres mellom promptversjoner, hvordan oppdager vi regresjoner, og hva skjer når konfidensen er lav?",
      'about.p': 'Mastergraden min i Data Science, AI og maskinlæring la til modellerings- og analyselaget. WPH ble stedet der jeg forente begge bakgrunnene i ett produksjonsrettet system.',
      'about.edu': 'UTDANNING', 'about.exp': 'ERFARING', 'about.ai': 'APPLIED AI', 'about.data': 'DATA',
      'about.expVal': '10+ år med programvarekvalitet og automatisering',
      'btn.more': 'Mer om meg →',
      'contact.h2': 'Bygger du pålitelige AI-systemer?',
      'contact.lead': 'Jeg er interessert i heltids fjernstillinger i USA innen Applied AI, AI Evaluation, AI Platform og avansert data-/ML-kvalitet.',
      'btn.email': 'Send meg e-post',
      'contact.location': 'STED', 'contact.mode': 'ARBEIDSFORM', 'contact.focus': 'FOKUS', 'contact.resume': 'CV',
      'contact.locationVal': 'Massachusetts, USA', 'contact.modeVal': 'Fjernarbeid (USA)', 'contact.download': 'Last ned PDF',
      'footer.featured': 'Utvalgt AI-prosjekt', 'footer.about': 'Om meg', 'footer.resume': 'CV'
    },

    is: {
      'a11y.skip': 'Fara í meginmál',
      'nav.about': 'Um mig', 'nav.resume': 'Ferilskrá', 'nav.projects': 'Verkefni', 'nav.data': 'Data Science', 'nav.qa': 'QA-áhrif', 'nav.contact': 'Hafa samband', 'nav.menu': 'Valmynd',
      'lang.aria': 'Skipta um tungumál',
      'hero.badge': 'Opin fyrir störf í Applied AI · AI Evaluation · AI Platform',
      'hero.h1': 'Ég smíða gervigreindarkerfi sem eru áreiðanleg, sýnileg og prófanleg.',
      'hero.lead': "Ég sameina yfir 10 ára reynslu í hugbúnaðargæðaverkfræði og meistaragráðu í Data Science, gervigreind og vélrænu námi til að smíða og meta gervigreindarkerfi þvert á gagnaleiðslur, umboð (agents), stjórnun beiðna (prompts), fjarmælingar, aðhvarfsprófanir og öryggi.",
      'hero.cred': 'Meistaragráða í Data Science, gervigreind og ML — Boston University<br />Massachusetts · opin fyrir fjarvinnu í Bandaríkjunum',
      'btn.built': 'Sjáðu hvað ég smíðaði', 'btn.demo': 'Horfa á 6 mínútna kynningu ↗', 'btn.resume': 'Sækja ferilskrá',
      'snap.label': 'Yfirlit fyrir ráðningaraðila',
      'snap.primary': 'AÐALSVIÐ', 'snap.quality': 'GÆÐASÉRHÆFING', 'snap.stack': 'KJARNATÆKNI', 'snap.experience': 'REYNSLA',
      'snap.expVal': '10+ ár í hugbúnaðargæðaverkfræði → Applied AI',
      'stats.s1': 'ár í hugbúnaðargæðum, sjálfvirkni, útgáfum og áreiðanleikaverkfræði',
      'stats.s2': 'yfirfarin gervigreindarmatstilvik á WPH-matsvettvangnum',
      'stats.s3': 'bakendaprófanir stóðust á loknum WPH-stöðugleikaáfanga',
      'feat.eyebrow': 'Valið gervigreindarverkefni',
      'feat.h2': 'World Publishing Houses — heimildatengdur gervigreindarvettvangur',
      'feat.p': "Ég hannaði og smíðaði full-stack gervigreindar- og gagnavettvang sem sameinar stýrð rannsóknarumboð (agents), útgáfugögn studd heimildum, stjórnun beiðna, keyrslufjarmælingar, gervigreindarmat, determínískt öryggi og yfirferð fólks.",
      'feat.videoLabel': 'Það sem ég smíðaði: kynning á gervigreindarvettvangi', 'feat.videoSub': '6:18 · yfirferð vöru',
      'feat.kicker': 'Verkfræði með áherslu á framleiðslu', 'feat.h3': 'Meira en spjallmenni',
      'feat.p2': "Líkanið er ekki uppspretta sannleikans. WPH aðskilur skipulögð gögn, sönnunargögn, úttak líkans, determínískt öryggi, útgáfur beiðna, fjarmælingar, mat og yfirferð fólks svo hægt sé að endurgera og rannsaka hegðun.",
      'btn.case': 'Skoða tilviksrannsókn', 'btn.live': 'Vettvangur í beinni ↗',
      'work.eyebrow': 'Frekari sönnun', 'work.h2': "Data Science og verkfræðileg gæði",
      'work.p': 'WPH er flaggskipið að ofan. Þessi verkefni sýna grunninn í líkanagerð og gæðaverkfræði sem liggur að baki því hvernig ég smíða gervigreindarkerfi.',
      'work.c1kicker': 'ML-lokaverkefni · staðfesting líkans', 'work.c1h3': 'Hvar húsnæðisverðslíkan brestur, og hvers vegna',
      'work.c1p': 'Ég bar saman Random Forest við línulegan grunn og einbeitti mér svo að hegðun leifa (residuals) og framleiðslutakmörkunum frekar en aðeins heildarnákvæmni.',
      'work.c1outLabel': 'Niðurstaða:', 'work.c1out': 'leifarnar afhjúpuðu kerfisbundna skekkju í dýrum húsum, svo ég skjalfesti þá takmörkun í stað þess að sýna aðeins R².',
      'work.c1read': 'Lesa tilviksrannsóknina →',
      'work.c2kicker': 'Fagleg áhrif · 10+ ár', 'work.c2h3': 'Hugbúnaðargæði sem forskot í gervigreindarverkfræði',
      'work.c2p': 'Útgáfuprófanir, sjálfvirkni, API, CI/CD, bilanagreining og sönnunarmiðuð forgangsröðun mótuðu hvernig ég hanna nú gervigreindarmat, aðhvarfshlið og sýnileika.',
      'work.c2link': 'Sjá verkfræðiferilinn →',
      'work.rowQuality': 'Aðhvarf, útgáfur, farsími, API, sjálfvirkni',
      'work.rowAI': 'Mat, öryggi, uppruni, fjarmælingar, gæðahlið',
      'work.rowData': 'Python, SQL, PostgreSQL, greining, staðfesting',
      'about.eyebrow': 'Um mig', 'about.h2': 'Hugbúnaðargæðaverkfræði → Applied AI',
      'about.lead': 'Ég varði meira en áratug í að spyrja hvað gerist þegar hugbúnaður hefur rangt fyrir sér. Nú beiti ég sömu aga á gervigreindarkerfi: hvaða gögn styðja svarið, hvað breytist milli útgáfa beiðna, hvernig greinum við afturför og hvað gerist þegar vissan er lítil?',
      'about.p': 'Meistaragráða mín í Data Science, gervigreind og vélrænu námi bætti við líkana- og greiningarlaginu. WPH varð staðurinn þar sem ég sameinaði bæði sviðin í eitt framleiðslumiðað kerfi.',
      'about.edu': 'MENNTUN', 'about.exp': 'REYNSLA', 'about.ai': 'APPLIED AI', 'about.data': 'GÖGN',
      'about.expVal': '10+ ár í hugbúnaðargæðaverkfræði og sjálfvirkni',
      'btn.more': 'Meira um mig →',
      'contact.h2': 'Ertu að smíða áreiðanleg gervigreindarkerfi?',
      'contact.lead': 'Ég hef áhuga á fullu fjarstarfi í Bandaríkjunum í Applied AI, AI Evaluation, AI Platform og háþróuðum gagna-/ML-gæðum.',
      'btn.email': 'Sendu mér tölvupóst',
      'contact.location': 'STAÐSETNING', 'contact.mode': 'VINNUFYRIRKOMULAG', 'contact.focus': 'ÁHERSLA', 'contact.resume': 'FERILSKRÁ',
      'contact.locationVal': "Massachusetts, Bandaríkin", 'contact.modeVal': 'Fjarvinna (BNA)', 'contact.download': 'Sækja PDF',
      'footer.featured': 'Valið gervigreindarverkefni', 'footer.about': 'Um mig', 'footer.resume': 'Ferilskrá'
    },

    sv: {
      'a11y.skip': 'Hoppa till huvudinnehållet',
      'nav.about': 'Om mig', 'nav.resume': 'CV', 'nav.projects': 'Projekt', 'nav.data': 'Data Science', 'nav.qa': 'QA-påverkan', 'nav.contact': 'Kontakt', 'nav.menu': 'Meny',
      'lang.aria': 'Byt språk',
      'hero.badge': 'Öppen för roller inom Applied AI · AI Evaluation · AI Platform',
      'hero.h1': 'Jag bygger AI-system som är pålitliga, observerbara och testbara.',
      'hero.lead': "Jag kombinerar över 10 års erfarenhet av mjukvarukvalitet med en master i Data Science, AI och maskininlärning för att bygga och utvärdera AI-system som spänner över datapipelines, agenter, promptstyrning, telemetri, regressionstestning och säkerhet.",
      'hero.cred': 'Master i Data Science, AI och ML — Boston University<br />Massachusetts · öppen för distansarbete i USA',
      'btn.built': 'Se vad jag byggt', 'btn.demo': 'Se 6-minuters demo ↗', 'btn.resume': 'Ladda ner CV',
      'snap.label': 'Översikt för rekryterare',
      'snap.primary': 'PRIMÄRT', 'snap.quality': 'KVALITETSSPECIALITET', 'snap.stack': 'KÄRNSTACK', 'snap.experience': 'ERFARENHET',
      'snap.expVal': '10+ år av mjukvarukvalitet → Applied AI',
      'stats.s1': 'år inom mjukvarukvalitet, automatisering, release och tillförlitlighetsteknik',
      'stats.s2': 'granskade AI-utvärderingsfall i WPH-utvärderingsplattformen',
      'stats.s3': 'backend-tester godkända vid en slutförd WPH-stabiliseringsmilstolpe',
      'feat.eyebrow': 'Utvalt AI-projekt',
      'feat.h2': 'World Publishing Houses — källförankrad AI-intelligensplattform',
      'feat.p': 'Jag designade och byggde en full-stack AI- och dataplattform som kombinerar kontrollerade forskningsagenter, källbelagd förlagsdata, promptstyrning, exekveringstelemetri, AI-utvärdering, deterministisk säkerhet och mänsklig granskning.',
      'feat.videoLabel': 'Det jag byggde: demo av AI-plattformen', 'feat.videoSub': '6:18 · produktgenomgång',
      'feat.kicker': 'Produktionsinriktad teknik', 'feat.h3': 'Mer än en chatbot',
      'feat.p2': 'Modellen är inte sanningskällan. WPH separerar strukturerad data, bevis, modellutdata, deterministisk säkerhet, promptversioner, telemetri, utvärdering och mänsklig granskning så att beteendet kan återskapas och undersökas.',
      'btn.case': 'Utforska fallstudien', 'btn.live': 'Live-plattform ↗',
      'work.eyebrow': 'Ytterligare bevis', 'work.h2': 'Data science och teknisk kvalitet',
      'work.p': 'WPH är flaggskeppet ovan. Dessa projekt visar modellerings- och kvalitetsgrunden bakom hur jag bygger AI-system.',
      'work.c1kicker': 'ML-examensprojekt · modellvalidering', 'work.c1h3': 'Var en bostadsprismodell brister, och varför',
      'work.c1p': 'Jag jämförde en Random Forest mot en linjär baslinje och fokuserade sedan på residualbeteende och produktionsgränser snarare än enbart rubriknoggrannhet.',
      'work.c1outLabel': 'Resultat:', 'work.c1out': 'residualerna avslöjade systematiskt fel på dyra bostäder, så jag dokumenterade den begränsningen i stället för att presentera enbart R².',
      'work.c1read': 'Läs fallstudien →',
      'work.c2kicker': 'Yrkesmässig påverkan · 10+ år', 'work.c2h3': 'Mjukvarukvalitet som fördel i AI-teknik',
      'work.c2p': 'Release-testning, automatisering, API:er, CI/CD, felanalys och bevisbaserad triage formade hur jag nu utformar AI-utvärderingar, regressionsgrindar och observerbarhet.',
      'work.c2link': 'Se den tekniska meritförteckningen →',
      'work.rowQuality': 'Regression, release, mobil, API, automatisering',
      'work.rowAI': 'Utvärderingar, säkerhet, härkomst, telemetri, kvalitetsgrindar',
      'work.rowData': 'Python, SQL, PostgreSQL, analys, validering',
      'about.eyebrow': 'Om mig', 'about.h2': 'Mjukvarukvalitet → Applied AI',
      'about.lead': "Jag ägnade mer än ett decennium åt att fråga vad som händer när mjukvara har fel. Nu tillämpar jag samma disciplin på AI-system: vilka bevis stöder svaret, vad ändras mellan promptversioner, hur upptäcker vi regressioner och vad händer när konfidensen är låg?",
      'about.p': 'Min master i Data Science, AI och maskininlärning lade till modellerings- och analyslagret. WPH blev platsen där jag förenade båda bakgrunderna i ett produktionsinriktat system.',
      'about.edu': 'UTBILDNING', 'about.exp': 'ERFARENHET', 'about.ai': 'APPLIED AI', 'about.data': 'DATA',
      'about.expVal': '10+ år av mjukvarukvalitet och automatisering',
      'btn.more': 'Mer om mig →',
      'contact.h2': 'Bygger du pålitliga AI-system?',
      'contact.lead': 'Jag är intresserad av heltidsjobb på distans i USA inom Applied AI, AI Evaluation, AI Platform och avancerad data-/ML-kvalitet.',
      'btn.email': 'Mejla mig',
      'contact.location': 'PLATS', 'contact.mode': "ARBETSFORM", 'contact.focus': 'FOKUS', 'contact.resume': 'CV',
      'contact.locationVal': 'Massachusetts, USA', 'contact.modeVal': 'Distans (USA)', 'contact.download': 'Ladda ner PDF',
      'footer.featured': 'Utvalt AI-projekt', 'footer.about': 'Om mig', 'footer.resume': 'CV'
    },

    da: {
      'a11y.skip': "Gå til hovedindholdet",
      'nav.about': "Om mig", 'nav.resume': "CV", 'nav.projects': "Projekter", 'nav.data': "Data Science", 'nav.qa': "QA-effekt", 'nav.contact': "Kontakt", 'nav.menu': "Menu",
      'lang.aria': "Skift sprog",
      'hero.badge': "Åben for roller inden for Applied AI · AI Evaluation · AI Platform",
      'hero.h1': "Jeg bygger AI-systemer, der er pålidelige, observerbare og testbare.",
      'hero.lead': "Jeg kombinerer over 10 års erfaring inden for softwarekvalitet med en kandidatgrad i Data Science, AI og maskinlæring for at bygge og evaluere AI-systemer på tværs af datapipelines, agenter, promptstyring, telemetri, regressionstest og sikkerhed.",
      'hero.cred': "Kandidat i Data Science, AI og ML — Boston University<br />Massachusetts · åben for fjernarbejde i USA",
      'btn.built': "Se hvad jeg har bygget", 'btn.demo': "Se 6-minutters demo ↗", 'btn.resume': "Download CV",
      'snap.label': "Overblik for rekrutterere",
      'snap.primary': "PRIMÆRT", 'snap.quality': "KVALITETSSPECIALISERING", 'snap.stack': "KERNESTACK", 'snap.experience': "ERFARING",
      'snap.expVal': "10+ års softwarekvalitet → Applied AI",
      'stats.s1': "års erfaring med softwarekvalitet, automatisering, release og pålidelighed",
      'stats.s2': "gennemgåede AI-evalueringssager i WPH-evalueringsplatformen",
      'stats.s3': "backend-test bestået ved en fuldført WPH-stabiliseringsmilepæl",
      'feat.eyebrow': "Udvalgt AI-projekt",
      'feat.h2': "World Publishing Houses — kildeforankret AI-intelligensplatform",
      'feat.p': "Jeg designede og byggede en full-stack AI- og dataplatform, der kombinerer kontrollerede forskningsagenter, kildebelagte forlagsdata, promptstyring, kørselstelemetri, AI-evaluering, deterministisk sikkerhed og menneskelig gennemgang.",
      'feat.videoLabel': "Det jeg byggede: demo af AI-platformen", 'feat.videoSub': "6:18 · produktgennemgang",
      'feat.kicker': "Produktionsorienteret ingeniørarbejde", 'feat.h3': "Mere end en chatbot",
      'feat.p2': "Modellen er ikke sandhedskilden. WPH adskiller strukturerede data, evidens, modeloutput, deterministisk sikkerhed, promptversioner, telemetri, evaluering og menneskelig gennemgang, så adfærd kan reproduceres og undersøges.",
      'btn.case': "Udforsk casestudiet", 'btn.live': "Live-platform ↗",
      'work.eyebrow': "Yderligere dokumentation", 'work.h2': "Data science og ingeniørkvalitet",
      'work.p': "WPH er flagskibet ovenfor. Disse projekter viser modellerings- og kvalitetsgrundlaget bag måden, jeg bygger AI-systemer på.",
      'work.c1kicker': "Afsluttende ML-projekt · modelvalidering", 'work.c1h3': "Hvor en boligprismodel svigter, og hvorfor",
      'work.c1p': "Jeg sammenlignede en Random Forest med en lineær baseline og fokuserede derefter på residualadfærd og produktionsgrænser frem for blot den overordnede nøjagtighed.",
      'work.c1outLabel': "Resultat:", 'work.c1out': "residualerne afslørede en systematisk fejl for dyre boliger, så jeg dokumenterede denne begrænsning i stedet for kun at præsentere R².",
      'work.c1read': "Læs casestudiet →",
      'work.c2kicker': "Faglig effekt · 10+ år", 'work.c2h3': "Softwarekvalitet som en fordel i AI-ingeniørarbejde",
      'work.c2p': "Release-test, automatisering, API'er, CI/CD, fejlanalyse og evidensbaseret triage formede, hvordan jeg nu designer AI-evalueringer, regressionsporte og observerbarhed.",
      'work.c2link': "Se ingeniørhistorikken →",
      'work.rowQuality': "Regression, release, mobil, API, automatisering",
      'work.rowAI': "Evalueringer, sikkerhed, oprindelse, telemetri, kvalitetsporte",
      'work.rowData': "Python, SQL, PostgreSQL, analyse, validering",
      'about.eyebrow': "Om mig", 'about.h2': "Softwarekvalitet → Applied AI",
      'about.lead': "Jeg brugte mere end et årti på at spørge, hvad der sker, når software tager fejl. Nu anvender jeg den samme disciplin på AI-systemer: hvilken evidens understøtter svaret, hvad ændrer sig mellem promptversioner, hvordan opdager vi regressioner, og hvad sker der, når konfidensen er lav?",
      'about.p': "Min kandidatgrad i Data Science, AI og maskinlæring tilføjede modellerings- og analyselaget. WPH blev stedet, hvor jeg forenede begge baggrunde i ét produktionsorienteret system.",
      'about.edu': "UDDANNELSE", 'about.exp': "ERFARING", 'about.ai': "APPLIED AI", 'about.data': "DATA",
      'about.expVal': "10+ års softwarekvalitet og automatisering",
      'btn.more': "Mere om mig →",
      'contact.h2': "Bygger du pålidelige AI-systemer?",
      'contact.lead': "Jeg er interesseret i fuldtids fjernstillinger i USA inden for Applied AI, AI Evaluation, AI Platform og avanceret data-/ML-kvalitet.",
      'btn.email': "Skriv til mig",
      'contact.location': "STED", 'contact.mode': "ARBEJDSFORM", 'contact.focus': "FOKUS", 'contact.resume': "CV",
      'contact.locationVal': "Massachusetts, USA", 'contact.modeVal': "Fjernarbejde (USA)", 'contact.download': "Download PDF",
      'footer.featured': "Udvalgt AI-projekt", 'footer.about': "Om mig", 'footer.resume': "CV"
    },

    fi: {
      'a11y.skip': "Siirry pääsisältöön",
      'nav.about': "Tietoa", 'nav.resume': "CV", 'nav.projects': "Projektit", 'nav.data': "Data Science", 'nav.qa': "QA-vaikutus", 'nav.contact': "Yhteystiedot", 'nav.menu': "Valikko",
      'lang.aria': "Vaihda kieli",
      'hero.badge': "Avoin Applied AI-, AI Evaluation- ja AI Platform -rooleille",
      'hero.h1': "Rakennan tekoälyjärjestelmiä, jotka ovat luotettavia, havainnoitavia ja testattavia.",
      'hero.lead': "Yhdistän yli 10 vuoden kokemuksen ohjelmistojen laadusta Data Science-, tekoäly- ja koneoppimismaisteriin rakentaakseni ja arvioidakseni tekoälyjärjestelmiä datavirroissa, agenteissa, promptien hallinnassa, telemetriassa, regressiotestauksessa ja turvallisuudessa.",
      'hero.cred': "Data Science-, tekoäly- ja ML-maisteri — Boston University<br />Massachusetts · avoin etätyölle Yhdysvalloissa",
      'btn.built': "Katso, mitä rakensin", 'btn.demo': "Katso 6 minuutin demo ↗", 'btn.resume': "Lataa CV",
      'snap.label': "Yhteenveto rekrytoijalle",
      'snap.primary': "ENSISIJAINEN", 'snap.quality': "LAADUN ERIKOISALA", 'snap.stack': "YDINTEKNOLOGIAT", 'snap.experience': "KOKEMUS",
      'snap.expVal': "10+ vuotta ohjelmistojen laatua → Applied AI",
      'stats.s1': "vuotta ohjelmistojen laadun, automaation, julkaisujen ja luotettavuustekniikan parissa",
      'stats.s2': "tarkastettua tekoälyn arviointitapausta WPH-arviointialustalla",
      'stats.s3': "läpäistyä backend-testiä valmistuneessa WPH:n vakautusvaiheessa",
      'feat.eyebrow': "Esittelyssä oleva tekoälyprojekti",
      'feat.h2': "World Publishing Houses — lähteisiin ankkuroitu tekoälyalusta",
      'feat.p': "Suunnittelin ja rakensin full-stack-tekoäly- ja data-alustan, joka yhdistää hallitut tutkimusagentit, lähteisiin perustuvan julkaisudatan, promptien hallinnan, suoritustelemetrian, tekoälyn arvioinnin, deterministisen turvallisuuden ja ihmisen tekemän tarkistuksen.",
      'feat.videoLabel': "Mitä rakensin: tekoälyalustan demo", 'feat.videoSub': "6:18 · tuote-esittely",
      'feat.kicker': "Tuotantoon suuntautunut tekniikka", 'feat.h3': "Enemmän kuin chatbotti",
      'feat.p2': "Malli ei ole totuuden lähde. WPH erottaa jäsennellyn datan, todisteet, mallin tulosteet, deterministisen turvallisuuden, promptien versiot, telemetrian, arvioinnin ja ihmisen tarkistuksen, jotta käyttäytyminen voidaan toistaa ja tutkia.",
      'btn.case': "Tutustu tapaustutkimukseen", 'btn.live': "Live-alusta ↗",
      'work.eyebrow': "Lisätodisteet", 'work.h2': "Data science ja tekninen laatu",
      'work.p': "WPH on yllä oleva lippulaiva. Nämä projektit osoittavat mallinnus- ja laatutekniikan perustan, jonka varaan rakennan tekoälyjärjestelmiä.",
      'work.c1kicker': "ML-lopputyö · mallin validointi", 'work.c1h3': "Missä asuntohintamalli pettää ja miksi",
      'work.c1p': "Vertasin Random Forestia lineaariseen perustasoon ja keskityin sitten residuaalien käyttäytymiseen ja tuotannon rajoihin pelkän kokonaistarkkuuden sijaan.",
      'work.c1outLabel': "Tulos:", 'work.c1out': "residuaalit paljastivat järjestelmällisen virheen kalliissa asunnoissa, joten dokumentoin tämän rajoituksen sen sijaan, että esittäisin pelkän R².",
      'work.c1read': "Lue tapaustutkimus →",
      'work.c2kicker': "Ammatillinen vaikutus · 10+ vuotta", 'work.c2h3': "Ohjelmistojen laatu etuna tekoälytekniikassa",
      'work.c2p': "Julkaisutestaus, automaatio, rajapinnat, CI/CD, vika-analyysi ja todisteisiin perustuva priorisointi muokkasivat tapaani suunnitella tekoälyn arviointeja, regressioportteja ja havainnoitavuutta.",
      'work.c2link': "Katso tekninen työhistoria →",
      'work.rowQuality': "Regressio, julkaisu, mobiili, API, automaatio",
      'work.rowAI': "Arvioinnit, turvallisuus, alkuperä, telemetria, laatuportit",
      'work.rowData': "Python, SQL, PostgreSQL, analytiikka, validointi",
      'about.eyebrow': "Tietoa", 'about.h2': "Ohjelmistojen laatu → Applied AI",
      'about.lead': "Käytin yli vuosikymmenen kysyen, mitä tapahtuu, kun ohjelmisto toimii väärin. Nyt sovellan samaa kurinalaisuutta tekoälyjärjestelmiin: mitkä todisteet tukevat vastausta, mikä muuttuu promptien versioiden välillä, miten havaitsemme regressiot ja mitä tapahtuu, kun mallin varmuus on matala?",
      'about.p': "Data Science-, tekoäly- ja koneoppimismaisterini lisäsi mallinnus- ja analytiikkakerroksen. WPH:sta tuli paikka, jossa yhdistin molemmat taustat yhdeksi tuotantoon suuntautuneeksi järjestelmäksi.",
      'about.edu': "KOULUTUS", 'about.exp': "KOKEMUS", 'about.ai': "APPLIED AI", 'about.data': "DATA",
      'about.expVal': "10+ vuotta ohjelmistojen laatua ja automaatiota",
      'btn.more': "Lisää minusta →",
      'contact.h2': "Rakennatko luotettavia tekoälyjärjestelmiä?",
      'contact.lead': "Olen kiinnostunut kokoaikaisista etätyörooleista Yhdysvalloissa: Applied AI, AI Evaluation, AI Platform sekä edistynyt datan ja ML:n laatu.",
      'btn.email': "Lähetä minulle sähköpostia",
      'contact.location': "SIJAINTI", 'contact.mode': "TYÖSKENTELYTAPA", 'contact.focus': "PAINOPISTE", 'contact.resume': "CV",
      'contact.locationVal': "Massachusetts, USA", 'contact.modeVal': "Etätyö (USA)", 'contact.download': "Lataa PDF",
      'footer.featured': "Esittelyssä oleva tekoälyprojekti", 'footer.about': "Tietoa", 'footer.resume': "CV"
    },

    et: {
      'a11y.skip': "Liigu põhisisu juurde",
      'nav.about': "Minust", 'nav.resume': "CV", 'nav.projects': "Projektid", 'nav.data': "Data Science", 'nav.qa': "QA mõju", 'nav.contact': "Kontakt", 'nav.menu': "Menüü",
      'lang.aria': "Muuda keelt",
      'hero.badge': "Avatud Applied AI · AI Evaluation · AI Platform rollidele",
      'hero.h1': "Ehitan tehisintellekti süsteeme, mis on usaldusväärsed, jälgitavad ja testitavad.",
      'hero.lead': "Ühendan üle 10 aasta tarkvara kvaliteeditehnika kogemust magistrikraadiga Data Science’is, tehisintellektis ja masinõppes, et ehitada ja hinnata AI-süsteeme andmekonveierites, agentides, promptide halduses, telemeetrias, regressioonitestimises ja turvalisuses.",
      'hero.cred': "Data Science’i, tehisintellekti ja ML-i magister — Boston University<br />Massachusetts · avatud kaugtööle USA-s",
      'btn.built': "Vaata, mida ehitasin", 'btn.demo': "Vaata 6-minutilist demot ↗", 'btn.resume': "Laadi alla CV",
      'snap.label': "Ülevaade värbajale",
      'snap.primary': "PEAMINE", 'snap.quality': "KVALITEEDI ERIALA", 'snap.stack': "PÕHITEHNOLOOGIAD", 'snap.experience': "KOGEMUS",
      'snap.expVal': "10+ aastat tarkvara kvaliteeditehnikat → Applied AI",
      'stats.s1': "aastat tarkvara kvaliteedi, automatiseerimise, väljalasete ja töökindluse alal",
      'stats.s2': "ülevaadatud AI hindamisjuhtumit WPH hindamisplatvormil",
      'stats.s3': "läbitud backend-testi lõpetatud WPH stabiliseerimise verstapostil",
      'feat.eyebrow': "Esiletõstetud AI projekt",
      'feat.h2': "World Publishing Houses — allikapõhine AI-teabeplatvorm",
      'feat.p': "Kavandasin ja ehitasin full-stack AI- ja andmeplatvormi, mis ühendab kontrollitud uurimisagendid, allikatega toetatud kirjastusandmed, promptide halduse, käitustelemeetria, AI hindamise, deterministliku turvalisuse ja inimkontrolli.",
      'feat.videoLabel': "Mida ma ehitasin: AI platvormi demo", 'feat.videoSub': "6:18 · tooteülevaade",
      'feat.kicker': "Tootmisele suunatud insenertöö", 'feat.h3': "Rohkem kui vestlusrobot",
      'feat.p2': "Mudel ei ole tõe allikas. WPH eraldab struktureeritud andmed, tõendid, mudeli väljundi, deterministliku turvalisuse, promptide versioonid, telemeetria, hindamise ja inimkontrolli, et käitumist saaks taasesitada ja uurida.",
      'btn.case': "Uuri juhtumianalüüsi", 'btn.live': "Live-platvorm ↗",
      'work.eyebrow': "Täiendavad tõendid", 'work.h2': "Andmeteadus ja insenerikvaliteet",
      'work.p': "WPH on ülal olev lipulaev. Need projektid näitavad modelleerimise ja kvaliteeditehnika alust, millele ma AI-süsteeme ehitan.",
      'work.c1kicker': "ML lõputöö · mudeli valideerimine", 'work.c1h3': "Kus kinnisvarahinna mudel ebaõnnestub ja miks",
      'work.c1p': "Võrdlesin Random Foresti lineaarse baasmudeliga ja keskendusin seejärel jääkide käitumisele ja tootmispiirangutele, mitte ainult üldisele täpsusele.",
      'work.c1outLabel': "Tulemus:", 'work.c1out': "jäägid paljastasid süstemaatilise vea kallites majades, seega dokumenteerisin selle piirangu, selle asemel et esitada ainult R².",
      'work.c1read': "Loe juhtumianalüüsi →",
      'work.c2kicker': "Ametialane mõju · 10+ aastat", 'work.c2h3': "Tarkvara kvaliteet kui eelis AI insenertöös",
      'work.c2p': "Väljalasete testimine, automatiseerimine, API-d, CI/CD, tõrgete analüüs ja tõenditel põhinev triaaž kujundasid selle, kuidas ma nüüd kavandan AI hindamisi, regressiooniväravaid ja jälgitavust.",
      'work.c2link': "Vaata insenerikogemust →",
      'work.rowQuality': "Regressioon, väljalase, mobiil, API, automatiseerimine",
      'work.rowAI': "Hindamised, turvalisus, päritolu, telemeetria, kvaliteediväravad",
      'work.rowData': "Python, SQL, PostgreSQL, analüütika, valideerimine",
      'about.eyebrow': "Minust", 'about.h2': "Tarkvara kvaliteeditehnika → Applied AI",
      'about.lead': "Veetsin üle kümne aasta küsides, mis juhtub, kui tarkvara eksib. Nüüd rakendan sama distsipliini AI-süsteemidele: millised tõendid toetavad vastust, mis muutub promptide versioonide vahel, kuidas tuvastame regressioone ja mis juhtub, kui kindlus on madal?",
      'about.p': "Minu magistrikraad Data Science’is, tehisintellektis ja masinõppes lisas modelleerimise ja analüütika kihi. WPH-st sai koht, kus ühendasin mõlemad taustad üheks tootmisele suunatud süsteemiks.",
      'about.edu': "HARIDUS", 'about.exp': "KOGEMUS", 'about.ai': "APPLIED AI", 'about.data': "ANDMED",
      'about.expVal': "10+ aastat tarkvara kvaliteeditehnikat ja automatiseerimist",
      'btn.more': "Rohkem minust →",
      'contact.h2': "Kas ehitad usaldusväärseid AI-süsteeme?",
      'contact.lead': "Olen huvitatud täiskohaga kaugtöö rollidest USA-s valdkondades Applied AI, AI Evaluation, AI Platform ja edasijõudnud andmete/ML-i kvaliteet.",
      'btn.email': "Kirjuta mulle",
      'contact.location': "ASUKOHT", 'contact.mode': "TÖÖVORM", 'contact.focus': "FOOKUS", 'contact.resume': "CV",
      'contact.locationVal': "Massachusetts, USA", 'contact.modeVal': "Kaugtöö (USA)", 'contact.download': "Laadi alla PDF",
      'footer.featured': "Esiletõstetud AI projekt", 'footer.about': "Minust", 'footer.resume': "CV"
    },

    lv: {
      'a11y.skip': "Pāriet uz galveno saturu",
      'nav.about': "Par mani", 'nav.resume': "CV", 'nav.projects': "Projekti", 'nav.data': "Data Science", 'nav.qa': "QA ietekme", 'nav.contact': "Kontakti", 'nav.menu': "Izvēlne",
      'lang.aria': "Mainīt valodu",
      'hero.badge': "Atvērta Applied AI · AI Evaluation · AI Platform lomām",
      'hero.h1': "Es veidoju MI sistēmas, kas ir uzticamas, novērojamas un testējamas.",
      'hero.lead': "Es apvienoju vairāk nekā 10 gadu pieredzi programmatūras kvalitātes inženierijā ar maģistra grādu Data Science, MI un mašīnmācīšanās jomā, lai veidotu un novērtētu MI sistēmas datu plūsmās, aģentos, uzvedņu pārvaldībā, telemetrijā, regresijas testēšanā un drošībā.",
      'hero.cred': "Maģistrs Data Science, MI un ML — Boston University<br />Masačūseta · atvērta attālinātam darbam ASV",
      'btn.built': "Skaties, ko izveidoju", 'btn.demo': "Skaties 6 minūšu demo ↗", 'btn.resume': "Lejupielādēt CV",
      'snap.label': "Kopsavilkums personāla atlasei",
      'snap.primary': "GALVENAIS", 'snap.quality': "KVALITĀTES SPECIALIZĀCIJA", 'snap.stack': "PAMATTEHNOLOĢIJAS", 'snap.experience': "PIEREDZE",
      'snap.expVal': "10+ gadi programmatūras kvalitātes inženierijā → Applied AI",
      'stats.s1': "gadi programmatūras kvalitātes, automatizācijas, laidienu un uzticamības inženierijā",
      'stats.s2': "pārskatīti MI novērtēšanas gadījumi WPH novērtēšanas platformā",
      'stats.s3': "backend testi izturēti pabeigtā WPH stabilizācijas atskaites punktā",
      'feat.eyebrow': "Izcelts MI projekts",
      'feat.h2': "World Publishing Houses — uz avotiem balstīta MI analītikas platforma",
      'feat.p': "Es izstrādāju un izveidoju pilna steka MI un datu platformu, kas apvieno kontrolētus pētniecības aģentus, ar avotiem pamatotus izdevniecības datus, uzvedņu pārvaldību, izpildes telemetriju, MI novērtēšanu, deterministisku drošību un cilvēka veiktu pārbaudi.",
      'feat.videoLabel': "Ko es izveidoju: MI platformas demo", 'feat.videoSub': "6:18 · produkta pārskats",
      'feat.kicker': "Uz ražošanu orientēta inženierija", 'feat.h3': "Vairāk nekā tērzēšanas robots",
      'feat.p2': "Modelis nav patiesības avots. WPH nošķir strukturētus datus, pierādījumus, modeļa izvadi, deterministisku drošību, uzvedņu versijas, telemetriju, novērtēšanu un cilvēka pārbaudi, lai uzvedību varētu atkārtot un izpētīt.",
      'btn.case': "Apskatīt gadījuma izpēti", 'btn.live': "Tiešsaistes platforma ↗",
      'work.eyebrow': "Papildu pierādījumi", 'work.h2': "Datu zinātne un inženierijas kvalitāte",
      'work.p': "WPH ir vadošais projekts, kas aprakstīts augstāk. Šie projekti parāda modelēšanas un kvalitātes inženierijas pamatu, uz kura es veidoju MI sistēmas.",
      'work.c1kicker': "ML noslēguma darbs · modeļa validācija", 'work.c1h3': "Kur mājokļu cenu modelis nedarbojas un kāpēc",
      'work.c1p': "Es salīdzināju Random Forest ar lineāru bāzlīniju un pēc tam koncentrējos uz atlikumu uzvedību un ražošanas ierobežojumiem, nevis tikai uz kopējo precizitāti.",
      'work.c1outLabel': "Rezultāts:", 'work.c1out': "atlikumi atklāja sistemātisku kļūdu dārgās mājās, tāpēc es dokumentēju šo ierobežojumu, nevis parādīju tikai R².",
      'work.c1read': "Lasīt gadījuma izpēti →",
      'work.c2kicker': "Profesionālā ietekme · 10+ gadi", 'work.c2h3': "Programmatūras kvalitāte kā priekšrocība MI inženierijā",
      'work.c2p': "Laidienu testēšana, automatizācija, API, CI/CD, kļūmju analīze un uz pierādījumiem balstīta prioritizācija veidoja to, kā es tagad izstrādāju MI novērtējumus, regresijas vārtus un novērojamību.",
      'work.c2link': "Skatīt inženierijas pieredzi →",
      'work.rowQuality': "Regresija, laidiens, mobilais, API, automatizācija",
      'work.rowAI': "Novērtējumi, drošība, izcelsme, telemetrija, kvalitātes vārti",
      'work.rowData': "Python, SQL, PostgreSQL, analītika, validācija",
      'about.eyebrow': "Par mani", 'about.h2': "Programmatūras kvalitātes inženierija → Applied AI",
      'about.lead': "Es pavadīju vairāk nekā desmit gadus, jautājot, kas notiek, kad programmatūra kļūdās. Tagad es piemēroju to pašu disciplīnu MI sistēmām: kādi pierādījumi atbalsta atbildi, kas mainās starp uzvedņu versijām, kā mēs atklājam regresijas un kas notiek, kad pārliecība ir zema?",
      'about.p': "Mans maģistra grāds Data Science, MI un mašīnmācīšanās jomā pievienoja modelēšanas un analītikas slāni. WPH kļuva par vietu, kur es apvienoju abas jomas vienā uz ražošanu orientētā sistēmā.",
      'about.edu': "IZGLĪTĪBA", 'about.exp': "PIEREDZE", 'about.ai': "APPLIED AI", 'about.data': "DATI",
      'about.expVal': "10+ gadi programmatūras kvalitātes inženierijā un automatizācijā",
      'btn.more': "Vairāk par mani →",
      'contact.h2': "Vai veidojat uzticamas MI sistēmas?",
      'contact.lead': "Mani interesē pilna laika attālinātā darba lomas ASV jomās Applied AI, AI Evaluation, AI Platform un progresīvā datu/ML kvalitātē.",
      'btn.email': "Raksti man",
      'contact.location': "ATRAŠANĀS VIETA", 'contact.mode': "DARBA VEIDS", 'contact.focus': "FOKUSS", 'contact.resume': "CV",
      'contact.locationVal': "Masačūseta, ASV", 'contact.modeVal': "Attālināti (ASV)", 'contact.download': "Lejupielādēt PDF",
      'footer.featured': "Izcelts MI projekts", 'footer.about': "Par mani", 'footer.resume': "CV"
    },

    lt: {
      'a11y.skip': "Pereiti prie pagrindinio turinio",
      'nav.about': "Apie mane", 'nav.resume': "CV", 'nav.projects': "Projektai", 'nav.data': "Data Science", 'nav.qa': "QA poveikis", 'nav.contact': "Kontaktai", 'nav.menu': "Meniu",
      'lang.aria': "Keisti kalbą",
      'hero.badge': "Atvira Applied AI · AI Evaluation · AI Platform vaidmenims",
      'hero.h1': "Kuriu DI sistemas, kurios yra patikimos, stebimos ir testuojamos.",
      'hero.lead': "Derinu daugiau nei 10 metų programinės įrangos kokybės inžinerijos patirtį su Data Science, DI ir mašininio mokymosi magistro laipsniu, kad kurčiau ir vertinčiau DI sistemas duomenų srautuose, agentuose, užklausų valdyme, telemetrijoje, regresijos testavime ir saugume.",
      'hero.cred': "Data Science, DI ir ML magistrė — Boston University<br />Masačusetsas · atvira nuotoliniam darbui JAV",
      'btn.built': "Pažiūrėkite, ką sukūriau", 'btn.demo': "Žiūrėti 6 minučių demo ↗", 'btn.resume': "Atsisiųsti CV",
      'snap.label': "Santrauka rekruteriui",
      'snap.primary': "PAGRINDINĖ", 'snap.quality': "KOKYBĖS SPECIALIZACIJA", 'snap.stack': "PAGRINDINĖS TECHNOLOGIJOS", 'snap.experience': "PATIRTIS",
      'snap.expVal': "10+ metų programinės įrangos kokybės inžinerijos → Applied AI",
      'stats.s1': "metų programinės įrangos kokybės, automatizavimo, leidimų ir patikimumo inžinerijos srityje",
      'stats.s2': "peržiūrėtų DI vertinimo atvejų WPH vertinimo platformoje",
      'stats.s3': "backend testų sėkmingai atlikta užbaigtame WPH stabilizavimo etape",
      'feat.eyebrow': "Išskirtinis DI projektas",
      'feat.h2': "World Publishing Houses — šaltiniais pagrįsta DI analizės platforma",
      'feat.p': "Suprojektavau ir sukūriau viso steko DI ir duomenų platformą, jungiančią kontroliuojamus tyrimų agentus, šaltiniais pagrįstus leidybos duomenis, užklausų valdymą, vykdymo telemetriją, DI vertinimą, deterministinį saugumą ir žmogaus atliekamą peržiūrą.",
      'feat.videoLabel': "Ką sukūriau: DI platformos demo", 'feat.videoSub': "6:18 · produkto apžvalga",
      'feat.kicker': "Į gamybą orientuota inžinerija", 'feat.h3': "Daugiau nei pokalbių robotas",
      'feat.p2': "Modelis nėra tiesos šaltinis. WPH atskiria struktūrizuotus duomenis, įrodymus, modelio išvestį, deterministinį saugumą, užklausų versijas, telemetriją, vertinimą ir žmogaus peržiūrą, kad elgseną būtų galima atkurti ir ištirti.",
      'btn.case': "Peržiūrėti atvejo analizę", 'btn.live': "Tiesioginė platforma ↗",
      'work.eyebrow': "Papildomi įrodymai", 'work.h2': "Duomenų mokslas ir inžinerinė kokybė",
      'work.p': "WPH yra pagrindinis projektas viršuje. Šie projektai rodo modeliavimo ir kokybės inžinerijos pagrindą, kuriuo remdamasi kuriu DI sistemas.",
      'work.c1kicker': "ML baigiamasis projektas · modelio validavimas", 'work.c1h3': "Kur būsto kainų modelis suklysta ir kodėl",
      'work.c1p': "Palyginau Random Forest su tiesine baze ir tada sutelkiau dėmesį į liekanų elgseną ir gamybos apribojimus, o ne tik į bendrą tikslumą.",
      'work.c1outLabel': "Rezultatas:", 'work.c1out': "liekanos atskleidė sisteminę paklaidą brangiuose būstuose, todėl dokumentavau šį apribojimą, o ne pateikiau vien R².",
      'work.c1read': "Skaityti atvejo analizę →",
      'work.c2kicker': "Profesinis poveikis · 10+ metų", 'work.c2h3': "Programinės įrangos kokybė kaip pranašumas DI inžinerijoje",
      'work.c2p': "Leidimų testavimas, automatizavimas, API, CI/CD, gedimų analizė ir įrodymais grįstas prioritetų nustatymas suformavo tai, kaip dabar kuriu DI vertinimus, regresijos vartus ir stebimumą.",
      'work.c2link': "Peržiūrėti inžinerinę patirtį →",
      'work.rowQuality': "Regresija, leidimas, mobilioji, API, automatizavimas",
      'work.rowAI': "Vertinimai, saugumas, kilmė, telemetrija, kokybės vartai",
      'work.rowData': "Python, SQL, PostgreSQL, analitika, validavimas",
      'about.eyebrow': "Apie mane", 'about.h2': "Programinės įrangos kokybės inžinerija → Applied AI",
      'about.lead': "Daugiau nei dešimtmetį klausiau, kas nutinka, kai programinė įranga klysta. Dabar tą pačią discipliną taikau DI sistemoms: kokie įrodymai pagrindžia atsakymą, kas keičiasi tarp užklausų versijų, kaip aptinkame regresijas ir kas nutinka, kai pasitikėjimas žemas?",
      'about.p': "Mano Data Science, DI ir mašininio mokymosi magistro laipsnis pridėjo modeliavimo ir analitikos sluoksnį. WPH tapo vieta, kur abi patirtis sujungiau į vieną gamybai orientuotą sistemą.",
      'about.edu': "IŠSILAVINIMAS", 'about.exp': "PATIRTIS", 'about.ai': "APPLIED AI", 'about.data': "DUOMENYS",
      'about.expVal': "10+ metų programinės įrangos kokybės inžinerijos ir automatizavimo",
      'btn.more': "Daugiau apie mane →",
      'contact.h2': "Kuriate patikimas DI sistemas?",
      'contact.lead': "Domiuosi viso etato nuotolinio darbo JAV vaidmenimis Applied AI, AI Evaluation, AI Platform ir pažangios duomenų/ML kokybės srityse.",
      'btn.email': "Parašykite man",
      'contact.location': "VIETA", 'contact.mode': "DARBO FORMA", 'contact.focus': "FOKUSAS", 'contact.resume': "CV",
      'contact.locationVal': "Masačusetsas, JAV", 'contact.modeVal': "Nuotoliniu būdu (JAV)", 'contact.download': "Atsisiųsti PDF",
      'footer.featured': "Išskirtinis DI projektas", 'footer.about': "Apie mane", 'footer.resume': "CV"
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
    if (switchUI) switchUI.refresh(lang);
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

  // ── Flags (inline SVG — render identically on every OS, unlike flag emoji) ────
  var FLAGS = {
    // English → Union Jack
    en: '<svg class="flag" viewBox="0 0 60 30" aria-hidden="true"><rect width="60" height="30" fill="#012169"/><path d="M0,0 60,30 M60,0 0,30" stroke="#fff" stroke-width="6"/><path d="M0,0 60,30 M60,0 0,30" stroke="#C8102E" stroke-width="3"/><rect x="25" width="10" height="30" fill="#fff"/><rect y="10" width="60" height="10" fill="#fff"/><rect x="27" width="6" height="30" fill="#C8102E"/><rect y="12" width="60" height="6" fill="#C8102E"/></svg>',
    // Spain
    es: '<svg class="flag" viewBox="0 0 3 2" aria-hidden="true"><rect width="3" height="2" fill="#c60b1e"/><rect y="0.5" width="3" height="1" fill="#ffc400"/></svg>',
    // Poland
    pl: '<svg class="flag" viewBox="0 0 2 2" aria-hidden="true"><rect width="2" height="2" fill="#dc143c"/><rect width="2" height="1" fill="#fff"/></svg>',
    // Ukraine
    uk: '<svg class="flag" viewBox="0 0 2 2" aria-hidden="true"><rect width="2" height="1" fill="#0057b7"/><rect y="1" width="2" height="1" fill="#ffd700"/></svg>',
    // France
    fr: '<svg class="flag" viewBox="0 0 3 2" aria-hidden="true"><rect width="3" height="2" fill="#fff"/><rect width="1" height="2" fill="#0055a4"/><rect x="2" width="1" height="2" fill="#ef4135"/></svg>',
    // Romania
    ro: '<svg class="flag" viewBox="0 0 3 2" aria-hidden="true"><rect width="1" height="2" fill="#002b7f"/><rect x="1" width="1" height="2" fill="#fcd116"/><rect x="2" width="1" height="2" fill="#ce1126"/></svg>',
    // Czechia
    cs: '<svg class="flag" viewBox="0 0 30 20" aria-hidden="true"><rect width="30" height="20" fill="#fff"/><rect y="10" width="30" height="10" fill="#d7141a"/><path d="M0,0 L15,10 L0,20 Z" fill="#11457e"/></svg>',
    // Norway
    no: '<svg class="flag" viewBox="0 0 25 18" aria-hidden="true"><rect width="25" height="18" fill="#ba0c2f"/><rect x="5" width="6" height="18" fill="#fff"/><rect y="6" width="25" height="6" fill="#fff"/><rect x="6.5" width="3" height="18" fill="#00205b"/><rect y="7.5" width="25" height="3" fill="#00205b"/></svg>',
    // Iceland
    is: '<svg class="flag" viewBox="0 0 25 18" aria-hidden="true"><rect width="25" height="18" fill="#02529c"/><rect x="5" width="6" height="18" fill="#fff"/><rect y="6" width="25" height="6" fill="#fff"/><rect x="6.5" width="3" height="18" fill="#dc1e35"/><rect y="7.5" width="25" height="3" fill="#dc1e35"/></svg>',
    // Sweden
    sv: '<svg class="flag" viewBox="0 0 25 18" aria-hidden="true"><rect width="25" height="18" fill="#006aa7"/><rect x="6" width="4" height="18" fill="#fecc00"/><rect y="7" width="25" height="4" fill="#fecc00"/></svg>',
    // Denmark
    da: '<svg class="flag" viewBox="0 0 25 18" aria-hidden="true"><rect width="25" height="18" fill="#c8102e"/><rect x="6" width="4" height="18" fill="#fff"/><rect y="7" width="25" height="4" fill="#fff"/></svg>',
    // Finland
    fi: '<svg class="flag" viewBox="0 0 25 18" aria-hidden="true"><rect width="25" height="18" fill="#fff"/><rect x="6" width="4" height="18" fill="#003580"/><rect y="7" width="25" height="4" fill="#003580"/></svg>',
    // Estonia
    et: '<svg class="flag" viewBox="0 0 30 18" aria-hidden="true"><rect width="30" height="6" fill="#0072ce"/><rect y="6" width="30" height="6" fill="#000"/><rect y="12" width="30" height="6" fill="#fff"/></svg>',
    // Latvia
    lv: '<svg class="flag" viewBox="0 0 25 15" aria-hidden="true"><rect width="25" height="15" fill="#9e3039"/><rect y="6" width="25" height="3" fill="#fff"/></svg>',
    // Lithuania
    lt: '<svg class="flag" viewBox="0 0 30 18" aria-hidden="true"><rect width="30" height="6" fill="#fdb913"/><rect y="6" width="30" height="6" fill="#006a44"/><rect y="12" width="30" height="6" fill="#c1272d"/></svg>'
  };
  function flagHTML(code) { return '<span class="flag-wrap">' + (FLAGS[code] || '') + '</span>'; }
  function metaFor(code) { for (var i = 0; i < LANGS.length; i++) if (LANGS[i].code === code) return LANGS[i]; return LANGS[0]; }

  // ── Switcher UI (custom accessible listbox with SVG flags) ───────────────────
  var switchUI = null;
  function buildSwitcher() {
    var host = document.querySelector('[data-nav-links]') || document.querySelector('.nav-inner') || document.body;
    var lang = getLang();
    var wrap = document.createElement('div');
    wrap.className = 'lang-switch';

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'lang-btn';
    btn.setAttribute('aria-haspopup', 'listbox');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', t(lang, 'lang.aria'));

    var menu = document.createElement('div');
    menu.className = 'lang-menu';
    menu.setAttribute('role', 'listbox');
    menu.hidden = true;

    var options = LANGS.map(function (l) {
      var o = document.createElement('button');
      o.type = 'button';
      o.className = 'lang-option';
      o.setAttribute('role', 'option');
      o.setAttribute('data-code', l.code);
      o.setAttribute('tabindex', '-1');
      o.innerHTML = flagHTML(l.code) + '<span class="lang-name">' + l.label + '</span><span class="lang-check" aria-hidden="true">✓</span>';
      o.addEventListener('click', function () { setLang(l.code); close(true); });
      menu.appendChild(o);
      return o;
    });

    function open() {
      menu.hidden = false; btn.setAttribute('aria-expanded', 'true');
      var sel = menu.querySelector('.lang-option[aria-selected="true"]') || options[0];
      sel.focus();
    }
    function close(focusBtn) { menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); if (focusBtn) btn.focus(); }
    function isOpen() { return !menu.hidden; }

    btn.addEventListener('click', function () { isOpen() ? close(false) : open(); });
    btn.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    });
    menu.addEventListener('keydown', function (e) {
      var i = options.indexOf(document.activeElement);
      if (e.key === 'Escape') { e.preventDefault(); close(true); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); options[Math.min(options.length - 1, i + 1)].focus(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); options[Math.max(0, i - 1)].focus(); }
      else if (e.key === 'Home') { e.preventDefault(); options[0].focus(); }
      else if (e.key === 'End') { e.preventDefault(); options[options.length - 1].focus(); }
      else if (e.key === 'Tab') { close(false); }
    });
    document.addEventListener('click', function (e) { if (isOpen() && !wrap.contains(e.target)) close(false); });

    wrap.appendChild(btn); wrap.appendChild(menu);
    host.appendChild(wrap);

    switchUI = {
      refresh: function (code) {
        var m = metaFor(code);
        btn.innerHTML = flagHTML(code) + '<span class="lang-btn-label">' + m.short + '</span><span class="lang-btn-caret" aria-hidden="true">▾</span>';
        btn.setAttribute('aria-label', t(code, 'lang.aria') + ' — ' + m.label);
        options.forEach(function (o) { o.setAttribute('aria-selected', o.getAttribute('data-code') === code ? 'true' : 'false'); });
      }
    };
  }

  function boot() {
    buildSwitcher();
    apply(getLang());
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.I18N = { set: setLang, get: getLang, apply: apply, langs: LANGS };
})();
