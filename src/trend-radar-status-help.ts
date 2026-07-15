const STATUS_HELP_COPY: Record<string, string> = {
  'LAST SCAN': '마지막으로 데이터를 수집한 시간',
  SOURCES: '정상적으로 수집된 커뮤니티 수 (예: 3/10)',
  WINDOW: '인기글을 분석한 기간',
  CACHE: '데이터를 새로 불러오는 주기',
};

function closeStatusHelp(except?: HTMLButtonElement) {
  document.querySelectorAll<HTMLButtonElement>('.trendRadarStatusHelp.isOpen').forEach((button) => {
    if (button === except) return;
    button.classList.remove('isOpen');
    button.setAttribute('aria-expanded', 'false');
  });
}

function statusLabelText(label: HTMLElement) {
  return label.childNodes[0]?.textContent?.trim() ?? label.textContent?.trim() ?? '';
}

function syncCacheLabel(statusBar: HTMLElement) {
  statusBar.querySelectorAll<HTMLElement>(':scope > div').forEach((item) => {
    const label = item.querySelector<HTMLElement>(':scope > span');
    const value = item.querySelector<HTMLElement>(':scope > strong');
    if (label && value && statusLabelText(label) === 'CACHE' && value.textContent !== '3 HOURS') {
      value.textContent = '3 HOURS';
    }
  });
}

function mountTrendRadarStatusHelp() {
  const statusBar = document.querySelector<HTMLElement>('.trendRadarStatusBar');
  if (!statusBar) return false;

  syncCacheLabel(statusBar);

  statusBar.querySelectorAll<HTMLElement>(':scope > div > span').forEach((label) => {
    if (label.querySelector('.trendRadarStatusHelp')) return;

    const key = statusLabelText(label);
    const copy = STATUS_HELP_COPY[key];
    if (!copy) return;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'trendRadarStatusHelp';
    button.textContent = 'ⓘ';
    button.dataset.tooltip = copy;
    button.setAttribute('aria-label', `${key}: ${copy}`);
    button.setAttribute('aria-expanded', 'false');

    button.addEventListener('click', (event) => {
      event.stopPropagation();
      const willOpen = !button.classList.contains('isOpen');
      closeStatusHelp(button);
      button.classList.toggle('isOpen', willOpen);
      button.setAttribute('aria-expanded', String(willOpen));
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

const statusHelpObserver = new MutationObserver(() => {
  void mountTrendRadarStatusHelp();
});

statusHelpObserver.observe(document.documentElement, {
  childList: true,
  characterData: true,
  subtree: true,
});
void mountTrendRadarStatusHelp();

document.addEventListener('click', () => closeStatusHelp());
