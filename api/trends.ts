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
};

type CachedResult = {
  expiresAt: number;
  payload: TrendPayload;
};

let memoryCache: CachedResult | null = null;

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

const TREND_SCHEMA = {
  type: 'object',
  properties: {
    generated_at: { type: 'string' },
    range_start: { type: 'string' },
    range_end: { type: 'string' },
    checked_sources: { type: 'integer', minimum: 0 },
    successful_sources: { type: 'integer', minimum: 0 },
    items: {
      type: 'array',
      maxItems: 10,
      items: {
        type: 'object',
        properties: {
          rank: { type: 'integer', minimum: 1, maximum: 10 },
          community: { type: 'string' },
          source_title: { type: 'string' },
          url: { type: 'string' },
          published_at: { type: 'string' },
          views: { type: ['integer', 'null'], minimum: 0 },
          comments: { type: ['integer', 'null'], minimum: 0 },
          recommendations: { type: ['integer', 'null'], minimum: 0 },
          metrics_visible: { type: 'boolean' },
          category: { type: 'string', enum: ['AI_TECH', 'SOCIETY', 'LIFESTYLE', 'CONTENT'] },
          topic: { type: 'string' },
          summary: { type: 'string' },
          why_trending: { type: 'string' },
          x_angle: { type: 'string' },
          x_hook: { type: 'string' },
          fact_check_status: { type: 'string', enum: ['verified', 'partial', 'unverified'] },
          fact_check_note: { type: 'string' },
          risk_level: { type: 'string', enum: ['low', 'medium', 'high'] },
          risk_factors: { type: 'array', items: { type: 'string' } },
          related_sources: { type: 'array', items: { type: 'string' } },
          trend_score: { type: 'number', minimum: 0, maximum: 100 },
        },
        required: [
          'rank',
          'community',
          'source_title',
          'url',
          'published_at',
          'views',
          'comments',
          'recommendations',
          'metrics_visible',
          'category',
          'topic',
          'summary',
          'why_trending',
          'x_angle',
          'x_hook',
          'fact_check_status',
          'fact_check_note',
          'risk_level',
          'risk_factors',
          'related_sources',
          'trend_score',
        ],
        additionalProperties: false,
      },
    },
  },
  required: ['generated_at', 'range_start', 'range_end', 'checked_sources', 'successful_sources', 'items'],
  additionalProperties: false,
};

const TREND_PROMPT = `너는 한국 온라인 트렌드를 찾고, X용 콘텐츠 소재로 정리하는 콘텐츠 리서처다.

현재 시각은 Asia/Seoul 기준이다. 현재 시각으로부터 최근 24시간 안에 게시된 공개 게시물만 조사한다.

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
- 삭제글, 검색 결과 미리보기만 있고 원문을 확인할 수 없는 글은 제외한다.
- 게시 시각을 확인할 수 없는 글은 제외한다.
- 조회수, 댓글 수, 추천 수가 화면에 없으면 추측하지 말고 null로 기록한다.

선정 기준:
1. 화면에 표시된 조회수 10,000 이상인 글을 최우선으로 한다.
2. 조회수가 공개되지 않으면 댓글 수, 추천 수, 실시간 인기글 상단 체류, 여러 커뮤니티 확산 여부를 함께 본다.
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
- source_title은 80자 이내로 정리한다.
- summary는 2문장 이내로 쓴다.
- x_hook은 과장 없이 짧고 강하게 쓴다.
- category는 AI_TECH, SOCIETY, LIFESTYLE, CONTENT 중 하나를 선택한다.
- trend_score가 높은 순서대로 최대 10개를 반환한다.`;

function jsonResponse(body: unknown, status = 200, cacheable = false) {
  const headers = new Headers({
    'Content-Type': 'application/json; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
  });

  headers.set(
    'Cache-Control',
    cacheable
      ? 'public, s-maxage=1800, stale-while-revalidate=3600'
      : 'no-store',
  );

  return new Response(JSON.stringify(body), { status, headers });
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

function isSafeHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

function normalizePayload(raw: TrendPayload): TrendPayload {
  const now = new Date();
  const rangeStart = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const seen = new Set<string>();

  const items = (Array.isArray(raw.items) ? raw.items : [])
    .filter((item) => item && item.risk_level !== 'high' && isSafeHttpUrl(item.url))
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
    successful_sources: Math.min(Math.max(raw.successful_sources || 0, 0), ALLOWED_DOMAINS.length),
    items,
  };
}

export default {
  async fetch(request: Request) {
    if (request.method !== 'GET') {
      return jsonResponse({ error: 'GET 요청만 지원합니다.' }, 405);
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return jsonResponse({ error: 'OPENAI_API_KEY 환경변수가 연결되지 않았어요.' }, 503);
    }

    const now = Date.now();
    if (memoryCache && memoryCache.expiresAt > now) {
      return jsonResponse({ ...memoryCache.payload, cached: true }, 200, true);
    }

    try {
      const response = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-5.5',
          reasoning: { effort: 'low' },
          store: false,
          tools: [
            {
              type: 'web_search',
              search_context_size: 'medium',
              filters: { allowed_domains: ALLOWED_DOMAINS },
              user_location: {
                type: 'approximate',
                country: 'KR',
                city: 'Seoul',
                region: 'Seoul',
              },
            },
          ],
          tool_choice: 'required',
          include: ['web_search_call.action.sources'],
          input: TREND_PROMPT,
          text: {
            format: {
              type: 'json_schema',
              name: 'korean_trend_radar',
              strict: true,
              schema: TREND_SCHEMA,
            },
          },
        }),
      });

      const responsePayload = await response.json() as Record<string, unknown>;

      if (!response.ok) {
        const errorObject = responsePayload.error && typeof responsePayload.error === 'object'
          ? responsePayload.error as Record<string, unknown>
          : null;
        const detail = errorObject && typeof errorObject.message === 'string'
          ? errorObject.message
          : 'OpenAI 검색 요청이 실패했어요.';
        return jsonResponse({ error: detail }, response.status >= 500 ? 502 : response.status);
      }

      const outputText = extractOutputText(responsePayload);
      if (!outputText) {
        return jsonResponse({ error: '검색 결과를 읽을 수 있는 JSON으로 받지 못했어요.' }, 502);
      }

      const parsed = JSON.parse(outputText) as TrendPayload;
      const payload = normalizePayload(parsed);
      memoryCache = { expiresAt: now + CACHE_TTL_MS, payload };

      return jsonResponse(payload, 200, true);
    } catch (error) {
      const message = error instanceof Error ? error.message : '트렌드 검색 중 알 수 없는 오류가 발생했어요.';
      return jsonResponse({ error: message }, 500);
    }
  },
};
