const originalFetch = window.fetch.bind(window);
const RADAR_BUILD = 'radar-static-json-v2-20260712';

function isTrendRequest(input: RequestInfo | URL) {
  const rawUrl = typeof input === 'string'
    ? input
    : input instanceof URL
      ? input.toString()
      : input.url;

  try {
    const url = new URL(rawUrl, window.location.origin);
    return url.pathname === '/api/trends' || url.pathname === '/api/curated-trends';
  } catch {
    return rawUrl === '/api/trends' || rawUrl === '/api/curated-trends';
  }
}

function normalizeCategory(value: unknown) {
  const category = String(value ?? '').trim();
  if (category === 'AI_TECH' || /AI|테크|기술/i.test(category)) return 'AI_TECH';
  if (category === 'SOCIETY' || /사회|경제|사건/i.test(category)) return 'SOCIETY';
  if (category === 'LIFESTYLE' || /생활|유머|건강|여행|음식|뷰티/i.test(category)) return 'LIFESTYLE';
  return 'CONTENT';
}

function isNavigationItem(item: unknown) {
  if (!item || typeof item !== 'object') return true;
  const record = item as Record<string, unknown>;
  const title = typeof record.source_title === 'string' ? record.source_title.trim() : '';
  const rawUrl = typeof record.url === 'string' ? record.url : '';

  if (!title || !rawUrl) return true;
  if (/(랭킹|인기글|베스트|실시간\s*베스트|모두의공원|HOT)$/i.test(title)) return true;

  try {
    const url = new URL(rawUrl);
    if (url.hostname === 'pann.nate.com') {
      if (/^\/talk\/ranking(?:\/|$)/i.test(url.pathname)) return true;
      if (/^\/talk\/c\d+/i.test(url.pathname)) return true;
      if (!/^\/talk\/\d+$/i.test(url.pathname)) return true;
    }
  } catch {
    return true;
  }

  return false;
}

async function loadStaticTrends(init?: RequestInit) {
  const response = await originalFetch(`/data/trends.json?ts=${Date.now()}`, {
    ...init,
    method: 'GET',
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
      'Cache-Control': 'no-cache',
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) return response;

  try {
    const payload = await response.clone().json() as Record<string, unknown>;
    const rawItems = Array.isArray(payload.items) ? payload.items : [];
    const items = rawItems
      .filter((item) => !isNavigationItem(item))
      .map((item, index) => {
        const record = item as Record<string, unknown>;
        return {
          ...record,
          rank: index + 1,
          category: normalizeCategory(record.category),
        };
      });

    const headers = new Headers(response.headers);
    headers.set('Content-Type', 'application/json; charset=utf-8');
    headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    headers.set('X-Luna-Radar-Build', RADAR_BUILD);

    return new Response(JSON.stringify({
      ...payload,
      items,
      build: payload.build ?? RADAR_BUILD,
      client_build: RADAR_BUILD,
      served_at: new Date().toISOString(),
    }), {
      status: 200,
      headers,
    });
  } catch {
    return response;
  }
}

window.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
  if (!isTrendRequest(input)) return originalFetch(input, init);
  return loadStaticTrends(init);
}) as typeof window.fetch;
