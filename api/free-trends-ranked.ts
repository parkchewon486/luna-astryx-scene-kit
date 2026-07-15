type Req = { method?: string };
type Res = { status(code: number): Res; setHeader(name: string, value: string): void; json(body: unknown): void };
type Category = 'AI_TECH' | 'SOCIETY' | 'LIFESTYLE' | 'CONTENT';
type Parser = 'generic' | 'dc' | 'ruliweb' | 'ppomppu' | 'clien' | 'mlb' | 'nate';
type Source = { name: string; url: string; base: string; parser: Parser };
type Item = {
  rank: number; community: string; source_title: string; url: string; published_at: string;
  views: number | null; comments: number | null; recommendations: number | null; metrics_visible: boolean;
  category: Category; topic: string; summary: string; why_trending: string; x_angle: string; x_hook: string;
  fact_check_status: 'partial'; fact_check_note: string; risk_level: 'low'; risk_factors: string[];
  related_sources: string[]; trend_score: number;
};
type Diagnostic = {
  name: string; url: string; status: string; item_count: number; elapsed_ms: number; final_url?: string;
  http_status?: number; content_type?: string; html_bytes?: number; candidate_links?: number; message?: string;
};
type Extracted = { items: Item[]; candidates: number };

export const config = { runtime: 'nodejs', maxDuration: 60 };
const BUILD = 'radar-ranked-v1-20260715';
const TTL = 30 * 60 * 1000;
let cache: { expires: number; payload: Record<string, unknown> } | null = null;

const SOURCES: Source[] = [
  { name: '에펨코리아 포텐', url: 'https://www.fmkorea.com/best', base: 'https://www.fmkorea.com', parser: 'generic' },
  { name: '디시인사이드 실시간 베스트', url: 'https://gall.dcinside.com/board/lists/?id=dcbest', base: 'https://gall.dcinside.com', parser: 'dc' },
  { name: '루리웹 베스트', url: 'https://bbs.ruliweb.com/best', base: 'https://bbs.ruliweb.com', parser: 'ruliweb' },
  { name: '뽐뿌 인기글', url: 'https://www.ppomppu.co.kr/hot.php', base: 'https://www.ppomppu.co.kr', parser: 'ppomppu' },
  { name: '클리앙 추천글', url: 'https://www.clien.net/service/recommend', base: 'https://www.clien.net', parser: 'clien' },
  { name: '더쿠 HOT', url: 'https://theqoo.net/hot', base: 'https://theqoo.net', parser: 'generic' },
  { name: '웃긴대학 웃대', url: 'https://web.humoruniv.com/board/humor/list.html?table=pds', base: 'https://web.humoruniv.com', parser: 'generic' },
  { name: 'MLBPARK 불펜', url: 'https://mlbpark.donga.com/mp/best.php?b=bullpen&m=view', base: 'https://mlbpark.donga.com', parser: 'mlb' },
  { name: '인스티즈', url: 'https://www.instiz.net/pt', base: 'https://www.instiz.net', parser: 'generic' },
  { name: '네이트판', url: 'https://pann.nate.com/talk/ranking', base: 'https://pann.nate.com', parser: 'nate' },
];

const BLOCKED = ['성폭행', '몰카', '노출', '미성년자', '신상', '사망설', '불륜', '성관계', '혐오', '살인범', '매수 추천', '급등주', '코인 추천'];
const SKIP = ['로그인', '회원가입', '공지', '이용약관', '개인정보', '고객센터', '검색', '다음', '이전', '더보기', '메뉴', 'javascript'];

