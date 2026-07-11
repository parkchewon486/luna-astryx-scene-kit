type RequestLike = { method?: string };
type ResponseLike = {
  status(code: number): ResponseLike;
  setHeader(name: string, value: string): void;
  json(body: unknown): void;
};

type Category = 'AI_TECH' | 'SOCIETY' | 'LIFESTYLE' | 'CONTENT';
type SourceConfig = { name: string; url: string; base: string };

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
  category: Category;
  topic: string;
  summary: string;
  why_trending: string;
  x_angle: string;
  x_hook: string;
  fact_check_status: 'partial';
  fact_check_note: string;
  risk_level: 'low' | 'medium';
  risk_factors: string[];
  related_sources: string[];
  trend_score: number;
};

type Payload = {
  generated_at: string;
  range_start: string;
  range_end: string;
  checked_sources: number;
  successful_sources: number;
  items: TrendItem[];
  cached?: boolean;
  build: string;
  mode: 'free-public-scraper';
  failed_sources: string[];
};

export const config = { runtime: 'nodejs', maxDuration: 60 };

const BUILD = 'radar-free-v1-20260711';
const TTL = 30 * 60 * 1000;
let cache: { expires: number; payload: Payload } | null = null;

const SOURCES: SourceConfig[] = [
  { name: '에펨코리아 포텐', url: 'https://www.fmkorea.com/best', base: 'https://www.fmkorea.com' },
  { name: '디시인사이드 실시간 베스트', url: 'https://gall.dcinside.com/board/lists/?id=dcbest', base: 'https://gall.dcinside.com' },
  { name: '루리웹 베스트', url: 'https://bbs.ruliweb.com/best', base: 'https://bbs.ruliweb.com' },
  { name: '뽐뿌 인기글', url: 'https://www.ppomppu.co.kr/hot.php', base: 'https://www.ppomppu.co.kr' },
  { name: '클리앙 모두의공원', url: 'https://www.clien.net/service/board/park', base: 'https://www.clien.net' },
  { name: '더쿠 HOT', url: 'https://theqoo.net/hot', base: 'https://theqoo.net' },
  { name: '웃긴대학 웃대', url: 'http://web.humoruniv.com/board/humor/list.html?table=pds', base: 'http://web.humoruniv.com' },
  { name: 'MLBPARK 불펜', url: 'https://mlbpark.donga.com/mp/b.php?b=bullpen', base: 'https://mlbpark.donga.com' },
  { name: '인스티즈', url: 'https://www.instiz.net/pt', base: 'https://www.instiz.net' },
  { name: '네이트판', url: 'https://pann.nate.com/talk/ranking', base: 'https://pann.nate.com' },
];

const BLOCKED_WORDS = [
  '성폭행', '몰카', '노출', '미성년자', '신상', '사망설', '불륜', '성관계', '혐오', '살인범',
  '매수 추천', '급등주', '코인 추천', '의료 기적', '암 완치',
];

const SKIP_TEXT = [
  '로그인', '회원가입', '공지', '이용약관', '개인정보', '고객센터', '검색', '다음', '이전',
  '더보기', '메뉴', '댓글', '추천', '조회', '광고', 'javascript',
];

function decodeHtml(value: string) {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;|&#34;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/\s+/g, ' ')
    .trim();
}

function absoluteUrl(href: string, source: SourceConfig) {
  try {
    const url = new URL(href, source.base);
    if (!['http:', 'https:'].includes(url.protocol)) return '';
    url.hash = '';
    return url.toString();
  } catch {
    return '';
  }
}

function parseNumber(text: string, labels: string[]) {
  for (const label of labels) {
    const patterns = [
      new RegExp(`${label}\\s*[:：]?\\s*([0-9][0-9,]*)`, 'i'),
      new RegExp(`([0-9][0-9,]*)\\s*${label}`, 'i'),
    ];
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return Number(match[1].replace(/,/g, ''));
    }
  }
  return null;
}

