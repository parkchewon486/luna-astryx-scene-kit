const DAILY_ROOT_ID = 'daily-signal-root';
const DAILY_TAB = 'daily';

function dailyRoot() {
  return document.getElementById(DAILY_ROOT_ID) as HTMLElement | null;
}

function setDailyVisible(visible: boolean) {
  const root = dailyRoot();
  if (!root) return;

  root.hidden = !visible;
  root.style.setProperty('display', visible ? 'block' : 'none', 'important');

  if (!visible) return;

  document.body.dataset.signalActive = DAILY_TAB;
  history.replaceState(null, '', `${location.pathname}${location.search}#daily`);

  document.querySelectorAll<HTMLElement>('[data-signal-group]').forEach((element) => {
    if (element === root) return;
    element.hidden = true;
    element.style.setProperty('display', 'none', 'important');
  });

  document.querySelectorAll<HTMLButtonElement>('[data-signal-tab]').forEach((button) => {
    const selected = button.dataset.signalTab === DAILY_TAB;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
}

function restoreOtherTabs() {
  const root = dailyRoot();
  if (root) {
    root.hidden = true;
    root.style.setProperty('display', 'none', 'important');
  }

  document.querySelectorAll<HTMLElement>('[data-signal-group]').forEach((element) => {
    if (element === root) return;
    element.style.removeProperty('display');
  });
}

document.addEventListener('click', (event) => {
  const button = (event.target as HTMLElement).closest<HTMLElement>('[data-signal-tab]');
  const tab = button?.dataset.signalTab;
  if (!tab) return;

  if (tab === DAILY_TAB) {
    event.preventDefault();
    event.stopImmediatePropagation();
    setDailyVisible(true);
    window.requestAnimationFrame(() => {
      setDailyVisible(true);
      dailyRoot()?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    return;
  }

  restoreOtherTabs();
}, true);

window.addEventListener('hashchange', () => {
  if (location.hash === '#daily') setDailyVisible(true);
  else restoreOtherTabs();
});

let queued = false;
const observer = new MutationObserver(() => {
  if (queued || location.hash !== '#daily') return;
  queued = true;
  window.requestAnimationFrame(() => {
    queued = false;
    setDailyVisible(true);
  });
});
observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden', 'style', 'data-signal-active'] });

if (location.hash === '#daily') {
  const timer = window.setInterval(() => {
    if (!dailyRoot()) return;
    window.clearInterval(timer);
    setDailyVisible(true);
  }, 100);
  window.setTimeout(() => window.clearInterval(timer), 5000);
}
