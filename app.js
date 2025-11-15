const form = document.getElementById('user-form');
const input = document.getElementById('username');
const statusEl = document.getElementById('status');
const resultsEl = document.getElementById('results');
const loadBtn = document.getElementById('load-btn');

form.addEventListener('submit', event => {
  event.preventDefault();
  const username = (input.value || '').trim();
  if (!username) {
    statusEl.textContent = 'Please enter a Reddit username.';
    return;
  }
  fetchUserPosts(username);
});

async function fetchUserPosts(username) {
  const user = username.replace(/^u\//i, '');
  statusEl.textContent = `Loading posts for u/${user}...`;
  loadBtn.disabled = true;
  resultsEl.innerHTML = '';
  try {
    const url = `https://www.reddit.com/user/${encodeURIComponent(user)}/submitted.json?raw_json=1&limit=75`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const payload = await res.json();
    const items = payload?.data?.children || [];
    if (!items.length) {
      statusEl.textContent = `No posts found for u/${user}.`;
      loadBtn.disabled = false;
      return;
    }
    statusEl.textContent = `Showing ${items.length} posts for u/${user}.`;
    const frag = document.createDocumentFragment();
    for (const item of items) {
      const post = item.data;
      const card = document.createElement('article');
      card.className = 'card';
      const mediaHtml = buildMediaHtml(post);
      card.innerHTML = `
        <header class="card-header">
          <a href="https://www.reddit.com${post.permalink}" target="_blank" rel="noopener noreferrer">
            ${escapeHtml(post.title || '[no title]')}
          </a>
        </header>
        <div class="card-media">
          ${mediaHtml}
        </div>
        <div class="card-body">
          <span class="badge">r/${escapeHtml(post.subreddit || '')}</span>
          <span class="badge">Score ${post.score ?? 0}</span>
        </div>
      `;
      frag.appendChild(card);
    }
    resultsEl.appendChild(frag);
  } catch (err) {
    console.error(err);
    statusEl.textContent = 'Error loading posts. Reddit may be blocking the request or the user may not exist.';
  } finally {
    loadBtn.disabled = false;
  }
}

function buildMediaHtml(post) {
  const safe = url => url.replace(/&amp;/g, '&');
  if (post.is_video && post.media?.reddit_video?.fallback_url) {
    const src = safe(post.media.reddit_video.fallback_url);
    return `<video controls muted playsinline src="${src}"></video><span class="tag">Video</span>`;
  }
  if (post.post_hint === 'image' && post.url) {
    const src = safe(post.url);
    return `<img src="${src}" alt=""><span class="tag">Image</span>`;
  }
  const preview = post.preview?.images?.[0]?.source?.url;
  if (preview) {
    const src = safe(preview);
    return `<img src="${src}" alt=""><span class="tag">Image</span>`;
  }
  if (post.thumbnail && post.thumbnail.startsWith('http')) {
    const src = safe(post.thumbnail);
    return `<img src="${src}" alt=""><span class="tag">Thumb</span>`;
  }
  return `<div class="no-media">No media preview available</div>`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
