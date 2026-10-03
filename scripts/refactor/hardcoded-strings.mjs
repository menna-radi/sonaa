#!/usr/bin/env node
/**
 * Lists probable hard-coded user-visible English strings in JSX (a to-do list for the i18n sweep).
 *   node scripts/refactor/hardcoded-strings.mjs [dir=src/presentation] [--limit 60] [--json]
 * Heuristics: JSX text nodes that start with a capital Latin letter, and string props
 * title/placeholder/aria-label/label/subtitle/body/message/description/alt="English words".
 * Mock files, CSS, tests and LanguageContext are skipped. Exit code is always 0.
 */
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const limitIdx = args.indexOf('--limit');
const limit = limitIdx >= 0 ? Number(args[limitIdx + 1]) || 60 : 60;
const positional = args.filter((a, i) => !a.startsWith('--') && i !== limitIdx + 1);
const dir = path.resolve(process.cwd(), positional[0] || 'src/presentation');
const asJson = args.includes('--json');
const SKIP = /(LanguageContext|Mock|\.test\.|\.d\.ts|AndroidPhoneBannerPreview)/;

const walk = (d, out = []) => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) { if (!['node_modules', 'dist'].includes(e.name)) walk(p, out); }
    else if (p.endsWith('.tsx') && !SKIP.test(p)) out.push(p);
  }
  return out;
};

const hits = [];
for (const file of walk(dir)) {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  lines.forEach((line, i) => {
    const code = line.replace(/\/\/.*$/, '');
    if (/^\s*(import|export|\*|\/\*)/.test(code)) return;
    const text = [...code.matchAll(/>\s*([A-Z][A-Za-z][A-Za-z ,.'’:!?&/-]{3,})\s*</g)].map((m) => m[1].trim());
    const props = [...code.matchAll(/\b(?:title|placeholder|aria-label|label|subtitle|body|message|description|alt|eyebrow)\s*=\s*["']([A-Za-z][A-Za-z ,.'’:!?&/-]{3,})["']/g)].map((m) => m[1]);
    for (const s of [...text, ...props]) {
      if (/^(true|false|null|undefined|px|rem|auto|none|flex|grid|block)$/i.test(s)) continue;
      hits.push({ file: path.relative(process.cwd(), file).split(path.sep).join('/'), line: i + 1, text: s });
    }
  });
}
if (asJson) { console.log(JSON.stringify(hits, null, 2)); process.exit(0); }
const byFile = new Map();
for (const h of hits) byFile.set(h.file, (byFile.get(h.file) || 0) + 1);
console.log(`Probable hard-coded strings: ${hits.length} in ${byFile.size} files`);
[...byFile.entries()].sort((a, b) => b[1] - a[1]).slice(0, 25).forEach(([f, n]) => console.log(String(n).padStart(4), f));
console.log('\nFirst occurrences:');
hits.slice(0, limit).forEach((h) => console.log(`${h.file}:${h.line}  "${h.text}"`));
