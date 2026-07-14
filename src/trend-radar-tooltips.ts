const TOOLTIP_COPY: Record<string, string> = {
  'LAST SCAN': '마지막으로 데이터를 수집한 시간',
  SOURCES: '정상적으로 수집된 커뮤니티 수 (예: 3/10)',
  WINDOW: '인기글을 분석한 기간',
  CACHE: '데이터를 새로 불러오는 주기',
};

const MOBILE_TOOLTIP_QUERY = window.matchMedia('(max-width: 680px)');
let activeTooltipButton: HTMLButtonElement | null = null;

function ensureMobileTooltip() {
  let backdrop = document.querySelector<HTMLDivElement>('.trendRadarTooltipBackdrop');
  let sheet = document.querySelector<HTMLElement>('.trendRadarTooltipSheet');

  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.className = 'trendRadarTooltipBackdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.appendChild(backdrop);
  }

  if (!sheet) {
    sheet = document.createElement('section');
    sheet.className = 'trendRadarTooltipSheet';
    sheet.id = 'trend-radar-tooltip-sheet';
    sheet.setAttribute('role', 'dialog');
    sheet.setAttribute('aria-modal', 'true');
    sheet.setAttribute('aria-hidden', 'true');
    sheet.innerHTML = '<div><strong data-tooltip-title></strong><button type="button" aria-label="설명 닫기">×</button></div><p data-tooltip-copy></p>';
    document.body.appendChild(sheet);
  }

  return { backdrop, sheet };
}

function closeMobileTooltip(returnFocus = true) {
  const { backdrop, sheet } = ensureMobileTooltip();
  backdrop.classList.remove('isOpen');
  sheet.classList.remove('isOpen');
  sheet.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('trendRadarTooltipSheetOpen');

  if (activeTooltipButton) {
    activeTooltipButton.classList.remove('isOpen');
    activeTooltipButton.setAttribute('aria-expanded', 'false');
    if (returnFocus) activeTooltipButton.focus();
  }

  activeTooltipButton = null;
}

function closeDesktopTooltips(except?: HTMLButtonElement) {
  document.querySelectorAll<HTMLButtonElement>('.trendRadarTooltipButton.isOpen').forEach((button) => {
    if (button === except) return;
    button.classList.remove('isOpen');
    button.setAttribute('aria-expanded', 'false');
  });
}

function openMobileTooltip(button: HTMLButtonElement, key: string, copy: string) {
  const { backdrop, sheet } = ensureMobileTooltip();
  closeDesktopTooltips(button);
  activeTooltipButton = button;
  button.classList.add('isOpen');
  button.setAttribute('aria-expanded', 'true');
  sheet.querySelector<HTMLElement>('[data-tooltip-title]')!.textContent = key;
  sheet.querySelector<HTMLElement>('[data-tooltip-copy]')!.textContent = copy;
  backdrop.classList.add('isOpen');
  sheet.classList.add('isOpen');
  sheet.setAttribute('aria-hidden', 'false');
  document.body.classList.add('trendRadarTooltipSheetOpen');
  sheet.querySelector<HTMLButtonElement>('button')?.focus();
}

function mountTrendRadarTooltips() {
  const statusBar = document.querySelector<HTMLElement>('.trendRadarStatusBar');
  if (!statusBar) return false;

  statusBar.querySelectorAll<HTMLElement>(':scope > div > span').forEach((label) => {
    if (label.querySelector('.trendRadarTooltipButton')) return;

    const key = label.textContent?.trim() ?? '';
    const copy = TOOLTIP_COPY[key];
    if (!copy) return;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'trendRadarTooltipButton';
    button.setAttribute('aria-label', `${key} 설명`);
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', 'trend-radar-tooltip-sheet');
    button.dataset.tooltip = copy;
    button.textContent = 'ⓘ';

    button.addEventListener('click', (event) => {
      event.stopPropagation();

      if (MOBILE_TOOLTIP_QUERY.matches) {
        if (activeTooltipButton === button) closeMobileTooltip(false);
        else openMobileTooltip(button, key, copy);
        return;
      }

      const nextOpen = !button.classList.contains('isOpen');
      closeDesktopTooltips(button);
      button.classList.toggle('isOpen', nextOpen);
      button.setAttribute('aria-expanded', String(nextOpen));
    });

    label.appendChild(button);
  });

  const { backdrop, sheet } = ensureMobileTooltip();
  if (backdrop.dataset.bound !== '1') {
    backdrop.dataset.bound = '1';
    backdrop.addEventListener('click', () => closeMobileTooltip());
    sheet.addEventListener('click', (event) => event.stopPropagation());
    sheet.querySelector('button')?.addEventListener('click', () => closeMobileTooltip());
  }

  return true;
}

const tooltipObserver = new MutationObserver(() => void mountTrendRadarTooltips());
tooltipObserver.observe(document.documentElement, { childList: true, subtree: true });
void mountTrendRadarTooltips();

document.addEventListener('click', () => {
  closeDesktopTooltips();
  if (activeTooltipButton) closeMobileTooltip(false);
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  closeDesktopTooltips();
  if (activeTooltipButton) closeMobileTooltip();
});

MOBILE_TOOLTIP_QUERY.addEventListener('change', () => {
  closeDesktopTooltips();
  if (activeTooltipButton) closeMobileTooltip(false);
});
