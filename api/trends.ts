// @ts-nocheck
const fallbackPayload = require('../public/data/trends.json');

type RequestLike = { method?: string };
type ResponseLike = {
  status(code: number): ResponseLike;
  setHeader(name: string, value: string): void;
  json(body: unknown): void;
};

export const config = { runtime: 'nodejs', maxDuration: 15 };

const RAW_TRENDS_URL = 'https://raw.githubusercontent.com/parkchewon486/luna-astryx-scene-kit/main/public/data/trends.json';

function setNoStoreHeaders(response: ResponseLike) {
  response.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  response.setHeader('CDN-Cache-Control', 'no-store');
  response.setHeader('Vercel-CDN-Cache-Control', 'no-store');
}

function isValidPayload(payload: unknown) {
  if (!payload || typeof payload !== 'object') return false;
  const value = payload as { generated_at?: unknown; items?: unknown };
  return typeof value.generated_at === 'string' && Array.isArray(value.items) && value.items.length > 0;
}

async function fetchLatestPayload() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  const minuteKey = Math.floor(Date.now() / 60000);

  try {
    const latestResponse = await fetch(`${RAW_TRENDS_URL}?v=${minuteKey}`, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Luna-Signal-Trend-Reader/1.0',
      },
      cache: 'no-store',
      signal: controller.signal,
    });

    if (!latestResponse.ok) throw new Error(`GitHub raw HTTP ${latestResponse.status}`);
    const payload = await latestResponse.json();
    if (!isValidPayload(payload)) throw new Error('최신 핫이슈 데이터 형식이 올바르지 않습니다.');
    return { payload, source: 'github-main' };
  } finally {
    clearTimeout(timeout);
  }
}

export default async function handler(request: RequestLike, response: ResponseLike) {
  if (request.method && request.method !== 'GET') {
    setNoStoreHeaders(response);
    response.status(405).json({ error: 'GET 요청만 지원합니다.' });
    return;
  }

  setNoStoreHeaders(response);

  try {
    const latest = await fetchLatestPayload();
    response.status(200).json({
      ...latest.payload,
      served_at: new Date().toISOString(),
      data_source: latest.source,
      api_build: 'trends-live-github-v1',
    });
  } catch (error) {
    response.status(200).json({
      ...fallbackPayload,
      served_at: new Date().toISOString(),
      data_source: 'bundled-fallback',
      fallback_reason: error instanceof Error ? error.message : '최신 데이터 조회 실패',
      api_build: 'trends-live-github-v1',
    });
  }
}