function categoryFor(title: string): Category {
  if (/(AI|인공지능|챗GPT|ChatGPT|제미나이|클로드|로봇|반도체|테크|스마트폰|애플|구글|오픈AI)/i.test(title)) return 'AI_TECH';
  if (/(정부|정책|사회|사건|교통|날씨|학교|직장|법원|경찰|경제)/i.test(title)) return 'SOCIETY';
  if (/(음식|카페|여행|건강|운동|육아|반려|집|패션|뷰티|생활)/i.test(title)) return 'LIFESTYLE';
  return 'CONTENT';
}

function ruleText(title: string, views: number | null, comments: number | null, recommendations: number | null) {
  const viewStrong = views !== null && views >= 10000;
  const commentStrong = comments !== null && comments >= 100;
  const recommendStrong = recommendations !== null && recommendations >= 100;

  if (viewStrong && commentStrong) {
    return {
      why: '조회수와 댓글이 함께 빠르게 쌓여 의견이 크게 갈리는 소재예요.',
      angle: '댓글 반응이 커진 이유와 사람들이 갈린 지점을 중심으로 정리',
      hook: `조회수보다 댓글창이 더 뜨거운 이야기: ${title}`,
    };
  }
  if (viewStrong) {
    return {
      why: '짧은 시간 안에 많은 사람이 확인한 인기글 상위 소재예요.',
      angle: '사람들이 한꺼번에 클릭한 이유를 짧게 설명',
      hook: `지금 1만 명 이상이 본 소재: ${title}`,
    };
  }
  if (recommendStrong) {
    return {
      why: '조회수 공개 여부와 관계없이 공감과 추천 반응이 강한 글이에요.',
      angle: '추천이 몰린 공감 포인트를 중심으로 소개',
      hook: `추천이 빠르게 쌓인 오늘의 공감 소재: ${title}`,
    };
  }
  return {
    why: '각 커뮤니티 인기글 상단에 노출된 소재로 반응이 빠르게 늘고 있어요.',
    angle: '인기글 상단에 오른 이유를 확인하고 핵심만 소개',
    hook: `지금 커뮤니티 상단에서 퍼지는 이야기: ${title}`,
  };
}

function extractLinks(html: string, source: SourceConfig, scannedAt: string): TrendItem[] {
  const results: TrendItem[] = [];
  const anchorPattern = /<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;
  let position = 0;

  while ((match = anchorPattern.exec(html)) && results.length < 35) {
    const href = match[1];
    const title = decodeHtml(match[2]);
    if (title.length < 8 || title.length > 120) continue;
    if (SKIP_TEXT.some((word) => title.toLowerCase().includes(word.toLowerCase()))) continue;
    if (BLOCKED_WORDS.some((word) => title.includes(word))) continue;

    const url = absoluteUrl(href, source);
    if (!url || url === source.url || /login|signup|member|notice/i.test(url)) continue;

    const nearby = decodeHtml(html.slice(Math.max(0, match.index - 500), Math.min(html.length, anchorPattern.lastIndex + 700)));
    const views = parseNumber(nearby, ['조회', 'view', 'views']);
    const comments = parseNumber(nearby, ['댓글', 'comment', 'comments']);
    const recommendations = parseNumber(nearby, ['추천', '공감', 'like', 'likes']);
    const metricsVisible = views !== null || comments !== null || recommendations !== null;
    const rules = ruleText(title, views, comments, recommendations);
    const score = Math.max(1, 100 - position * 2)
      + Math.min(25, views ? Math.log10(Math.max(views, 1)) * 5 : 0)
      + Math.min(15, comments ? Math.log10(Math.max(comments, 1)) * 5 : 0)
      + Math.min(10, recommendations ? Math.log10(Math.max(recommendations, 1)) * 4 : 0);

    results.push({
      rank: 0,
      community: source.name,
      source_title: title,
      url,
      published_at: scannedAt,
      views,
      comments,
      recommendations,
      metrics_visible: metricsVisible,
      category: categoryFor(title),
      topic: title,
      summary: title,
      why_trending: rules.why,
      x_angle: rules.angle,
      x_hook: rules.hook,
      fact_check_status: 'partial',
      fact_check_note: '공개 인기글 페이지의 제목과 화면에 표시된 반응 수치만 확인했습니다. 원문 내용은 게시물에서 다시 확인하세요.',
      risk_level: metricsVisible ? 'low' : 'medium',
      risk_factors: metricsVisible ? [] : ['조회·댓글·추천 수치 일부가 공개되지 않음'],
      related_sources: [],
      trend_score: Math.round(score * 10) / 10,
    });
    position += 1;
  }

  return results;
}

