const DAILY_ROOT_ID = 'daily-signal-root';
const DAILY_TAB = 'daily';
const TOP_NAV_ID = 'luna-signal-top-nav';
const MOBILE_NAV_ID = 'luna-mobile-nav';
const KNOWN_TABS = new Set(['hot', 'write', 'prompt', 'contest', 'tools', 'global']);

let dailyActive = location.hash === '#daily';
let scheduled = false;

function dailyRoot() {
  return document.getElementById(DAILY_ROOT_ID) as HTMLElement | null;
}

function dailyButtonMarkup(mobile: boolean) {
  return mobile ? '<span>☀</span><b>데일리</b>' : '<b>데일리 시그널</b><small>TODAY</small>';
}

function ensureDailyButton(nav: HTMLElement) {
  const duplicates = Array.from(nav.querySelectorAll<HTMLButtonElement>('[data-signal-tab="daily"]'));
  let button = duplicates.shift() ?? null;
  duplicates.forEach((item) => item.remove());

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

function ensureStructure() {
  const root = dailyRoot();
  if (root) root.dataset.signalGroup = DAILY_TAB;

  [TOP_NAV_ID, MOBILE_NAV_ID].forEach((id) => {
    const nav = document.getElementById(id);
    if (nav) ensureDailyButton(nav);
  });
}

function syncButtons(tab: string) {
  document.querySelectorAll<HTMLButtonElement>('[data-signal-tab]').forEach((button) => {
    const selected = button.dataset.signalTab === tab;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
}

function showDaily(scroll = false) {
  const root = dailyRoot();
  if (!root) return;

  dailyActive = true;
  ensureStructure();
  document.body.dataset.signalActive = DAILY_TAB;
  history.replaceState(null, '', `${location.pathname}${location.search}#daily`);

  document.querySelectorAll<HTMLElement>('[data-signal-group]').forEach((element) => {
    element.hidden = element !== root;
  });
  root.hidden = false;
  syncButtons(DAILY_TAB);

  if (scroll) window.requestAnimationFrame(() => root.scrollIntoView({ behavior: 'smooth', block: 'start' }));
}

function leaveDaily() {
  dailyActive = false;
  const root = dailyRoot();
  if (root) {
    root.dataset.signalGroup = DAILY_TAB;
    root.hidden = true;
  }
}

function scheduleRepair() {
  if (scheduled) return;
  scheduled = true;
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      scheduled = false;
      ensureStructure();
      if (dailyActive || location.hash === '#daily') showDaily(false);
      else leaveDaily();
    });
  });
}

document.addEventListener('click', (event) => {
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-signal-tab]');
  const tab = button?.dataset.signalTab;
  if (!tab) return;

  if (tab === DAILY_TAB) {
    event.preventDefault();
    event.stopImmediatePropagation();
    showDaily(true);
    return;
  }

  if (KNOWN_TABS.has(tab)) leaveDaily();
}, true);

window.addEventListener('hashchange', () => {
  if (location.hash === '#daily') showDaily(false);
  else leaveDaily();
});

function startIntegration() {
  ensureStructure();
  if (dailyActive) showDaily(false);
  else leaveDaily();

  const observer = new MutationObserver(scheduleRepair);
  observer.observe(document.body, { childList: true, subtree: true });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startIntegration, { once: true });
else startIntegration();
