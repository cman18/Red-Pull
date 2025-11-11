/* App entry point */
const el = document.getElementById('app');
const versionEl = document.getElementById('version');

function fmt(ts){
  const d = new Date(ts);
  return d.toISOString().replace('T',' ').replace('Z',' UTC');
}

// Render a simple interactive card to verify updates
function render(message){
  el.innerHTML = `
    <div class="grid">
      <div class="card">
        <h2>Live update demo</h2>
        <p>${message}</p>
        <button id="btn">Click me</button>
      </div>
      <div class="card">
        <h2>How cache busting works</h2>
        <ol>
          <li>The build script generates a new version string.</li>
          <li>It fingerprints CSS and JS file names.</li>
          <li>index.html is rewritten to reference the new names.</li>
        </ol>
      </div>
    </div>
  `;
  document.getElementById('btn').onclick = () => alert('It works');
}

async function loadVersion(){
  try {
    const res = await fetch('version.json?ts=' + Date.now(), { cache: 'no-store' });
    const data = await res.json();
    versionEl.textContent = data.version;
    render('This build was generated at ' + fmt(data.buildTime));
  } catch(e){
    versionEl.textContent = 'dev';
    render('Dev mode. Run npm run build to fingerprint assets');
  }
}

loadVersion();
