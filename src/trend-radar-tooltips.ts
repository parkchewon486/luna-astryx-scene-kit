const TOOLTIP_COPY: Record<string, string> = {
  'LAST SCAN': '마지막으로 데이터를 수집한 시간',
  SOURCES: '정상적으로 수집된 커뮤니티 수',
  WINDOW: '인기글을 분석한 기간',
  CACHE: '데이터를 3시간마다 새로 불러오는 주기',
};

function closeAllTooltips(except?: HTMLButtonElement) {
  document.querySelectorAll<HTMLButtonElement>('.trendRadarTooltipButton.isOpen').forEach((button) => {
    if (button === except) return;
    button.classList.remove('isOpen');
    button.setAttribute('aria-expanded', 'false');
  });
}

function mountTrendRadarTooltips() {
  const statusBar = document.querySelector<HTMLElement>('.trendRadarStatusBar');
  if (!statusBar) return false;

  statusBar.querySelectorAll<HTMLElement>(':scope > div > span').forEach((label) => {
    const key = label.childNodes[0]?.textContent?.trim() ?? label.textContent?.trim() ?? '';
    const copy = TOOLTIP_COPY[key];
    if (!copy) return;

    if (key === 'CACHE') {
      const value = label.parentElement?.querySelector<HTMLElement>('strong');
      if (value) value.textContent = '3 HOURS';
    }

    if (label.querySelector('.trendRadarTooltipButton')) return;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'trendRadarTooltipButton';
    button.setAttribute('aria-label', `${key} 설명`);
    button.setAttribute('aria-expanded', 'false');
    button.dataset.tooltip = copy;
    button.textContent = '?';

    button.addEventListener('click', (event) => {
      event.stopPropagation();
      const nextOpen = !button.classList.contains('isOpen');
      closeAllTooltips(button);
      button.classList.toggle('isOpen', nextOpen);
      button.setAttribute('aria-expanded', String(nextOpen));
    });

    button.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      button.classList.remove('isOpen');
      button.setAttribute('aria-expanded', 'false');
      button.blur();
    });

    label.appendChild(button);
  });

  return true;
}

const tooltipObserver = new MutationObserver(() => {
  void mountTrendRadarTooltips();
});

tooltipObserver.observe(document.documentElement, { childList: true, subtree: true });
void mountTrendRadarTooltips();

document.addEventListener('click', () => closeAllTooltips());
