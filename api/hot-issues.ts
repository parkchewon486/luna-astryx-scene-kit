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
  build?: string;
};

type RequestLike = {
  method?: string;
};

type ResponseLike = {
  status(code: number): ResponseLike;
  setHeader(name: string, value: string): void;
  json(body: unknown): void;
};

type CachedResult = {
  expiresAt: number;
  payload: TrendPayload;
};

type OpenAiFailure = {
  status: number;
  code: string;
  type: string;
  message: string;
  requestId: string;
  retryable: boolean;
};

export const config = {
  runtime: 'nodejs',
  maxDuration: 60,
};

const BUILD_ID = 'radar-v4-20260711';
const CACHE_TTL_MS = 30 * 60 * 1000;
const ALLOWED_DOMAINS = [
  'fmkorea.com',
  'dcinside.com',
  'ruliweb.com',
  'ppomppu.co.kr',
  'clien.net',
  'theqoo.net',
  'humoruniv.com',
  'mlbpark.donga.com',
  'instiz.net',
  'pann.nate.com',
  'threads.net',
  'instagram.com',
  'tiktok.com',
];

let memoryCache: CachedResult | null = null;

function sendJson(response: ResponseLike, body: unknown, status = 200, cacheable = false) {
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('X-Luna-Radar-Build', BUILD_ID);
  response.setHeader(
    'Cache-Control',
    cacheable
      ? 'public, s-maxage=1800, stale-while-revalidate=3600'
      : 'no-store, max-age=0',
  );
  response.status(status).json(body);
}

function asString(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const nestedMessage = record.message ?? record.detail ?? record.error_description ?? record.code;
    if (nestedMessage !== undefined) return asString(nestedMessage, fallback);
    try {
      return JSON.stringify(value);
    } catch {
      return fallback;
    }
  }
  return fallback;
}

function asNumberOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number' && Number.isFinite(value)) return Math.max(0, Math.round(value));
  if (typeof value === 'string') {
    const normalized = value.replace(/,/g, '').trim();
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? Math.max(0, Math.round(parsed)) : null;
  }
  return null;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => asString(item)).filter(Boolean).slice(0, 10);
}

function isSafeHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

function normalizeCategory(value: unknown): TrendCategory {
  const candidate = asString(value).toUpperCase();
  if (candidate === 'AI_TECH' || candidate === 'SOCIETY' || candidate === 'LIFESTYLE' || candidate === 'CONTENT') {
    return candidate;
  }
  return 'CONTENT';
}

function normalizeFactStatus(value: unknown): FactCheckStatus {
  const candidate = asString(value).toLowerCase();
  if (candidate === 'verified' || candidate === 'partial' || candidate === 'unverified') return candidate;
  return 'partial';
}

function normalizeRisk(value: unknown): RiskLevel {
  const candidate = asString(value).toLowerCase();
  if (candidate === 'low' || candidate === 'medium' || candidate === 'high') return candidate;
  return 'medium';
}

