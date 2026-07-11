type RadarItem = {
  source_title: string;
  url: string;
};

type RadarPayload = { items?: RadarItem[] };
type DraftPayload = { draft?: string; error?: string };

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

function updateButtonLabels(root: HTMLElement) {
  root.querySelectorAll<HTMLButtonElement>('.trendRadarListMeta button').forEach((button) => {
    if (!button.dataset.busy && !button.textContent?.includes('복사됨')) button.textContent = '본문 읽고 X 초안';
  });
  root.querySelectorAll<HTMLButtonElement>('.trendRadarActions .primary').forEach((button) => {
    if (!button.dataset.busy && !button.textContent?.includes('복사됨')) button.textContent = '본문 읽고 X 초안';
  });
}

async function createDraft(item: RadarItem) {
  const response = await fetch('/api/x-draft-v2', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ url: item.url, title: item.source_title }),
  });
  const payload = await response.json() as DraftPayload;
  if (!response.ok || !payload.draft) {
    throw new Error(payload.error || 'X 초안을 만들지 못했어요.');
  }
  return payload.draft;
}

async function enhanceRadar(root: HTMLElement) {
  if (radarEnhancementStarted) return;
  radarEnhancementStarted = true;

  const eyebrow = root.querySelector<HTMLElement>('.trendRadarEyebrow span:last-child');
  if (eyebrow) eyebrow.textContent = '무료 공개 인기글 수집 · 최근 24시간';

  const intro = root.querySelector<HTMLElement>('.trendRadarHeader p');
  if (intro) intro.textContent = '원문 본문을 직접 확인한 뒤, 확인된 내용만으로 X 초안을 만들어요.';

  const footerBadge = root.querySelector<HTMLElement>('.trendRadarFooter span');
  if (footerBadge) footerBadge.textContent = '공개 원문 본문 확인 기반';

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
  updateButtonLabels(root);

  let scheduled = false;
  const observer = new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      decorateOriginalLinks(root, items);
      updateButtonLabels(root);
    });
  });
  observer.observe(root, { childList: true, subtree: true });

  root.addEventListener('click', async (event) => {
    const button = (event.target as Element | null)?.closest<HTMLButtonElement>('button');
    if (!button) return;

    const label = button.textContent?.trim() ?? '';
    if (!label.includes('본문 읽고 X 초안') && !label.includes('X 초안') && !label.includes('X 글감')) return;

    const article = button.closest('article');
    if (!article) return;

    const item = findItem(article, items);
    if (!item) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    const idleLabel = '본문 읽고 X 초안';
    button.dataset.busy = 'true';
    button.disabled = true;
    button.textContent = '본문 확인 중…';

    try {
      const draft = await createDraft(item);
      await navigator.clipboard.writeText(draft);
      button.textContent = '본문 기반 초안 복사됨';
      window.setTimeout(() => {
        delete button.dataset.busy;
        button.disabled = false;
        button.textContent = idleLabel;
      }, 1800);
    } catch (error) {
      console.error('X draft generation failed', error);
      button.title = error instanceof Error ? error.message : '본문 확인 실패';
      button.textContent = '본문 확인 실패';
      window.setTimeout(() => {
        delete button.dataset.busy;
        button.disabled = false;
        button.textContent = idleLabel;
      }, 2200);
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
