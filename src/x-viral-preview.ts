// @ts-nocheck

type XTrendItem = {
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
  x_angle: string;
  x_hook: string;
};

function formatMetric(value: number | null) {
  if (value === null) return '';
  if (value >= 10000) return `${(value / 10000).toFixed(value >= 100000 ? 0 : 1)}만`;
  return new Intl.NumberFormat('ko-KR').format(value);
}

function isXSource(item: XTrendItem) {
  return /(^|\s)(X|트위터|Twitter|Threads|스레드)(\s|$)/i.test(item.community);
}

function buildXPanel() {
  const panel = document.createElement('section');
  panel.className = 'xViralPreviewPanel';
  panel.hidden = true;
  panel.innerHTML = `
    <div class="xViralPreviewNotice">
      <span>LIVE X SIGNAL</span>
      <strong>X 바이럴 글</strong>
      <p>공개 URL과 반응 수치를 확인한 X·Threads 게시물만 표시합니다.</p>
    </div>
    <div class="xViralPreviewGrid" data-x-live-grid>
      <div class="xViralPreviewNotice"><strong>불러오는 중</strong><p>최신 X·Threads 데이터를 확인하고 있어요.</p></div>
    </div>`;
  return panel;
}

async function loadXItems(panel: HTMLElement) {
  const grid = panel.querySelector('[data-x-live-grid]');
  if (!grid) return;

  try {
    const response = await fetch(`/api/trends?t=${Date.now()}`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!response.ok) throw new Error('X 데이터를 불러오지 못했어요.');
    const payload = await response.json();
    const items = Array.isArray(payload.items) ? payload.items.filter(isXSource).slice(0, 10) : [];

    if (!items.length) {
      grid.innerHTML = '<div class="xViralPreviewNotice"><strong>확인된 X 글이 아직 없어요</strong><p>이번 스캔에서 공개 URL과 반응 수치를 함께 확인한 게시물이 없었습니다. 다음 스캔 때 다시 확인합니다.</p></div>';
      return;
    }

    grid.innerHTML = items.map((item: XTrendItem, index: number) => `
      <article class="xViralPreviewCard">
        <div class="xViralPreviewTop"><b>#${index + 1}</b><span>${item.category || 'X 바이럴'}</span></div>
        <small>${item.community}</small>
        <h3>${item.source_title}</h3>
        <p>${item.summary || item.source_title}</p>
        <div class="xViralMetrics">
          ${item.views !== null ? `<span>조회 ${formatMetric(item.views)}</span>` : ''}
          ${item.comments !== null ? `<span>댓글 ${formatMetric(item.comments)}</span>` : ''}
          ${item.recommendations !== null ? `<span>반응 ${formatMetric(item.recommendations)}</span>` : ''}
        </div>
        <div><em>X ANGLE</em><p>${item.x_angle}</p></div>
        <blockquote>“${item.x_hook}”</blockquote>
        <div class="trendRadarActions">
          <a href="${item.url}" target="_blank" rel="noreferrer">원문 보기 ↗</a>
          <button type="button" data-copy-hook="${index}">훅 복사</button>
        </div>
      </article>`).join('');

    grid.querySelectorAll('[data-copy-hook]').forEach((button) => {
      button.addEventListener('click', async () => {
        const item = items[Number(button.getAttribute('data-copy-hook'))];
        if (!item) return;
        try {
          await navigator.clipboard.writeText(item.x_hook);
          button.textContent = '복사됨';
          window.setTimeout(() => { button.textContent = '훅 복사'; }, 1400);
        } catch {
          button.textContent = '복사 실패';
        }
      });
    });
  } catch (error) {
    grid.innerHTML = `<div class="xViralPreviewNotice"><strong>불러오기 실패</strong><p>${error instanceof Error ? error.message : '잠시 뒤 다시 확인해 주세요.'}</p></div>`;
  }
}

function mountXPreview() {
  const radar = document.querySelector('.trendRadar');
  if (!radar || radar.querySelector('.xViralTabs')) return false;

  const tabs = document.createElement('div');
  tabs.className = 'xViralTabs';
  tabs.innerHTML = '<button type="button" class="active" data-radar-mode="community">커뮤니티 HOT</button><button type="button" data-radar-mode="x">X 바이럴 <span>LIVE</span></button>';

  const panel = buildXPanel();
  const statusBar = radar.querySelector('.trendRadarStatusBar');
  if (statusBar) statusBar.insertAdjacentElement('beforebegin', tabs);
  else radar.prepend(tabs);
  tabs.insertAdjacentElement('afterend', panel);

  const communitySelectors = ['.trendRadarStatusBar', '.trendRadarFilters', '.trendRadarLoading', '.trendRadarError', '.trendRadarEmpty', '.trendRadarGrid', '.trendRadarList', '.trendRadarFooter'];
  let loaded = false;

  function setMode(mode: 'community' | 'x') {
    tabs.querySelectorAll('button').forEach((button) => button.classList.toggle('active', button.getAttribute('data-radar-mode') === mode));
    communitySelectors.forEach((selector) => radar.querySelectorAll(selector).forEach((element) => { element.hidden = mode === 'x'; }));
    panel.hidden = mode !== 'x';
    if (mode === 'x' && !loaded) {
      loaded = true;
      void loadXItems(panel);
    }
  }

  tabs.addEventListener('click', (event) => {
    const source = event.target instanceof Element ? event.target : null;
    const button = source ? source.closest('[data-radar-mode]') : null;
    if (!button) return;
    setMode(button.getAttribute('data-radar-mode') === 'x' ? 'x' : 'community');
  });

  return true;
}

if (!mountXPreview()) {
  const observer = new MutationObserver(() => {
    if (!mountXPreview()) return;
    observer.disconnect();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
}