function buildTrendPrompt() {
  const seoulNow = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    dateStyle: 'full',
    timeStyle: 'long',
  }).format(new Date());

  return `너는 한국 온라인 트렌드를 찾고, X용 콘텐츠 소재로 정리하는 콘텐츠 리서처다.

현재 시각은 ${seoulNow}, Asia/Seoul 기준이다. 현재 시각으로부터 최근 24시간 안에 게시된 공개 게시물만 조사한다.

조사 대상:
- 에펨코리아 포텐
- 디시인사이드 실시간 베스트
- 루리웹 베스트
- 뽐뿌 인기글
- 클리앙 모두의공원
- 더쿠 HOT
- 웃긴대학 웃대
- MLBPARK 불펜
- 인스티즈
- 네이트판
- Threads 공개 게시물
- Instagram 공개 게시물
- TikTok 공개 게시물

접근 규칙:
- 로그인 없이 볼 수 있는 공개 페이지에만 접근한다.
- 로그인, 결제, 캡차 우회, 비공개 접근이 필요한 페이지는 제외한다.
- 삭제글, 검색 미리보기만 있고 원문을 확인할 수 없는 글은 제외한다.
- 게시 시각을 확인할 수 없는 글은 제외한다.
- 조회수, 댓글 수, 추천 수가 화면에 없으면 추측하지 말고 null로 기록한다.

선정 기준:
1. 화면에 표시된 조회수 10,000 이상인 글을 최우선으로 한다.
2. 조회수가 공개되지 않으면 댓글 수, 추천 수, 인기글 상단 노출, 여러 커뮤니티 확산 여부를 함께 본다.
3. 같은 뉴스, 영상, 사건을 여러 곳에서 퍼온 경우 가장 먼저 올라온 글 또는 반응이 가장 큰 글 하나만 남긴다.
4. 조건을 통과한 글이 10개보다 적으면 억지로 채우지 않는다.

제외 대상:
- 연예인 사생활 추측, 일반인 신상, 미성년자 민감 소재, 성적 소재, 혐오 표현
- 확인되지 않은 범죄 의혹, 의료 루머, 투자 매수·매도 선동
- 조작 가능성이 큰 캡처, 출처 없는 주장, 명예훼손 위험이 큰 소재

사실 확인:
- 공식 발표, 원본 영상, 신뢰할 수 있는 보도로 확인되면 verified
- 일부만 확인되면 partial
- 커뮤니티 주장만 존재하면 unverified 및 risk_level high
- risk_level high인 소재는 최종 items에서 제외한다.

작성 규칙:
- 원문 제목과 문장을 길게 복사하지 않는다.
- 사람들이 왜 반응했는지 새 문장으로 정리한다.
- source_title은 80자 이내, summary는 2문장 이내로 쓴다.
- x_hook은 과장 없이 짧고 강하게 쓴다.
- category는 AI_TECH, SOCIETY, LIFESTYLE, CONTENT 중 하나다.
- trend_score가 높은 순서대로 최대 10개를 반환한다.

반드시 유효한 JSON 객체 하나만 출력한다. 마크다운 코드블록, 설명 문장, 주석을 붙이지 않는다.

JSON 형식:
{
  "generated_at": "ISO 날짜",
  "range_start": "ISO 날짜",
  "range_end": "ISO 날짜",
  "checked_sources": 13,
  "successful_sources": 0,
  "items": [
    {
      "rank": 1,
      "community": "커뮤니티 이름",
      "source_title": "80자 이내 제목",
      "url": "직접 원문 링크",
      "published_at": "ISO 날짜",
      "views": 10000,
      "comments": 0,
      "recommendations": 0,
      "metrics_visible": true,
      "category": "AI_TECH",
      "topic": "주제",
      "summary": "2문장 이내 설명",
      "why_trending": "반응 이유",
      "x_angle": "X 글 관점",
      "x_hook": "한 줄 훅",
      "fact_check_status": "verified",
      "fact_check_note": "확인 근거",
      "risk_level": "low",
      "risk_factors": [],
      "related_sources": [],
      "trend_score": 90
    }
  ]
}`;
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
      if (partRecord.type === 'output_text' && typeof partRecord.text === 'string') {
        return partRecord.text;
      }
    }
  }

  return '';
}

function parseJsonObject(text: string): Record<string, unknown> {
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  try {
    const parsed = JSON.parse(cleaned);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed as Record<string, unknown>;
  } catch {
    // Try extracting the outermost JSON object below.
  }

  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    const parsed = JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed as Record<string, unknown>;
  }

  throw new Error('검색 결과가 유효한 JSON 형식이 아니었어요.');
}

