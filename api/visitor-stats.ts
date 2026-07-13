type RequestLike = { method?: string; body?: unknown };
type ResponseLike = {
  status(code: number): ResponseLike;
  setHeader(name: string, value: string): void;
  json(body: unknown): void;
};

type VisitorStats = {
  active?: unknown;
  today?: unknown;
  total?: unknown;
  today_key?: unknown;
  available?: unknown;
};

export const config = { runtime: 'nodejs', maxDuration: 10 };

const SUPABASE_TIMEOUT_MS = 6_000;

function send(response: ResponseLike, body: unknown, status = 200) {
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  response.status(status).json(body);
}

function supabaseConfig() {
  const url = (process.env.SUPABASE_URL ?? '').trim().replace(/\/+$/, '');
  const key = (
    process.env.SUPABASE_SECRET_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    ''
  ).trim();
  if (!url || !key) throw new Error('visitor_store_unconfigured');
  return { url, key };
}

function classifySupabaseError(status: number, message: string) {
  const normalized = message.toLowerCase();
  if (status === 401 || status === 403) return 'visitor_store_auth_failed';
  if (
    status === 404 ||
    normalized.includes('pgrst202') ||
    normalized.includes('could not find the function') ||
    normalized.includes('relation') && normalized.includes('does not exist')
  ) {
    return 'visitor_store_schema_missing';
  }
  if (status === 429) return 'visitor_store_rate_limited';
  return `visitor_store_http_${status}`;
}

async function callRpc(name: string, args: Record<string, unknown>) {
  const { url, key } = supabaseConfig();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SUPABASE_TIMEOUT_MS);
  const headers: Record<string, string> = {
    apikey: key,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (!key.startsWith('sb_secret_')) {
    headers.Authorization = `Bearer ${key}`;
  }

  try {
    const response = await fetch(`${url}/rest/v1/rpc/${name}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(args),
      signal: controller.signal,
    });
    const text = await response.text();
    if (!response.ok) {
      throw new Error(classifySupabaseError(response.status, text));
    }
    if (!text) throw new Error('visitor_store_invalid_result');
    return JSON.parse(text) as VisitorStats | VisitorStats[];
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('visitor_store_timeout');
    }
    if (error instanceof SyntaxError) throw new Error('visitor_store_invalid_result');
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

function normalizeStats(raw: VisitorStats | VisitorStats[]) {
  const stats = Array.isArray(raw) ? raw[0] : raw;
  const active = Number(stats?.active ?? 0);
  const today = Number(stats?.today ?? 0);
  const total = Number(stats?.total ?? 0);
  if (![active, today, total].every(Number.isFinite)) {
    throw new Error('visitor_store_invalid_result');
  }
  return {
    active,
    today,
    total,
    today_key: typeof stats?.today_key === 'string' ? stats.today_key : null,
    available: true,
  };
}

function safeReason(error: unknown) {
  if (!(error instanceof Error)) return 'visitor_store_error';
  if (/^visitor_store_[a-z0-9_]+$/.test(error.message)) return error.message;
  return 'visitor_store_error';
}

export default async function handler(request: RequestLike, response: ResponseLike) {
  if (request.method && request.method !== 'POST' && request.method !== 'GET') {
    return send(response, { error: 'GET or POST only' }, 405);
  }

  try {
    if (request.method === 'GET') {
      const result = normalizeStats(await callRpc('get_visitor_stats', {}));
      return send(response, { ...result, yesterday: null });
    }

    const body = request.body && typeof request.body === 'object'
      ? request.body as Record<string, unknown>
      : {};
    const sessionId = typeof body.sessionId === 'string' ? body.sessionId.slice(0, 80) : '';
    const event = body.event === 'visit' ? 'visit' : 'heartbeat';
    if (!sessionId) return send(response, { error: 'missing session' }, 400);

    const result = normalizeStats(await callRpc('record_visitor', {
      p_session_id: sessionId,
      p_event: event,
    }));
    return send(response, { ...result, yesterday: null });
  } catch (error) {
    return send(response, {
      active: null,
      today: null,
      total: null,
      yesterday: null,
      available: false,
      reason: safeReason(error),
    }, 200);
  }
}
