#!/usr/bin/env node
/**
 * Lists source files under src/ that nothing imports (candidates for deletion).
 *   node scripts/refactor/unused-files.mjs
 * Entry points (main.tsx, App.tsx), *.d.ts and css files imported via side-effect are handled.
 * It is a heuristic: review each file before deleting.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.cwd(), 'src');
const files = [];
const walk = (d) => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(tsx?|css)$/.test(e.name) && !e.name.endsWith('.d.ts')) files.push(p);
  }
};
walk(root);

const resolveImport = (from, spec) => {
  if (!spec.startsWith('.')) return null;
  const base = path.resolve(path.dirname(from), spec);
  const candidates = [base, `${base}.ts`, `${base}.tsx`, `${base}.css`, path.join(base, 'index.ts'), path.join(base, 'index.tsx')];
  return candidates.find((c) => fs.existsSync(c) && fs.statSync(c).isFile()) || null;
};

const imported = new Set();
for (const f of files) {
  if (!/\.(tsx?)$/.test(f)) continue;
  const src = fs.readFileSync(f, 'utf8');
  for (const m of src.matchAll(/(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g)) {
    const r = resolveImport(f, m[1]);
    if (r) imported.add(path.resolve(r));
  }
}
const entry = new Set(['main.tsx', 'App.tsx', 'vite-env.d.ts']);
const unused = files.filter((f) => !imported.has(path.resolve(f)) && !entry.has(path.basename(f)));
console.log(`Unreferenced files: ${unused.length}`);
unused.forEach((f) => console.log(' - ' + path.relative(process.cwd(), f).split(path.sep).join('/')));
