type RequestLike = { method?: string };
type ResponseLike = {
  status(code: number): ResponseLike;
  setHeader(name: string, value: string): void;
  json(body: unknown): void;
};

type VerifiedNewsItem = {
  title: string;
  description: string;
  category: string;
  url: string;
  match: string[];
};

type PublicNewsItem = Omit<VerifiedNewsItem, 'match'>;

export const config = { runtime: 'nodejs', maxDuration: 10 };

const SOURCE_URL = 'https://higgsfield.ai/';
const VERIFIED_AT = '2026-07-13T04:24:00.000Z';
const FETCH_TIMEOUT_MS = 3_000;

const VERIFIED_ITEMS: VerifiedNewsItem[] = [
  {
    title: '총상금 10만 달러 앱 콘테스트',
    description: 'Claude MCP 또는 Higgsfield Supercomputer로 앱을 제작해 7월 22일까지 제출하는 공식 콘테스트입니다.',
    category: '콘테스트',
    url: 'https://higgsfield.ai/supercomputer/apps',
    match: ['$100k app contest', 'ship an app via claude mcp'],
  },
  {
    title: 'Seedream 5.0 Pro 공개',
    description: '바이트댄스의 상위급 추론형 이미지 생성 모델 Seedream 5.0 Pro가 Higgsfield에 추가됐습니다.',
    category: '새 모델',
    url: 'https://higgsfield.ai/ai/image?model=seedream_v5_pro',
    match: ['seedream 5.0 pro', "bytedance's top-tier reasoning image model"],
  },
  {
    title: 'Higgsfield App Builder 출시',
    description: 'Higgsfield의 이미지·영상 모델을 활용해 풀스택 앱을 만들 수 있는 App Builder가 공개됐습니다.',
    category: '새 기능',
    url: 'https://higgsfield.ai/supercomputer/apps',
    match: ['app builder', 'build full-stack apps powered by higgsfield'],
  },
  {
    title: 'Gemini Omni Flash·Seed Audio 플러그인 추가',
    description: 'Gemini Omni Flash와 Seed Audio 1.0을 Adobe Premiere Pro와 DaVinci Resolve Studio 안에서 사용할 수 있습니다.',
    category: '플러그인',
    url: 'https://higgsfield.ai/plugins/premiere-pro',
    match: ['gemini omni flash & seed audio 1.0', 'now in higgsfield plugins'],
  },
  {
    title: 'Higgsfield Explainer 공개',
    description: '주제를 입력하면 최대 10분 길이의 자막형 설명 영상을 제작하는 Explainer 기능이 공개됐습니다.',
    category: '새 기능',
    url: 'https://higgsfield.ai/supercomputer/marketplace/skills/higgsfield-explainer',
    match: ['higgsfield explainer', 'captioned explainer video'],
  },
];

function send(response: ResponseLike, body: unknown, status = 200) {
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=1800');
  response.status(status).json(body);
}

function plainText(html: string) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function publicItems(items: VerifiedNewsItem[]): PublicNewsItem[] {
  return items.map(({ match: _match, ...item }) => item);
}

function visibleVerifiedItems(html: string) {
  const text = plainText(html);
  return VERIFIED_ITEMS.filter((item) => item.match.some((token) => text.includes(token.toLowerCase())));
}

async function fetchHomepage() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(SOURCE_URL, {
      cache: 'no-store',
      signal: controller.signal,
      headers: {
        Accept: 'text/html,application/xhtml+xml',
        'User-Agent': 'Mozilla/5.0 (compatible; LunaSignal/1.1; +https://lunakim-studio.vercel.app)',
      },
    });
    if (!response.ok) throw new Error(`Higgsfield 응답 오류 ${response.status}`);
    return await response.text();
  } finally {
    clearTimeout(timer);
  }
}

export default async function handler(request: RequestLike, response: ResponseLike) {
  if (request.method && request.method !== 'GET') {
    return send(response, { error: 'GET only' }, 405);
  }

  const fetchedAt = new Date().toISOString();
  try {
    const html = await fetchHomepage();
    const visible = visibleVerifiedItems(html);
    const items = visible.length >= 3 ? visible : VERIFIED_ITEMS;
    return send(response, {
      source: SOURCE_URL,
      fetched_at: fetchedAt,
      verified_at: VERIFIED_AT,
      mode: visible.length >= 3 ? 'live' : 'fallback',
      items: publicItems(items),
    });
  } catch (error) {
    return send(response, {
      source: SOURCE_URL,
      fetched_at: fetchedAt,
      verified_at: VERIFIED_AT,
      mode: 'fallback',
      warning: error instanceof Error ? error.message : 'Higgsfield 실시간 확인에 실패했어요.',
      items: publicItems(VERIFIED_ITEMS),
    });
  }
}
