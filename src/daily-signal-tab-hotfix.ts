const DAILY_ROOT_ID = 'daily-signal-root';
const DAILY_HOST_ID = 'daily-signal-host';
const DAILY_TAB = 'daily';
const TOP_NAV_ID = 'luna-signal-top-nav';
const MOBILE_NAV_ID = 'luna-mobile-nav';
const KNOWN_TABS = new Set(['hot', 'write', 'prompt', 'contest', 'tools', 'global']);

let dailyActive = location.hash === '#daily';
let repairQueued = false;

function dailyRoot() {
  return document.getElementById(DAILY_ROOT_ID) as HTMLElement | null;
}

function ensureHost() {
  const main = document.querySelector<HTMLElement>('main.page');
  if (!main) return null;

  let host = document.getElementById(DAILY_HOST_ID) as HTMLElement | null;
  if (!host) {
    host = document.createElement('div');
    host.id = DAILY_HOST_ID;
    host.setAttribute('aria-live', 'polite');
    main.insertAdjacentElement('afterend', host);
  }

  const root = dailyRoot();
  if (root && root.parentElement !== host) host.appendChild(root);
  if (root) root.dataset.signalGroup = DAILY_TAB;
  return root;
}

function dailyButtonMarkup(mobile: boolean) {
  return mobile
    ? '<span>☀</span><b>데일리</b>'
    : '<b>데일리 시그널</b><small>TODAY</small>';
}

function ensureDailyButton(nav: HTMLElement) {
  const duplicates = Array.from(nav.querySelectorAll<HTMLButtonElement>('[data-signal-tab="daily"]'));
  let button = duplicates.shift() ?? null;
  duplicates.forEach((duplicate) => duplicate.remove());

  if (!button) {
    button = document.createElement('button');
    button.type = 'button';
    button.dataset.signalTab = DAILY_TAB;
    button.setAttribute('aria-pressed', 'false');
  }

  button.classList.add('dailySignalTab');
  button.innerHTML = dailyButtonMarkup(nav.id === MOBILE_NAV_ID);

  const hotButton = nav.querySelector<HTMLElement>('[data-signal-tab="hot"]');
  if (hotButton && hotButton.nextElementSibling !== button) hotButton.after(button);
  else if (!button.isConnected) nav.prepend(button);
}

function ensureNavigation() {
  [TOP_NAV_ID, MOBILE_NAV_ID].forEach((id) => {
    const nav = document.getElementById(id);
    if (nav) ensureDailyButton(nav);
  });
}

function syncButtons(activeTab: string) {
  document.querySelectorAll<HTMLButtonElement>('[data-signal-tab]').forEach((button) => {
    const selected = button.dataset.signalTab === activeTab;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
}

function openDaily(scroll = false) {
  const root = ensureHost();
  if (!root) return false;

  dailyActive = true;
  ensureNavigation();
  document.body.dataset.signalActive = DAILY_TAB;
  if (location.hash !== '#daily') {
    history.replaceState(null, '', `${location.pathname}${location.search}#daily`);
  }

  document.querySelectorAll<HTMLElement>('[data-signal-group]').forEach((element) => {
    element.hidden = element !== root;
  });
  root.hidden = false;
  syncButtons(DAILY_TAB);

  if (scroll) {
    window.requestAnimationFrame(() => root.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }
  return true;
}

function closeDaily() {
  dailyActive = false;
  const root = ensureHost();
  if (root) root.hidden = true;
}

function repair() {
  ensureNavigation();
  const root = ensureHost();
  if (!root) return;

  if (dailyActive || location.hash === '#daily') {
    openDaily(false);
  } else {
    root.hidden = true;
  }
}

function scheduleRepair() {
  if (repairQueued) return;
  repairQueued = true;
  window.requestAnimationFrame(() => {
    repairQueued = false;
    repair();
  });
}

document.addEventListener('click', (event) => {
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-signal-tab]');
  const tab = button?.dataset.signalTab;
  if (!tab) return;

  if (tab === DAILY_TAB) {
    event.preventDefault();
    event.stopImmediatePropagation();
    openDaily(true);
    return;
  }

  if (KNOWN_TABS.has(tab)) closeDaily();
}, true);

window.addEventListener('hashchange', () => {
  dailyActive = location.hash === '#daily';
  if (dailyActive) openDaily(false);
  else closeDaily();
});

function startIntegration() {
  repair();
  const observer = new MutationObserver(scheduleRepair);
  observer.observe(document.body, { childList: true, subtree: true });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startIntegration, { once: true });
} else {
  startIntegration();
}