function normalizePayload(raw: Record<string, unknown>, modelUsed: string): TrendPayload {
  const now = new Date();
  const rangeStart = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const seen = new Set<string>();
  const sourceItems = Array.isArray(raw.items) ? raw.items : [];

  const items = sourceItems
    .map((value, index): TrendItem | null => {
      if (!value || typeof value !== 'object') return null;
      const item = value as Record<string, unknown>;
      const url = asString(item.url);
      const riskLevel = normalizeRisk(item.risk_level);
      const publishedAt = asString(item.published_at);
      const publishedDate = new Date(publishedAt);

      if (!isSafeHttpUrl(url) || riskLevel === 'high') return null;
      if (!Number.isNaN(publishedDate.getTime()) && publishedDate < rangeStart) return null;

      return {
        rank: index + 1,
        community: asString(item.community, '출처 확인 필요'),
        source_title: asString(item.source_title, '제목 확인 필요').slice(0, 120),
        url,
        published_at: publishedAt || now.toISOString(),
        views: asNumberOrNull(item.views),
        comments: asNumberOrNull(item.comments),
        recommendations: asNumberOrNull(item.recommendations),
        metrics_visible: Boolean(item.metrics_visible),
        category: normalizeCategory(item.category),
        topic: asString(item.topic, '온라인 트렌드'),
        summary: asString(item.summary, '내용을 확인 중입니다.'),
        why_trending: asString(item.why_trending, '반응량이 빠르게 늘고 있습니다.'),
        x_angle: asString(item.x_angle, '사람들이 반응한 이유를 중심으로 정리'),
        x_hook: asString(item.x_hook, '지금 온라인에서 빠르게 퍼지는 소재'),
        fact_check_status: normalizeFactStatus(item.fact_check_status),
        fact_check_note: asString(item.fact_check_note, '원문과 공개 자료를 기준으로 확인'),
        risk_level: riskLevel,
        risk_factors: asStringArray(item.risk_factors),
        related_sources: asStringArray(item.related_sources).filter(isSafeHttpUrl),
        trend_score: Math.min(100, Math.max(0, Number(item.trend_score) || 0)),
      };
    })
    .filter((item): item is TrendItem => item !== null)
    .sort((a, b) => b.trend_score - a.trend_score)
    .filter((item) => {
      const key = `${item.url}|${item.source_title}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 10)
    .map((item, index) => ({ ...item, rank: index + 1 }));

  return {
    generated_at: now.toISOString(),
    range_start: rangeStart.toISOString(),
    range_end: now.toISOString(),
    checked_sources: ALLOWED_DOMAINS.length,
    successful_sources: Math.min(
      ALLOWED_DOMAINS.length,
      Math.max(0, Math.round(Number(raw.successful_sources) || 0)),
    ),
    items,
    model_used: modelUsed,
    build: BUILD_ID,
  };
}

function normalizeOpenAiFailure(payload: unknown, status: number, requestId: string): OpenAiFailure {
  const record = payload && typeof payload === 'object' ? payload as Record<string, unknown> : {};
  const rawError = record.error;
  const errorRecord = rawError && typeof rawError === 'object' ? rawError as Record<string, unknown> : {};
  const code = asString(errorRecord.code ?? record.code, 'openai_request_failed');
  const type = asString(errorRecord.type ?? record.type, 'api_error');
  const message = asString(errorRecord.message ?? rawError ?? record.message, 'OpenAI 요청이 실패했어요.');
  const lowerMessage = message.toLowerCase();
  const retryable = status >= 500
    || code.includes('model_not_found')
    || code.includes('unsupported')
    || lowerMessage.includes('model')
    || lowerMessage.includes('web_search')
    || lowerMessage.includes('filter');

  return { status, code, type, message, requestId, retryable };
}

function friendlyFailureMessage(failure: OpenAiFailure) {
  const haystack = `${failure.code} ${failure.type} ${failure.message}`.toLowerCase();

  if (failure.status === 401 || haystack.includes('invalid_api_key') || haystack.includes('incorrect api key')) {
    return 'OpenAI API 키가 유효하지 않아요. Vercel의 OPENAI_API_KEY 값을 새 키로 교체해 주세요.';
  }
  if (haystack.includes('insufficient_quota') || haystack.includes('billing') || haystack.includes('quota')) {
    return 'OpenAI API 크레딧 또는 결제 한도가 부족해요. OpenAI API Billing에서 잔액과 사용 한도를 확인해 주세요.';
  }
  if (failure.status === 429 || haystack.includes('rate_limit')) {
    return 'OpenAI API 요청 한도에 잠시 걸렸어요. 1분 뒤 다시 시도해 주세요.';
  }
  if (failure.status === 403 || haystack.includes('permission')) {
    return '이 API 키에 웹 검색 또는 선택한 모델 사용 권한이 없어요. OpenAI 프로젝트 권한을 확인해 주세요.';
  }

  return failure.message || 'OpenAI 웹 검색 요청이 실패했어요.';
}

async function callOpenAi(apiKey: string) {
  const attempts = [
    { model: 'gpt-5.6-luna', filtered: true },
    { model: 'gpt-5.5', filtered: true },
    { model: 'gpt-4.1-mini', filtered: false },
  ];
  let lastFailure: OpenAiFailure | null = null;

  for (const attempt of attempts) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 50000);

    try {
      const webSearchTool: Record<string, unknown> = {
        type: 'web_search',
        search_context_size: 'medium',
        user_location: {
          type: 'approximate',
          country: 'KR',
          city: 'Seoul',
          region: 'Seoul',
        },
      };

      if (attempt.filtered) {
        webSearchTool.filters = { allowed_domains: ALLOWED_DOMAINS };
      }

      const body: Record<string, unknown> = {
        model: attempt.model,
        store: false,
        tools: [webSearchTool],
        tool_choice: 'required',
        input: buildTrendPrompt(),
        max_output_tokens: 12000,
      };

      if (attempt.model.startsWith('gpt-5.6')) {
        body.reasoning = { effort: 'low' };
      }

      const openAiResponse = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      const requestId = openAiResponse.headers.get('x-request-id') ?? '';
      const responsePayload = await openAiResponse.json() as Record<string, unknown>;

      if (!openAiResponse.ok) {
        const failure = normalizeOpenAiFailure(responsePayload, openAiResponse.status, requestId);
        lastFailure = failure;
        if (failure.retryable) continue;
        throw failure;
      }

      const outputText = extractOutputText(responsePayload);
      if (!outputText) {
        lastFailure = {
          status: 502,
          code: 'empty_output',
          type: 'response_parse_error',
          message: 'OpenAI가 검색 결과 텍스트를 반환하지 않았어요.',
          requestId,
          retryable: true,
        };
        continue;
      }

      const parsed = parseJsonObject(outputText);
      return normalizePayload(parsed, attempt.model);
    } catch (error) {
      if (error && typeof error === 'object' && 'status' in error && 'message' in error) {
        throw error;
      }
      if (error instanceof Error && error.name === 'AbortError') {
        lastFailure = {
          status: 504,
          code: 'openai_timeout',
          type: 'timeout_error',
          message: 'OpenAI 웹 검색이 제한 시간 안에 끝나지 않았어요.',
          requestId: '',
          retryable: false,
        };
        break;
      }
      lastFailure = {
        status: 500,
        code: 'unexpected_error',
        type: 'runtime_error',
        message: error instanceof Error ? error.message : asString(error, '알 수 없는 오류가 발생했어요.'),
        requestId: '',
        retryable: false,
      };
      break;
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastFailure ?? {
    status: 502,
    code: 'all_models_failed',
    type: 'api_error',
    message: '사용 가능한 웹 검색 모델을 찾지 못했어요.',
    requestId: '',
    retryable: false,
  };
}

export default async function handler(request: RequestLike, response: ResponseLike) {
  if (request.method && request.method !== 'GET') {
    sendJson(response, { error: 'GET 요청만 지원합니다.', build: BUILD_ID }, 405);
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    sendJson(response, {
      error: 'OPENAI_API_KEY 환경변수를 Node 함수에서 읽지 못했어요.',
      code: 'missing_api_key',
      environment: process.env.VERCEL_ENV ?? 'unknown',
      build: BUILD_ID,
    }, 503);
    return;
  }

  const now = Date.now();
  if (memoryCache && memoryCache.expiresAt > now) {
    sendJson(response, { ...memoryCache.payload, cached: true }, 200, true);
    return;
  }

  try {
    const payload = await callOpenAi(apiKey);
    memoryCache = { expiresAt: now + CACHE_TTL_MS, payload };
    sendJson(response, payload, 200, true);
  } catch (error) {
    const failure = error && typeof error === 'object'
      ? error as Partial<OpenAiFailure>
      : {};
    const normalized: OpenAiFailure = {
      status: typeof failure.status === 'number' ? failure.status : 500,
      code: asString(failure.code, 'trend_radar_failed'),
      type: asString(failure.type, 'api_error'),
      message: asString(failure.message ?? error, '트렌드 검색 중 알 수 없는 오류가 발생했어요.'),
      requestId: asString(failure.requestId),
      retryable: Boolean(failure.retryable),
    };

    sendJson(response, {
      error: friendlyFailureMessage(normalized),
      code: normalized.code,
      stage: normalized.type,
      request_id: normalized.requestId || null,
      build: BUILD_ID,
    }, normalized.status >= 400 && normalized.status < 600 ? normalized.status : 500);
  }
}
