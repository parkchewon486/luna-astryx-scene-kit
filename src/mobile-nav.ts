type Tab = 'hot' | 'write' | 'prompt' | 'contest' | 'tools' | 'global';
type Trend = {
  rank?: number;
  community?: string;
  source_title?: string;
  url?: string;
  topic?: string;
  summary?: string;
  why_trending?: string;
  x_angle?: string;
  x_hook?: string;
};
type TrendData = { generated_at?: string; items?: Trend[] };
type Visitors = { active: number | null; today: number | null; total: number | null; available?: boolean };
type Paper = {
  id?: string;
  title?: string;
  summary?: string;
  publishedAt?: string;
  upvotes?: number;
  numComments?: number;
  githubRepo?: string;
  organization?: { fullname?: string; name?: string };
};
type Daily = Paper & { paper?: Paper };
type MemoryTranslation = { responseData?: { translatedText?: string } };

const TOP = 'luna-signal-top-nav';
const MOBILE = 'luna-mobile-nav';
const STYLE = 'luna-signal-shell-style';
const WRITE = 'luna-signal-write-root';
const TOOLS = 'luna-signal-tools-root';
const GLOBAL = 'luna-signal-global-root';
const VISITORS = 'luna-signal-visitor-bar';

const TABS: Array<[Tab, string, string]> = [
  ['hot', '핫이슈', '◉'],
  ['write', '오늘 뭐 쓰지?', '✎'],
  ['prompt', '프롬프트 스튜디오', '✦'],
  ['contest', '공모전', '◆'],
  ['tools', '크리에이터 툴', '⬡'],
  ['global', '글로벌 시그널', '↗'],
];

const TOOL_LINKS: Array<[string, string, string]> = [
  ['Seedance', '숏폼 영상', 'https://seed.bytedance.com/en/seedance'],
  ['Google Flow', 'Veo 장면 제작', 'https://labs.google/fx/tools/flow'],
  ['Runway', '생성형 영상 편집', 'https://runwayml.com'],
  ['Kling AI', '이미지 기반 영상', 'https://klingai.com'],
  ['Krea', '실시간 이미지 생성', 'https://krea.ai'],
  ['Ideogram', '타이포 이미지', 'https://ideogram.ai'],
  ['Hugging Face Spaces', 'AI 앱 탐색', 'https://huggingface.co/spaces'],
  ['Product Hunt', '새 서비스 발견', 'https://www.producthunt.com'],
  ['GitHub Trending', '급상승 오픈소스', 'https://github.com/trending'],
  ['Perplexity', '출처 기반 리서치', 'https://www.perplexity.ai'],
  ['Cursor', 'AI 코딩', 'https://cursor.com'],
  ['Vercel', '웹앱 배포', 'https://vercel.com'],
];

let active: Tab = isTab(location.hash.slice(1)) ? location.hash.slice(1) as Tab : 'hot';
let drafts: string[] = [];
let writeReady = false;
let globalReady = false;
let watcher: MutationObserver | null = null;
let busy = false;
let timer: number | null = null;
let restoredVisitBound = false;

const q = <T extends Element>(selector: string, root: ParentNode = document) => root.querySelector<T>(selector);
const qa = <T extends Element>(selector: string, root: ParentNode = document) => Array.from(root.querySelectorAll<T>(selector));

function isTab(value: string | null): value is Tab {
  return TABS.some(([key]) => key === value);
}

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatNumber(value: number | null | undefined) {
  return typeof value === 'number' ? new Intl.NumberFormat('ko-KR').format(value) : '확인 불가';
}

function formatDate(value?: string) {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime())
    ? new Intl.DateTimeFormat('ko-KR', {
        timeZone: 'Asia/Seoul',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date)
    : '시간 확인 불가';
}

function shorten(value?: string, max = 190) {
  const text = (value ?? '').replace(/\s+/g, ' ').trim();
  return text.length > max ? `${text.slice(0, max).trim()}…` : text;
}

