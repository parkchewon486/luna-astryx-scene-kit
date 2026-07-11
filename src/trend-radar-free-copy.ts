type RadarItem = {
  source_title: string;
  url: string;
  topic: string;
  summary: string;
  why_trending: string;
  x_angle: string;
  x_hook: string;
  fact_check_note: string;
  views: number | null;
  comments: number | null;
  recommendations: number | null;
};

type RadarPayload = { items?: RadarItem[] };

let radarEnhancementStarted = false;

function formatCount(value: number | null) {
  if (value === null) return '확인 불가';
  return new Intl.NumberFormat('ko-KR').format(value);
}

function normalized(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function usefulSummary(item: RadarItem) {
  const title = normalized(item.source_title);
  const summary = normalized(item.summary);
  const topic = normalized(item.topic);

  if (!summary || summary === title || summary === topic) return '';
  if (summary.includes(title) && summary.length < title.length + 24) return '';
  return summary;
}

function buildFullMaterial(item: RadarItem) {
  const summary = usefulSummary(item);
  const details = summary ? `\n\n내용 메모\n${summary}` : '';

  return `소재\n${item.source_title}${details}\n\n첫 문장 후보\n${item.x_hook}\n\n사람들이 반응한 이유\n${item.why_trending}\n\n글을 풀어갈 방식\n${item.x_angle}\n\n공개 반응 수치\n조회 ${formatCount(item.views)} · 댓글 ${formatCount(item.comments)} · 추천 ${formatCount(item.recommendations)}\n\n확인 메모\n${item.fact_check_note}\n\n원문 보기\n${item.url}`;
}

function findItem(article: Element, items: RadarItem[]) {
  const title = article.querySelector('h3')?.textContent?.trim();
  if (!title) return null;
  return items.find((item) => item.source_title.trim() === title) ?? null;
}

function findItemFromCopiedText(text: string, items: RadarItem[]) {
  const urlMatch = text.match(/https?:\/\/[^\s]+/);
  if (urlMatch) {
    const byUrl = items.find((item) => item.url === urlMatch[0]);
    if (byUrl) return byUrl;
  }

  return items.find((item) => text.includes(item.source_title)) ?? null;
}

function installClipboardGuard(items: RadarItem[]) {
  const clipboard = navigator.clipboard;
  if (!clipboard?.writeText) return;

  const originalWriteText = clipboard.writeText.bind(clipboard);
  const guardedWriteText = async (text: string) => {
    if (text.includes('아래 소재를 한국 X에 올릴 글로 재가공해줘.')) {
      const item = findItemFromCopiedText(text, items);
      if (item) return originalWriteText(buildFullMaterial(item));
    }
    return originalWriteText(text);
  };

  try {
    Object.defineProperty(clipboard, 'writeText', {
      configurable: true,
      value: guardedWriteText,
    });
  } catch {
    try {
      clipboard.writeText = guardedWriteText;
    } catch {
      // 브라우저가 Clipboard API 교체를 막으면 아래 클릭 가로채기를 사용합니다.
    }
  }
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
    if (!button.textContent?.includes('복사됨')) button.textContent = '글감 정리 복사';
  });
}

async function enhanceRadar(root: HTMLElement) {
  if (radarEnhancementStarted) return;
  radarEnhancementStarted = true;

  const eyebrow = root.querySelector<HTMLElement>('.trendRadarEyebrow span:last-child');
  if (eyebrow) eyebrow.textContent = '무료 공개 인기글 수집 · 최근 24시간';

  const intro = root.querySelector<HTMLElement>('.trendRadarHeader p');
  if (intro) intro.textContent = '공개 인기글 페이지에서 반응이 큰 소재를 모아 X 글감 형태로 정리해요.';

  const footerBadge = root.querySelector<HTMLElement>('.trendRadarFooter span');
  if (footerBadge) footerBadge.textContent = '무료 공개 페이지 수집 기반';

  const loadingTitle = root.querySelector<HTMLElement>('.trendRadarLoading strong');
  if (loadingTitle) loadingTitle.textContent = '공개 인기글 페이지를 살펴보고 있어요';

  const loadingText = root.querySelector<HTMLElement>('.trendRadarLoading p');
  if (loadingText) loadingText.textContent = '조회수와 반응량을 읽고, 중복과 위험 키워드를 규칙으로 걸러냅니다.';

  let items: RadarItem[] = [];
  try {
    const response = await fetch('/api/trends', { cache: 'no-store', headers: { Accept: 'application/json' } });
    const payload = await response.json() as RadarPayload;
    items = Array.isArray(payload.items) ? payload.items : [];
  } catch {
    radarEnhancementStarted = false;
    return;
  }

  installClipboardGuard(items);
  decorateOriginalLinks(root, items);
  updateButtonLabels(root);

  const observer = new MutationObserver(() => {
    decorateOriginalLinks(root, items);
    updateButtonLabels(root);
  });
  observer.observe(root, { childList: true, subtree: true });

  root.addEventListener('click', async (event) => {
    const button = (event.target as Element | null)?.closest<HTMLButtonElement>('button');
    if (!button) return;

    const label = button.textContent?.trim() ?? '';
    if (!label.includes('글감') && !label.includes('X 글감')) return;

    const article = button.closest('article');
    if (!article) return;

    const item = findItem(article, items);
    if (!item) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    try {
      await navigator.clipboard.writeText(buildFullMaterial(item));
      const featured = button.classList.contains('primary');
      button.textContent = '정리된 글감 복사됨';
      window.setTimeout(() => {
        button.textContent = featured ? 'X 글감 만들기' : '글감 정리 복사';
      }, 1600);
    } catch {
      button.textContent = '복사 실패';
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
