const SIGNAL_POLISH_STYLE_ID = 'luna-signal-menu-polish-style';
const SIGNAL_WRITE_PANEL_ID = 'luna-signal-write-root';
const HIGGSFIELD_API = '/api/higgsfield-news';
const HIGGSFIELD_TIMEOUT_MS = 8_000;

type HiggsfieldNewsItem = {
  title: string;
  description: string;
  category: string;
  url: string;
};

type HiggsfieldNewsPayload = {
  source?: string;
  fetched_at?: string;
  verified_at?: string;
  mode?: 'live' | 'fallback';
  items?: HiggsfieldNewsItem[];
  error?: string;
};

let higgsfieldLoading = false;
let higgsfieldReady = false;
let higgsfieldHtml = '';
let higgsfieldMode: 'live' | 'fallback' = 'live';
let higgsfieldFetchedAt = '';

function escapeSignalHtml(value: unknown) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatSignalTime(value?: string) {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime())
    ? new Intl.DateTimeFormat('ko-KR', {
        timeZone: 'Asia/Seoul',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date)
    : '확인 시각 없음';
}

function ensureSignalPolishStyle() {
  if (document.getElementById(SIGNAL_POLISH_STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = SIGNAL_POLISH_STYLE_ID;
  style.textContent = `
    #${SIGNAL_WRITE_PANEL_ID}{display:none!important}
    .signalTop [data-signal-tab="write"],
    .lunaMobileNav [data-signal-tab="write"]{display:none!important}
    @media(max-width:1024px){.lunaMobileNav{grid-template-columns:repeat(5,minmax(0,1fr))!important}}

    body .trendRadarActions button[data-copy-hook]{display:none!important}
    body .trendRadarActions button[data-copy-draft]{display:grid!important}

    .promptStudioBanner.signalUnifiedPrompt{
      display:block!important;margin:0 0 22px;padding:27px 32px 25px;
      border:1px solid rgba(111,99,217,.16);border-radius:28px;
      background:linear-gradient(135deg,rgba(255,255,255,.97),rgba(245,243,255,.92)),radial-gradient(circle at 90% 8%,rgba(107,214,238,.18),transparent 38%);
      box-shadow:0 20px 58px rgba(47,45,92,.09);overflow:hidden;
    }
    .promptStudioBanner.signalUnifiedPrompt::after{width:220px;height:220px;right:-86px;top:-126px}
    .signalUnifiedEyebrow{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:12px}
    .signalUnifiedBadge{display:inline-flex;align-items:center;min-height:28px;padding:0 12px;border-radius:999px;background:#151927;color:#fff;font:900 10px/1 'Manrope','Noto Sans KR',sans-serif;letter-spacing:.12em}
    .signalUnifiedNote{color:#766f88;font-size:11px;font-weight:850;letter-spacing:.04em}
    .signalUnifiedTitleRow{display:flex;align-items:flex-end;gap:11px;flex-wrap:wrap}
    .promptStudioBanner.signalUnifiedPrompt .signalUnifiedTitleRow h2{margin:0;color:#111522;font-family:'Noto Sans KR','Manrope',sans-serif;font-size:clamp(32px,4.2vw,50px);font-style:normal;font-weight:950;line-height:1;letter-spacing:-.07em}
    .signalUnifiedEnglish{padding-bottom:4px;color:#7c7691;font:900 13px/1 'Manrope',sans-serif;letter-spacing:.2em}
    .promptStudioBanner.signalUnifiedPrompt>p{margin:16px 0 0;color:#5f6377;font-size:14px;font-weight:700;line-height:1.7;letter-spacing:0}

    #luna-signal-tools-root .signalHead,
    #luna-signal-global-root .signalHead{display:block;position:relative;margin-bottom:22px;padding:3px 0 4px}
    #luna-signal-tools-root .signalHead>div,
    #luna-signal-global-root .signalHead>div{display:block}
    #luna-signal-tools-root .signalHead small,
    #luna-signal-global-root .signalHead small{display:inline-flex;align-items:center;min-height:28px;padding:0 12px;border-radius:999px;background:#151927;color:#fff;font-size:10px;font-weight:950;letter-spacing:.12em}
    #luna-signal-tools-root .signalHead h2,
    #luna-signal-global-root .signalHead h2{display:flex;align-items:flex-end;gap:11px;flex-wrap:wrap;margin:12px 0 0;color:#111522;font-size:clamp(32px,4.2vw,50px);font-weight:950;line-height:1;letter-spacing:-.07em}
    #luna-signal-tools-root .signalHead h2::after,
    #luna-signal-global-root .signalHead h2::after{padding-bottom:4px;color:#7c7691;font:900 13px/1 'Manrope',sans-serif;letter-spacing:.2em}
    #luna-signal-tools-root .signalHead h2::after{content:'TOOLBOX'}
    #luna-signal-global-root .signalHead h2::after{content:'SIGNAL'}
    #luna-signal-tools-root .signalHead p,
    #luna-signal-global-root .signalHead p{max-width:700px;margin:15px 0 0;color:#5f6377;font-size:14px;font-weight:700;line-height:1.7}
    #luna-signal-global-root .signalMeta{position:absolute;right:0;bottom:5px}
    #luna-signal-global-root .higgsfieldNewsCard .signalActions a{background:#151927;color:#fff;border-color:#151927}
    #luna-signal-global-root .higgsfieldSource{margin-top:12px;padding:11px 12px;border-radius:13px;background:#f7f5fb;color:#6e6780;font-size:12px;font-weight:750;line-height:1.55}

    .contestRadarHeader.signalUnifiedContest{align-items:flex-end}
    .contestRadarHeader.signalUnifiedContest .contestRadarEyebrow{margin-bottom:13px}
    .contestRadarHeader.signalUnifiedContest .contestRadarLive{display:inline-flex;align-items:center;min-height:28px;padding:0 12px;border-radius:999px;background:#151927;color:#fff;font-size:10px;font-weight:950;letter-spacing:.12em}
    .contestRadarHeader.signalUnifiedContest .contestRadarKicker{display:none}
    .contestRadarHeader.signalUnifiedContest .contestRadarTitleWrap{align-items:flex-end;gap:12px}
    .contestRadarHeader.signalUnifiedContest h2{font-family:'Noto Sans KR','Manrope',sans-serif;font-size:clamp(42px,6vw,68px);font-weight:950;line-height:.92;letter-spacing:-.075em}
    .contestRadarHeader.signalUnifiedContest .contestRadarWord::after{height:3px;bottom:-6px}
    .contestRadarHeader.signalUnifiedContest .contestRadarEnglish{padding-bottom:5px;color:#7c7691;font-size:16px;letter-spacing:.22em}
    .contestRadarHeader.signalUnifiedContest p{max-width:700px;margin-top:20px;color:#5f6377;font-weight:700;line-height:1.75}

    @media(max-width:720px){
      .promptStudioBanner.signalUnifiedPrompt{padding:22px 19px;border-radius:24px}
      .promptStudioBanner.signalUnifiedPrompt .signalUnifiedTitleRow h2,
      #luna-signal-tools-root .signalHead h2,
      #luna-signal-global-root .signalHead h2{font-size:36px}
      .contestRadarHeader.signalUnifiedContest h2{font-size:44px}
      .signalUnifiedEnglish,
      #luna-signal-tools-root .signalHead h2::after,
      #luna-signal-global-root .signalHead h2::after{font-size:11px}
      .contestRadarHeader.signalUnifiedContest .contestRadarEnglish{font-size:12px}
      #luna-signal-global-root .signalMeta{position:static;display:inline-block;margin-top:12px}
    }
  `;
  document.head.appendChild(style);
}

function decoratePromptStudioBanner() {
  const banner = document.querySelector<HTMLElement>('.promptStudioBanner');
  if (!banner || banner.dataset.signalUnified === '1') return;

  banner.dataset.signalUnified = '1';
  banner.classList.add('signalUnifiedPrompt');
  banner.innerHTML = `
    <div class="signalUnifiedEyebrow">
      <span class="signalUnifiedBadge">CREATE STUDIO</span>
      <span class="signalUnifiedNote">이미지 · 영상 프롬프트 제작</span>
    </div>
    <div class="signalUnifiedTitleRow">
      <h2>프롬프트 스튜디오</h2>
      <span class="signalUnifiedEnglish">STUDIO</span>
    </div>
    <p>무드, 렌즈, 조명, 움직임을 조합해 바로 복사할 수 있는 프롬프트를 만드세요.</p>
  `;
}

function setHiggsfieldHeader() {
  const root = document.getElementById('luna-signal-global-root');
  if (!root) return;
  const kicker = root.querySelector<HTMLElement>('.signalHead small');
  const description = root.querySelector<HTMLElement>('.signalHead p');
  if (kicker) kicker.textContent = 'HIGGSFIELD UPDATES';
  if (description) description.textContent = 'Higgsfield 공식 홈페이지의 새 모델·기능·콘테스트 소식을 한국어로 정리합니다.';
}

function renderHiggsfieldNews(items: HiggsfieldNewsItem[], fetchedAt?: string, mode: 'live' | 'fallback' = 'live') {
  const root = document.getElementById('luna-signal-global-root');
  const state = root?.querySelector<HTMLElement>('[data-global-state]');
  const meta = root?.querySelector<HTMLElement>('[data-global-meta]');
  if (!root || !state) return;

  const sourceNote = mode === 'live'
    ? 'Higgsfield 공식 홈페이지에서 현재 확인된 업데이트입니다.'
    : '최근 Higgsfield 공식 홈페이지에서 확인한 업데이트입니다.';

  higgsfieldHtml = items.map((item) => `
    <article class="signalCard higgsfieldNewsCard">
      <small>${escapeSignalHtml(item.category)} · HIGGSFIELD OFFICIAL</small>
      <h3>${escapeSignalHtml(item.title)}</h3>
      <p>${escapeSignalHtml(item.description)}</p>
      <div class="higgsfieldSource">${sourceNote}</div>
      <div class="signalActions"><a href="${escapeSignalHtml(item.url)}" target="_blank" rel="noreferrer">Higgsfield에서 보기 ↗</a></div>
    </article>
  `).join('');

  higgsfieldMode = mode;
  higgsfieldFetchedAt = fetchedAt ?? '';
  state.className = 'signalGrid';
  state.innerHTML = higgsfieldHtml;
  state.dataset.higgsfieldRendered = '1';
  if (meta) meta.textContent = `${mode === 'live' ? '공식 홈 확인' : '최근 공식 확인'} · ${formatSignalTime(fetchedAt)}`;
  higgsfieldReady = true;
}

function restoreHiggsfieldNews() {
  if (!higgsfieldReady || !higgsfieldHtml) return;
  const root = document.getElementById('luna-signal-global-root');
  const state = root?.querySelector<HTMLElement>('[data-global-state]');
  const meta = root?.querySelector<HTMLElement>('[data-global-meta]');
  if (!state || state.querySelector('.higgsfieldNewsCard')) return;
  state.className = 'signalGrid';
  state.innerHTML = higgsfieldHtml;
  state.dataset.higgsfieldRendered = '1';
  if (meta) meta.textContent = `${higgsfieldMode === 'live' ? '공식 홈 확인' : '최근 공식 확인'} · ${formatSignalTime(higgsfieldFetchedAt)}`;
}

async function loadHiggsfieldNews(force = false) {
  if ((higgsfieldReady && !force) || higgsfieldLoading) return;
  const root = document.getElementById('luna-signal-global-root');
  const state = root?.querySelector<HTMLElement>('[data-global-state]');
  const meta = root?.querySelector<HTMLElement>('[data-global-meta]');
  if (!root || !state) return;

  setHiggsfieldHeader();
  higgsfieldLoading = true;
  state.className = 'signalState';
  state.dataset.higgsfieldRendered = '0';
  state.innerHTML = '<div><strong>Higgsfield 최신 소식을 확인하고 있어요</strong><p>공식 홈페이지의 새 모델과 기능 소식을 한국어로 정리합니다.</p></div>';
  if (meta) meta.textContent = 'Higgsfield 연결 중';

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), HIGGSFIELD_TIMEOUT_MS);
  try {
    const response = await fetch(`${HIGGSFIELD_API}?ts=${Date.now()}`, {
      cache: 'no-store',
      signal: controller.signal,
    });
    const payload = await response.json() as HiggsfieldNewsPayload;
    const items = Array.isArray(payload.items)
      ? payload.items.filter((item) => item.title && item.description && item.url).slice(0, 6)
      : [];
    if (!response.ok || !items.length) throw new Error(payload.error || '표시할 Higgsfield 소식이 없어요.');
    renderHiggsfieldNews(items, payload.fetched_at, payload.mode === 'fallback' ? 'fallback' : 'live');
  } catch (error) {
    higgsfieldReady = false;
    const message = error instanceof DOMException && error.name === 'AbortError'
      ? '연결 시간이 길어져 중단했어요. 다시 시도해 주세요.'
      : error instanceof Error ? error.message : '잠시 뒤 다시 확인해 주세요.';
    state.className = 'signalState';
    state.dataset.higgsfieldRendered = '0';
    state.innerHTML = `<div><strong>Higgsfield 소식을 불러오지 못했어요</strong><p>${escapeSignalHtml(message)}</p><button type="button" data-higgsfield-retry>다시 시도</button></div>`;
    if (meta) meta.textContent = '연결 실패';
  } finally {
    window.clearTimeout(timeout);
    higgsfieldLoading = false;
  }
}

