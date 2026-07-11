type TrendCategory = 'AI_TECH' | 'SOCIETY' | 'LIFESTYLE' | 'CONTENT';
type FactCheckStatus = 'verified' | 'partial' | 'unverified';
type RiskLevel = 'low' | 'medium' | 'high';

type TrendItem = {
  rank: number;
  community: string;
  source_title: string;
  url: string;
  published_at: string;
  views: number | null;
  comments: number | null;
  recommendations: number | null;
  metrics_visible: boolean;
  category: TrendCategory;
  topic: string;
  summary: string;
  why_trending: string;
  x_angle: string;
  x_hook: string;
  fact_check_status: FactCheckStatus;
  fact_check_note: string;
  risk_level: RiskLevel;
  risk_factors: string[];
  related_sources: string[];
  trend_score: number;
};

type TrendPayload = {
  generated_at: string;
  range_start: string;
  range_end: string;
  checked_sources: number;
  successful_sources: number;
  items: TrendItem[];
  cached?: boolean;
  model_used?: string;
  auth_used?: string;
  build?: string;
};

type RequestLike = { method?: string };
type ResponseLike = {
  status(code: number): ResponseLike;
  setHeader(name: string, value: string): void;
  json(body: unknown): void;
};

type CallTarget = {
  name: string;
  endpoint: string;
  token: string;
  model: string;
};

export const config = {
  runtime: 'nodejs',
  maxDuration: 60,
};

const BUILD_ID = 'radar-v5-oidc-20260711';
const CACHE_TTL_MS = 30 * 60 * 1000;
const SOURCE_COUNT = 13;
let cache: { expiresAt: number; payload: TrendPayload } | null = null;

function sendJson(response: ResponseLike, body: unknown, status = 200, cacheable = false) {
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('X-Luna-Radar-Build', BUILD_ID);
  response.setHeader('Cache-Control', cacheable
    ? 'public, s-maxage=1800, stale-while-revalidate=3600'
    : 'no-store, max-age=0');
  response.status(status).json(body);
}

function toText(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return toText(record.message ?? record.detail ?? record.error_description ?? record.code, fallback);
  }
  return fallback;
}

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(typeof value === 'string' ? value.replace(/,/g, '') : value);
  return Number.isFinite(parsed) ? Math.max(0, Math.round(parsed)) : null;
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map((item) => toText(item)).filter(Boolean).slice(0, 10) : [];
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

function extractOutputText(payload: unknown) {
  if (!payload || typeof payload !== 'object') return '';
  const record = payload as Record<string, unknown>;
  if (typeof record.output_text === 'string') return record.output_text;

  const output = Array.isArray(record.output) ? record.output : [];
  for (const item of output) {
    if (!item || typeof item !== 'object') continue;
    const content = Array.isArray((item as Record<string, unknown>).content)
      ? (item as Record<string, unknown>).content as unknown[]
      : [];
    for (const part of content) {
      if (!part || typeof part !== 'object') continue;
      const partRecord = part as Record<string, unknown>;
      if (partRecord.type === 'output_text' && typeof partRecord.text === 'string') return partRecord.text;
    }
  }
  return '';
}

function parseJson(text: string): Record<string, unknown> {
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  try {
    const parsed = JSON.parse(cleaned);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
  } catch {
    // Recover the outermost JSON object below.
  }
  const first = cleaned.indexOf('{');
  const last = cleaned.lastIndexOf('}');
  if (first >= 0 && last > first) {
    const parsed = JSON.parse(cleaned.slice(first, last + 1));
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
  }
  throw new Error('검색 결과가 유효한 JSON이 아니었어요.');
}

