const fs = require('node:fs');
const assert = require('node:assert/strict');
const read = (path) => fs.readFileSync(path, 'utf8');
const home = read('index.html');
const about = read('pages/about.html');
const resume = read('pages/resume.html');
const projects = read('pages/projects.html');
const sitemap = read('sitemap.xml');
assert.match(home, /Beyond the Prompt: Engineering AI Systems You Can Trust/);
assert.match(home, /projects\/ai-agent-evaluation\//);
assert.match(home, /projects\/wph-architecture\//);
assert.match(about, /through October 2026/);
assert.match(resume, /Apr 2022 – Oct 2026/);
assert.doesNotMatch(resume, /Apr 2022 – Present/);
assert.match(projects, /HTTP 200 OK does not prove factual correctness/);
for (const path of ['projects/ai-agent-evaluation/', 'projects/wph-architecture/']) {
  assert.ok(fs.existsSync(path + 'index.html'), 'Missing linked page: ' + path);
  assert.ok(sitemap.includes('https://tetianakravchuk.com/' + path), 'Missing sitemap URL: ' + path);
}
const i18n = read('assets/i18n.js');
assert.match(i18n, /Beyond the Prompt: Engineering AI Systems You Can Trust/);
assert.match(resume, /Designed and maintained test strategies/);
assert.doesNotMatch(resume, /Apr 2022 – Present/);
for (const page of ['pages/about.html','pages/projects.html','pages/resume.html']) {
  assert.match(read(page), /raw\\.githubusercontent\\.com\\/tetianakravchuk\\/tetianakravchuk\\.com/);
}
const redirects = read('_redirects');
assert.match(redirects, /\\/pages\\/resume\\.html/);
assert.match(read('_headers'), /Content-Security-Policy/);
assert.ok(fs.existsSync('assets/resume/Tetiana_Kravchuk_Resume.pdf'), 'Resume PDF asset missing');
console.log('Portfolio source-level smoke checks passed.');