function text(html: string) {
  return html.replace(/<script\b[\s\S]*?<\/script>/gi, ' ').replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&#160;/gi, ' ').replace(/&amp;/gi, '&')
    .replace(/&quot;|&#34;/gi, '"').replace(/&#39;|&apos;/gi, "'").replace(/&lt;/gi, '<').replace(/&gt;/gi, '>')
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n))).replace(/\s+/g, ' ').trim();
}
function number(value?: string | null) { const m = value?.replace(/,/g, '').match(/\d+/); return m ? Number(m[0]) : null; }
function labeled(value: string, labels: string[]) {
  for (const label of labels) {
    const a = value.match(new RegExp(`${label}\\s*[:：]?\\s*([0-9][0-9,]*)`, 'i'));
    const b = value.match(new RegExp(`([0-9][0-9,]*)\\s*${label}`, 'i'));
    if (a || b) return Number((a?.[1] ?? b?.[1] ?? '0').replace(/,/g, ''));
  }
  return null;
}
function classValue(html: string, pattern: string) {
  for (const tag of ['td', 'span', 'div', 'em', 'strong']) {
    const m = html.match(new RegExp(`<${tag}\\b[^>]*class=["'][^"']*${pattern}[^"']*["'][^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
    if (m) return text(m[1]);
  }
  return '';
}
function absolute(href: string, source: Source) { try { const u = new URL(href.replace(/&amp;/gi, '&'), source.base); u.hash = ''; return /^https?:$/.test(u.protocol) ? u.toString() : ''; } catch { return ''; } }
function title(raw: string) { return text(raw).replace(/^\[[^\]]{1,12}\]\s*/, '').replace(/\s*\[[0-9,]+\]\s*$/, '').trim(); }
function valid(value: string) { return value.length >= 6 && value.length <= 140 && /[0-9A-Za-z가-힣]{5}/.test(value) && !/[�□]/.test(value) && !SKIP.some(x => value.toLowerCase().includes(x.toLowerCase())) && !BLOCKED.some(x => value.includes(x)); }
function category(value: string): Category {
  if (/(AI|인공지능|챗GPT|ChatGPT|제미나이|클로드|로봇|반도체|테크|스마트폰|애플|구글|오픈AI)/i.test(value)) return 'AI_TECH';
  if (/(정부|정책|사회|사건|교통|날씨|학교|직장|법원|경찰|경제)/i.test(value)) return 'SOCIETY';
  if (/(음식|카페|여행|건강|운동|육아|반려|집|패션|뷰티|생활)/i.test(value)) return 'LIFESTYLE';
  return 'CONTENT';
}
function block(html: string, start: number, end: number) {
  const lower = html.toLowerCase();
  for (const tag of ['tr', 'li', 'article']) {
    const a = lower.lastIndexOf(`<${tag}`, start), b = lower.indexOf(`</${tag}>`, end);
    if (a >= 0 && b >= end && b - a < 20000) return html.slice(a, b + tag.length + 3);
  }
  return html.slice(Math.max(0, start - 900), Math.min(html.length, end + 1400));
}
function score(pos: number, views: number | null, comments: number | null, recs: number | null) {
  return Math.round((114 - pos * 4 + Math.min(24, views ? Math.log10(views) * 5 : 0) + Math.min(18, comments ? Math.log10(comments) * 6 : 0) + Math.min(14, recs ? Math.log10(recs) * 5 : 0)) * 10) / 10;
}
function make(source: Source, value: string, url: string, scannedAt: string, pos: number, views: number | null, comments: number | null, recs: number | null): Item {
  const metrics = views !== null || comments !== null || recs !== null;
  const why = views !== null && views >= 10000 ? '짧은 시간 안에 많은 사람이 확인한 인기글 상위 소재예요.' : comments !== null && comments >= 100 ? '댓글 반응이 빠르게 커진 인기 소재예요.' : '해당 커뮤니티 인기 목록 상위에 올라온 소재예요.';
  return { rank: 0, community: source.name, source_title: value, url, published_at: scannedAt, views, comments, recommendations: recs, metrics_visible: metrics,
    category: category(value), topic: value, summary: value, why_trending: why, x_angle: '인기 목록에서 반응이 커진 이유를 짧게 소개', x_hook: `지금 커뮤니티 인기 목록에 오른 이야기: ${value}`,
    fact_check_status: 'partial', fact_check_note: metrics ? '공개 인기 목록의 순위와 확인 가능한 반응 수치를 확인했습니다. 원문 내용은 게시물에서 다시 확인하세요.' : '공개 인기 목록의 상위 노출 순위를 확인했습니다. 세부 반응 수치는 원문에서 다시 확인하세요.',
    risk_level: 'low', risk_factors: [], related_sources: [], trend_score: score(pos, views, comments, recs) };
}

function rankedAnchors(html: string, source: Source, scannedAt: string, hrefRule: RegExp, metric: (b: string) => [number | null, number | null, number | null]): Extracted {
  const items: Item[] = [], seen = new Set<string>(); let candidates = 0, pos = 0, m: RegExpExecArray | null;
  const re = /<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  while ((m = re.exec(html)) && items.length < 12) {
    const url = absolute(m[1], source); if (!url || seen.has(url) || !hrefRule.test(url)) continue;
    const t = title(m[2]); if (!valid(t)) continue; candidates++;
    const [views, comments, recs] = metric(block(html, m.index, re.lastIndex));
    items.push(make(source, t, url, scannedAt, pos++, views, comments, recs)); seen.add(url);
  }
  return { items, candidates };
}
function extractDc(html: string, source: Source, scannedAt: string): Extracted {
  const items: Item[] = []; let candidates = 0, pos = 0, m: RegExpExecArray | null;
  const rows = /<tr\b[^>]*class=["'][^"']*ub-content[^"']*["'][^>]*>([\s\S]*?)<\/tr>/gi;
  while ((m = rows.exec(html)) && items.length < 12) {
    const row = m[0], a = row.match(/<a\b[^>]*href=["']([^"']*(?:\/board\/view\/|\/board\/view\?)[^"']*)["'][^>]*>([\s\S]*?)<\/a>/i); if (!a) continue;
    const url = absolute(a[1], source), t = title(a[2]); if (!url || !valid(t)) continue; candidates++;
    const views = number(classValue(row, 'gall_count')), recs = number(classValue(row, 'gall_recommend'));
    const comments = number(classValue(row, 'reply_num')) ?? number(text(row).match(/\[([0-9,]+)\]/)?.[1]);
    if ((views ?? 0) < 10000 && (comments ?? 0) < 30 && (recs ?? 0) < 30) continue;
    items.push(make(source, t, url, scannedAt, pos++, views, comments, recs));
  }
  return { items, candidates };
}
function extract(html: string, source: Source, scannedAt: string): Extracted {
  if (source.parser === 'dc') return extractDc(html, source, scannedAt);
  if (source.parser === 'ruliweb') return rankedAnchors(html, source, scannedAt, /\/(?:best|news)\/board\/\d+\/read\/\d+/i, b => [null, number(text(b).match(/\[([0-9,]+)\]/)?.[1]), null]);
  if (source.parser === 'ppomppu') return rankedAnchors(html, source, scannedAt, /\/(?:zboard\/)?(?:view|read)\.php\?.*(?:id|no)=/i, b => { const t = text(b); return [labeled(t, ['조회']), number(t.match(/\[([0-9,]+)\]/)?.[1]) ?? labeled(t, ['댓글']), labeled(t, ['추천'])]; });
  if (source.parser === 'clien') return rankedAnchors(html, source, scannedAt, /\/service\/board\/[a-z0-9_-]+\/\d+/i, b => { const t = text(b); return [number(classValue(b, 'hit|view')) ?? labeled(t, ['조회']), number(classValue(b, 'reply|comment')) ?? number(t.match(/\[([0-9,]+)\]/)?.[1]), number(classValue(b, 'symph|recommend')) ?? labeled(t, ['공감', '추천'])]; });
  if (source.parser === 'mlb') return rankedAnchors(html, source, scannedAt, /\/mp\/b\.php\?.*\bb=bullpen\b.*\bid=\d+.*\bm=view\b/i, b => { const t = text(b); return [labeled(t, ['조회']), number(t.match(/\[([0-9,]+)\]/)?.[1]), null]; });
  if (source.parser === 'nate') return rankedAnchors(html, source, scannedAt, /\/talk\/\d+$/i, b => { const t = text(b); return [labeled(t, ['조회']), labeled(t, ['댓글']), labeled(t, ['추천'])]; });
  return rankedAnchors(html, source, scannedAt, /\/(?:best|hot|talk|board|view|read|bbs)[^\s]*\d/i, b => { const t = text(b); return [labeled(t, ['조회', 'view']), labeled(t, ['댓글', 'comment']) ?? number(t.match(/\[([0-9,]+)\]/)?.[1]), labeled(t, ['추천', '공감', 'like'])]; });
}
async function decodeResponse(r: Response) {
  const bytes = new Uint8Array(await r.arrayBuffer()), ct = r.headers.get('content-type') ?? '';
  const charset = ct.match(/charset\s*=\s*([^;\s]+)/i)?.[1]?.replace(/["']/g, '') ?? '';
  try { return new TextDecoder(/euc-kr|cp949|ks_c_5601/i.test(charset) ? 'euc-kr' : 'utf-8').decode(bytes); } catch { return new TextDecoder().decode(bytes); }
}
async function collect(source: Source, scannedAt: string): Promise<{ items: Item[]; diagnostic: Diagnostic }> {
  const started = Date.now(), controller = new AbortController(), timer = setTimeout(() => controller.abort(), 9000);
  try {
    const r = await fetch(source.url, { redirect: 'follow', signal: controller.signal, headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,*/*;q=0.8', 'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.6', 'Cache-Control': 'no-cache' } });
    const meta = { name: source.name, url: source.url, final_url: r.url || source.url, elapsed_ms: Date.now() - started, http_status: r.status, content_type: r.headers.get('content-type') ?? undefined };
    if (!r.ok) return { items: [], diagnostic: { ...meta, status: 'http_error', item_count: 0, message: `HTTP ${r.status}` } };
    const html = await decodeResponse(r), size = new TextEncoder().encode(html).length;
    if (size < 1000) return { items: [], diagnostic: { ...meta, status: 'empty_html', item_count: 0, html_bytes: size } };
    if (/(captcha|cloudflare|access denied|비정상적인 접근|접근이 제한|로봇이 아닙니다)/i.test(html)) return { items: [], diagnostic: { ...meta, status: 'blocked_page', item_count: 0, html_bytes: size } };
    const out = extract(html, source, scannedAt), status = out.items.length ? 'ok' : out.candidates ? 'parse_empty' : 'no_candidates';
    return { items: out.items, diagnostic: { ...meta, status, item_count: out.items.length, html_bytes: size, candidate_links: out.candidates, message: out.items.length ? '인기 목록 후보를 수집했습니다.' : '사이트별 URL 또는 지표 규칙을 통과하지 못했습니다.' } };
  } catch (e) {
    const timeout = e instanceof Error && e.name === 'AbortError';
    return { items: [], diagnostic: { name: source.name, url: source.url, status: timeout ? 'timeout' : 'network_error', item_count: 0, elapsed_ms: Date.now() - started, message: e instanceof Error ? e.message : 'network error' } };
  } finally { clearTimeout(timer); }
}
function unique(items: Item[]) {
  const urls = new Set<string>(), titles = new Set<string>();
  return items.filter(i => { const u = i.url.replace(/[?#].*$/, ''), t = i.source_title.replace(/[^0-9a-z가-힣]/gi, '').toLowerCase().slice(0, 45); if (urls.has(u) || (t.length > 12 && titles.has(t))) return false; urls.add(u); titles.add(t); return true; });
}
function ranking(items: Item[]) {
  const sorted = unique(items).sort((a, b) => b.trend_score - a.trend_score), picked: Item[] = [], urls = new Set<string>(), counts = new Map<string, number>();
  for (const i of sorted) { if (picked.length === 10) break; if (counts.has(i.community)) continue; picked.push(i); urls.add(i.url); counts.set(i.community, 1); }
  for (const i of sorted) { if (picked.length === 10) break; if (urls.has(i.url) || (counts.get(i.community) ?? 0) >= 3) continue; picked.push(i); urls.add(i.url); counts.set(i.community, (counts.get(i.community) ?? 0) + 1); }
  return picked.sort((a, b) => b.trend_score - a.trend_score).map((i, n) => ({ ...i, rank: n + 1 }));
}
function send(res: Res, body: unknown, status = 200, cacheable = false) { res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.setHeader('X-Luna-Radar-Build', BUILD); res.setHeader('Cache-Control', cacheable ? 'public, s-maxage=1800, stale-while-revalidate=3600' : 'no-store'); res.status(status).json(body); }
export default async function handler(req: Req, res: Res) {
  if (req.method && req.method !== 'GET') return send(res, { error: 'GET 요청만 지원합니다.', build: BUILD }, 405);
  const nowMs = Date.now(); if (cache && cache.expires > nowMs) return send(res, { ...cache.payload, cached: true }, 200, true);
  const scannedAt = new Date().toISOString(), results = await Promise.all(SOURCES.map(s => collect(s, scannedAt))), diagnostics = results.map(r => r.diagnostic);
  const items = ranking(results.flatMap(r => r.items)), successful = diagnostics.filter(d => d.status === 'ok').length;
  const payload = { generated_at: scannedAt, range_start: new Date(nowMs - 86400000).toISOString(), range_end: scannedAt, checked_sources: SOURCES.length, successful_sources: successful, items, build: BUILD, mode: 'free-public-scraper', failed_sources: diagnostics.filter(d => d.status !== 'ok').map(d => d.name), source_diagnostics: diagnostics };
  if (!successful || !items.length) return send(res, { ...payload, error: '현재 인기글 순위를 만들 만큼 수집된 커뮤니티가 없습니다.', code: 'all_sources_failed' }, 502);
  cache = { expires: nowMs + TTL, payload }; return send(res, payload, 200, true);
}
