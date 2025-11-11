// Fingerprint assets and emit fresh index for GitHub Pages
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const srcIndex = path.join(root, 'index.html');
const srcCss = path.join(root, 'assets', 'main.css');
const srcJs = path.join(root, 'assets', 'app.js');
const dist = path.join(root, 'dist');
const distAssets = path.join(dist, 'assets');

const args = new Set(process.argv.slice(2));
if (args.has('--clean')) {
  fs.rmSync(dist, { recursive: true, force: true });
  console.log('cleaned dist');
  process.exit(0);
}

fs.mkdirSync(distAssets, { recursive: true });

function fingerprint(filePath){
  const buf = fs.readFileSync(filePath);
  const hash = crypto.createHash('sha1').update(buf).digest('hex').slice(0,8);
  const ext = path.extname(filePath);
  const base = path.basename(filePath, ext);
  const outName = `${base}.${hash}${ext}`;
  return { hash, outName, buf };
}

const css = fingerprint(srcCss);
const js = fingerprint(srcJs);

// write assets
fs.writeFileSync(path.join(distAssets, css.outName), css.buf);
fs.writeFileSync(path.join(distAssets, js.outName), js.buf);

// write version
const version = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0,14);
const versionJson = { version, buildTime: Date.now() };
fs.writeFileSync(path.join(dist, 'version.json'), JSON.stringify(versionJson, null, 2));

// rewrite HTML to point to hashed names
const html = fs.readFileSync(srcIndex, 'utf8')
  .replace('assets/main.css', `assets/${css.outName}`)
  .replace('assets/app.js', `assets/${js.outName}`)
  .replace('<code id="version">dev</code>', `<code id="version">${version}</code>`);

fs.writeFileSync(path.join(dist, 'index.html'), html);
fs.writeFileSync(path.join(dist, '404.html'), html); // SPA fallback for Pages

console.log('build complete');
console.log(`css -> assets/${css.outName}`);
console.log(`js  -> assets/${js.outName}`);
console.log(`version ${version}`);
