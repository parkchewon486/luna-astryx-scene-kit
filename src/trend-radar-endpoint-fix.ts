const originalFetch = window.fetch.bind(window);
const RADAR_BUILD = 'radar-curated-v1-20260711';

function readableError(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);

  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const nested = record.message ?? record.detail ?? record.error_description ?? record.code;
    if (nested !== undefined) return readableError(nested);
    try {
      return JSON.stringify(value);
    } catch {
      return '큐레이션 데이터를 불러오는 중 오류가 발생했어요.';
    }
  }

  return '큐레이션 데이터를 불러오는 중 오류가 발생했어요.';
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

async function normalizeTrendResponse(response: Response) {
  if (!response.ok) return response;

  try {
    const payload = await response.clone().json() as Record<string, unknown>;
    if (!Array.isArray(payload.items)) return response;

    const items = payload.items
      .filter((item) => !isNavigationItem(item))
      .map((item, index) => ({ ...(item as Record<string, unknown>), rank: index + 1 }));

    const headers = new Headers(response.headers);
    headers.set('Content-Type', 'application/json; charset=utf-8');
    headers.set('Cache-Control', 'no-store, max-age=0');
    headers.set('X-Luna-Radar-Build', RADAR_BUILD);

    return new Response(JSON.stringify({ ...payload, items, build: RADAR_BUILD }), {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  } catch {
    return response;
  }
}

window.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
  const rawUrl = typeof input === 'string'
    ? input
    : input instanceof URL
      ? input.toString()
      : input.url;

  const isTrendRequest = rawUrl === '/api/trends' || rawUrl.endsWith('/api/trends');
  if (!isTrendRequest) return originalFetch(input, init);

  const response = await originalFetch(`/api/curated-trends?build=${RADAR_BUILD}&ts=${Date.now()}`, {
    ...init,
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
      'X-Luna-Radar-Build': RADAR_BUILD,
      ...(init?.headers ?? {}),
    },
  });

  if (response.ok) return normalizeTrendResponse(response);

  let payload: Record<string, unknown> = {};
  try {
    const parsed = await response.clone().json();
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      payload = parsed as Record<string, unknown>;
    }
  } catch {
    try {
      payload = { error: await response.clone().text() };
    } catch {
      payload = {};
    }
  }

  const baseError = readableError(payload.error ?? payload.message ?? payload);
  const code = readableError(payload.code ?? `http_${response.status}`);
  const build = typeof payload.build === 'string' ? payload.build : RADAR_BUILD;
  const error = `${baseError} [${code} · ${build}]`;
  const normalizedPayload = { ...payload, error, code, build };
  const headers = new Headers(response.headers);
  headers.set('Content-Type', 'application/json; charset=utf-8');
  headers.set('Cache-Control', 'no-store, max-age=0');
  headers.set('X-Luna-Radar-Build', RADAR_BUILD);

  return new Response(JSON.stringify(normalizedPayload), {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}) as typeof window.fetch;
