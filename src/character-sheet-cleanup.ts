let characterCleanupTimer: number | undefined;
let characterCleanupInterval: number | undefined;

function isCharacterSheetActive() {
  const tab = document.querySelector<HTMLElement>('[data-character-sheet-tab="true"]');
  return Boolean(tab?.classList.contains('active'));
}

function cleanCharacterSheetList() {
  if (!isCharacterSheetActive()) return;

  const list = document.querySelector<HTMLElement>('.presetList');
  if (!list) return;

  list.querySelectorAll<HTMLElement>('.fujiPresetButton, [data-fuji-preset], .customRealPreset, .forceGothicCard').forEach((card) => {
    card.remove();
  });

  const cards = Array.from(list.querySelectorAll<HTMLElement>('.presetButton'));
  cards.forEach((card) => {
    if (!card.dataset.characterSheetCard) {
      card.remove();
    }
  });

  const characterCards = list.querySelectorAll('[data-character-sheet-card]');
  if (characterCards.length > 2) {
    const seen = new Set<string>();
    characterCards.forEach((card) => {
      const id = (card as HTMLElement).dataset.characterSheetCard ?? '';
      if (seen.has(id)) card.remove();
      seen.add(id);
    });
  }
}

function installCharacterSheetCleanup() {
  cleanCharacterSheetList();
}

installCharacterSheetCleanup();

const characterCleanupObserver = new MutationObserver(() => {
  window.clearTimeout(characterCleanupTimer);
  characterCleanupTimer = window.setTimeout(installCharacterSheetCleanup, 50);
});

characterCleanupObserver.observe(document.documentElement, { childList: true, subtree: true });

window.clearInterval(characterCleanupInterval);
characterCleanupInterval = window.setInterval(installCharacterSheetCleanup, 350);
window.setTimeout(() => window.clearInterval(characterCleanupInterval), 30000);