function navButtons(mobile = false) {
  return TABS.map(([key, label, icon]) => (
    `<button type="button" data-signal-tab="${key}" aria-pressed="false">${mobile ? `<span>${icon}</span>` : ''}<b>${label}</b></button>`
  )).join('');
}

function styles() {
  if (q(`#${STYLE}`)) return;
  const style = document.createElement('style');
  style.id = STYLE;
  style.textContent = `
    .signalBrand{margin:0!important;line-height:.8!important}
    .signalBrand .luna{display:block;color:#7769e7;font:italic 700 clamp(38px,4vw,56px) Georgia,serif}
    .signalBrand .signal{display:inline-block;color:transparent;background:linear-gradient(110deg,#6f63ff,#8fd8ff,#d6b7ff,#fff7d9,#8ff0d0,#ffb7dd,#786cff);background-size:260% 100%;-webkit-background-clip:text;background-clip:text;font-size:clamp(60px,7vw,98px);font-weight:950;filter:drop-shadow(0 8px 18px rgba(112,92,200,.18));animation:aurora 8s ease-in-out infinite}
    @keyframes aurora{50%{background-position:100%}}
    .signalTop{position:sticky;top:10px;z-index:9000;display:flex;justify-content:center;gap:6px;width:min(1120px,calc(100% - 12px));margin:0 auto 25px;padding:8px;border:1px solid #e5e0f2;border-radius:20px;background:#fffffff0;box-shadow:0 14px 38px #2c235217;backdrop-filter:blur(18px);overflow-x:auto}
    .signalTop button{flex:none;min-height:45px;padding:0 17px;border:0;border-radius:13px;background:transparent;color:#736c82;font-weight:850;white-space:nowrap}
    .signalTop button.active{background:#211d35;color:#fff}
    .signalPanel{width:min(1120px,calc(100% - 32px));margin:0 auto 42px;padding:28px;border:1px solid #e3dff0;border-radius:28px;background:#fffffff2;box-shadow:0 22px 62px #2d265315}
    .signalHead{display:flex;justify-content:space-between;gap:16px;align-items:end;margin-bottom:19px}
    .signalHead small,.signalCard>small{color:#7259b4;font-weight:950;letter-spacing:.1em}
    .signalHead h2{margin:6px 0 0;font-size:clamp(28px,4vw,42px);letter-spacing:-.045em}
    .signalHead p,.signalCard p{margin:7px 0 0;color:#696374;line-height:1.65}
    .signalMeta{padding:8px 11px;border-radius:999px;background:#f0edf8;color:#675d7b;font-size:11px;font-weight:850;white-space:nowrap}
    .signalGrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
    .signalCard{display:flex;flex-direction:column;padding:19px;border:1px solid #e8e4f1;border-radius:20px;background:#fff}
    .signalCard h3{margin:9px 0 5px;font-size:18px;line-height:1.4}
    .signalBox{margin-top:11px;padding:11px;border-radius:13px;background:#f7f5fb}
    .signalBox b{display:block;margin-bottom:4px;color:#796f90;font-size:9px;letter-spacing:.1em}
    .signalBox p{white-space:pre-line;font-size:13px}
    .signalActions{display:flex;gap:8px;margin-top:auto;padding-top:14px}
    .signalActions a,.signalActions button{flex:1;display:grid;place-items:center;min-height:39px;border:1px solid #ddd6ea;border-radius:10px;background:#fff;color:#514768;text-decoration:none;font-size:12px;font-weight:900}
    .signalActions button{background:#211d35;color:#fff}
    .signalState{display:grid;place-items:center;min-height:180px;border:1px dashed #cfc7e2;border-radius:19px;text-align:center;color:#6f6882}
    .signalState strong{display:block;color:#28233d;font-size:18px}
    .signalState button{margin-top:9px;padding:9px 13px;border:0;border-radius:10px;background:#211d35;color:#fff;font-weight:900}
    .signalTools{display:grid;grid-template-columns:repeat(4,1fr);gap:11px}
    .signalTool{padding:16px;border:1px solid #e8e4f1;border-radius:17px;background:#fff;color:inherit;text-decoration:none}
    .signalTool small{color:#7259b4;font-weight:950}
    .signalTool strong{display:block;margin:7px 0}
    .signalTool p{margin:0;color:#756e80;font-size:12px}
    .signalVisitors{grid-column:2;display:grid;grid-template-columns:1fr 1px 1fr;gap:13px;align-items:center;margin-top:-19px;padding:12px 17px;border:1px solid #e3dff0;border-radius:17px;background:#fffffff0}
    .signalVisitors .line{height:27px;background:#ddd8ef}
    .signalStat{display:flex;justify-content:center;align-items:center;gap:8px}
    .signalStat i{width:7px;height:7px;border-radius:50%;background:#63d6ac;box-shadow:0 0 0 5px #63d6ac21}
    .signalStat small{display:block;color:#817b91;font-size:10px;font-weight:850}
    .signalStat strong{display:block;font-size:17px}
    .trendRadarHook,.trendRadarAngle,.trendRadarActions button,.trendRadarListMeta button,.trendRadarVisitorBadge{display:none!important}
    .lunaMobileNav button.active{background:linear-gradient(135deg,#e5deff,#dcf5ff)!important;color:#2d2450!important}
    body[data-signal-active="hot"] [data-signal-group]:not([data-signal-group="hot"]),
    body[data-signal-active="write"] [data-signal-group]:not([data-signal-group="write"]),
    body[data-signal-active="prompt"] [data-signal-group]:not([data-signal-group="prompt"]),
    body[data-signal-active="contest"] [data-signal-group]:not([data-signal-group="contest"]),
    body[data-signal-active="tools"] [data-signal-group]:not([data-signal-group="tools"]),
    body[data-signal-active="global"] [data-signal-group]:not([data-signal-group="global"]){display:none!important}
    @media(max-width:1024px){.signalTop{justify-content:flex-start;width:calc(100% - 20px)}.signalTop button{padding:0 13px;font-size:13px}.signalPanel{width:calc(100% - 16px);padding:21px 15px}.signalGrid{grid-template-columns:1fr}.signalTools{grid-template-columns:repeat(2,1fr)}.signalVisitors{grid-column:1;margin-top:-8px}.lunaMobileNav{grid-template-columns:repeat(6,1fr)!important}}
    @media(max-width:560px){.signalHead{display:block}.signalMeta{display:inline-block;margin-top:9px}.signalTools{grid-template-columns:1fr}.signalActions{flex-direction:column}.signalBrand .signal{font-size:56px}}
    @media(prefers-reduced-motion:reduce){.signalBrand .signal{animation:none}}
  `;
  document.head.appendChild(style);
}

