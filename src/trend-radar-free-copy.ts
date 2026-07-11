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

function buildFullMaterial(item: RadarItem) {
  return `${item.x_hook}\n\n${item.summary}\n\n왜 반응했나\n${item.why_trending}\n\nX에서 풀어낼 각도\n${item.x_angle}\n\n반응 수치\n조회 ${formatCount(item.views)} · 댓글 ${formatCount(item.comments)} · 추천 ${formatCount(item.recommendations)}\n\n확인 메모\n${item.fact_check_note}\n\n원문 링크\n${item.url}`;
}

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

  decorateOriginalLinks(root, items);

  const observer = new MutationObserver(() => decorateOriginalLinks(root, items));
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
    event.stopImmediatePropagation();

    try {
      await navigator.clipboard.writeText(buildFullMaterial(item));
      const previous = button.textContent;
      button.textContent = '전체 글감 복사됨';
      window.setTimeout(() => {
        button.textContent = previous?.includes('X 글감') ? 'X 글감 만들기' : '전체 글감 복사';
      }, 1600);
    } catch {
      button.textContent = '복사 실패';
    }
  }, true);

  root.querySelectorAll<HTMLButtonElement>('.trendRadarListMeta button').forEach((button) => {
    button.textContent = '전체 글감 복사';
  });
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
