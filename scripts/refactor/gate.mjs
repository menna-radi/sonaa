#!/usr/bin/env node
/**
 * Refactor gate for the dashboard (frontend).
 *
 *   node scripts/refactor/gate.mjs [--dirs a,b] [--max-inline 6] [--allow-interval fileA,fileB] [--allow-hex fileA]
 *
 * Checks (exit 1 on any failure, prints every problem):
 *  1. Per directory in --dirs: hex colours, <style> tags, window.alert/confirm, setInterval, inline style budget per file.
 *  2. i18n: every translation entry that is NEW or CHANGED vs HEAD has non-empty en/ar/he.
 *  3. i18n: every literal t('key') used in a CHANGED file exists in LanguageContext.tsx with en/ar/he.
 *  4. CSS: every var(--x) (without fallback) used in a CHANGED file is defined somewhere under src/.
 * Legacy debt outside the changed files / given dirs never fails the gate.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const args = process.argv.slice(2);
const opt = (name, def = '') => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
};
const dirs = opt('dirs').split(',').map((s) => s.trim()).filter(Boolean);
const maxInline = Number(opt('max-inline', '6'));
const allowInterval = new Set(opt('allow-interval').split(',').filter(Boolean).map((s) => path.basename(s)));
const allowHex = new Set(['AndroidPhoneBannerPreview.tsx', 'tokens.css', ...opt('allow-hex').split(',').filter(Boolean).map((s) => path.basename(s))]);
const root = process.cwd();
const LANG_FILE = 'src/presentation/context/LanguageContext.tsx';
const problems = [];
const fail = (msg) => problems.push(msg);

const sh = (cmd) => {
  try { return execSync(cmd, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }); } catch { return ''; }
};
const walk = (dir, out = []) => {
  if (!fs.existsSync(dir)) return out;
  if (fs.statSync(dir).isFile()) { if (/\.(tsx?|css)$/.test(dir)) out.push(dir); return out; }
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (!['node_modules', 'dist', '.git'].includes(e.name)) walk(p, out); }
    else if (/\.(tsx?|css)$/.test(e.name)) out.push(p);
  }
  return out;
};
const rel = (p) => path.relative(root, p).split(path.sep).join('/');

// ---------- 1. directory checks ----------
for (const d of dirs) {
  for (const file of walk(path.resolve(root, d))) {
    const src = fs.readFileSync(file, 'utf8');
    const name = path.basename(file);
    const r = rel(file);
    const hex = (src.match(/#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b/g) || []).filter((h) => !/^#\d+$/.test(h));
    if (hex.length && !allowHex.has(name)) fail(`${r}: ${hex.length} hex colour literal(s) (${hex.slice(0, 3).join(', ')}…) — use var(--token)`);
    if (/<style\b/.test(src)) fail(`${r}: contains a <style> tag — move rules to a .css file`);
    if (/\b(?:window\.(?:alert|confirm)|alert)\s*\(/.test(src)) fail(`${r}: window.alert/confirm — use useConfirm()/useToast()`);
    if (/\bsetInterval\s*\(/.test(src) && !allowInterval.has(name)) fail(`${r}: setInterval — use TanStack Query refetchInterval`);
    if (name.endsWith('.tsx')) {
      const inline = (src.match(/style\s*=\s*\{\{/g) || []).length;
      if (inline > maxInline) fail(`${r}: ${inline} inline style objects (budget ${maxInline}) — use ui-* classes`);
      if (/:\s*any\b|<any>|as any\b/.test(src)) {
        const n = (src.match(/:\s*any\b|<any>|as any\b/g) || []).length;
        if (n > 0) fail(`${r}: ${n} use(s) of \`any\` — use domain types`);
      }
    }
  }
}

// ---------- changed files ----------
const changed = new Set(
  [...sh('git diff --name-only HEAD').split('\n'), ...sh('git ls-files --others --exclude-standard').split('\n')]
    .map((s) => s.trim().replace(/\\/g, '/'))
    .filter((s) => s.startsWith('src/') && fs.existsSync(path.join(root, s))),
);

// ---------- 2/3. i18n ----------
function parseTranslations(text) {
  const start = text.indexOf('export const translations');
  if (start < 0) return null;
  const open = text.indexOf('{', text.indexOf('=', start));
  let depth = 0, i = open, inStr = null, esc = false;
  for (; i < text.length; i++) {
    const c = text[i];
    if (inStr) { if (esc) esc = false; else if (c === '\\') esc = true; else if (c === inStr) inStr = null; continue; }
    if (c === "'" || c === '"' || c === '`') { inStr = c; continue; }
    if (c === '/' && text[i + 1] === '/') { while (i < text.length && text[i] !== '\n') i++; continue; }
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) break; }
  }
  try { return new Function(`return (${text.slice(open, i + 1)})`)(); } catch (e) { fail(`Cannot parse translations object: ${e.message}`); return null; }
}
const langNow = fs.existsSync(path.join(root, LANG_FILE)) ? parseTranslations(fs.readFileSync(path.join(root, LANG_FILE), 'utf8')) : null;
const langHeadText = sh(`git show HEAD:${LANG_FILE}`);
const langHead = langHeadText ? parseTranslations(langHeadText) : {};
const complete = (e) => e && ['en', 'ar', 'he'].every((l) => typeof e[l] === 'string' && e[l].trim() !== '');
if (langNow) {
  for (const [k, v] of Object.entries(langNow)) {
    const before = langHead?.[k];
    const isNewOrChanged = !before || JSON.stringify(before) !== JSON.stringify(v);
    if (isNewOrChanged && !complete(v)) fail(`i18n: key "${k}" is missing en/ar/he text`);
  }
  for (const f of changed) {
    if (!/\.(tsx|ts)$/.test(f) || f === LANG_FILE) continue;
    const src = fs.readFileSync(path.join(root, f), 'utf8');
    const used = new Set();
    for (const m of src.matchAll(/\bt\(\s*['"`]([a-zA-Z0-9_.]+)['"`]\s*\)/g)) used.add(m[1]);
    for (const k of used) if (!complete(langNow[k])) fail(`${f}: t('${k}') has no complete en/ar/he entry in LanguageContext.tsx`);
  }
}

// ---------- 4. css vars ----------
const defined = new Set();
for (const f of walk(path.join(root, 'src'))) {
  const src = fs.readFileSync(f, 'utf8');
  for (const m of src.matchAll(/(--[a-zA-Z0-9-_]+)\s*:/g)) defined.add(m[1]);
}
for (const f of changed) {
  if (!/\.(tsx|css)$/.test(f)) continue;
  const src = fs.readFileSync(path.join(root, f), 'utf8');
  for (const m of src.matchAll(/var\(\s*(--[a-zA-Z0-9-_]+)\s*\)/g)) {
    if (!defined.has(m[1])) fail(`${f}: var(${m[1]}) is not defined in any CSS — use a token from tokens.css`);
  }
}

if (problems.length) {
  const uniq = [...new Set(problems)];
  console.error(`\n[GATE FAILED] ${uniq.length} problem(s):`);
  for (const p of uniq.slice(0, 80)) console.error(' - ' + p);
  if (uniq.length > 80) console.error(` … and ${uniq.length - 80} more`);
  process.exit(1);
}
console.log(`[GATE PASSED] dirs=${dirs.join(',') || '(none)'} changedFiles=${changed.size}`);