function hero(main: HTMLElement) {
  const badge = q<HTMLElement>('.heroCopy .badge', main);
  if (badge) badge.textContent = 'CREATOR SIGNAL · ASTRYX Y2K THEME';

  const title = q<HTMLElement>('.heroCopy h1', main);
  if (title && !q('.signal', title)) {
    title.className = 'signalBrand';
    title.setAttribute('aria-label', 'Luna Signal');
    title.innerHTML = '<span class="luna">Luna</span><span class="signal">Signal</span>';
  }

  const lead = q<HTMLElement>('.heroCopy .lead', main);
  if (lead && lead.dataset.signalCopy !== '1') {
    lead.dataset.signalCopy = '1';
    lead.innerHTML = '프롬프트 제작부터 핫이슈 탐색, 공모전 발견까지.<br>콘텐츠 제작에 필요한 신호를 한곳에서 확인하세요.';
  }
}

function tabNav(heroGrid: HTMLElement) {
  let top = q<HTMLElement>(`#${TOP}`);
  if (!top) {
    top = document.createElement('nav');
    top.id = TOP;
    top.className = 'signalTop';
    top.innerHTML = navButtons();
    top.setAttribute('aria-label', 'Luna Signal 메뉴');
    heroGrid.after(top);
    top.addEventListener('click', clickTab);
  }

  let mobile = q<HTMLElement>(`#${MOBILE}`);
  if (!mobile) {
    mobile = document.createElement('nav');
    mobile.id = MOBILE;
    mobile.className = 'lunaMobileNav';
    document.body.appendChild(mobile);
    document.body.classList.add('hasLunaMobileNav');
  }
  if (mobile.dataset.signal !== '1') {
    mobile.dataset.signal = '1';
    mobile.innerHTML = navButtons(true);
    mobile.addEventListener('click', clickTab);
  }
  return top;
}

