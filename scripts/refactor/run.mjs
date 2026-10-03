#!/usr/bin/env node
/**
 * Unattended ticket runner for the dashboard refactor (v2).
 *
 * Reads the ticket files in docs/refactor/*tickets*.md and implements them one by one with
 * Claude Code in print mode, using a low-cost model by default. After every ticket it runs the gate
 * (build, lint of touched files, style/i18n gate), commits on success, retries with the gate output on
 * failure, escalates once to a stronger model, and ROLLS BACK + moves on if it still fails.
 * It never stops on a failed ticket, waits out rate limits, and can be re-run any time to resume.
 *
 *   node scripts/refactor/run.mjs                    # run everything that is pending (backend + frontend)
 *   node scripts/refactor/run.mjs --track frontend   # only T-F tickets
 *   node scripts/refactor/run.mjs --only T-F010,T-F011
 *   node scripts/refactor/run.mjs --dry-run          # validate + print the plan, change nothing
 *   node scripts/refactor/run.mjs --status           # table of ticket states
 *   node scripts/refactor/run.mjs --retry-failed     # reset FAILED/BLOCKED tickets to pending, then run
 *
 * Options: --low <model> --mid <model> --all-low --no-escalate --attempts 3 --timeout-min 45
 *          --max-budget-usd 5 --backend-dir <path> --branch <name> --backend-branch <name> --from <id>
 *          --max-wait-hours 24 --no-commit
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn, execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// ───────────────────────────── config ─────────────────────────────
const argv = process.argv.slice(2);
const flag = (n) => argv.includes(`--${n}`);
const opt = (n, d) => { const i = argv.indexOf(`--${n}`); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : d; };

const FRONT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const BACK = path.resolve(opt('backend-dir', path.join(FRONT, '..', 'Arox-backend')));
const TICKET_DIR = path.join(FRONT, 'docs', 'refactor');
const STATE_FILE = path.join(FRONT, '.refactor-state.json');
const LOG_DIR = path.join(FRONT, '.refactor-logs');
const MODEL_LOW = opt('low', 'claude-haiku-4-5-20251001');
const MODEL_MID = opt('mid', 'claude-sonnet-5-5');
const ALL_LOW = flag('all-low');
const ESCALATE = !flag('no-escalate');
const ATTEMPTS = Number(opt('attempts', '3'));
const TIMEOUT_MS = Number(opt('timeout-min', '45')) * 60_000;
const BUDGET = opt('max-budget-usd', '5');
const MAX_WAIT_MS = Number(opt('max-wait-hours', '24')) * 3_600_000;
const BRANCH_F = opt('branch', 'refactor/dash-v2');
const BRANCH_B = opt('backend-branch', 'refactor/admin-api-v2');
const TRACK = opt('track', 'all');
const ONLY = (opt('only', '') || '').split(',').map((s) => s.trim()).filter(Boolean);
const FROM = opt('from', '');
const DRY = flag('dry-run');
const NO_COMMIT = flag('no-commit');
const isWin = process.platform === 'win32';

const ALLOWED_TOOLS = [
  'Read', 'Edit', 'Write', 'Glob', 'Grep',
  'Bash(npm run build:*)', 'Bash(npm run lint:*)', 'Bash(npm install:*)', 'Bash(npx tsc:*)', 'Bash(npx eslint:*)',
  'Bash(npx prisma generate:*)', 'Bash(node scripts/:*)', 'Bash(git status:*)', 'Bash(git diff:*)', 'Bash(git log:*)',
  'Bash(grep:*)', 'Bash(ls:*)', 'Bash(wc:*)', 'Bash(cat:*)', 'Bash(mkdir:*)',
  // deletions/moves are limited to source files and tracked through git
  'Bash(rm src/:*)', 'Bash(rm -f src/:*)', 'Bash(git rm:*)', 'Bash(git mv:*)',
].join(',');

// ───────────────────────────── utils ─────────────────────────────
const ts = () => new Date().toISOString().replace('T', ' ').slice(0, 19);
const log = (...a) => console.log(`[${ts()}]`, ...a);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
fs.mkdirSync(LOG_DIR, { recursive: true });

function sh(cmd, cwd, { timeout = 15 * 60_000, allowFail = true } = {}) {
  try {
    const out = execSync(cmd, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 256 * 1024 * 1024, timeout });
    return { code: 0, out };
  } catch (e) {
    const out = `${e.stdout || ''}${e.stderr || ''}${e.message && !e.stdout && !e.stderr ? e.message : ''}`;
    if (!allowFail) throw new Error(`${cmd} failed: ${out.slice(-2000)}`);
    return { code: e.status ?? 1, out };
  }
}
const git = (args, cwd) => sh(`git ${args}`, cwd, { allowFail: true });

// ───────────────────────────── parsing ─────────────────────────────
function parseTickets() {
  const files = fs.readdirSync(TICKET_DIR).filter((f) => /tickets.*\.md$/.test(f)).sort();
  const tickets = [];
  for (const f of files) {
    const text = fs.readFileSync(path.join(TICKET_DIR, f), 'utf8').replace(/^﻿/, '').replace(/\r\n/g, '\n');
    const firstTicket = text.search(/^### T-[BF]\d+/m);
    const preamble = firstTicket > 0 ? text.slice(0, firstTicket) : '';
    const blocks = text.split(/^(?=### T-[BF]\d+ ·)/m).filter((b) => b.startsWith('### T-'));
    for (const b of blocks) {
      const lines = b.split('\n');
      const m = lines[0].match(/^### (T-[BF]\d+) · (.+)$/);
      if (!m) continue;
      const t = { id: m[1], title: m[2].trim(), file: f, preamble, meta: {}, body: '' };
      let i = 1;
      while (i < lines.length && lines[i].trim() === '') i++;
      while (i < lines.length && /^- [a-z-]+:/.test(lines[i])) {
        const mm = lines[i].match(/^- ([a-z-]+):\s*(.*)$/);
        t.meta[mm[1]] = mm[2].trim();
        i++;
      }
      let bodyLines = lines.slice(i);
      const cut = bodyLines.findIndex((l) => /^---\s*$/.test(l) || /^## /.test(l));
      if (cut >= 0) bodyLines = bodyLines.slice(0, cut);
      t.body = bodyLines.join('\n').trim();
      const list = (k, sep) => (t.meta[k] || '').split(sep).map((s) => s.trim()).filter(Boolean);
      t.repo = t.meta.repo || (t.id.startsWith('T-B') ? 'backend' : 'frontend');
      t.tier = t.meta.tier || 'low';
      t.depends = list('depends', ',');
      t.needs = list('needs', ',');
      t.spec = list('spec', ';');
      t.files = list('files', ';');
      t.audit = list('audit', ',');
      t.gate = t.meta.gate || (t.repo === 'backend' ? 'backend' : 'frontend');
      t.maxInline = t.meta['max-inline'] || '6';
      tickets.push(t);
    }
  }
  return tickets;
}

function validate(tickets) {
  const ids = new Map();
  const errs = [];
  for (const t of tickets) {
    if (ids.has(t.id)) errs.push(`duplicate ticket id ${t.id}`);
    ids.set(t.id, t);
    if (!t.body) errs.push(`${t.id}: empty body`);
    if (!t.files.length) errs.push(`${t.id}: no files list`);
  }
  for (const t of tickets) for (const d of [...t.depends, ...t.needs]) if (!ids.has(d)) errs.push(`${t.id}: unknown dependency ${d}`);
  // cycle check (depends only)
  const state = new Map();
  const visit = (id, stack) => {
    if (state.get(id) === 2) return;
    if (state.get(id) === 1) { errs.push(`dependency cycle: ${[...stack, id].join(' -> ')}`); return; }
    state.set(id, 1);
    for (const d of ids.get(id).depends) if (ids.has(d)) visit(d, [...stack, id]);
    state.set(id, 2);
  };
  for (const id of ids.keys()) visit(id, []);
  return errs;
}

/** File order, but every ticket after its depends/needs (stable topological order). */
function order(tickets) {
  const byId = new Map(tickets.map((t) => [t.id, t]));
  const done = new Set();
  const out = [];
  const place = (t, guard = new Set()) => {
    if (done.has(t.id) || guard.has(t.id)) return;
    guard.add(t.id);
    for (const d of [...t.depends, ...t.needs]) if (byId.has(d)) place(byId.get(d), guard);
    done.add(t.id);
    out.push(t);
  };
  tickets.forEach((t) => place(t));
  return out;
}

