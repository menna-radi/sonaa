#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const strict = args.includes('--strict');
const targetArg = args.find((a) => !a.startsWith('--'));
const targetDir = path.resolve(process.cwd(), targetArg || 'src/presentation');

const EXTENSIONS = new Set(['.tsx', '.ts', '.jsx', '.js', '.css']);
const EXCLUDED_DIRS = new Set(['node_modules', 'dist', '.git', 'coverage']);
const ALLOWED_HEX_FILES = new Set(['AndroidPhoneBannerPreview.tsx']);

function scanDir(dir, results = []) {
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!EXCLUDED_DIRS.has(entry.name)) {
        scanDir(fullPath, results);
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (EXTENSIONS.has(ext)) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const fileName = path.basename(filePath);

  // Pattern matchers
  const inlineStyleMatches = (content.match(/style\s*=\s*\{\{/g) || []).length;
  const hexMatches = (content.match(/#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g) || []).length;
  const rgbaMatches = (content.match(/rgba?\s*\(/g) || []).length;
  const importantMatches = (content.match(/!important/g) || []).length;
  const styleTagMatches = (content.match(/<style\b/g) || []).length;
  const alertConfirmMatches = (content.match(/\b(?:window\.)?(?:alert|confirm)\s*\(/g) || []).length;

  return {
    file: path.relative(process.cwd(), filePath),
    fileName,
    inlineStyle: inlineStyleMatches,
    hex: hexMatches,
    rgba: rgbaMatches,
    important: importantMatches,
    styleTag: styleTagMatches,
    alertConfirm: alertConfirmMatches,
  };
}

const files = scanDir(targetDir);
const reports = files.map(analyzeFile);

const totals = reports.reduce(
  (acc, r) => {
    acc.inlineStyle += r.inlineStyle;
    acc.hex += r.hex;
    acc.rgba += r.rgba;
    acc.important += r.important;
    acc.styleTag += r.styleTag;
    acc.alertConfirm += r.alertConfirm;
    if (ALLOWED_HEX_FILES.has(r.fileName)) {
      acc.allowedHex += r.hex;
    }
    return acc;
  },
  { inlineStyle: 0, hex: 0, allowedHex: 0, rgba: 0, important: 0, styleTag: 0, alertConfirm: 0 }
);

console.log(`\n=== UI AUDIT: ${path.relative(process.cwd(), targetDir) || '.'} (${reports.length} files) ===`);
console.table({
  'Inline Styles (style={{...}})': { Total: totals.inlineStyle },
  'Hex Colors (#...)': { Total: totals.hex, 'Allowed (Exceptions)': totals.allowedHex, Disallowed: totals.hex - totals.allowedHex },
  'RGB/RGBA calls': { Total: totals.rgba },
  '!important': { Total: totals.important },
  '<style> tags': { Total: totals.styleTag },
  'window.alert / confirm': { Total: totals.alertConfirm },
});

// Top 10 files with most inline styles or hex colors
const dirtyFiles = reports
  .map((r) => ({
    file: r.file,
    dirtyScore: r.inlineStyle + r.hex + r.important * 2 + r.styleTag * 5,
    inline: r.inlineStyle,
    hex: r.hex,
    important: r.important,
    styleTag: r.styleTag,
  }))
  .sort((a, b) => b.dirtyScore - a.dirtyScore)
  .slice(0, 10);

if (dirtyFiles.length > 0 && dirtyFiles[0].dirtyScore > 0) {
  console.log('\n--- Top 10 High Debt Files ---');
  console.table(dirtyFiles);
}

if (strict) {
  const disallowedHex = totals.hex - totals.allowedHex;
  if (disallowedHex > 0) {
    console.error(`\n[STRICT CHECK FAILED] Found ${disallowedHex} disallowed hex color literals!`);
    process.exit(1);
  }
  console.log('\n[STRICT CHECK PASSED] No disallowed hex color literals found.');
}
