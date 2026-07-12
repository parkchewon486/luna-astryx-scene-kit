type RequestLike = { method?: string; body?: unknown };
type ResponseLike = {
  status(code: number): ResponseLike;
  setHeader(name: string, value: string): void;
  json(body: unknown): void;
};

export const config = { runtime: 'nodejs', maxDuration: 10 };

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

async function redis(command: unknown[]) {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) throw new Error('visitor_store_unconfigured');

  const response = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
  });
  if (!response.ok) throw new Error(`visitor_store_${response.status}`);
  const payload = await response.json() as { result?: unknown };
  return payload.result;
}

export default async function handler(request: RequestLike, response: ResponseLike) {
  if (request.method && request.method !== 'POST' && request.method !== 'GET') {
    return send(response, { error: 'GET or POST only' }, 405);
  }

  try {
    const now = Date.now();
    const activeKey = 'luna:visitors:active';
    const totalVisitsKey = 'luna:visits:total';
    const today = dateKey();
    const yesterday = dateKey(-1);
    const todayVisitorsKey = `luna:visitors:today:${today}`;
    const yesterdayVisitorsKey = `luna:visitors:today:${yesterday}`;
    const todayVisitsKey = `luna:visits:day:${today}`;
    const cutoff = now - 90_000;

    const legacyToday = Number(await redis(['SCARD', todayVisitorsKey]) ?? 0);
    const legacyYesterday = Number(await redis(['SCARD', yesterdayVisitorsKey]) ?? 0);

    await redis(['SET', todayVisitsKey, legacyToday, 'NX']);
    await redis(['SET', totalVisitsKey, legacyYesterday + legacyToday, 'NX']);

    if (request.method !== 'GET') {
      const body = request.body && typeof request.body === 'object' ? request.body as Record<string, unknown> : {};
      const sessionId = typeof body.sessionId === 'string' ? body.sessionId.slice(0, 80) : '';
      const event = body.event === 'visit' ? 'visit' : 'heartbeat';
      if (!sessionId) return send(response, { error: 'missing session' }, 400);

      await redis(['ZADD', activeKey, now, sessionId]);
      await redis(['ZREMRANGEBYSCORE', activeKey, 0, cutoff]);
      await redis(['SADD', todayVisitorsKey, sessionId]);
      await redis(['EXPIRE', todayVisitorsKey, 172800]);

      if (event === 'visit') {
        await redis(['INCR', todayVisitsKey]);
        await redis(['INCR', totalVisitsKey]);
      }
    } else {
      await redis(['ZREMRANGEBYSCORE', activeKey, 0, cutoff]);
    }

    const active = Number(await redis(['ZCARD', activeKey]) ?? 0);
    const todayVisits = Number(await redis(['GET', todayVisitsKey]) ?? legacyToday);
    const totalVisits = Number(await redis(['GET', totalVisitsKey]) ?? legacyYesterday + legacyToday);

    return send(response, {
      active,
      today: todayVisits,
      total: totalVisits,
      yesterday: legacyYesterday,
      today_key: today,
      yesterday_key: yesterday,
      available: true,
    });
  } catch {
    return send(response, {
      active: null,
      today: null,
      total: null,
      yesterday: null,
      available: false,
    }, 200);
  }
}
