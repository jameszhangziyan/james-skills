#!/usr/bin/env node
// Rebuild dist/server/index.js after editing index.html or public/favicon.svg.
// Reads a fresh template (or restores placeholders in a built worker), then
// embeds the latest static files into the Cloudflare Worker source.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

const toLiteral = (s) =>
  s
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$\{/g, '\\${');

const workerPath = resolve(root, 'dist/server/index.js');
const idxPath = resolve(root, 'index.html');
const favPath = resolve(root, 'public/favicon.svg');

let tpl = readFileSync(workerPath, 'utf8');

// If the worker was already built (no placeholders), re-derive the template
// by restoring the placeholders using a heuristic: replace the existing
// template literal for INDEX_HTML with the placeholder, and similarly for
// FAVICON_SVG.
if (!tpl.includes('__INDEX_HTML_PLACEHOLDER__')) {
  // match the first backtick-quoted assignment of `const INDEX_HTML = `...`;`
  tpl = tpl.replace(
    /(const INDEX_HTML = `)[\s\S]*?(`;\n)/,
    '$1__INDEX_HTML_PLACEHOLDER__$2'
  );
}
if (!tpl.includes('__FAVICON_SVG_PLACEHOLDER__')) {
  tpl = tpl.replace(
    /(const FAVICON_SVG = `)[\s\S]*?(`;\n)/,
    '$1__FAVICON_SVG_PLACEHOLDER__$2'
  );
}

if (!tpl.includes('__INDEX_HTML_PLACEHOLDER__') || !tpl.includes('__FAVICON_SVG_PLACEHOLDER__')) {
  console.error('Worker template is missing placeholders. Restore them manually:');
  console.error('  const INDEX_HTML = `__INDEX_HTML_PLACEHOLDER__`;');
  console.error('  const FAVICON_SVG = `__FAVICON_SVG_PLACEHOLDER__`;');
  process.exit(2);
}

const idx = readFileSync(idxPath, 'utf8');
const fav = readFileSync(favPath, 'utf8');

const out = tpl
  .replace('`__INDEX_HTML_PLACEHOLDER__`', '`' + toLiteral(idx) + '`')
  .replace('`__FAVICON_SVG_PLACEHOLDER__`', '`' + toLiteral(fav) + '`');

writeFileSync(workerPath, out, 'utf8');

console.log(`index.html   ${idx.length.toLocaleString()} chars`);
console.log(`favicon.svg  ${fav.length.toLocaleString()} chars`);
console.log(`worker       ${out.length.toLocaleString()} bytes`);
