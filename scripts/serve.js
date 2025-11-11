// Minimal static preview server for local testing
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const root = process.cwd();
const port = 8080;

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url);
  let filePath = decodeURIComponent(parsed.pathname);
  if (filePath === '/') filePath = '/index.html';
  const tryFiles = [path.join(root, 'dist', filePath), path.join(root, filePath)];
  let hit = null;
  for (const f of tryFiles){
    if (fs.existsSync(f) && fs.statSync(f).isFile()) { hit = f; break; }
  }
  if (!hit) {
    // SPA fallback
    hit = path.join(root, 'dist', 'index.html');
    if (!fs.existsSync(hit)) hit = path.join(root, 'index.html');
  }
  const ext = path.extname(hit).slice(1);
  const types = { html: 'text/html', js: 'text/javascript', css: 'text/css', json: 'application/json' };
  res.setHeader('Content-Type', types[ext] || 'text/plain');
  // Do not cache in dev preview
  res.setHeader('Cache-Control', 'no-store');
  fs.createReadStream(hit).pipe(res);
});

server.listen(port, () => {
  console.log(`preview at http://localhost:${port}`);
});