function normalize(raw: Record<string, unknown>, target: CallTarget): TrendPayload {
  const now = new Date();
  const rangeStart = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const seen = new Set<string>();
  const rows = Array.isArray(raw.items) ? raw.items : [];

  const items = rows.map((row, index): TrendItem | null => {
    if (!row || typeof row !== 'object') return null;
    const item = row as Record<string, unknown>;
    const url = toText(item.url);
    const riskCandidate = toText(item.risk_level).toLowerCase();
    const risk: RiskLevel = riskCandidate === 'low' || riskCandidate === 'high' ? riskCandidate : 'medium';
    const dateText = toText(item.published_at);
    const date = new Date(dateText);
    if (!isHttpUrl(url) || risk === 'high') return null;
    if (!Number.isNaN(date.getTime()) && date < rangeStart) return null;

    const categoryCandidate = toText(item.category).toUpperCase();
    const category: TrendCategory = categoryCandidate === 'AI_TECH' || categoryCandidate === 'SOCIETY'
      || categoryCandidate === 'LIFESTYLE' || categoryCandidate === 'CONTENT'
      ? categoryCandidate : 'CONTENT';
    const factCandidate = toText(item.fact_check_status).toLowerCase();
    const fact: FactCheckStatus = factCandidate === 'verified' || factCandidate === 'unverified'
      ? factCandidate : 'partial';

    return {
      rank: index + 1,
      community: toText(item.community, '출처 확인 필요'),
      source_title: toText(item.source_title, '제목 확인 필요').slice(0, 120),
      url,
      published_at: dateText || now.toISOString(),
      views: toNumber(item.views),
      comments: toNumber(item.comments),
      recommendations: toNumber(item.recommendations),
      metrics_visible: Boolean(item.metrics_visible),
      category,
      topic: toText(item.topic, '온라인 트렌드'),
      summary: toText(item.summary, '내용을 확인 중입니다.'),
      why_trending: toText(item.why_trending, '반응량이 빠르게 늘고 있습니다.'),
      x_angle: toText(item.x_angle, '사람들이 반응한 이유를 중심으로 정리'),
      x_hook: toText(item.x_hook, '지금 온라인에서 빠르게 퍼지는 소재'),
      fact_check_status: fact,
      fact_check_note: toText(item.fact_check_note, '원문과 공개 자료를 기준으로 확인'),
      risk_level: risk,
      risk_factors: toStringArray(item.risk_factors),
      related_sources: toStringArray(item.related_sources).filter(isHttpUrl),
      trend_score: Math.min(100, Math.max(0, Number(item.trend_score) || 0)),
    };
  }).filter((item): item is TrendItem => item !== null)
    .sort((a, b) => b.trend_score - a.trend_score)
    .filter((item) => {
      const key = `${item.url}|${item.source_title}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 10)
    .map((item, index) => ({ ...item, rank: index + 1 }));

  return {
    generated_at: now.toISOString(),
    range_start: rangeStart.toISOString(),
    range_end: now.toISOString(),
    checked_sources: SOURCE_COUNT,
    successful_sources: Math.min(SOURCE_COUNT, Math.max(0, Math.round(Number(raw.successful_sources) || 0))),
    items,
    model_used: target.model,
    auth_used: target.name,
    build: BUILD_ID,
  };
}

function buildPrompt() {
  const seoulNow = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul', dateStyle: 'full', timeStyle: 'long',
  }).format(new Date());

  return `너는 한국 온라인 트렌드를 찾고 X용 글감으로 정리하는 리서처다.
현재 시각은 ${seoulNow}, Asia/Seoul 기준이다. 최근 24시간 안에 게시된 공개 글만 조사한다.

대상: 에펨코리아 포텐, 디시인사이드 실시간 베스트, 루리웹 베스트, 뽐뿌 인기글, 클리앙 모두의공원, 더쿠 HOT, 웃긴대학, MLBPARK 불펜, 인스티즈, 네이트판, Threads, Instagram, TikTok.
로그인·결제·캡차 우회·비공개 접근이 필요한 페이지는 제외한다. 게시 시각을 확인할 수 없으면 제외한다. 숫자가 공개되지 않으면 null로 기록한다.
조회수 10,000 이상을 우선하고, 조회수가 없으면 댓글·추천·상단 노출·동시 확산을 본다. 같은 사건은 하나만 남긴다. 조건에 맞는 글이 적으면 억지로 채우지 않는다.
연예인 사생활, 일반인 신상, 미성년자 민감 소재, 성적 소재, 혐오, 미확인 범죄·의료 루머, 투자 선동, 조작 캡처, 명예훼손 위험 소재는 제외한다.
원문을 길게 복사하지 말고 새 문장으로 정리한다. high 위험도는 items에서 제외한다.

유효한 JSON 객체 하나만 출력한다. 설명과 코드블록은 쓰지 않는다.
형식:
{"generated_at":"ISO","range_start":"ISO","range_end":"ISO","checked_sources":13,"successful_sources":0,"items":[{"rank":1,"community":"출처","source_title":"80자 이내","url":"직접 링크","published_at":"ISO","views":10000,"comments":0,"recommendations":0,"metrics_visible":true,"category":"AI_TECH|SOCIETY|LIFESTYLE|CONTENT","topic":"주제","summary":"2문장 이내","why_trending":"반응 이유","x_angle":"X 글 관점","x_hook":"한 줄 훅","fact_check_status":"verified|partial|unverified","fact_check_note":"확인 근거","risk_level":"low|medium|high","risk_factors":[],"related_sources":[],"trend_score":90}]}`;
}

async function callTarget(target: CallTarget) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 52000);
  try {
    const response = await fetch(target.endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${target.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: target.model,
        store: false,
        tools: [{ type: 'web_search' }],
        tool_choice: 'required',
        input: buildPrompt(),
        max_output_tokens: 10000,
      }),
      signal: controller.signal,
    });

    const payload = await response.json() as Record<string, unknown>;
    if (!response.ok) {
      const error = payload.error && typeof payload.error === 'object'
        ? payload.error as Record<string, unknown> : payload;
      const message = toText(error.message ?? error, `AI 요청 실패 (${response.status})`);
      const code = toText(error.code ?? error.type, `http_${response.status}`);
      throw { status: response.status, code, message, target: target.name };
    }

    const text = extractOutputText(payload);
    if (!text) throw { status: 502, code: 'empty_output', message: '검색 결과 텍스트가 비어 있어요.', target: target.name };
    return normalize(parseJson(text), target);
  } finally {
    clearTimeout(timeout);
  }
}

export default async function handler(request: RequestLike, response: ResponseLike) {
  if (request.method && request.method !== 'GET') {
    sendJson(response, { error: 'GET 요청만 지원합니다.', build: BUILD_ID }, 405);
    return;
  }

  const now = Date.now();
  if (cache && cache.expiresAt > now) {
    sendJson(response, { ...cache.payload, cached: true }, 200, true);
    return;
  }

  const openAiKey = process.env.OPENAI_API_KEY?.trim();
  const gatewayToken = process.env.AI_GATEWAY_API_KEY?.trim() || process.env.VERCEL_OIDC_TOKEN?.trim();
  const targets: CallTarget[] = [];

  if (gatewayToken) {
    targets.push({
      name: process.env.AI_GATEWAY_API_KEY ? 'vercel-ai-gateway-key' : 'vercel-oidc',
      endpoint: 'https://ai-gateway.vercel.sh/v1/responses',
      token: gatewayToken,
      model: 'openai/gpt-5.5',
    });
  }
  if (openAiKey) {
    targets.push({
      name: 'openai-direct',
      endpoint: 'https://api.openai.com/v1/responses',
      token: openAiKey,
      model: 'gpt-5.5',
    });
  }

  if (targets.length === 0) {
    sendJson(response, {
      error: 'AI 인증값을 함수에서 읽지 못했어요. OIDC와 OpenAI 키가 모두 없는 상태입니다.',
      code: 'missing_all_auth',
      detected: {
        openai_api_key: Boolean(process.env.OPENAI_API_KEY),
        ai_gateway_api_key: Boolean(process.env.AI_GATEWAY_API_KEY),
        vercel_oidc_token: Boolean(process.env.VERCEL_OIDC_TOKEN),
      },
      environment: process.env.VERCEL_ENV ?? 'unknown',
      build: BUILD_ID,
    }, 503);
    return;
  }

  const failures: Array<Record<string, unknown>> = [];
  for (const target of targets) {
    try {
      const payload = await callTarget(target);
      cache = { expiresAt: now + CACHE_TTL_MS, payload };
      sendJson(response, payload, 200, true);
      return;
    } catch (error) {
      const record = error && typeof error === 'object' ? error as Record<string, unknown> : {};
      failures.push({
        target: toText(record.target, target.name),
        status: Number(record.status) || 500,
        code: toText(record.code, 'request_failed'),
        message: toText(record.message ?? error, 'AI 요청이 실패했어요.'),
      });
    }
  }

  const last = failures[failures.length - 1] ?? {};
  sendJson(response, {
    error: toText(last.message, '모든 AI 연결 경로가 실패했어요.'),
    code: toText(last.code, 'all_targets_failed'),
    failures,
    build: BUILD_ID,
  }, Number(last.status) >= 400 && Number(last.status) < 600 ? Number(last.status) : 502);
}
