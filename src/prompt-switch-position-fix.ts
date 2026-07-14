const PROMPT_SWITCH_ID = 'prompt-switch-root';
const SIGNAL_NAV_ID = 'luna-signal-top-nav';

function placePromptSwitchBelowNavigation() {
  const promptSwitch = document.getElementById(PROMPT_SWITCH_ID) as HTMLElement | null;
  const navigation = document.getElementById(SIGNAL_NAV_ID) as HTMLElement | null;
  if (!promptSwitch || !navigation || !navigation.parentElement) return false;

  promptSwitch.dataset.signalGroup = 'prompt';
  if (navigation.nextElementSibling !== promptSwitch) {
    navigation.insertAdjacentElement('afterend', promptSwitch);
  }
  return true;
}

function startPromptSwitchPositionFix() {
  placePromptSwitchBelowNavigation();

  let queued = false;
  const observer = new MutationObserver(() => {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(() => {
      queued = false;
      placePromptSwitchBelowNavigation();
    });
  });

  observer.observe(document.documentElement, { childList: true, subtree: true });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startPromptSwitchPositionFix, { once: true });
} else {
  startPromptSwitchPositionFix();
}
