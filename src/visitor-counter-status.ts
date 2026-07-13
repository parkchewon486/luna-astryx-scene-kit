type VisitorPayload = {
  active: number | null;
  today: number | null;
  total: number | null;
  available?: boolean;
  reason?: string;
};

const BAR_ID = 'luna-signal-visitor-bar';
const STATUS_STYLE_ID = 'luna-visitor-status-style';
const VISITOR_SESSION_KEY = 'luna-radar-visitor-session';

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

function setPending() {
  const bar = getBar();
  if (!bar) return;
  const active = bar.querySelector<HTMLElement>('[data-active]');
  const today = bar.querySelector<HTMLElement>('[data-today]');
  const total = bar.querySelector<HTMLElement>('[data-total]');
  if (active) active.textContent = '방문자 집계 연결 중';
  if (today) today.textContent = '실시간 숫자를 확인하고 있어요';
  if (total) total.textContent = '';
  bar.dataset.state = 'pending';
  bar.hidden = false;
}

function setError(reason?: string) {
  const bar = getBar();
  if (!bar) return;
  const active = bar.querySelector<HTMLElement>('[data-active]');
  const today = bar.querySelector<HTMLElement>('[data-today]');
  const total = bar.querySelector<HTMLElement>('[data-total]');
  if (active) active.textContent = '방문자 집계 연결 확인 필요';
  if (today) today.textContent = reason ? `상태 코드: ${reason}` : '잠시 뒤 다시 확인해 주세요';
  if (total) total.textContent = '';
  bar.dataset.state = 'error';
  bar.hidden = false;
}

function setLive(payload: VisitorPayload) {
  const bar = getBar();
  if (!bar || payload.active === null || payload.today === null || payload.total === null) return;
  const active = bar.querySelector<HTMLElement>('[data-active]');
  const today = bar.querySelector<HTMLElement>('[data-today]');
  const total = bar.querySelector<HTMLElement>('[data-total]');
  if (active) active.textContent = `${formatCount(payload.active)}명`;
  if (today) today.textContent = `오늘 ${formatCount(payload.today)}회 · 누적 방문`;
  if (total) total.textContent = `${formatCount(payload.total)}회`;
  bar.dataset.state = 'live';
  bar.hidden = false;
}

async function refreshVisitorStatus(event: 'visit' | 'heartbeat' = 'heartbeat') {
  const bar = getBar();
  if (!bar) return false;
  setPending();
  try {
    const response = await fetch('/api/visitor-stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      cache: 'no-store',
      body: JSON.stringify({ sessionId: getSessionId(), event }),
    });
    const payload = await response.json() as VisitorPayload;
    if (!response.ok || !payload.available || payload.active === null || payload.today === null || payload.total === null) {
      setError(payload.reason);
      return false;
    }
    setLive(payload);
    return true;
  } catch {
    setError('visitor_api_unreachable');
    return false;
  }
}

function mountVisitorStatus() {
  ensureStyle();
  if (!getBar()) return false;
  void refreshVisitorStatus('heartbeat');
  window.setInterval(() => void refreshVisitorStatus('heartbeat'), 30_000);
  return true;
}

if (!mountVisitorStatus()) {
  const observer = new MutationObserver(() => {
    if (!mountVisitorStatus()) return;
    observer.disconnect();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
}
