let initialFujiSelectionDone = false;

function prioritizeFujifilmPreset() {
  const tabs = document.querySelector<HTMLElement>('.presetTabs');
  if (!tabs) return false;

  const buttons = Array.from(tabs.querySelectorAll<HTMLButtonElement>('.presetTab'));
  const fujifilmTab = buttons.find((button) => button.textContent?.trim() === '후지필름');
  if (!fujifilmTab) return false;

  fujifilmTab.style.order = '-1';

  if (!initialFujiSelectionDone) {
    initialFujiSelectionDone = true;
    if (!fujifilmTab.classList.contains('active')) {
      fujifilmTab.click();
    }
  }

  return true;
}

if (!prioritizeFujifilmPreset()) {
  const observer = new MutationObserver(() => {
    if (!prioritizeFujifilmPreset()) return;
    observer.disconnect();
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
}
