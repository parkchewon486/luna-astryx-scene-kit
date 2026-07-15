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

type ExtractionResult = {
  items: TrendItem[];
  anchors_seen: number;
  candidate_links: number;
  metrics_links: number;
  threshold_links: number;
};

type SourceDiagnosticStatus =
  | 'ok'
  | 'http_error'
  | 'timeout'
  | 'empty_html'
  | 'blocked_page'
  | 'no_anchors'
  | 'no_candidate_links'
  | 'metrics_not_found'
  | 'below_threshold'
  | 'network_error'
  | 'parse_error';

type SourceDiagnostic = {
  name: string;
  url: string;
  final_url?: string;
  status: SourceDiagnosticStatus;
  item_count: number;
  elapsed_ms: number;
  http_status?: number;
  content_type?: string;
  html_bytes?: number;
  anchors_seen?: number;
  candidate_links?: number;
  metrics_links?: number;
  threshold_links?: number;
  message?: string;
};

type SourceResult = {
  items: TrendItem[];
  diagnostic: SourceDiagnostic;
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
  source_diagnostics: SourceDiagnostic[];
};

export const config = { runtime: 'nodejs', maxDuration: 60 };

const BUILD = 'radar-free-v4-source-diagnostics-20260715';
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
  '더보기', '메뉴', '댓글', '추천', '조회', '광고', 'javascript', '본문영역 바로가기',
  '아무거나질문', '실시간 베스트', '인기글', '랭킹',
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
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
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
      why: '공감과 추천 반응이 강한 글이에요.',
      angle: '추천이 몰린 공감 포인트를 중심으로 소개',
      hook: `추천이 빠르게 쌓인 오늘의 공감 소재: ${title}`,
    };
  }
  return {
    why: '공개 반응 수치가 기준을 넘긴 인기 소재예요.',
    angle: '확인 가능한 반응 수치를 중심으로 소개',
    hook: `지금 커뮤니티에서 반응이 커진 이야기: ${title}`,
  };
}

function isMalformedTitle(title: string) {
  if (!title) return true;
  if (/�|□|\\uFFFD|&#x?[0-9a-f]+;/i.test(title)) return true;
  const weirdCount = (title.match(/[?◇◆□�]/g) ?? []).length;
  if (weirdCount >= 2) return true;
  const readableCount = (title.match(/[0-9A-Za-z가-힣]/g) ?? []).length;
  return readableCount < 5;
}

function isNavigationUrl(url: string, source: SourceConfig) {
  try {
    const parsed = new URL(url);
    if (url === source.url) return true;
    if (/login|signup|member|notice/i.test(url)) return true;
    if (source.name === '네이트판' && !/^\/talk\/\d+/.test(parsed.pathname)) return true;
    if (/\/best\/?$|\/hot\/?$|\/ranking\/?$|\/board\/lists\/?$/i.test(parsed.pathname)) return true;
    return false;
  } catch {
    return true;
  }
}

function extractLinks(html: string, source: SourceConfig, scannedAt: string): ExtractionResult {
  const results: TrendItem[] = [];
  const anchorPattern = /<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;
  let position = 0;
  let anchorsSeen = 0;
  let candidateLinks = 0;
  let metricsLinks = 0;
  let thresholdLinks = 0;

  while ((match = anchorPattern.exec(html)) && results.length < 35) {
    anchorsSeen += 1;
    const href = match[1];
    const title = decodeHtml(match[2]);
    if (title.length < 8 || title.length > 120) continue;
    if (isMalformedTitle(title)) continue;
    if (SKIP_TEXT.some((word) => title.toLowerCase().includes(word.toLowerCase()))) continue;
    if (BLOCKED_WORDS.some((word) => title.includes(word))) continue;

    const url = absoluteUrl(href, source);
    if (!url || isNavigationUrl(url, source)) continue;
    candidateLinks += 1;

    const nearby = decodeHtml(html.slice(Math.max(0, match.index - 500), Math.min(html.length, anchorPattern.lastIndex + 700)));
    const views = parseNumber(nearby, ['조회', 'view', 'views']);
    const comments = parseNumber(nearby, ['댓글', 'comment', 'comments']);
    const recommendations = parseNumber(nearby, ['추천', '공감', 'like', 'likes']);
    const metricsVisible = views !== null || comments !== null || recommendations !== null;
    if (!metricsVisible) continue;
    metricsLinks += 1;

    const passesThreshold = (views !== null && views >= 10000)
      || (comments !== null && comments >= 30)
      || (recommendations !== null && recommendations >= 30);
    if (!passesThreshold) continue;
    thresholdLinks += 1;

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
      metrics_visible: true,
      category: categoryFor(title),
      topic: title,
      summary: title,
      why_trending: rules.why,
      x_angle: rules.angle,
      x_hook: rules.hook,
      fact_check_status: 'partial',
      fact_check_note: '공개 인기글 페이지의 제목과 반응 수치를 확인했습니다. 원문 내용은 게시물에서 다시 확인하세요.',
      risk_level: 'low',
      risk_factors: [],
      related_sources: [],
      trend_score: Math.round(score * 10) / 10,
    });
    position += 1;
  }

  return {
    items: results,
    anchors_seen: anchorsSeen,
    candidate_links: candidateLinks,
    metrics_links: metricsLinks,
    threshold_links: thresholdLinks,
  };
}

function looksBlocked(html: string) {
  return /(captcha|cloudflare|access denied|automated quer|비정상적인 접근|접근이 제한|로봇이 아닙니다|서비스 이용이 제한)/i.test(html);
}

