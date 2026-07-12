// @ts-nocheck

type TrendItem = {
  rank: number;
  community: string;
  source_title: string;
  url: string;
  published_at: string;
  views: number | null;
  comments: number | null;
  recommendations: number | null;
  category: string;
  summary: string;
  why_trending?: string;
  x_angle: string;
  x_hook: string;
  risk_level?: string;
};

function formatMetric(value: number | null) {
  if (value === null) return '';
  if (value >= 10000) return `${(value / 10000).toFixed(value >= 100000 ? 0 : 1)}만`;
  return new Intl.NumberFormat('ko-KR').format(value);
}

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function buildWritingPanel() {
  const panel = document.createElement('section');
  panel.className = 'xViralPreviewPanel';
  panel.hidden = true;
  panel.innerHTML = `
    <div class="xViralPreviewNotice">
      <span>WRITE NOW</span>
      <strong>오늘 뭐 쓰지?</strong>
      <p>지금 뜨는 소재를 바로 올릴 수 있는 훅과 글 각도로 바꿔드려요.</p>
    </div>
    <div class="xViralPreviewGrid" data-writing-grid>
      <div class="xViralPreviewNotice"><strong>불러오는 중</strong><p>오늘 쓸 만한 소재를 고르고 있어요.</p></div>
    </div>`;
  return panel;
}

function buildAngles(item: TrendItem) {
  const topic = item.source_title;
  return [
    `정보형: ${item.x_angle || topic}`,
    `공감형: 이 주제를 실제로 겪어본 사람들의 반응을 묻기`,
    `논쟁형: ${topic}에 대해 어디까지 동의하는지 질문하기`,
  ];
}

function buildQuestions(item: TrendItem) {
  const base = item.source_title.replace(/[?？!！.。]+$/g, '');
  return [
    `${base}, 여러분은 어떻게 생각하세요?`,
    `직접 겪어봤거나 비슷한 사례 본 적 있나요?`,
  ];
}

function getSignalLabel(item: TrendItem) {
  const views = item.views ?? 0;
  const comments = item.comments ?? 0;
  const reactions = item.recommendations ?? 0;
  if (comments >= 200) return '댓글형';
  if (views >= 50000) return '조회형';
  if (reactions >= 100) return '공유형';
  return '공감형';
}

