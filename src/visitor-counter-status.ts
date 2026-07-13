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

function setText(node: HTMLElement | null, value: string) {
  if (node && node.textContent !== value) node.textContent = value;
}

function errorMessage(reason?: string) {
  if (reason === 'visitor_store_unconfigured') {
    return {
      title: 'Supabase 연결 준비 필요',
      detail: 'Vercel 환경 변수 2개를 연결해 주세요',
    };
  }
  if (reason === 'visitor_store_schema_missing') {
    return {
      title: 'Supabase 테이블 준비 필요',
      detail: 'SQL Editor에서 방문자 집계 SQL을 실행해 주세요',
    };
  }
  if (reason === 'visitor_store_auth_failed') {
    return {
      title: 'Supabase 비밀키 확인 필요',
      detail: '서버용 Secret key 값을 다시 확인해 주세요',
    };
  }
  return {
    title: '방문자 집계 연결 확인 필요',
    detail: reason ? `상태 코드: ${reason}` : '잠시 뒤 다시 확인해 주세요',
  };
}

function renderState() {
  ensureStyle();
  const bar = getBar();
  if (!bar) return;

  const active = bar.querySelector<HTMLElement>('[data-active]');
  const today = bar.querySelector<HTMLElement>('[data-today]');
  const total = bar.querySelector<HTMLElement>('[data-total]');

  if (currentState.kind === 'pending') {
    setText(active, '방문자 집계 연결 중');
    setText(today, 'Supabase에서 숫자를 확인하고 있어요');
    setText(total, '');
    bar.dataset.state = 'pending';
    bar.hidden = false;
    return;
  }

  if (currentState.kind === 'error') {
    const message = errorMessage(currentState.reason);
    setText(active, message.title);
    setText(today, message.detail);
    setText(total, currentState.reason ? `상태 코드: ${currentState.reason}` : '');
    bar.dataset.state = 'error';
    bar.hidden = false;
    return;
  }

  const { payload } = currentState;
  if (payload.active === null || payload.today === null || payload.total === null) return;
  setText(active, `${formatCount(payload.active)}명`);
  setText(today, `오늘 ${formatCount(payload.today)}회 · 누적 방문`);
  setText(total, `${formatCount(payload.total)}회`);
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
        : {
            active: null,
            today: null,
            total: null,
            available: false,
            reason: currentState.kind === 'error' ? currentState.reason : 'visitor_store_pending',
          };
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

    if (
      !response.ok ||
      !payload.available ||
      payload.active === null ||
      payload.today === null ||
      payload.total === null
    ) {
      currentState = { kind: 'error', reason: payload.reason ?? `visitor_api_http_${response.status}` };
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

function startVisitorTracker() {
  if (trackerStarted) return;
  trackerStarted = true;
  ensureStyle();
  installVisitorGetBridge();

  void refreshVisitorStatus('visit');
  window.setInterval(() => void refreshVisitorStatus('heartbeat'), REFRESH_INTERVAL_MS);
  window.setInterval(renderState, 500);
}

startVisitorTracker();