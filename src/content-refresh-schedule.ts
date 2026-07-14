type ContestRecord = {
  deadline?: string;
  d_day?: number;
  status?: string;
  category?: unknown;
  auto_discovered?: boolean;
  [key: string]: unknown;
};

type ContestPayload = {
  contests?: ContestRecord[];
  [key: string]: unknown;
};

const GLOBAL_DATA_URL = '/data/global-signals.json';
const HUGGING_FACE_DAILY_PAPERS = 'https://huggingface.co/api/daily_papers';
const REFRESH_BUILD = 'scheduled-content-v2-20260713';
const previousFetch = window.fetch.bind(window);
const blockedHuggingFaceRequest = new Promise<Response>(() => {});

function requestUrl(input: RequestInfo | URL) {
  return typeof input === 'string'
    ? input
    : input instanceof URL
      ? input.toString()
      : input.url;
}

function kstDateKey(date: Date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function calendarDayNumber(key: string) {
  const [year, month, day] = key.split('-').map(Number);
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

function refreshContestPayload(payload: ContestPayload) {
  const now = new Date();
  const today = calendarDayNumber(kstDateKey(now));
  const contests = Array.isArray(payload.contests)
    ? payload.contests.map((contest) => {
        const deadline = typeof contest.deadline === 'string' ? new Date(contest.deadline) : null;
        const categories = Array.isArray(contest.category)
          ? contest.category.filter((item): item is string => typeof item === 'string')
          : [];
        const taggedCategories = contest.auto_discovered && !categories.includes('자동 발굴')
          ? [...categories, '자동 발굴']
          : categories;

        if (!deadline || Number.isNaN(deadline.getTime())) {
          return { ...contest, category: taggedCategories };
        }

        const deadlineDay = calendarDayNumber(kstDateKey(deadline));
        const expired = deadline.getTime() < now.getTime();
        return {
          ...contest,
          category: taggedCategories,
          d_day: Math.max(0, deadlineDay - today),
          status: expired ? 'closed' : contest.status === 'closed' ? 'closed' : 'open',
        };
      })
    : [];

  return {
    ...payload,
    contests,
    client_refreshed_at: now.toISOString(),
  };
}

window.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
  const rawUrl = requestUrl(input);
  const url = new URL(rawUrl, window.location.origin);

  if (url.href === HUGGING_FACE_DAILY_PAPERS) {
    return blockedHuggingFaceRequest;
  }

  if (url.pathname === '/api/higgsfield-news') {
    return previousFetch(GLOBAL_DATA_URL, {
      ...init,
      method: 'GET',
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
  }

  if (url.pathname === '/data/contests.json') {
    const response = await previousFetch(input, init);
    if (!response.ok) return response;

    try {
      const payload = await response.clone().json() as ContestPayload;
      const headers = new Headers(response.headers);
      headers.set('Content-Type', 'application/json; charset=utf-8');
      headers.set('X-Luna-Schedule-Build', REFRESH_BUILD);
      return new Response(JSON.stringify(refreshContestPayload(payload)), {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    } catch {
      return response;
    }
  }

  return previousFetch(input, init);
}) as typeof window.fetch;

function setText(node: HTMLElement | null, value: string) {
  if (node && node.textContent !== value) node.textContent = value;
}

function patchVisibleLabels() {
  document.querySelectorAll<HTMLElement>('.trendRadarStatusBar > div').forEach((item) => {
    const label = item.querySelector('span')?.textContent?.trim();
    const value = item.querySelector<HTMLElement>('strong');
    if (label === 'CACHE') setText(value, '3 HOURS');
  });

  document.querySelectorAll<HTMLElement>('.trendRadarRefresh, .contestRadarRefresh').forEach((button) => button.remove());

  const globalMeta = document.querySelector<HTMLElement>('#luna-signal-global-root [data-global-meta]');
  if (globalMeta && globalMeta.textContent && !/연결|실패|확인 중/.test(globalMeta.textContent)) {
    const next = globalMeta.textContent.replace(/^공식 홈 확인|^최근 공식 확인/, '6시간 예약 수집');
    setText(globalMeta, next);
  }
}

function mountScheduleLabels() {
  patchVisibleLabels();
  let queued = false;
  const observer = new MutationObserver(() => {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(() => {
      queued = false;
      patchVisibleLabels();
    });
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountScheduleLabels, { once: true });
} else {
  mountScheduleLabels();
}