function head(kicker: string, title: string, description: string, meta: string) {
  return `<header class="signalHead"><div><small>${kicker}</small><h2>${title}</h2><p>${description}</p></div>${meta}</header>`;
}

function panel(id: string, group: Tab, html: string) {
  const element = document.createElement('section');
  element.id = id;
  element.className = 'signalPanel';
  element.dataset.signalGroup = group;
  element.innerHTML = html;
  return element;
}

function custom(top: HTMLElement) {
  let writePanel = q<HTMLElement>(`#${WRITE}`);
  if (!writePanel) {
    writePanel = panel(
      WRITE,
      'write',
      `${head('X CONTENT DESK', '오늘 뭐 쓰지?', '수집된 원문을 바탕으로 바로 쓸 수 있는 초안을 정리합니다.', '<span class="signalMeta" data-write-meta>연결 전</span>')}<div class="signalState" data-write-state><div><strong>글감을 기다리고 있어요</strong><p>탭을 열면 불러옵니다.</p></div></div>`,
    );
    top.after(writePanel);
    writePanel.addEventListener('click', writeClick);
  }

  let toolsPanel = q<HTMLElement>(`#${TOOLS}`);
  if (!toolsPanel) {
    toolsPanel = panel(
      TOOLS,
      'tools',
      `${head('CREATOR TOOLBOX', '크리에이터 툴', '공식 사이트로 바로 이동합니다.', '')}<div class="signalTools">${TOOL_LINKS.map(([name, note, url]) => `<a class="signalTool" href="${url}" target="_blank" rel="noreferrer"><small>OFFICIAL</small><strong>${name}</strong><p>${note}</p></a>`).join('')}</div>`,
    );
    writePanel.after(toolsPanel);
  }

  let globalPanel = q<HTMLElement>(`#${GLOBAL}`);
  if (!globalPanel) {
    globalPanel = panel(
      GLOBAL,
      'global',
      `${head('GLOBAL AI SIGNALS', '글로벌 시그널', 'Hugging Face 최신 AI 연구를 한국어로 정리합니다.', '<span class="signalMeta" data-global-meta>연결 전</span>')}<div class="signalState" data-global-state><div><strong>최신 자료를 기다리고 있어요</strong><p>탭을 열면 한국어로 불러옵니다.</p></div></div>`,
    );
    toolsPanel.after(globalPanel);
    globalPanel.addEventListener('click', globalClick);
  }
}

function visitor(heroGrid: HTMLElement) {
  if (q(`#${VISITORS}`)) return;
  const element = document.createElement('section');
  element.id = VISITORS;
  element.className = 'signalVisitors';
  element.hidden = true;
  element.innerHTML = '<div class="signalStat"><i></i><div><small>지금 접속 중</small><strong data-active></strong></div></div><div class="line"></div><div class="signalStat"><div><small data-today></small><strong data-total></strong></div></div>';
  heroGrid.appendChild(element);
}

function classify(main: HTMLElement) {
  const promptSelectors = [
    '.promptStudioBanner',
    '.presetPanel',
    '.presetPanelPriority',
    '.howGrid',
    '.benefitSection',
    '.mainGrid',
    '.bottomGrid.buildNotesBottom',
  ].join(',');

  qa<HTMLElement>(promptSelectors, main).forEach((element) => {
    element.dataset.signalGroup = 'prompt';
  });

  for (const node of Array.from(main.children)) {
    const element = node as HTMLElement;
    if (element.classList.contains('heroGrid') || element.id === TOP) {
      delete element.dataset.signalGroup;
      element.hidden = false;
      continue;
    }
    if ([WRITE, TOOLS, GLOBAL].includes(element.id)) continue;
    if (element.matches(promptSelectors)) {
      element.dataset.signalGroup = 'prompt';
      continue;
    }
    element.dataset.signalGroup = element.id === 'luna-trend-radar-root'
      ? 'hot'
      : element.id === 'contest-radar-root' || element.classList.contains('contestRadarRoot')
        ? 'contest'
        : 'prompt';
  }
}

