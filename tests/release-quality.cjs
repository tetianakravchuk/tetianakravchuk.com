const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = process.cwd();
const pages = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    if (entry.name.startsWith('.')) continue;
    const relative = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(relative);
    else if (entry.name.endsWith('.html')) pages.push(relative);
  }
}
walk('pages');
walk('projects');
pages.push('index.html');
const sitemap = fs.readFileSync('sitemap.xml','utf8');
const headers = fs.readFileSync('_headers','utf8');
assert.match(headers, /Content-Security-Policy:/);
assert.match(headers, /X-Content-Type-Options:\s*nosniff/);
assert.match(headers, /Referrer-Policy:/);
assert.match(headers, /\/academy\/\*/);
assert.match(headers, /noindex/);
assert.match(sitemap, /<urlset/);
assert.match(fs.readFileSync('robots.txt','utf8'), /Sitemap:/i);
const errors = [];
for (const file of pages) {
  const html = fs.readFileSync(file,'utf8');
  const count = (re) => [...html.matchAll(re)].length;
  if (count(/<main(?:\s|>)/gi) > 1) errors.push(file+': nested or repeated main landmark');
  if (count(/<title(?:\s|>)/gi) !== 1) errors.push(file+': expected exactly one title');
  if (!/<html\b[^>]*\blang\s*=/.test(html)) errors.push(file+': missing language');
  if (!/<meta\b[^>]*name=["']viewport["']/.test(html)) errors.push(file+': missing viewport');
  const canonical = html.match(/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)/i)
    || html.match(/<link\b[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["']/i);
  if (!canonical) errors.push(file+': missing canonical URL');
  else if (!canonical[1].startsWith('https://tetianakravchuk.com/')) errors.push(file+': invalid canonical origin');
  if (/\b(?:src|href)=["']http:\/\//i.test(html)) errors.push(file+': insecure asset or link');
  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    if (!/\balt\s*=/.test(match[0])) errors.push(file+': image missing alt attribute');
  }
}
assert.deepEqual(errors, [], 'Release quality failures:\n'+errors.join('\n'));
console.log('Phase 5 source release-quality checks passed for '+pages.length+' HTML pages.');
