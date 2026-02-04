// ===========================
// UI-only interactions
// ===========================

// ---- Mobile + Sidebar state
const body = document.body;
const overlay = document.querySelector('[data-overlay]');
const sidebarToggle = document.querySelector('[data-sidebar-toggle]');

const themeToggle = document.querySelector('[data-theme-toggle]');

const THEME_KEY = 'polyglot_theme';

function setTheme(theme) {
  const next = theme === 'dark' ? 'dark' : 'light';
  body.setAttribute('data-theme', next);
  localStorage.setItem(THEME_KEY, next);

  // update icon if present
  const icon = themeToggle?.querySelector('.theme-toggle-icon');
  if (icon) icon.textContent = next === 'dark' ? '☀' : '☾';
}

function getPreferredTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'light' || saved === 'dark') return saved;

  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

const SIDEBAR_KEY = 'polyglot_sidebar';
const NAV_KEY = 'polyglot_nav';

function setSidebarCollapsed(isCollapsed) {
  body.setAttribute('data-sidebar', isCollapsed ? 'collapsed' : 'expanded');
  localStorage.setItem(SIDEBAR_KEY, isCollapsed ? 'collapsed' : 'expanded');
}

function setNavOpen(isOpen) {
  body.setAttribute('data-nav', isOpen ? 'open' : 'closed');
  localStorage.setItem(NAV_KEY, isOpen ? 'open' : 'closed');
}

function isMobile() {
  return window.matchMedia('(max-width: 1024px)').matches;
}

// Init defaults
(function initLayoutState() {
  const savedSidebar = localStorage.getItem(SIDEBAR_KEY) || 'expanded';
  const savedNav = localStorage.getItem(NAV_KEY) || 'closed';

  body.setAttribute('data-sidebar', savedSidebar);
  body.setAttribute('data-nav', savedNav);

  // Theme init
  setTheme(getPreferredTheme());

  // On mobile, always start with nav closed
  if (isMobile()) setNavOpen(false);
})();

if (sidebarToggle) {
  sidebarToggle.addEventListener('click', () => {
    if (isMobile()) {
      const open = body.getAttribute('data-nav') === 'open';
      setNavOpen(!open);
      return;
    }

    const collapsed = body.getAttribute('data-sidebar') === 'collapsed';
    setSidebarCollapsed(!collapsed);
  });
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const current = body.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    setTheme(current === 'dark' ? 'light' : 'dark');
  });
}

// Keep in sync if OS theme changes (only if user hasn't explicitly chosen)
if (window.matchMedia) {
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener?.('change', () => {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved !== 'light' && saved !== 'dark') {
      setTheme(getPreferredTheme());
    }
  });
}

if (overlay) {
  overlay.addEventListener('click', () => setNavOpen(false));
}

// Close drawer after choosing a nav item on mobile/tablet.
document.querySelectorAll('.sidebar .nav-item').forEach((item) => {
  item.addEventListener('click', () => {
    if (isMobile()) setNavOpen(false);
  });
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') setNavOpen(false);
});

window.addEventListener('resize', () => {
  if (isMobile()) {
    setNavOpen(false);
    // avoid collapsed layout in mobile
    body.setAttribute('data-sidebar', 'expanded');
  }
});

// ---- Fake table interactions (search + sort UI)
const searchInput = document.querySelector('.table-search');
const tableRows = document.querySelectorAll('.table tbody tr');
const sortButtons = document.querySelectorAll('.table-sort');

if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();

    tableRows.forEach((row) => {
      const text = row.innerText.toLowerCase();
      row.style.display = text.includes(query) ? '' : 'none';
    });
  });
}

sortButtons.forEach((button) => {
  button.addEventListener('click', () => {
    // visual-only sort state
    sortButtons.forEach((b) => b.classList.remove('active'));
    button.classList.add('active');

    const indicator = button.querySelector('.sort-indicator');
    if (!indicator) return;

    indicator.textContent =
      indicator.textContent === '↕' ? '↓' :
      indicator.textContent === '↓' ? '↑' : '↕';
  });
});


// ---- Users page filters (UI-only)
const usersSearch = document.querySelector('[data-users-search]');
const usersStatus = document.querySelector('[data-users-status]');
const usersPlan = document.querySelector('[data-users-plan]');
const usersRows = document.querySelectorAll('[data-users-table] tbody tr');

function applyUsersFilters() {
  const q = (usersSearch?.value || '').trim().toLowerCase();
  const status = usersStatus?.value || 'all';
  const plan = usersPlan?.value || 'all';

  usersRows.forEach((row) => {
    const text = row.innerText.toLowerCase();
    const rowStatus = row.getAttribute('data-status') || '';
    const rowPlan = row.getAttribute('data-plan') || '';

    const matchesQuery = !q || text.includes(q);
    const matchesStatus = status === 'all' || rowStatus === status;
    const matchesPlan = plan === 'all' || rowPlan === plan;

    row.style.display = matchesQuery && matchesStatus && matchesPlan ? '' : 'none';
  });
}

if (usersSearch) usersSearch.addEventListener('input', applyUsersFilters);
if (usersStatus) usersStatus.addEventListener('change', applyUsersFilters);
if (usersPlan) usersPlan.addEventListener('change', applyUsersFilters);

// ---- Billing: invoices filters (UI-only)
const invoicesSearch = document.querySelector('[data-invoices-search]');
const invoicesStatus = document.querySelector('[data-invoices-status]');
const invoicesRows = document.querySelectorAll('[data-invoices-table] tbody tr');

function applyInvoiceFilters() {
  const q = (invoicesSearch?.value || '').trim().toLowerCase();
  const status = invoicesStatus?.value || 'all';

  invoicesRows.forEach((row) => {
    const text = row.innerText.toLowerCase();
    const rowStatus = row.getAttribute('data-status') || '';

    const matchesQuery = !q || text.includes(q);
    const matchesStatus = status === 'all' || rowStatus === status;

    row.style.display = matchesQuery && matchesStatus ? '' : 'none';
  });
}

if (invoicesSearch) invoicesSearch.addEventListener('input', applyInvoiceFilters);
if (invoicesStatus) invoicesStatus.addEventListener('change', applyInvoiceFilters);

// ---- Analytics: update chip + legend text (UI-only)
const analyticsRange = document.querySelector('[data-analytics-range]');
const analyticsMetric = document.querySelector('[data-analytics-metric]');
const analyticsChip = document.querySelector('[data-analytics-chip]');
const analyticsLegend = document.querySelector('[data-analytics-legend]');

function syncAnalyticsUI() {
  if (analyticsChip && analyticsRange) {
    const map = { '7': 'Last 7 days', '30': 'Last 30 days', '90': 'Last 90 days' };
    analyticsChip.textContent = map[analyticsRange.value] || 'Last 30 days';
  }
  if (analyticsLegend && analyticsMetric) {
    const map = { revenue: 'Revenue', active: 'Active users', churn: 'Churn' };
    analyticsLegend.textContent = map[analyticsMetric.value] || 'Revenue';
  }
}

if (analyticsRange) analyticsRange.addEventListener('change', syncAnalyticsUI);
if (analyticsMetric) analyticsMetric.addEventListener('change', syncAnalyticsUI);
syncAnalyticsUI();

// ---- Sidebar active state (auto)
(function syncActiveNav() {
  const current = window.location.pathname.split("/").pop();
  const navItems = document.querySelectorAll(".nav-item");

  navItems.forEach(item => {
    const href = item.getAttribute("href")?.split("/").pop();
    if (href === current) {
      item.classList.add("is-active");
    } else {
      item.classList.remove("is-active");
    }
  });
})();