// ───────────────────────────── state ─────────────────────────────
const loadState = () => (fs.existsSync(STATE_FILE) ? JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')) : { tickets: {} });
const saveState = (s) => fs.writeFileSync(STATE_FILE, JSON.stringify(s, null, 2));
const state = loadState();
const setStatus = (id, patch) => { state.tickets[id] = { ...(state.tickets[id] || {}), ...patch, updatedAt: new Date().toISOString() }; saveState(state); writeStatusFile(); };
const statusOf = (id) => state.tickets[id]?.status || 'PENDING';

let ALL = [];
function writeStatusFile() {
  const rows = ALL.map((t) => `${t.id.padEnd(8)} ${statusOf(t.id).padEnd(8)} ${(state.tickets[t.id]?.model || '').padEnd(28)} ${t.title}`);
  const counts = ALL.reduce((a, t) => { a[statusOf(t.id)] = (a[statusOf(t.id)] || 0) + 1; return a; }, {});
  fs.writeFileSync(path.join(LOG_DIR, 'STATUS.txt'), `Updated ${ts()}\n${JSON.stringify(counts)}\n\n${rows.join('\n')}\n`);
}

// ───────────────────────────── git helpers ─────────────────────────────
const repoDir = (t) => (t.repo === 'backend' ? BACK : FRONT);
function changedFiles(cwd) {
  const r = git('status --porcelain=v1 -uall', cwd);
  return r.out.split('\n').filter(Boolean).map((l) => l.slice(3).replace(/^"|"$/g, '').split(' -> ').pop().replace(/\\/g, '/'));
}
function headSha(cwd) { return git('rev-parse HEAD', cwd).out.trim(); }
/** Hard safety: only ever reset/clean the exact repo root and only while on the runner's work branch. */
function rollback(cwd, sha, branch) {
  const norm = (p) => p.replace(/\\/g, '/').replace(/\/$/, '').toLowerCase();
  const top = norm(git('rev-parse --show-toplevel', cwd).out.trim());
  const cur = git('rev-parse --abbrev-ref HEAD', cwd).out.trim();
  if (top !== norm(path.resolve(cwd)) || cur !== branch) {
    log(`REFUSING to roll back: toplevel=${top} branch=${cur} (expected ${cwd} on ${branch}). Revert the ticket's changes manually.`);
    return;
  }
  git(`reset --hard ${sha}`, cwd);
  git('clean -fd', cwd);
}
const branchOf = (t) => (t.repo === 'backend' ? BRANCH_B : BRANCH_F);

function preflight(repo, cwd, branch) {
  if (!fs.existsSync(path.join(cwd, '.git'))) throw new Error(`${repo}: ${cwd} is not a git repository`);
  const cur = git('rev-parse --abbrev-ref HEAD', cwd).out.trim();
  const dirty = changedFiles(cwd);
  const specPaths = (p) => p.startsWith('docs/') || p.startsWith('scripts/refactor/') || p === '.gitignore';
  const other = dirty.filter((p) => !(repo === 'frontend' && specPaths(p)));
  if (other.length) throw new Error(`${repo}: working tree has uncommitted changes outside the refactor specs:\n  ${other.slice(0, 15).join('\n  ')}\nCommit or stash them first.`);
  if (cur !== branch) {
    const exists = git(`rev-parse --verify ${branch}`, cwd).code === 0;
    const r = git(exists ? `checkout ${branch}` : `checkout -b ${branch}`, cwd);
    if (r.code !== 0) throw new Error(`${repo}: cannot switch to ${branch}: ${r.out}`);
    log(`${repo}: now on branch ${branch}${exists ? '' : ' (created from ' + cur + ')'}`);
  }
  if (repo === 'frontend' && changedFiles(cwd).length) {
    git('add -A docs scripts/refactor .gitignore', cwd);
    const r = git('commit -m "docs: dashboard refactor v2 specs and ticket runner"', cwd);
    if (r.code !== 0) throw new Error(`frontend: could not commit the spec files: ${r.out}`);
    log('frontend: committed the refactor specs and runner');
  }
}

// ───────────────────────────── gates ─────────────────────────────
const baseline = { frontBuildOk: true, backTsc: 0 };
const countTscErrors = (out) => (out.match(/error TS\d+/g) || []).length;

function allowedScope(t) {
  const exact = new Set(['src/presentation/context/LanguageContext.tsx']);
  const dirs = new Set();
  for (const f of t.files) {
    const p = f.replace(/\\/g, '/');
    if (/\.[a-z0-9]+$/i.test(p)) {
      exact.add(p);
      const d = path.posix.dirname(p);
      if (d !== '.') dirs.add(d);
      const m = p.match(/^(src\/presentation\/features\/[^/]+)\//);
      if (m) dirs.add(m[1]);
    } else dirs.add(p.replace(/\/$/, ''));
  }
  return (p) => exact.has(p) || [...dirs].some((d) => p === d || p.startsWith(d + '/'));
}

function runGate(t, cwd, files) {
  const problems = [];
  if (!files.length) return ['No files were changed — the ticket was not implemented.'];
  const inScope = allowedScope(t);
  const out = files.filter((f) => !inScope(f));
  if (out.length) problems.push(`Out-of-scope file changes (revert them or stay within the ticket's files): ${out.join(', ')}`);

  const tsFiles = files.filter((f) => /\.(ts|tsx)$/.test(f) && fs.existsSync(path.join(cwd, f)));
  if (t.gate === 'frontend') {
    const b = sh('npm run build', cwd, { timeout: 20 * 60_000 });
    if (b.code !== 0) problems.push(`npm run build FAILED:\n${b.out.slice(-3500)}`);
    if (tsFiles.length) {
      const e = sh(`npx eslint --format json ${tsFiles.map((f) => `"${f}"`).join(' ')}`, cwd);
      try {
        const rep = JSON.parse(e.out.slice(e.out.indexOf('[')));
        const msgs = rep.flatMap((r) => r.messages.filter((m) => m.severity === 2).map((m) => `${path.relative(cwd, r.filePath).replace(/\\/g, '/')}:${m.line} ${m.ruleId}: ${m.message}`));
        if (msgs.length) problems.push(`ESLint errors in touched files (${msgs.length}):\n${msgs.slice(0, 30).join('\n')}`);
      } catch { if (e.code !== 0) problems.push(`eslint failed to run:\n${e.out.slice(-1500)}`); }
    }
    const dirs = t.audit.join(',');
    const g = sh(`node scripts/refactor/gate.mjs ${dirs ? `--dirs "${dirs}"` : ''} --max-inline ${t.maxInline}`, cwd);
    if (g.code !== 0) problems.push(`style/i18n gate FAILED:\n${g.out.slice(-3500)}`);
  } else if (t.gate === 'backend') {
    const tsc = sh('npx tsc --noEmit', cwd, { timeout: 20 * 60_000 });
    const n = countTscErrors(tsc.out);
    if (tsc.code !== 0 && n > baseline.backTsc) problems.push(`tsc --noEmit FAILED (${n} errors, baseline ${baseline.backTsc}):\n${tsc.out.slice(-3500)}`);
    if (tsFiles.length) {
      const e = sh(`npx eslint --format json ${tsFiles.map((f) => `"${f}"`).join(' ')}`, cwd);
      try {
        const rep = JSON.parse(e.out.slice(e.out.indexOf('[')));
        const msgs = rep.flatMap((r) => r.messages.filter((m) => m.severity === 2).map((m) => `${path.relative(cwd, r.filePath).replace(/\\/g, '/')}:${m.line} ${m.ruleId}: ${m.message}`));
        if (msgs.length) problems.push(`ESLint errors in touched files (${msgs.length}):\n${msgs.slice(0, 30).join('\n')}`);
      } catch { if (e.code !== 0) problems.push(`eslint failed to run:\n${e.out.slice(-1500)}`); }
    }
    const unit = files.filter((f) => /\.unit\.test\.ts$/.test(f));
    if (unit.length) {
      const j = sh(`npx jest -c jest.unit.config.js ${unit.map((f) => `"${f}"`).join(' ')}`, cwd);
      if (j.code !== 0) problems.push(`unit tests FAILED:\n${j.out.slice(-3000)}`);
    }
  } // docs: scope check only
  return problems;
}

// ───────────────────────────── model call ─────────────────────────────
let currentChild = null;
function killTree(child) {
  try {
    if (isWin) execSync(`taskkill /pid ${child.pid} /T /F`, { stdio: 'ignore' });
    else child.kill('SIGKILL');
  } catch { /* already gone */ }
}

function runClaude({ prompt, model, cwd, logFile, addDirs }) {
  return new Promise((resolve) => {
    const args = ['-p', '--model', model, '--permission-mode', 'acceptEdits', '--allowedTools', ALLOWED_TOOLS,
      '--output-format', 'text', '--max-budget-usd', String(BUDGET)];
    for (const d of addDirs || []) args.push('--add-dir', d);
    const child = spawn('claude', args, { cwd, stdio: ['pipe', 'pipe', 'pipe'], windowsHide: true });
    currentChild = child;
    let out = '';
    let timedOut = false;
    const timer = setTimeout(() => { timedOut = true; killTree(child); }, TIMEOUT_MS);
    child.stdout.on('data', (d) => { out += d; });
    child.stderr.on('data', (d) => { out += d; });
    child.on('error', (e) => { clearTimeout(timer); fs.appendFileSync(logFile, `\n[spawn error] ${e.message}\n`); resolve({ code: 127, out: out + e.message, timedOut }); });
    child.on('close', (code) => {
      clearTimeout(timer);
      currentChild = null;
      fs.writeFileSync(logFile, out);
      resolve({ code: code ?? 1, out, timedOut });
    });
    child.stdin.write(prompt);
    child.stdin.end();
  });
}

const RATE_RE = /rate.?limit|usage limit|limit reached|overloaded|\b429\b|\b529\b|try again (later|in)|quota|credit balance|too many requests|temporarily unavailable/i;

function buildPrompt(t, attempt, prevProblems, doneBackend) {
  const rel = (p) => p.replace(/\\/g, '/');
  const specs = ['README.md', '02-overview-standard.md', ...t.spec].filter((v, i, a) => a.indexOf(v) === i)
    .map((s) => `docs/refactor/${s}`);
  const isBack = t.repo === 'backend';
  const checks = isBack
    ? 'npx tsc --noEmit  and  npx eslint <the files you changed>'
    : 'npm run build  and  npx eslint <the .ts/.tsx files you changed>  and  node scripts/refactor/gate.mjs --dirs "' + t.audit.join(',') + '" --max-inline ' + t.maxInline;
  return [
    `You are the implementation agent for ticket ${t.id} of the Arox dashboard refactor. Work autonomously and finish the ticket completely. Do not ask questions.`,
    `Repository root (your cwd): ${repoDir(t)}`,
    isBack
      ? `The frontend repo with the specs is at ${FRONT} (read-only for you): read ${rel(path.join(FRONT, 'docs/refactor/00-backend-deep-dive.md'))} for context. The rules for backend tickets are included below.`
      : `FIRST read these files completely (they hold the rules and the exact code to copy): ${specs.join(', ')}.`,
    '',
    `## Ticket ${t.id} · ${t.title}`,
    `tier: ${t.tier} · files you may touch: ${t.files.join('; ')}`,
    t.depends.length ? `depends (already done): ${t.depends.join(', ')}` : '',
    t.needs.length ? `optional backend support: ${t.needs.map((n) => `${n}=${doneBackend.has(n) ? 'DEPLOYED' : 'NOT AVAILABLE (use the fallback/capability behaviour from the spec)'}`).join(', ')}` : '',
    '',
    isBack ? `### Backend ticket rules\n${t.preamble}\n` : '',
    '### Ticket text',
    t.body,
    '',
    '## Operating rules',
    '- Edit ONLY the files listed for this ticket (new files inside the same folders are fine). Never touch .env, dist/, node_modules/, uploads/, or other tickets\' files.',
    '- Do NOT run git commit/reset/checkout/stash/clean — the runner handles git. Do not install dependencies unless the ticket says so.',
    '- Keep every existing behaviour not mentioned in the ticket. Match the surrounding code style. No `any`, no invented data, no hard-coded user-visible English (use t() keys with en/ar/he).',
    `- Before finishing run: ${checks}. Fix everything they report. The runner runs the same gate afterwards and will reject the work if it fails.`,
    '- If part of the ticket is impossible, do the rest, keep the build green, and end with a line `TICKET_BLOCKED: <reason>`. Otherwise end with `TICKET_DONE` and a 5-line summary of what changed.',
    attempt > 1 && prevProblems ? `\n## Previous attempt FAILED the gate — fix exactly these problems (the previous edits are still in the working tree):\n${prevProblems}` : '',
  ].filter((x) => x !== '').join('\n');
}

// ───────────────────────────── main loop ─────────────────────────────
async function waitRateLimit(waitedRef, label) {
  const steps = [60, 180, 300, 600, 900, 1800, 1800, 3600];
  const idx = Math.min(waitedRef.n, steps.length - 1);
  const s = steps[idx] * 1000;
  waitedRef.n++;
  waitedRef.total += s;
  if (waitedRef.total > MAX_WAIT_MS) return false;
  log(`⏳ rate limit / transient error (${label}); sleeping ${Math.round(s / 60000)} min (total waited ${(waitedRef.total / 3600000).toFixed(1)} h)`);
  await sleep(s);
  return true;
}

async function runTicket(t, doneBackend) {
  const cwd = repoDir(t);
  const base = headSha(cwd);
  const models = [];
  const tierModel = ALL_LOW || t.tier === 'low' ? MODEL_LOW : MODEL_MID;
  for (let i = 0; i < ATTEMPTS; i++) models.push(tierModel);
  if (ESCALATE && !ALL_LOW && tierModel === MODEL_LOW) models.push(MODEL_MID);

  let prevProblems = '';
  const waited = { n: 0, total: 0 };
  for (let a = 1; a <= models.length; a++) {
    const model = models[a - 1];
    const logFile = path.join(LOG_DIR, `${t.id}-a${a}.log`);
    log(`▶ ${t.id} attempt ${a}/${models.length} with ${model} — ${t.title}`);
    setStatus(t.id, { status: 'RUNNING', attempts: a, model });
    const prompt = buildPrompt(t, a, prevProblems, doneBackend);
    const addDirs = t.repo === 'backend' ? [FRONT] : [];
    let res = await runClaude({ prompt, model, cwd, logFile, addDirs });

    while ((res.code !== 0 || !res.out.trim()) && RATE_RE.test(res.out) && !res.timedOut) {
      if (!(await waitRateLimit(waited, t.id))) break;
      res = await runClaude({ prompt, model, cwd, logFile, addDirs });
    }
    if (res.timedOut) { prevProblems = `The previous attempt exceeded the ${TIMEOUT_MS / 60000} min time limit. Work in smaller steps and finish faster.`; log(`⚠ ${t.id}: timed out`); }
    else if (res.code !== 0 && !RATE_RE.test(res.out)) { prevProblems = `The model process exited with code ${res.code}: ${res.out.slice(-800)}`; }

    const files = changedFiles(cwd);
    const problems = runGate(t, cwd, files);
    const blocked = /TICKET_BLOCKED:/i.test(res.out) ? res.out.match(/TICKET_BLOCKED:.*/i)?.[0] : '';
    if (!problems.length) {
      if (!NO_COMMIT) {
        git('add -A', cwd);
        const msg = `refactor(${t.repo}): ${t.id} ${t.title.replace(/"/g, "'")}\n\nRefactor-Ticket: ${t.id}\nModel: ${model}${blocked ? `\nNote: ${blocked}` : ''}`;
        const mf = path.join(LOG_DIR, `${t.id}.commitmsg`);
        fs.writeFileSync(mf, msg);
        const c = git(`commit -F "${mf}"`, cwd);
        if (c.code !== 0) { problems.push(`git commit failed: ${c.out.slice(-1200)}`); }
      }
      if (!problems.length) {
        const sha = headSha(cwd);
        setStatus(t.id, { status: 'DONE', commit: sha, model, note: blocked || undefined, finishedAt: new Date().toISOString() });
        log(`✔ ${t.id} DONE (${sha.slice(0, 8)})${blocked ? ' — ' + blocked : ''}`);
        return true;
      }
    }
    prevProblems = problems.join('\n\n').slice(0, 6000) || prevProblems;
    log(`✖ ${t.id} attempt ${a} failed the gate:\n${prevProblems.split('\n').slice(0, 12).join('\n')}`);
  }
  rollback(cwd, base, branchOf(t));
  setStatus(t.id, { status: 'FAILED', error: prevProblems.slice(0, 2000), finishedAt: new Date().toISOString() });
  log(`✘ ${t.id} FAILED after all attempts — rolled back, continuing with the next ticket`);
  return false;
}

function printStatus(list) {
  const rows = list.map((t) => ({ id: t.id, status: statusOf(t.id), model: state.tickets[t.id]?.model || '', title: t.title.slice(0, 70) }));
  console.table(rows);
  const c = rows.reduce((a, r) => { a[r.status] = (a[r.status] || 0) + 1; return a; }, {});
  console.log(c);
}

async function main() {
  let tickets = parseTickets();
  const errs = validate(tickets);
  if (errs.length) { console.error('Ticket validation failed:\n - ' + errs.join('\n - ')); process.exit(2); }
  ALL = order(tickets);
  if (flag('status')) { printStatus(ALL); return; }

  let selected = ALL.filter((t) => TRACK === 'all' || (TRACK === 'frontend' ? t.repo === 'frontend' : t.repo === 'backend'));
  if (ONLY.length) selected = selected.filter((t) => ONLY.includes(t.id));
  if (FROM) { const i = selected.findIndex((t) => t.id === FROM); if (i >= 0) selected = selected.slice(i); }
  if (flag('retry-failed')) for (const t of selected) if (['FAILED', 'BLOCKED'].includes(statusOf(t.id))) setStatus(t.id, { status: 'PENDING', error: undefined });

  if (DRY || flag('list')) {
    log(`Plan: ${selected.length} tickets (backend ${selected.filter((t) => t.repo === 'backend').length}, frontend ${selected.filter((t) => t.repo === 'frontend').length})`);
    selected.forEach((t, i) => console.log(`${String(i + 1).padStart(3)}. ${t.id.padEnd(7)} [${t.repo.slice(0, 1).toUpperCase()}/${t.tier}] ${statusOf(t.id).padEnd(7)} ${t.title}${t.depends.length ? '  ← ' + t.depends.join(',') : ''}`));
    return;
  }

  // preflight per repo that has pending work
  const pending = selected.filter((t) => statusOf(t.id) !== 'DONE');
  const needFront = pending.some((t) => t.repo === 'frontend') || pending.some((t) => t.repo === 'backend'); // runner state lives in the frontend repo
  if (needFront) preflight('frontend', FRONT, BRANCH_F);
  if (pending.some((t) => t.repo === 'backend')) {
    preflight('backend', BACK, BRANCH_B);
    const base = sh('npx tsc --noEmit', BACK, { timeout: 20 * 60_000 });
    baseline.backTsc = countTscErrors(base.out);
    log(`backend baseline: ${baseline.backTsc} tsc errors`);
  }
  if (pending.some((t) => t.repo === 'frontend')) {
    const b = sh('npm run build', FRONT, { timeout: 20 * 60_000 });
    if (b.code !== 0) { console.error('The frontend build is already failing before any ticket ran — fix it first:\n' + b.out.slice(-2500)); process.exit(3); }
    log('frontend baseline build OK');
  }

  const startedAt = Date.now();
  const doneBackend = new Set(ALL.filter((t) => t.repo === 'backend' && statusOf(t.id) === 'DONE').map((t) => t.id));
  let interrupted = false;
  process.on('SIGINT', () => {
    interrupted = true;
    log('SIGINT: stopping the model and rolling back the current ticket…');
    if (currentChild) killTree(currentChild);
    const running = ALL.find((t) => statusOf(t.id) === 'RUNNING');
    if (running) { rollback(repoDir(running), headSha(repoDir(running)), branchOf(running)); setStatus(running.id, { status: 'PENDING' }); }
    process.exit(130);
  });

  for (const t of selected) {
    if (interrupted) break;
    const st = statusOf(t.id);
    if (st === 'DONE') { if (t.repo === 'backend') doneBackend.add(t.id); continue; }
    if (['FAILED', 'BLOCKED'].includes(st)) { log(`↷ ${t.id} is ${st} (use --retry-failed to try again)`); continue; }
    const badDep = t.depends.find((d) => statusOf(d) !== 'DONE');
    if (badDep) {
      setStatus(t.id, { status: 'BLOCKED', error: `dependency ${badDep} is ${statusOf(badDep)}` });
      log(`⛔ ${t.id} BLOCKED by ${badDep} (${statusOf(badDep)})`);
      continue;
    }
    const ok = await runTicket(t, doneBackend);
    if (ok && t.repo === 'backend') doneBackend.add(t.id);
  }

  const mins = Math.round((Date.now() - startedAt) / 60000);
  log(`Finished in ${mins} min.`);
  printStatus(selected);
  const failed = selected.filter((t) => ['FAILED', 'BLOCKED'].includes(statusOf(t.id)));
  const summary = [`# Refactor runner summary (${ts()})`, '', `Ran ${selected.length} tickets in ${mins} min.`, '',
    '| Ticket | Status | Model | Title |', '|---|---|---|---|',
    ...selected.map((t) => `| ${t.id} | ${statusOf(t.id)} | ${state.tickets[t.id]?.model || ''} | ${t.title} |`), '',
    failed.length ? '## Failed / blocked\n' + failed.map((t) => `- **${t.id}** ${statusOf(t.id)} — ${(state.tickets[t.id]?.error || '').split('\n')[0]}`).join('\n') : 'All tickets are DONE.'].join('\n');
  fs.writeFileSync(path.join(LOG_DIR, 'SUMMARY.md'), summary);
  log(`Summary written to ${path.relative(FRONT, path.join(LOG_DIR, 'SUMMARY.md'))}`);
  if (failed.length) log(`${failed.length} ticket(s) need attention. Inspect .refactor-logs/<id>-aN.log, fix by hand or re-run with --retry-failed.`);
}

main().catch((e) => { console.error('Runner crashed:', e); process.exit(1); });
