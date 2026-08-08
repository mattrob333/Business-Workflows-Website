/**
 * Minimal static server for the `output: 'export'` build.
 *
 * The site has no runtime (02-architecture: static export, no server until Phase 2), so
 * the Playwright walks must run against exactly the artefact that ships — `out/` — and
 * not against `next dev`. A dev server would hide export-only failures, which is the
 * class of bug worth catching here.
 *
 * No dependency is added for this (team rule 8): `node:http` is enough.
 */

import { createServer } from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { createGzip } from 'node:zlib';

const ROOT = new URL('../out/', import.meta.url).pathname;
const PORT = Number(process.env.PORT ?? 4321);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

function resolve(pathname) {
  const clean = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, '');
  const candidates =
    clean === '/' || clean === ''
      ? ['index.html']
      : [clean.replace(/^\//, ''), `${clean.replace(/^\//, '')}.html`, join(clean.replace(/^\//, ''), 'index.html')];

  for (const candidate of candidates) {
    const full = join(ROOT, candidate);
    if (!full.startsWith(ROOT)) continue;
    try {
      if (statSync(full).isFile()) return full;
    } catch {
      /* next candidate */
    }
  }
  return null;
}

createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  const file = resolve(url.pathname);
  if (!file) {
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('not found');
    return;
  }
  // Real static hosts serve text assets compressed; the Lighthouse budget is measured
  // against that behavior, so this server must match it or the numbers lie slow.
  const type = TYPES[extname(file)] ?? 'application/octet-stream';
  const compressible = /^(text\/|application\/(json|javascript))|image\/svg/.test(type);
  const wantsGzip = compressible && /\bgzip\b/.test(req.headers['accept-encoding'] ?? '');
  const headers = { 'content-type': type, 'cache-control': 'no-store' };
  if (wantsGzip) headers['content-encoding'] = 'gzip';
  res.writeHead(200, headers);
  const stream = createReadStream(file);
  if (wantsGzip) stream.pipe(createGzip()).pipe(res);
  else stream.pipe(res);
}).listen(PORT, () => {
  console.log(`static export served on http://127.0.0.1:${PORT}`);
});
