/**
 * Projects Module
 * Fetches live repositories from GitHub API with fallback to /data/projects.json.
 * Renders database-record styled cards with strict honesty rules.
 */

import { filterAndFormatRepos } from './utils/github-filter.js';

const CACHE_KEY = 'mamun_github_repos_cache_v2';
const CACHE_TIME_KEY = 'mamun_github_repos_time_v2';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function loadProjects() {
  const container = document.getElementById('projects-grid-container');
  const countBadge = document.getElementById('projects-count-badge');
  if (!container) return;

  container.innerHTML = `
    <div class="project-loading-state" style="grid-column: 1 / -1; padding: 2rem; text-align: center; color: var(--text-muted); font-family: var(--font-mono); font-size: 0.85rem;">
      <span style="color: var(--line-mint)">SELECT * FROM public_repositories...</span> Fetching latest GitHub records...
    </div>
  `;

  let repos = [];

  // Check sessionStorage cache first
  const cachedData = sessionStorage.getItem(CACHE_KEY);
  const cachedTime = sessionStorage.getItem(CACHE_TIME_KEY);
  const isFresh = cachedTime && Date.now() - parseInt(cachedTime, 10) < CACHE_TTL_MS;

  if (cachedData && isFresh) {
    try {
      repos = JSON.parse(cachedData);
    } catch (e) {}
  }

  // If not cached, fetch live from GitHub API
  if (!repos.length) {
    try {
      const response = await fetch('https://api.github.com/users/Mamuntheprogrammer/repos?per_page=100&sort=updated', {
        headers: { Accept: 'application/vnd.github.v3+json' },
      });

      if (response.ok) {
        const raw = await response.json();
        repos = filterAndFormatRepos(raw);
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(repos));
        sessionStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
      } else {
        throw new Error(`GitHub API HTTP ${response.status}`);
      }
    } catch (err) {
      console.warn('GitHub API unavailable or rate-limited; falling back to /data/projects.json', err);
      try {
        const fallbackRes = await fetch('./data/projects.json');
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          repos = fallbackData;
        }
      } catch (fallbackErr) {
        console.error('Failed to load fallback projects data', fallbackErr);
      }
    }
  }

  // Render initial cards
  if (countBadge) {
    countBadge.textContent = `${repos.length} records`;
  }

  renderRepoCards(container, repos);
  initFilterButtons(container, repos);
}

function renderRepoCards(container, repos, filterCategory = 'all') {
  const filtered = repos.filter((repo) => {
    if (filterCategory === 'all') return true;
    if (filterCategory === 'featured') return repo.featured;
    if (filterCategory === 'python') return (repo.language || '').toLowerCase().includes('python');
    if (filterCategory === 'automation') {
      return (
        (repo.tags || []).some((t) => t.toLowerCase().includes('auto')) ||
        repo.name.toLowerCase().includes('merger') ||
        repo.name.toLowerCase().includes('sql')
      );
    }
    if (filterCategory === 'mobile') {
      return (
        (repo.language || '').toLowerCase().includes('dart') ||
        (repo.tags || []).some((t) => t.toLowerCase().includes('flutter') || t.toLowerCase().includes('mobile'))
      );
    }
    return true;
  });

  if (!filtered.length) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 2rem; text-align: center; color: var(--text-muted); font-family: var(--font-mono);">
        No matching records found for query [${filterCategory}].
      </div>
    `;
    return;
  }

  container.innerHTML = filtered
    .map((repo, idx) => {
      const recordNumber = String(idx + 1).padStart(3, '0');
      const starIcon = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--packet-amber);">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      `;

      return `
        <article class="project-card ${repo.featured ? 'project-featured' : ''}" data-repo-name="${repo.name}">
          <div class="project-card-top">
            <div class="project-record-id">
              <span>RECORD_ID #${recordNumber}</span>
              ${repo.featured ? '<span class="technical-tag technical-tag-amber" style="font-size: 0.65rem;">★ FEATURED</span>' : ''}
            </div>
            <h3 class="project-name">${repo.name}</h3>
            <p class="project-desc">${repo.description}</p>
            <div class="project-tags">
              <span class="project-tag" style="color: var(--line-mint);">${repo.language}</span>
              ${(repo.tags || []).map((t) => `<span class="project-tag">${t}</span>`).join('')}
            </div>
          </div>
          <div class="project-card-footer">
            <div class="project-stat-group">
              <span style="display: inline-flex; align-items: center; gap: 0.25rem;">
                ${starIcon} ${repo.stargazers_count}
              </span>
            </div>
            <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="project-link-action" aria-label="View repository ${repo.name} on GitHub">
              <span>SOURCE</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </a>
          </div>
        </article>
      `;
    })
    .join('');
}

function initFilterButtons(container, repos) {
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.filter || 'all';
      renderRepoCards(container, repos, cat);
    });
  });
}
