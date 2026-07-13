type VisitorPayload = {
  active: number | null;
  today: number | null;
  total: number | null;
  available?: boolean;
  reason?: string;
};

type VisitorState =
  | { kind: 'pending' }
  | { kind: 'error'; reason?: string }
  | { kind: 'live'; payload: VisitorPayload };

const BAR_ID = 'luna-signal-visitor-bar';
const STATUS_STYLE_ID = 'luna-visitor-status-style';
const VISITOR_SESSION_KEY = 'luna-radar-visitor-session';
const REFRESH_INTERVAL_MS = 5 * 60_000;

let currentState: VisitorState = { kind: 'pending' };
let trackerStarted = false;
let bridgeInstalled = false;
let nativeFetch: typeof window.fetch = window.fetch.bind(window);

function ensureStyle() {
  if (document.getElementById(STATUS_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STATUS_STYLE_ID;
  style.textContent = `
    #${BAR_ID}[hidden]{display:none!important}
    #${BAR_ID}[data-state="pending"],
    #${BAR_ID}[data-state="error"]{display:grid!important}
    #${BAR_ID}[data-state="error"] .signalStat i{background:#f0b45b;box-shadow:0 0 0 5px #f0b45b21}
    #${BAR_ID}[data-state="error"] [data-active],
    #${BAR_ID}[data-state="pending"] [data-active]{font-size:13px;color:#6f6882}
  `;
  document.head.appendChild(style);
}

function getSessionId() {
  let id = localStorage.getItem(VISITOR_SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(VISITOR_SESSION_KEY, id);
  }
  return id;
}

function formatCount(value: number) {
  return new Intl.NumberFormat('ko-KR').format(value);
}

function getBar() {
  return document.getElementById(BAR_ID);
}

function errorMessage(reason?: string) {
  if (reason === 'visitor_store_quota_exceeded') {
    return {
      title: 'Upstash 무료 사용량 초과',
      detail: '월 50만 commands 한도를 넘었어요',
    };
  }
  if (reason === 'visitor_store_write_permission_denied') {
    return {
      title: 'Redis 쓰기 권한 확인 필요',
      detail: 'Vercel에 일반 REST 토큰을 연결해 주세요',
    };
  }
  return {
    title: '방문자 집계 연결 확인 필요',
    detail: reason ? `상태 코드: ${reason}` : '잠시 뒤 다시 확인해 주세요',
  };
}

function renderState() {
  const bar = getBar();
  if (!bar) return;
  const active = bar.querySelector<HTMLElement>('[data-active]');
  const today = bar.querySelector<HTMLElement>('[data-today]');
  const total = bar.querySelector<HTMLElement>('[data-total]');

  if (currentState.kind === 'pending') {
    if (active) active.textContent = '방문자 집계 연결 중';
    if (today) today.textContent = '실시간 숫자를 확인하고 있어요';
    if (total) total.textContent = '';
    bar.dataset.state = 'pending';
    bar.hidden = false;
    return;
  }

  if (currentState.kind === 'error') {
    const message = errorMessage(currentState.reason);
    if (active) active.textContent = message.title;
    if (today) today.textContent = message.detail;
    if (total) total.textContent = currentState.reason ? `상태 코드: ${currentState.reason}` : '';
    bar.dataset.state = 'error';
    bar.hidden = false;
    return;
  }

  const { payload } = currentState;
  if (payload.active === null || payload.today === null || payload.total === null) return;
  if (active) active.textContent = `${formatCount(payload.active)}명`;
  if (today) today.textContent = `오늘 ${formatCount(payload.today)}회 · 누적 방문`;
  if (total) total.textContent = `${formatCount(payload.total)}회`;
  bar.dataset.state = 'live';
  bar.hidden = false;
}

function installVisitorGetBridge() {
  if (bridgeInstalled) return;
  bridgeInstalled = true;
  nativeFetch = window.fetch.bind(window);

  window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    const request = input instanceof Request ? input : null;
    const method = (init?.method ?? request?.method ?? 'GET').toUpperCase();
    const url = typeof input === 'string'
      ? input
      : input instanceof URL
        ? input.toString()
        : input.url;

    if (method === 'GET' && /\/api\/visitor-stats(?:\?|$)/.test(url)) {
      const payload = currentState.kind === 'live'
        ? currentState.payload
        : { active: 0, today: 0, total: 0, available: true };
      return Promise.resolve(new Response(JSON.stringify(payload), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      }));
    }
    return nativeFetch(input, init);
  }) as typeof window.fetch;
}

async function refreshVisitorStatus(event: 'visit' | 'heartbeat') {
  currentState = { kind: 'pending' };
  renderState();
  try {
    const response = await nativeFetch('/api/visitor-stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      cache: 'no-store',
      body: JSON.stringify({ sessionId: getSessionId(), event }),
    });
    const payload = await response.json() as VisitorPayload;
    if (!response.ok || !payload.available || payload.active === null || payload.today === null || payload.total === null) {
      currentState = { kind: 'error', reason: payload.reason };
      renderState();
      return false;
    }
    currentState = { kind: 'live', payload };
    renderState();
    return true;
  } catch {
    currentState = { kind: 'error', reason: 'visitor_api_unreachable' };
    renderState();
    return false;
  }
}

function mountVisitorStatus() {
  ensureStyle();
  installVisitorGetBridge();
  if (!getBar()) return false;
  if (trackerStarted) {
    renderState();
    return true;
  }

  trackerStarted = true;
  void refreshVisitorStatus('visit');
  window.setInterval(() => void refreshVisitorStatus('heartbeat'), REFRESH_INTERVAL_MS);
  window.setInterval(renderState, 1_000);
  return true;
}

if (!mountVisitorStatus()) {
  const observer = new MutationObserver(() => {
    if (!mountVisitorStatus()) return;
    observer.disconnect();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
}