function diagnosticStatus(extraction: ExtractionResult): SourceDiagnosticStatus {
  if (extraction.items.length > 0) return 'ok';
  if (extraction.anchors_seen === 0) return 'no_anchors';
  if (extraction.candidate_links === 0) return 'no_candidate_links';
  if (extraction.metrics_links === 0) return 'metrics_not_found';
  return 'below_threshold';
}

function diagnosticMessage(status: SourceDiagnosticStatus) {
  if (status === 'ok') return '기준을 통과한 인기글을 수집했습니다.';
  if (status === 'no_anchors') return 'HTML에서 일반 링크 태그를 찾지 못했습니다. 자바스크립트 렌더링 가능성이 있습니다.';
  if (status === 'no_candidate_links') return '링크는 있었지만 제목·URL 필터를 통과한 게시물 후보가 없었습니다.';
  if (status === 'metrics_not_found') return '게시물 후보는 있었지만 조회·댓글·추천 수치를 찾지 못했습니다.';
  if (status === 'below_threshold') return '반응 수치는 찾았지만 현재 인기 기준을 통과한 글이 없었습니다.';
  if (status === 'blocked_page') return '자동 수집 차단 또는 보안 확인 페이지가 반환됐습니다.';
  if (status === 'empty_html') return '응답 본문이 너무 짧아 정상 페이지로 보기 어렵습니다.';
  if (status === 'timeout') return '9초 안에 응답을 받지 못했습니다.';
  if (status === 'http_error') return '서버가 성공이 아닌 HTTP 상태를 반환했습니다.';
  if (status === 'parse_error') return 'HTML을 분석하는 과정에서 오류가 발생했습니다.';
  return '네트워크 요청 중 오류가 발생했습니다.';
}

async function fetchSource(source: SourceConfig, scannedAt: string): Promise<SourceResult> {
  const startedAt = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 9000);

  const baseDiagnostic = {
    name: source.name,
    url: source.url,
    item_count: 0,
  };

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

    const responseMeta = {
      ...baseDiagnostic,
      final_url: response.url || source.url,
      elapsed_ms: Date.now() - startedAt,
      http_status: response.status,
      content_type: response.headers.get('content-type') ?? undefined,
    };

    if (!response.ok) {
      return {
        items: [],
        diagnostic: {
          ...responseMeta,
          status: 'http_error',
          message: diagnosticMessage('http_error'),
        },
      };
    }

    const html = await response.text();
    const htmlBytes = new TextEncoder().encode(html).length;

    if (htmlBytes < 1000) {
      return {
        items: [],
        diagnostic: {
          ...responseMeta,
          elapsed_ms: Date.now() - startedAt,
          html_bytes: htmlBytes,
          status: 'empty_html',
          message: diagnosticMessage('empty_html'),
        },
      };
    }

    if (looksBlocked(html)) {
      return {
        items: [],
        diagnostic: {
          ...responseMeta,
          elapsed_ms: Date.now() - startedAt,
          html_bytes: htmlBytes,
          status: 'blocked_page',
          message: diagnosticMessage('blocked_page'),
        },
      };
    }

    try {
      const extraction = extractLinks(html, source, scannedAt);
      const status = diagnosticStatus(extraction);
      return {
        items: extraction.items,
        diagnostic: {
          ...responseMeta,
          elapsed_ms: Date.now() - startedAt,
          html_bytes: htmlBytes,
          status,
          item_count: extraction.items.length,
          anchors_seen: extraction.anchors_seen,
          candidate_links: extraction.candidate_links,
          metrics_links: extraction.metrics_links,
          threshold_links: extraction.threshold_links,
          message: diagnosticMessage(status),
        },
      };
    } catch (error) {
      return {
        items: [],
        diagnostic: {
          ...responseMeta,
          elapsed_ms: Date.now() - startedAt,
          html_bytes: htmlBytes,
          status: 'parse_error',
          message: error instanceof Error ? error.message : diagnosticMessage('parse_error'),
        },
      };
    }
  } catch (error) {
    const timedOut = error instanceof Error && error.name === 'AbortError';
    const status: SourceDiagnosticStatus = timedOut ? 'timeout' : 'network_error';
    return {
      items: [],
      diagnostic: {
        ...baseDiagnostic,
        elapsed_ms: Date.now() - startedAt,
        status,
        message: error instanceof Error ? error.message : diagnosticMessage(status),
      },
    };
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
  const sourceResults = await Promise.all(SOURCES.map((source) => fetchSource(source, scannedAt)));
  const sourceDiagnostics = sourceResults.map((result) => result.diagnostic);
  const failedSources = sourceDiagnostics
    .filter((diagnostic) => diagnostic.status !== 'ok')
    .map((diagnostic) => diagnostic.name);
  const gathered = sourceResults.flatMap((result) => result.items);

  const successfulSources = sourceDiagnostics.filter((diagnostic) => diagnostic.status === 'ok').length;
  const items = dedupe(gathered)
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
    source_diagnostics: sourceDiagnostics,
  };

  if (successfulSources === 0) {
    return send(response, {
      ...payload,
      error: '현재 모든 공개 인기글 페이지가 자동 수집 요청을 차단했거나 파싱 기준을 통과하지 못했어요.',
      code: 'all_sources_failed',
    }, 502);
  }

  cache = { expires: nowMs + TTL, payload };
  return send(response, payload, 200, true);
}