function bindHiggsfieldSignal() {
  const root = document.getElementById('luna-signal-global-root');
  if (!root) return;
  setHiggsfieldHeader();

  if (root.dataset.higgsfieldBound !== '1') {
    root.dataset.higgsfieldBound = '1';
    root.addEventListener('click', (event) => {
      if (!(event.target as HTMLElement).closest('[data-higgsfield-retry]')) return;
      higgsfieldReady = false;
      void loadHiggsfieldNews(true);
    });
  }

  restoreHiggsfieldNews();
  if (document.body.dataset.signalActive === 'global' || location.hash === '#global') {
    void loadHiggsfieldNews();
  }
}

function polishSignalNavigation() {
  ensureSignalPolishStyle();

  document.querySelectorAll<HTMLElement>('[data-signal-tab="write"]').forEach((button) => button.remove());
  const writePanel = document.getElementById(SIGNAL_WRITE_PANEL_ID);
  if (writePanel) writePanel.hidden = true;

  if (location.hash === '#write' || document.body.dataset.signalActive === 'write') {
    document.querySelector<HTMLButtonElement>('[data-signal-tab="hot"]')?.click();
  }

  decoratePromptStudioBanner();
  document.querySelector<HTMLElement>('.contestRadarHeader')?.classList.add('signalUnifiedContest');
  bindHiggsfieldSignal();
}