async function loadWritingIdeas(panel: HTMLElement) {
  const grid = panel.querySelector('[data-writing-grid]');
  if (!grid) return;

  try {
    const response = await fetch(`/data/trends.json?t=${Date.now()}`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!response.ok) throw new Error('글감 데이터를 불러오지 못했어요.');
    const payload = await response.json();
    const items: TrendItem[] = Array.isArray(payload.items)
      ? payload.items.filter((item: TrendItem) => item && item.source_title && item.url).slice(0, 6)
      : [];

    if (!items.length) {
      grid.innerHTML = '<div class="xViralPreviewNotice"><strong>오늘 추천할 글감이 아직 없어요</strong><p>다음 스캔에서 새로운 소재를 다시 골라드려요.</p></div>';
      return;
    }

    grid.innerHTML = items.map((item, index) => {
      const angles = buildAngles(item);
      const questions = buildQuestions(item);
      const hook = item.x_hook || item.source_title;
      const draft = `${hook}\n\n${item.summary || item.source_title}\n\n${questions[0]}`;
      return `
        <article class="xViralPreviewCard">
          <div class="xViralPreviewTop"><b>#${index + 1}</b><span>${escapeHtml(getSignalLabel(item))}</span></div>
          <small>${escapeHtml(item.community)} · ${escapeHtml(item.category || '트렌드')}</small>
          <h3>${escapeHtml(item.source_title)}</h3>
          <p>${escapeHtml(item.summary || item.source_title)}</p>
          <div class="xViralMetrics">
            ${item.views !== null ? `<span>조회 ${formatMetric(item.views)}</span>` : ''}
            ${item.comments !== null ? `<span>댓글 ${formatMetric(item.comments)}</span>` : ''}
            ${item.recommendations !== null ? `<span>반응 ${formatMetric(item.recommendations)}</span>` : ''}
          </div>
          <div><em>3초 훅</em><blockquote>“${escapeHtml(hook)}”</blockquote></div>
          <div><em>글 각도</em><p>${angles.map((angle) => `• ${escapeHtml(angle)}`).join('<br>')}</p></div>
          <div><em>댓글 질문</em><p>${questions.map((question) => `• ${escapeHtml(question)}`).join('<br>')}</p></div>
          <div class="trendRadarActions">
            <a href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">원문 보기 ↗</a>
            <button type="button" data-copy-hook="${index}">훅 복사</button>
            <button type="button" data-copy-draft="${index}">초안 복사</button>
          </div>
        </article>`;
    }).join('');

    grid.querySelectorAll('[data-copy-hook]').forEach((button) => {
      button.addEventListener('click', async () => {
        const item = items[Number(button.getAttribute('data-copy-hook'))];
        if (!item) return;
        try {
          await navigator.clipboard.writeText(item.x_hook || item.source_title);
          button.textContent = '복사됨';
          window.setTimeout(() => { button.textContent = '훅 복사'; }, 1400);
        } catch {
          button.textContent = '복사 실패';
        }
      });
    });

    grid.querySelectorAll('[data-copy-draft]').forEach((button) => {
      button.addEventListener('click', async () => {
        const item = items[Number(button.getAttribute('data-copy-draft'))];
        if (!item) return;
        const questions = buildQuestions(item);
        const draft = `${item.x_hook || item.source_title}\n\n${item.summary || item.source_title}\n\n${questions[0]}`;
        try {
          await navigator.clipboard.writeText(draft);
          button.textContent = '초안 복사됨';
          window.setTimeout(() => { button.textContent = '초안 복사'; }, 1400);
        } catch {
          button.textContent = '복사 실패';
        }
      });
    });
  } catch (error) {
    grid.innerHTML = `<div class="xViralPreviewNotice"><strong>불러오기 실패</strong><p>${escapeHtml(error instanceof Error ? error.message : '잠시 뒤 다시 확인해 주세요.')}</p></div>`;
  }
}

function mountWritingIdeas() {
  const radar = document.querySelector('.trendRadar');
  if (!radar || radar.querySelector('.xViralTabs')) return false;

  const tabs = document.createElement('div');
  tabs.className = 'xViralTabs';
  tabs.innerHTML = '<button type="button" class="active" data-radar-mode="community">커뮤니티 HOT</button><button type="button" data-radar-mode="write">오늘 뭐 쓰지? <span>NEW</span></button>';

  const panel = buildWritingPanel();
  const statusBar = radar.querySelector('.trendRadarStatusBar');
  if (statusBar) statusBar.insertAdjacentElement('beforebegin', tabs);
  else radar.prepend(tabs);
  tabs.insertAdjacentElement('afterend', panel);

  const communitySelectors = ['.trendRadarStatusBar', '.trendRadarFilters', '.trendRadarLoading', '.trendRadarError', '.trendRadarEmpty', '.trendRadarGrid', '.trendRadarList', '.trendRadarFooter'];
  let loaded = false;

  function setMode(mode: 'community' | 'write') {
    tabs.querySelectorAll('button').forEach((button) => button.classList.toggle('active', button.getAttribute('data-radar-mode') === mode));
    communitySelectors.forEach((selector) => radar.querySelectorAll(selector).forEach((element) => { element.hidden = mode === 'write'; }));
    panel.hidden = mode !== 'write';
    if (mode === 'write' && !loaded) {
      loaded = true;
      void loadWritingIdeas(panel);
    }
  }

  tabs.addEventListener('click', (event) => {
    const source = event.target instanceof Element ? event.target : null;
    const button = source ? source.closest('[data-radar-mode]') : null;
    if (!button) return;
    setMode(button.getAttribute('data-radar-mode') === 'write' ? 'write' : 'community');
  });

  return true;
}

if (!mountWritingIdeas()) {
  const observer = new MutationObserver(() => {
    if (!mountWritingIdeas()) return;
    observer.disconnect();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
}
