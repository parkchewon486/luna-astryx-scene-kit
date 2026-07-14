const PROMPT_SWITCH_ROOT_ID = 'prompt-switch-root';
const PROMPT_SWITCH_NAV_ID = 'luna-signal-top-nav';
const PROMPT_SWITCH_ANCHOR_ID = 'prompt-switch-mount-anchor';

function findPromptMain(topNav: HTMLElement) {
  return topNav.closest<HTMLElement>('main')
    ?? document.querySelector<HTMLElement>('main.page')
    ?? document.querySelector<HTMLElement>('main');
}

function ensurePromptSwitchPlacement() {
  const topNav = document.getElementById(PROMPT_SWITCH_NAV_ID) as HTMLElement | null;
  if (!topNav || !topNav.parentElement) return false;

  const main = findPromptMain(topNav);
  if (main && !main.classList.contains('page')) main.classList.add('page');

  const root = document.getElementById(PROMPT_SWITCH_ROOT_ID) as HTMLElement | null;
  if (root) {
    root.dataset.signalGroup = 'prompt';
    if (topNav.nextElementSibling !== root) topNav.insertAdjacentElement('afterend', root);
    document.getElementById(PROMPT_SWITCH_ANCHOR_ID)?.remove();
    return true;
  }

  if (!main || !main.contains(topNav)) return false;

  let anchor = document.getElementById(PROMPT_SWITCH_ANCHOR_ID) as HTMLElement | null;
  if (!anchor) {
    anchor = document.createElement('div');
    anchor.id = PROMPT_SWITCH_ANCHOR_ID;
    anchor.className = 'heroGrid';
    anchor.hidden = true;
    anchor.setAttribute('aria-hidden', 'true');
    topNav.insertAdjacentElement('afterend', anchor);
  }

  return false;
}

function startPromptSwitchMountHotfix() {
  ensurePromptSwitchPlacement();

  let queued = false;
  const observer = new MutationObserver(() => {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(() => {
      queued = false;
      ensurePromptSwitchPlacement();
    });
  });

  observer.observe(document.documentElement, { childList: true, subtree: true });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startPromptSwitchMountHotfix, { once: true });
} else {
  startPromptSwitchMountHotfix();
}
