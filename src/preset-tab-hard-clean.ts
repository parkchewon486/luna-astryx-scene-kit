let presetHardCleanTimer: number | undefined;
let presetHardCleanInterval: number | undefined;

function getCurrentPresetTab() {
  return Array.from(document.querySelectorAll<HTMLElement>('.presetTab'))
    .find((tab) => tab.classList.contains('active'))
    ?.textContent
    ?.trim() ?? '';
}

function installPresetHardCleanStyles() {
  const old = document.getElementById('preset-tab-hard-clean-style');
  if (old) old.remove();

  const style = document.createElement('style');
  style.id = 'preset-tab-hard-clean-style';
  style.textContent = `
    .presetList:not([data-active-preset-tab="후지필름"]) [data-fuji-preset] {
      display: none !important;
      visibility: hidden !important;
      pointer-events: none !important;
    }

    .presetList[data-active-preset-tab="치비이미지"] .forceRealPreview[data-force-real-preview="치비"] {
      height: 178px !important;
      background:
        radial-gradient(circle at 50% 24%, rgba(255,255,255,0.96), transparent 90px),
        linear-gradient(135deg, #f8f1e8, #edf4ff) !important;
    }

    .presetList[data-active-preset-tab="치비이미지"] .forceRealPreview[data-force-real-preview="치비"] img {
      object-fit: contain !important;
      object-position: center center !important;
      padding: 8px !important;
      background: transparent !important;
    }

    @media (max-width: 640px) {
      .presetList[data-active-preset-tab="치비이미지"] .forceRealPreview[data-force-real-preview="치비"] {
        height: 168px !important;
      }
    }
  `;
  document.head.appendChild(style);
}

function removeFujiCardsOutsideFujiTab(list: HTMLElement, tab: string) {
  if (tab === '후지필름') return;

  list.querySelectorAll<HTMLElement>('[data-fuji-preset]').forEach((card) => {
    card.remove();
  });
}

function cleanChibiCards(list: HTMLElement, tab: string) {
  if (tab !== '치비이미지') return;

  Array.from(list.querySelectorAll<HTMLElement>('.presetButton')).forEach((card) => {
    const title = card.querySelector('strong')?.textContent?.trim() ?? '';
    if (title === '프사용 치비 레진돌' || title === '후지필름 감성') {
      card.remove();
    }
  });
}

function runPresetTabHardClean() {
  installPresetHardCleanStyles();

  const list = document.querySelector<HTMLElement>('.presetList');
  if (!list) return;

  const tab = getCurrentPresetTab();
  list.dataset.activePresetTab = tab;

  removeFujiCardsOutsideFujiTab(list, tab);
  cleanChibiCards(list, tab);
}

runPresetTabHardClean();

const presetHardCleanObserver = new MutationObserver(() => {
  window.clearTimeout(presetHardCleanTimer);
  presetHardCleanTimer = window.setTimeout(runPresetTabHardClean, 40);
});

presetHardCleanObserver.observe(document.documentElement, { childList: true, subtree: true, attributes: true });

window.clearInterval(presetHardCleanInterval);
presetHardCleanInterval = window.setInterval(runPresetTabHardClean, 250);
