const originalFetch = window.fetch.bind(window);
const RADAR_BUILD = 'radar-v5-oidc-20260711';

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
      return '핫이슈 API에서 알 수 없는 오류를 받았어요.';
    }
  }

  return '핫이슈 API에서 알 수 없는 오류를 받았어요.';
}

window.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
  const rawUrl = typeof input === 'string'
    ? input
    : input instanceof URL
      ? input.toString()
      : input.url;

  const isTrendRequest = rawUrl === '/api/trends' || rawUrl.endsWith('/api/trends');
  if (!isTrendRequest) return originalFetch(input, init);

  const response = await originalFetch(`/api/radar-v5?build=${RADAR_BUILD}&ts=${Date.now()}`, {
    ...init,
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
      'X-Luna-Radar-Build': RADAR_BUILD,
      ...(init?.headers ?? {}),
    },
  });

  if (response.ok) return response;

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
