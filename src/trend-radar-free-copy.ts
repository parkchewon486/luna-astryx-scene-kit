type RadarItem = {
  source_title: string;
  url: string;
};

type RadarPayload = { items?: RadarItem[] };

let radarEnhancementStarted = false;

function findItem(article: Element, items: RadarItem[]) {
  const title = article.querySelector('h3')?.textContent?.trim();
  if (!title) return null;
  return items.find((item) => item.source_title.trim() === title) ?? null;
}

function decorateOriginalLinks(root: HTMLElement, items: RadarItem[]) {
  root.querySelectorAll<HTMLElement>('.trendRadarList > article').forEach((article) => {
    const item = findItem(article, items);
    const meta = article.querySelector<HTMLElement>('.trendRadarListMeta');
    if (!item || !meta || meta.querySelector('.trendRadarOriginalLink')) return;

    const link = document.createElement('a');
    link.className = 'trendRadarOriginalLink';
    link.href = item.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = '원문 보기 ↗';
    meta.insertBefore(link, meta.querySelector('button'));
  });
}

function simplifyActions(root: HTMLElement) {
  root.querySelectorAll<HTMLButtonElement>('.trendRadarActions .primary').forEach((button) => button.remove());

  root.querySelectorAll<HTMLButtonElement>('.trendRadarListMeta button').forEach((button) => {
    if (button.dataset.titleCopy === 'true') return;
    button.dataset.titleCopy = 'true';
    button.textContent = '제목 복사';
  });
}

async function enhanceRadar(root: HTMLElement) {
  if (radarEnhancementStarted) return;
  radarEnhancementStarted = true;

  const eyebrow = root.querySelector<HTMLElement>('.trendRadarEyebrow span:last-child');
  if (eyebrow) eyebrow.textContent = '무료 공개 인기글 수집 · 최근 24시간';

  const intro = root.querySelector<HTMLElement>('.trendRadarHeader p');
  if (intro) intro.textContent = '반응이 큰 공개 글을 빠르게 훑고, 원문으로 바로 이동할 수 있게 정리했어요.';

  const footerBadge = root.querySelector<HTMLElement>('.trendRadarFooter span');
  if (footerBadge) footerBadge.textContent = '무료 공개 페이지 수집 기반';

  let items: RadarItem[] = [];
  try {
    const response = await fetch('/api/trends', { cache: 'no-store', headers: { Accept: 'application/json' } });
    const payload = await response.json() as RadarPayload;
    items = Array.isArray(payload.items) ? payload.items : [];
  } catch {
    radarEnhancementStarted = false;
    return;
  }

  decorateOriginalLinks(root, items);
  simplifyActions(root);

  let scheduled = false;
  const observer = new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      decorateOriginalLinks(root, items);
      simplifyActions(root);
    });
  });
  observer.observe(root, { childList: true, subtree: true });

  root.addEventListener('click', async (event) => {
    const button = (event.target as Element | null)?.closest<HTMLButtonElement>('button[data-title-copy="true"]');
    if (!button) return;

    const article = button.closest('article');
    if (!article) return;

    const item = findItem(article, items);
    if (!item) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    try {
      await navigator.clipboard.writeText(item.source_title);
      button.textContent = '제목 복사됨';
      window.setTimeout(() => { button.textContent = '제목 복사'; }, 1400);
    } catch {
      button.textContent = '복사 실패';
      window.setTimeout(() => { button.textContent = '제목 복사'; }, 1600);
    }
  }, true);
}

function startRadarEnhancement() {
  const root = document.querySelector<HTMLElement>('.trendRadar');
  if (!root) return false;
  void enhanceRadar(root);
  return true;
}

if (!startRadarEnhancement()) {
  const observer = new MutationObserver(() => {
    if (!startRadarEnhancement()) return;
    observer.disconnect();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
}
