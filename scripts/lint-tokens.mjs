// Team-rules enforcement: no raw hex in components (tokens only), and the amber law -
// the --constraint token may only be referenced by files that declare themselves
// constraint surfaces via the pragma comment: /* amber-law: constraint-surface */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
const errors = [];
function walk(dir) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) { walk(p); continue; }
    if (!/\.(tsx|ts|css)$/.test(f) || p.includes('tokens.css')) continue;
    const src = readFileSync(p, 'utf8');
    if (/#[0-9a-fA-F]{3,8}\b/.test(src) && !p.endsWith('.mdx'))
      errors.push(`${p}: raw hex color — use tokens`);
    if (/--constraint/.test(src) && !src.includes('amber-law: constraint-surface'))
      errors.push(`${p}: uses --constraint without the amber-law pragma`);
  }
}
walk('src');
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log('tokens clean');
