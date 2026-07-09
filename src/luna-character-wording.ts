let lunaCharacterWordingTimer: number | undefined;
let lunaCharacterWordingInterval: number | undefined;

function replaceLunaCharacterWording(text: string) {
  return text
    .replace('[여자친구버전] 같이 첨부한 사란짱 이미지도 같이 넣어주세요.', '[여자 캐릭터 시트] 같이 첨부한 루나 이미지도 같이 넣어주세요.')
    .replaceAll('사란짱', '루나')
    .replaceAll('[여자친구버전]', '[여자 캐릭터 시트]');
}

function isCharacterSheetTabActive() {
  return Boolean(document.querySelector<HTMLElement>('[data-character-sheet-tab="true"]')?.classList.contains('active'));
}

function fixVisibleCharacterPromptText() {
  if (!isCharacterSheetTabActive()) return;

  document.querySelectorAll<HTMLElement>('.promptCard p').forEach((body) => {
    const fixed = replaceLunaCharacterWording(body.textContent ?? '');
    if (body.textContent !== fixed) body.textContent = fixed;
  });
}

function collectVisiblePromptCards() {
  const cards = Array.from(document.querySelectorAll<HTMLElement>('.promptCard'));
  const parts = cards.map((card) => {
    const label = card.querySelector('span')?.textContent?.trim() ?? '';
    const body = card.querySelector('p')?.textContent?.trim() ?? '';
    if (!label || !body) return '';
    return `${label}\n\n${replaceLunaCharacterWording(body)}`;
  }).filter(Boolean);

  return parts.join('\n\n');
}

function installLunaCharacterCopyFix() {
  if (document.body.dataset.lunaCharacterCopyFix === 'true') return;
  document.body.dataset.lunaCharacterCopyFix = 'true';

  document.addEventListener('click', (event) => {
    const button = (event.target as HTMLElement | null)?.closest('button');
    if (!button || !isCharacterSheetTabActive()) return;

    const text = button.textContent ?? '';

    window.setTimeout(() => {
      fixVisibleCharacterPromptText();

      if (text.includes('전체 프롬프트 복사')) {
        const prompt = collectVisiblePromptCards();
        if (prompt) navigator.clipboard?.writeText(prompt).catch(() => undefined);
      }
    }, 80);
  }, true);
}

function runLunaCharacterWordingFix() {
  installLunaCharacterCopyFix();
  fixVisibleCharacterPromptText();
}

runLunaCharacterWordingFix();

const lunaCharacterWordingObserver = new MutationObserver(() => {
  window.clearTimeout(lunaCharacterWordingTimer);
  lunaCharacterWordingTimer = window.setTimeout(runLunaCharacterWordingFix, 60);
});

lunaCharacterWordingObserver.observe(document.documentElement, { childList: true, subtree: true, characterData: true });

window.clearInterval(lunaCharacterWordingInterval);
lunaCharacterWordingInterval = window.setInterval(runLunaCharacterWordingFix, 400);
window.setTimeout(() => window.clearInterval(lunaCharacterWordingInterval), 30000);