function show(tab: Tab, scroll = true) {
  active = tab;
  document.body.dataset.signalActive = tab;
  history.replaceState(null, '', `${location.pathname}${location.search}#${tab}`);

  const main = q<HTMLElement>('main.page');
  if (main) classify(main);

  qa<HTMLElement>('[data-signal-group]').forEach((element) => {
    element.hidden = element.dataset.signalGroup !== tab;
  });

  qa<HTMLButtonElement>('[data-signal-tab]').forEach((button) => {
    const on = button.dataset.signalTab === tab;
    button.classList.toggle('active', on);
    button.setAttribute('aria-pressed', String(on));
  });

  const live = q<HTMLElement>('.trendRadarLive');
  if (live && live.dataset.signal !== '1') {
    live.dataset.signal = '1';
    live.innerHTML = '<i></i> LATEST SCAN';
  }

  if (tab === 'write') void loadWrite();
  if (tab === 'global') void loadGlobal();
  if (scroll) requestAnimationFrame(() => q(`#${TOP}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
}

function clickTab(event: Event) {
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-signal-tab]');
  const value = button?.dataset.signalTab ?? null;
  if (isTab(value)) show(value);
}

function commentQuestion(item: Trend) {
  return `${(item.topic || item.source_title || '이 주제').replace(/[.?!]+$/, '')}, 여러분 생각은 어때요?`;
}

function makeDraft(item: Trend) {
  return [item.x_hook || item.source_title, item.summary, item.why_trending, commentQuestion(item)].filter(Boolean).join('\n\n');
}

async function loadWrite(force = false) {
  if (writeReady && !force) return;
  const root = q<HTMLElement>(`#${WRITE}`);
  const state = q<HTMLElement>('[data-write-state]', root ?? document);
  const meta = q<HTMLElement>('[data-write-meta]', root ?? document);
  if (!root || !state) return;

  state.className = 'signalState';
  state.innerHTML = '<div><strong>글감을 정리하고 있어요</strong><p>원문과 수집 시각을 확인합니다.</p></div>';

  try {
    const response = await fetch(`/api/trends?ts=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) throw new Error('데이터를 불러오지 못했어요.');
    const data = await response.json() as TrendData;
    const items = Array.isArray(data.items) ? data.items.filter((item) => item.url && item.source_title).slice(0, 3) : [];
    if (!items.length) throw new Error('표시할 글감이 없어요.');

    drafts = items.map(makeDraft);
    const age = data.generated_at ? Math.round((Date.now() - new Date(data.generated_at).getTime()) / 60000) : null;
    if (meta) meta.textContent = `${age !== null && age > 180 ? '갱신 지연 · ' : ''}마지막 수집 ${formatDate(data.generated_at)}`;

    state.className = 'signalGrid';
    state.innerHTML = items.map((item, index) => `
      <article class="signalCard">
        <small>${escapeHtml(item.community || '공개 커뮤니티')} · #${escapeHtml(item.rank ?? index + 1)}</small>
        <h3>${escapeHtml(item.source_title)}</h3>
        <p>${escapeHtml(shorten(item.summary))}</p>
        <div class="signalBox"><b>글 각도</b><p>${escapeHtml(item.x_angle || item.topic || '원문 반응을 바탕으로 의견 묻기')}</p></div>
        <div class="signalBox"><b>댓글 질문</b><p>${escapeHtml(commentQuestion(item))}</p></div>
        <div class="signalBox"><b>초안</b><p>${escapeHtml(drafts[index])}</p></div>
        <div class="signalActions"><button data-copy="${index}">초안 복사</button><a href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">원문 링크 ↗</a></div>
      </article>
    `).join('');
    writeReady = true;
  } catch (error) {
    if (meta) meta.textContent = '연결 실패';
    state.className = 'signalState';
    state.innerHTML = `<div><strong>글감을 불러오지 못했어요</strong><p>${escapeHtml(error instanceof Error ? error.message : '다시 시도해 주세요.')}</p><button data-write-retry>다시 시도</button></div>`;
  }
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const area = document.createElement('textarea');
    area.value = text;
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    document.execCommand('copy');
    area.remove();
  }
}

function writeClick(event: Event) {
  const target = event.target as HTMLElement;
  if (target.closest('[data-write-retry]')) {
    writeReady = false;
    void loadWrite(true);
    return;
  }
  const button = target.closest<HTMLButtonElement>('[data-copy]');
  if (!button) return;
  const text = drafts[Number(button.dataset.copy)];
  if (!text) return;
  void copyText(text).then(() => {
    button.textContent = '복사됨';
    window.setTimeout(() => { button.textContent = '초안 복사'; }, 1400);
  });
}

function parseGoogleTranslation(payload: unknown) {
  if (!Array.isArray(payload) || !Array.isArray(payload[0])) return '';
  return payload[0]
    .map((part: unknown) => Array.isArray(part) && typeof part[0] === 'string' ? part[0] : '')
    .join('')
    .trim();
}

function hasKorean(text: string) {
  return /[가-힣]/.test(text);
}

async function translateText(source: string) {
  const text = shorten(source, 480);
  if (!text) return '';
  if (hasKorean(text)) return text;

  try {
    const googleUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ko&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(googleUrl, { cache: 'no-store' });
    if (response.ok) {
      const translated = parseGoogleTranslation(await response.json());
      if (translated && hasKorean(translated)) return translated;
    }
  } catch {
    // Use the second provider below.
  }

  try {
    const memoryUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en%7Cko`;
    const response = await fetch(memoryUrl, { cache: 'no-store' });
    if (response.ok) {
      const payload = await response.json() as MemoryTranslation;
      const translated = payload.responseData?.translatedText?.trim() ?? '';
      if (translated && hasKorean(translated)) return translated;
    }
  } catch {
    // The user sees a retry state instead of an English-only card.
  }

  throw new Error('한국어 번역을 완료하지 못했어요.');
}

async function translatePapers(papers: Paper[]) {
  const translated: Array<Paper & { koreanTitle: string; koreanSummary: string }> = [];
  for (const paper of papers) {
    const koreanTitle = await translateText(paper.title ?? '');
    const koreanSummary = await translateText(paper.summary ?? '');
    translated.push({ ...paper, koreanTitle, koreanSummary });
  }
  return translated;
}

async function loadGlobal(force = false) {
  if (globalReady && !force) return;
  const root = q<HTMLElement>(`#${GLOBAL}`);
  const state = q<HTMLElement>('[data-global-state]', root ?? document);
  const meta = q<HTMLElement>('[data-global-meta]', root ?? document);
  if (!root || !state) return;

  state.className = 'signalState';
  state.innerHTML = '<div><strong>최신 자료를 한국어로 옮기고 있어요</strong><p>Hugging Face 자료를 불러온 뒤 제목과 설명을 번역합니다.</p></div>';
  if (meta) meta.textContent = '한국어 번역 중';

  try {
    const response = await fetch('https://huggingface.co/api/daily_papers', { cache: 'no-store' });
    if (!response.ok) throw new Error('Hugging Face 응답을 받지 못했어요.');
    const data = await response.json() as Daily[];
    const papers = Array.isArray(data)
      ? data.map((item) => item.paper ?? item).filter((paper) => paper.id && paper.title).slice(0, 3)
      : [];
    if (!papers.length) throw new Error('표시할 자료가 없어요.');

    const translated = await translatePapers(papers);
    if (meta) meta.textContent = `한국어 번역 · ${formatDate(new Date().toISOString())}`;

    state.className = 'signalGrid';
    state.innerHTML = translated.map((paper) => `
      <article class="signalCard">
        <small>${escapeHtml(paper.organization?.fullname || paper.organization?.name || 'HUGGING FACE')} · 한국어 번역</small>
        <h3>${escapeHtml(paper.koreanTitle)}</h3>
        <p>${escapeHtml(shorten(paper.koreanSummary))}</p>
        <div class="signalBox"><b>등록 시각</b><p>${formatDate(paper.publishedAt)}</p></div>
        <div class="signalBox"><b>반응</b><p>추천 ${formatNumber(paper.upvotes)} · 댓글 ${formatNumber(paper.numComments)}</p></div>
        <div class="signalActions"><a href="https://huggingface.co/papers/${escapeHtml(paper.id)}" target="_blank" rel="noreferrer">논문 원문 ↗</a>${paper.githubRepo ? `<a href="${escapeHtml(paper.githubRepo)}" target="_blank" rel="noreferrer">GitHub ↗</a>` : ''}</div>
      </article>
    `).join('');
    globalReady = true;
  } catch (error) {
    if (meta) meta.textContent = '번역 연결 실패';
    state.className = 'signalState';
    state.innerHTML = `<div><strong>한국어 글로벌 시그널을 불러오지 못했어요</strong><p>${escapeHtml(error instanceof Error ? error.message : '다시 시도해 주세요.')}</p><button data-global-retry>다시 시도</button></div>`;
  }
}

function globalClick(event: Event) {
  if (!(event.target as HTMLElement).closest('[data-global-retry]')) return;
  globalReady = false;
  void loadGlobal(true);
}

function countRestoredVisit() {
  window.addEventListener('pageshow', (event) => {
    if (!event.persisted) return;
    const key = 'luna-radar-visitor-session';
    let id = localStorage.getItem(key);
    if (!id) {
      id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(key, id);
    }
    void fetch('/api/visitor-stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
      body: JSON.stringify({ sessionId: id, event: 'visit' }),
    }).catch(() => undefined);
  });
}

async function loadVisitors() {
  const bar = q<HTMLElement>(`#${VISITORS}`);
  if (!bar) return;
  try {
    const response = await fetch(`/api/visitor-stats?ts=${Date.now()}`, { cache: 'no-store' });
    const payload = await response.json() as Visitors;
    if (!response.ok || !payload.available || payload.active === null || payload.today === null || payload.total === null) {
      bar.hidden = true;
      return;
    }
    const activeNode = q<HTMLElement>('[data-active]', bar);
    const todayNode = q<HTMLElement>('[data-today]', bar);
    const totalNode = q<HTMLElement>('[data-total]', bar);
    if (activeNode) activeNode.textContent = `${formatNumber(payload.active)}명`;
    if (todayNode) todayNode.textContent = `오늘 ${formatNumber(payload.today)}회 · 누적 방문`;
    if (totalNode) totalNode.textContent = `${formatNumber(payload.total)}회`;
    bar.hidden = false;
  } catch {
    bar.hidden = true;
  }
}

function mount() {
  if (!restoredVisitBound) {
    restoredVisitBound = true;
    countRestoredVisit();
  }

  const main = q<HTMLElement>('main.page');
  const heroGrid = q<HTMLElement>('.heroGrid', main ?? document);
  if (!main || !heroGrid) return false;

  styles();
  hero(main);
  const top = tabNav(heroGrid);
  custom(top);
  visitor(heroGrid);
  classify(main);
  show(active, false);

  window.setTimeout(() => void loadVisitors(), 800);
  if (timer === null) timer = window.setInterval(() => void loadVisitors(), 30_000);

  if (!watcher) {
    watcher = new MutationObserver(() => {
      if (busy) return;
      busy = true;
      requestAnimationFrame(() => {
        busy = false;
        mount();
      });
    });
    watcher.observe(document.body, { childList: true, subtree: true });
  }
  return true;
}

if (!mount()) {
  const boot = new MutationObserver(() => {
    if (!mount()) return;
    boot.disconnect();
  });
  boot.observe(document.documentElement, { childList: true, subtree: true });
}
