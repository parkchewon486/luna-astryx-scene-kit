type RequestLike = { method?: string; body?: unknown };
type ResponseLike = {
  status(code: number): ResponseLike;
  setHeader(name: string, value: string): void;
  json(body: unknown): void;
};

type PipelineEntry = { result?: unknown; error?: string | null };

export const config = { runtime: 'nodejs', maxDuration: 10 };

const REDIS_TIMEOUT_MS = 6_000;

function send(response: ResponseLike, body: unknown, status = 200) {
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  response.status(status).json(body);
}

function dateKey(offsetDays = 0) {
  const date = new Date(Date.now() + offsetDays * 86_400_000);
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function redisConfig() {
  const url = (
    process.env.UPSTASH_REDIS_REST_URL ??
    process.env.KV_REST_API_URL ??
    process.env.REDIS_REST_URL ??
    ''
  ).trim().replace(/\/+$/, '');
  const token = (
    process.env.UPSTASH_REDIS_REST_TOKEN ??
    process.env.KV_REST_API_TOKEN ??
    process.env.REDIS_REST_TOKEN ??
    ''
  ).trim();
  if (!url || !token) throw new Error('visitor_store_unconfigured');
  return { url, token };
}

async function redisPipeline(commands: unknown[][]) {
  const { url, token } = redisConfig();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REDIS_TIMEOUT_MS);
  try {
    const endpoint = url.endsWith('/pipeline') ? url : `${url}/pipeline`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(commands),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`visitor_store_${response.status}`);
    const payload = await response.json() as PipelineEntry[];
    if (!Array.isArray(payload) || payload.length !== commands.length) {
      throw new Error('visitor_store_invalid_result');
    }
    if (payload.some((entry) => entry.error)) throw new Error('visitor_store_command_failed');
    return payload.map((entry) => entry.result);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('visitor_store_timeout');
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
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
    const now = Date.now();
    const today = dateKey();
    const yesterday = dateKey(-1);
    const body = request.body && typeof request.body === 'object'
      ? request.body as Record<string, unknown>
      : {};
    const sessionId = request.method === 'GET'
      ? ''
      : typeof body.sessionId === 'string' ? body.sessionId.slice(0, 80) : '';
    const event = body.event === 'visit' ? 'visit' : 'heartbeat';
    if (request.method !== 'GET' && !sessionId) {
      return send(response, { error: 'missing session' }, 400);
    }

    const activeKey = 'luna:visitors:active';
    const todayVisitorsKey = `luna:visitors:today:${today}`;
    const yesterdayVisitorsKey = `luna:visitors:today:${yesterday}`;
    const todayVisitsKey = `luna:visits:day:${today}`;
    const totalVisitsKey = 'luna:visits:total';
    const commands: unknown[][] = [
      ['ZREMRANGEBYSCORE', activeKey, 0, now - 90_000],
    ];

    if (sessionId) {
      commands.push(
        ['ZADD', activeKey, now, sessionId],
        ['SADD', todayVisitorsKey, sessionId],
        ['EXPIRE', todayVisitorsKey, 172800],
      );
      if (event === 'visit') {
        commands.push(['INCR', todayVisitsKey], ['INCR', totalVisitsKey]);
      }
    }

    commands.push(
      ['ZCARD', activeKey],
      ['GET', todayVisitsKey],
      ['GET', totalVisitsKey],
      ['SCARD', todayVisitorsKey],
      ['SCARD', yesterdayVisitorsKey],
    );

    const result = await redisPipeline(commands);
    const [activeRaw, todayStoredRaw, totalStoredRaw, legacyTodayRaw, legacyYesterdayRaw] = result.slice(-5);
    const active = Number(activeRaw ?? 0);
    const legacyToday = Number(legacyTodayRaw ?? 0);
    const legacyYesterday = Number(legacyYesterdayRaw ?? 0);
    const todayVisits = todayStoredRaw === null || todayStoredRaw === undefined
      ? legacyToday
      : Number(todayStoredRaw);
    const totalVisits = totalStoredRaw === null || totalStoredRaw === undefined
      ? legacyToday + legacyYesterday
      : Number(totalStoredRaw);

    if (![active, todayVisits, totalVisits, legacyYesterday].every(Number.isFinite)) {
      throw new Error('visitor_store_invalid_result');
    }

    return send(response, {
      active,
      today: todayVisits,
      total: totalVisits,
      yesterday: legacyYesterday,
      today_key: today,
      yesterday_key: yesterday,
      available: true,
    });
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
