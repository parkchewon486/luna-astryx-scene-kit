type RequestLike = { method?: string; body?: unknown };
type ResponseLike = {
  status(code: number): ResponseLike;
  setHeader(name: string, value: string): void;
  json(body: unknown): void;
};

type RedisStats = [unknown, unknown, unknown, unknown];

export const config = { runtime: 'nodejs', maxDuration: 10 };

const REDIS_TIMEOUT_MS = 6_000;
const VISITOR_SCRIPT = `
local activeKey = KEYS[1]
local todayVisitorsKey = KEYS[2]
local yesterdayVisitorsKey = KEYS[3]
local todayVisitsKey = KEYS[4]
local totalVisitsKey = KEYS[5]
local now = tonumber(ARGV[1])
local cutoff = tonumber(ARGV[2])
local sessionId = ARGV[3]
local event = ARGV[4]

local legacyToday = redis.call('SCARD', todayVisitorsKey)
local legacyYesterday = redis.call('SCARD', yesterdayVisitorsKey)
redis.call('SET', todayVisitsKey, legacyToday, 'NX')
redis.call('SET', totalVisitsKey, legacyYesterday + legacyToday, 'NX')
redis.call('ZREMRANGEBYSCORE', activeKey, 0, cutoff)

if sessionId ~= '' then
  redis.call('ZADD', activeKey, now, sessionId)
  redis.call('SADD', todayVisitorsKey, sessionId)
  redis.call('EXPIRE', todayVisitorsKey, 172800)
  if event == 'visit' then
    redis.call('INCR', todayVisitsKey)
    redis.call('INCR', totalVisitsKey)
  end
end

local active = redis.call('ZCARD', activeKey)
local todayVisits = tonumber(redis.call('GET', todayVisitsKey) or legacyToday)
local totalVisits = tonumber(redis.call('GET', totalVisitsKey) or (legacyYesterday + legacyToday))
return { active, todayVisits, totalVisits, legacyYesterday }
`;

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

async function redis(command: unknown[]) {
  const { url, token } = redisConfig();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REDIS_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(command),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`visitor_store_${response.status}`);
    const payload = await response.json() as { result?: unknown; error?: string };
    if (payload.error) throw new Error('visitor_store_command_failed');
    return payload.result;
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

    const result = await redis([
      'EVAL',
      VISITOR_SCRIPT,
      5,
      'luna:visitors:active',
      `luna:visitors:today:${today}`,
      `luna:visitors:today:${yesterday}`,
      `luna:visits:day:${today}`,
      'luna:visits:total',
      now,
      now - 90_000,
      sessionId,
      event,
    ]);
    if (!Array.isArray(result) || result.length < 4) {
      throw new Error('visitor_store_invalid_result');
    }
    const [activeRaw, todayRaw, totalRaw, yesterdayRaw] = result as RedisStats;
    const active = Number(activeRaw ?? 0);
    const todayVisits = Number(todayRaw ?? 0);
    const totalVisits = Number(totalRaw ?? 0);
    const yesterdayVisitors = Number(yesterdayRaw ?? 0);
    if (![active, todayVisits, totalVisits, yesterdayVisitors].every(Number.isFinite)) {
      throw new Error('visitor_store_invalid_result');
    }

    return send(response, {
      active,
      today: todayVisits,
      total: totalVisits,
      yesterday: yesterdayVisitors,
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