function applyLunaSignalBrand() {
  const hero = document.querySelector<HTMLElement>('.heroCopy');
  if (!hero) return false;

  const badge = hero.querySelector<HTMLElement>('.badge');
  if (badge) badge.textContent = 'CREATOR SIGNAL · ASTRYX Y2K THEME';

  const title = hero.querySelector<HTMLHeadingElement>('h1');
  if (title && !title.dataset.lunaSignalReady) {
    title.dataset.lunaSignalReady = 'true';
    title.classList.add('lunaSignalTitle');
    title.setAttribute('aria-label', 'Luna Signal');
    title.innerHTML = '<span class="lunaWord">Luna</span><span class="signalWord">Signal</span><span class="signalPulse" aria-hidden="true"></span>';
  }

  const lead = hero.querySelector<HTMLElement>('.lead');
  if (lead) {
    lead.innerHTML = '프롬프트 제작부터<br class="lunaSignalBreak" /> 핫이슈 탐색, 공모전 발견까지<br class="lunaSignalBreak" /> 콘텐츠 제작에 필요한 신호를 한곳에.';
  }

  const presetPanel = document.querySelector<HTMLElement>('.presetPanel');
  if (presetPanel && !document.querySelector('.promptStudioBanner')) {
    const banner = document.createElement('section');
    banner.className = 'promptStudioBanner';
    banner.setAttribute('aria-label', '프롬프트 스튜디오');
    presetPanel.parentElement?.insertBefore(banner, presetPanel);
  }

  document.title = 'Luna Signal';
  polishSignalNavigation();
  return true;
}

function mountLunaSignalBrand() {
  applyLunaSignalBrand();

  document.addEventListener('click', (event) => {
    const tab = (event.target as HTMLElement).closest<HTMLElement>('[data-signal-tab]')?.dataset.signalTab;
    if (tab !== 'global') return;
    window.setTimeout(() => void loadHiggsfieldNews(), 0);
  }, true);

  let queued = false;
  const observer = new MutationObserver(() => {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(() => {
      queued = false;
      applyLunaSignalBrand();
    });
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountLunaSignalBrand, { once: true });
} else {
  mountLunaSignalBrand();
}