async function fetchSource(source: SourceConfig, scannedAt: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 9000);
  try {
    const response = await fetch(source.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LunaTrendRadar/1.0; +https://lunakim-studio.vercel.app)',
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.6',
      },
      redirect: 'follow',
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const html = await response.text();
    if (html.length < 1000) throw new Error('empty page');
    return extractLinks(html, source, scannedAt);
  } finally {
    clearTimeout(timeout);
  }
}

function dedupe(items: TrendItem[]) {
  const seenUrls = new Set<string>();
  const seenTitles = new Set<string>();
  return items.filter((item) => {
    const urlKey = item.url.replace(/[?#].*$/, '').replace(/\/$/, '');
    const titleKey = item.source_title.replace(/[^0-9a-z가-힣]/gi, '').toLowerCase().slice(0, 45);
    if (seenUrls.has(urlKey) || (titleKey.length > 12 && seenTitles.has(titleKey))) return false;
    seenUrls.add(urlKey);
    seenTitles.add(titleKey);
    return true;
  });
}

function send(response: ResponseLike, payload: unknown, status = 200, cacheable = false) {
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('X-Luna-Radar-Build', BUILD);
  response.setHeader('Cache-Control', cacheable ? 'public, s-maxage=1800, stale-while-revalidate=3600' : 'no-store');
  response.status(status).json(payload);
}

export default async function handler(request: RequestLike, response: ResponseLike) {
  if (request.method && request.method !== 'GET') return send(response, { error: 'GET 요청만 지원합니다.', build: BUILD }, 405);

  const nowMs = Date.now();
  if (cache && cache.expires > nowMs) return send(response, { ...cache.payload, cached: true }, 200, true);

  const now = new Date();
  const scannedAt = now.toISOString();
  const settled = await Promise.allSettled(SOURCES.map((source) => fetchSource(source, scannedAt)));
  const failedSources: string[] = [];
  const gathered: TrendItem[] = [];

  settled.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value.length > 0) gathered.push(...result.value);
    else failedSources.push(SOURCES[index].name);
  });

  const successfulSources = SOURCES.length - failedSources.length;
  const items = dedupe(gathered)
    .filter((item) => item.views === null || item.views >= 10000 || item.comments === null || item.comments >= 30 || item.recommendations === null || item.recommendations >= 30)
    .sort((a, b) => b.trend_score - a.trend_score)
    .slice(0, 10)
    .map((item, index) => ({ ...item, rank: index + 1 }));

  const payload: Payload = {
    generated_at: scannedAt,
    range_start: new Date(nowMs - 24 * 60 * 60 * 1000).toISOString(),
    range_end: scannedAt,
    checked_sources: SOURCES.length,
    successful_sources: successfulSources,
    items,
    build: BUILD,
    mode: 'free-public-scraper',
    failed_sources: failedSources,
  };

  if (successfulSources === 0) {
    return send(response, {
      ...payload,
      error: '현재 모든 공개 인기글 페이지가 자동 수집 요청을 차단했어요. 잠시 뒤 다시 시도해 주세요.',
      code: 'all_sources_blocked',
    }, 502);
  }

  cache = { expires: nowMs + TTL, payload };
  return send(response, payload, 200, true);
}
