type VisitorPayload = { active: number | null; today: number | null; available?: boolean };

const VISITOR_SESSION_KEY = 'luna-radar-visitor-session';
let visitorTrackerStarted = false;
let heartbeatTimer: number | null = null;

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

function ensureBadge(root: HTMLElement) {
  let badge = root.querySelector<HTMLElement>('.trendRadarVisitorBadge');
  if (badge) return badge;

  badge = document.createElement('div');
  badge.className = 'trendRadarVisitorBadge';
  badge.hidden = true;
  badge.innerHTML = `
    <span class="trendRadarVisitorLive"><i></i> LIVE</span>
    <span class="trendRadarVisitorText">
      <strong data-visitor-active>지금 확인 중</strong>
      <small data-visitor-today></small>
    </span>
  `;

  const header = root.querySelector('.trendRadarHeader');
  if (header) header.insertAdjacentElement('afterend', badge);
  else root.prepend(badge);
  return badge;
}

async function heartbeat(root: HTMLElement) {
  const badge = ensureBadge(root);
  try {
    const response = await fetch('/api/visitor-stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      cache: 'no-store',
      body: JSON.stringify({ sessionId: getSessionId() }),
    });
    const payload = await response.json() as VisitorPayload;
    if (!response.ok || !payload.available || payload.active === null || payload.today === null) {
      badge.hidden = true;
      return;
    }

    const activeNode = badge.querySelector<HTMLElement>('[data-visitor-active]');
    const todayNode = badge.querySelector<HTMLElement>('[data-visitor-today]');
    if (activeNode) {
      activeNode.textContent = payload.active <= 1
        ? '지금 누군가 보고 있어요'
        : `지금 ${formatCount(payload.active)}명이 보고 있어요`;
    }
    if (todayNode) todayNode.textContent = `오늘 ${formatCount(payload.today)}명 방문`;
    badge.hidden = false;
  } catch {
    badge.hidden = true;
  }
}

function startVisitorTracker() {
  if (visitorTrackerStarted) return true;
  const root = document.querySelector<HTMLElement>('.trendRadar');
  if (!root) return false;

  visitorTrackerStarted = true;
  void heartbeat(root);
  heartbeatTimer = window.setInterval(() => void heartbeat(root), 30_000);

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) void heartbeat(root);
  });
  window.addEventListener('pagehide', () => {
    if (heartbeatTimer !== null) window.clearInterval(heartbeatTimer);
  }, { once: true });
  return true;
}

if (!startVisitorTracker()) {
  const observer = new MutationObserver(() => {
    if (!startVisitorTracker()) return;
    observer.disconnect();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
}
