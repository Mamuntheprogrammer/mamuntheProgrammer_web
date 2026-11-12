/**
 * Projects Module
 * Fetches live repositories from the GitHub API with a static JSON fallback,
 * then renders database-record styled cards with strict honesty rules.
 * The fallback keeps the projects section working on GitHub Pages even when
 * the API is rate-limited or the visitor is offline.
 */

import { filterAndFormatRepos } from './utils/github-filter.js';
import { sessionGet, sessionSet } from './utils/storage.js';

const CACHE_KEY = 'mamun_github_repos_cache_v2';
const CACHE_TIME_KEY = 'mamun_github_repos_time_v2';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const GITHUB_PROFILE = 'https://github.com/Mamuntheprogrammer';

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

  // Check sessionStorage cache first (guarded for privacy-mode browsers)
  const cachedData = sessionGet(CACHE_KEY);
  const cachedTime = sessionGet(CACHE_TIME_KEY);
  const isFresh = cachedTime && Date.now() - parseInt(cachedTime, 10) < CACHE_TTL_MS;

  if (cachedData && isFresh) {
    try {
      const parsed = JSON.parse(cachedData);
      if (Array.isArray(parsed)) repos = parsed;
    } catch (error) {
      // Corrupted cache: ignore and fetch fresh data.
    }
  }

  // If not cached, fetch live from GitHub API
  if (!repos.length) {
    try {
      const response = await fetch('https://api.github.com/users/Mamuntheprogrammer/repos?per_page=100&sort=updated', {
        headers: { Accept: 'application/vnd.github.v3+json' },
      });

      if (!response.ok) throw new Error(`GitHub API HTTP ${response.status}`);

      const raw = await response.json();
      repos = filterAndFormatRepos(raw);
      if (!repos.length) throw new Error('GitHub API returned no usable repositories');

      sessionSet(CACHE_KEY, JSON.stringify(repos));
      sessionSet(CACHE_TIME_KEY, Date.now().toString());
    } catch (err) {
      console.warn('GitHub API unavailable or rate-limited; falling back to ./data/projects.json', err);
      try {
        const fallbackRes = await fetch('./data/projects.json', { cache: 'no-cache' });
        if (!fallbackRes.ok) throw new Error(`Fallback HTTP ${fallbackRes.status}`);
        const fallbackData = await fallbackRes.json();
        if (Array.isArray(fallbackData)) repos = fallbackData;
      } catch (fallbackErr) {
        console.error('Failed to load fallback projects data', fallbackErr);
      }
    }
  }

  if (!repos.length) {
    if (countBadge) countBadge.textContent = 'OFFLINE';
    container.innerHTML = `
      <div class="project-loading-state" style="grid-column: 1 / -1; padding: 2rem; text-align: center; color: var(--text-muted); font-family: var(--font-mono); font-size: 0.85rem;">
        Repository records could not be loaded right now.<br />
        <a href="${GITHUB_PROFILE}?tab=repositories" target="_blank" rel="noopener noreferrer">Browse the full list on GitHub ↗</a>
      </div>
    `;
    return;
  }

  renderRepoCards(container, repos);
  initFilterButtons(container, repos);

  // Let deep-link navigation recalculate now that the project grid has a height.
  window.dispatchEvent(new CustomEvent('projects-loaded', { detail: { count: repos.length } }));
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

  const countBadge = document.getElementById('projects-count-badge');
  if (countBadge) {
    countBadge.textContent =
      filterCategory === 'all' ? `${filtered.length} records` : `${filtered.length} / ${repos.length} records`;
  }

  if (!filtered.length) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 2rem; text-align: center; color: var(--text-muted); font-family: var(--font-mono);">
        No matching records found for query [${escapeHtml(filterCategory)}].
      </div>
    `;
    return;
  }

  container.innerHTML = filtered
    .map((repo, idx) => {
      const recordNumber = String(idx + 1).padStart(3, '0');
      const language = repo.language || 'Polyglot';
      const languageKey = language.toLowerCase();
      const tags = Array.from(
        new Set((repo.tags || []).filter((tag) => tag && tag.toLowerCase() !== languageKey))
      );
      const repoName = escapeHtml(repo.name);
      const description = escapeHtml(repo.description || 'Open-source repository by Mamuntheprogrammer.');
      const safeUrl = /^https:\/\/github\.com\//i.test(repo.html_url || '')
        ? repo.html_url
        : `${GITHUB_PROFILE}?tab=repositories`;
      const stars = Number(repo.stargazers_count) || 0;

      const starIcon = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--packet-amber);" aria-hidden="true">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      `;

      return `
        <article class="project-card ${repo.featured ? 'project-featured' : ''}" data-repo-name="${repoName}">
          <div class="project-card-top">
            <div class="project-record-id">
              <span>RECORD_ID #${recordNumber}</span>
              ${repo.featured ? '<span class="technical-tag technical-tag-amber" style="font-size: 0.65rem;">★ FEATURED</span>' : ''}
            </div>
            <h3 class="project-name">${repoName}</h3>
            <p class="project-desc">${description}</p>
            <div class="project-tags">
              <span class="project-tag" style="color: var(--line-mint);">${escapeHtml(language)}</span>
              ${tags.map((t) => `<span class="project-tag">${escapeHtml(t)}</span>`).join('')}
            </div>
          </div>
          <div class="project-card-footer">
            <div class="project-stat-group">
              <span style="display: inline-flex; align-items: center; gap: 0.25rem;" aria-label="${stars} GitHub stars">
                ${starIcon} ${stars}
              </span>
            </div>
            <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="project-link-action" aria-label="View repository ${repoName} on GitHub">
              <span>SOURCE</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
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
  const filterBar = document.querySelector('.projects-filter-bar');
  if (!filterBar || filterBar.dataset.bound === 'true') return;
  filterBar.dataset.bound = 'true';

  const filterBtns = Array.from(filterBar.querySelectorAll('.filter-btn'));
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      renderRepoCards(container, repos, btn.dataset.filter || 'all');
    });
  });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
