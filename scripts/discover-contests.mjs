import { readFile, writeFile } from 'node:fs/promises';

const DATA_PATH = 'public/data/contests.json';
const CANDIDATE_PATH = 'public/data/contest-candidates.json';
const USER_AGENT = 'Mozilla/5.0 (compatible; LunaContestDiscovery/1.0; +https://lunakim-studio.vercel.app)';
const FETCH_TIMEOUT_MS = 15_000;
const MAX_FEED_ITEMS = 18;
const MAX_OFFICIAL_LINKS = 8;
const MAX_VISIBLE_ADDITIONS = 5;
const MAX_CANDIDATES = 100;

const FEEDS = [
  {
    scope: 'domestic',
    query: '("AI 공모전" OR "생성형 AI 공모전" OR "AI 영상 공모전" OR "AI 쇼츠 공모전") when:21d',
    language: 'ko', country: 'KR', edition: 'KR:ko',
  },
  {
    scope: 'domestic',
    query: '("바이브코딩 챌린지" OR "AI 해커톤" OR "앱 공모전" OR "AI 콘텐츠 공모전") when:21d',
    language: 'ko', country: 'KR', edition: 'KR:ko',
  },
  {
    scope: 'overseas',
    query: '("generative AI competition" OR "AI film contest" OR "AI creator challenge") (deadline OR "open call") when:30d',
    language: 'en-US', country: 'US', edition: 'US:en',
  },
  {
    scope: 'overseas',
    query: '("AI hackathon" OR "AI app challenge" OR "AI startup competition") (global OR international) when:30d',
    language: 'en-US', country: 'US', edition: 'US:en',
  },
];

const MEDIA_OR_DISCOVERY_DOMAINS = [
  'news.google.com', 'naver.com', 'daum.net', 'youtube.com', 'youtu.be', 'instagram.com',
  'facebook.com', 'x.com', 'twitter.com', 'tiktok.com', 'yna.co.kr', 'newsis.com',
  'mk.co.kr', 'hankyung.com', 'etnews.com', 'zdnet.co.kr', 'chosun.com', 'joongang.co.kr',
  'donga.com', 'seoul.co.kr', 'khan.co.kr', 'fnnews.com', 'mt.co.kr', 'sedaily.com',
  'heraldcorp.com', 'asiae.co.kr', 'edaily.co.kr', 'aitimes.com', 'news1.kr', 'bloter.net',
  'contestkorea.com', 'wevity.com', 'all-con.co.kr', 'linkareer.com', 'thinkyou.co.kr',
];

const TRUSTED_PLATFORM_DOMAINS = [
  'toss.im', 'lguplus.com', 'coway.com', 'dacon.io', 'kaggle.com', 'itu.int',
  'aiforgood.itu.int', 'adobe.com', 'google.com', 'microsoft.com', 'openai.com',
  'huggingface.co', 'runwayml.com', 'higgsfield.ai', 'capcut.com', 'canva.com',
  'github.com', 'devpost.com', 'challenge.gov',
];

const CONTEST_PATTERN = /(공모전|콘테스트|챌린지|해커톤|페스티벌|경진대회|competition|contest|challenge|hackathon|open call|festival)/i;
const TOPIC_PATTERN = /(AI|인공지능|생성형|영상|숏폼|앱|웹|바이브코딩|로봇|데이터|스타트업|크리에이터|디자인|film|video|app|web|coding|creator|design|startup|machine learning)/i;
const DEADLINE_MARKER = /(마감|접수\s*기간|신청\s*기간|제출\s*기한|응모\s*기간|모집\s*기간|deadline|apply\s*by|applications?\s*(?:close|due)|submission\s*deadline|entries?\s*close|until)/ig;

function decodeXml(value = '') {
  return value
    .replace(/^<!\[CDATA\[|\]\]>$/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .trim();
}

function stripHtml(value = '') {
  return decodeXml(value)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tag(block, name) {
  const match = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, 'i'));
  return match ? decodeXml(match[1]) : '';
}

function normalizeTitle(value = '') {
  return stripHtml(value)
    .replace(/\s+-\s+[^-]{2,40}$/g, '')
    .replace(/[\[\]【】()（）]/g, ' ')
    .replace(/[^0-9a-z가-힣]+/gi, ' ')
    .toLowerCase()
    .replace(/\b(2025|2026|2027)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function canonicalUrl(value = '') {
  try {
    const url = new URL(value);
    url.hash = '';
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid'].forEach((key) => url.searchParams.delete(key));
    url.hostname = url.hostname.toLowerCase().replace(/^www\./, '');
    url.pathname = url.pathname.replace(/\/+$/, '') || '/';
    return url.toString();
  } catch {
    return '';
  }
}

function hostname(value = '') {
  try { return new URL(value).hostname.toLowerCase().replace(/^www\./, ''); } catch { return ''; }
}

function matchesDomain(host, domain) {
  return host === domain || host.endsWith(`.${domain}`);
}

function isMediaOrDiscovery(url) {
  const host = hostname(url);
  return MEDIA_OR_DISCOVERY_DOMAINS.some((domain) => matchesDomain(host, domain));
}

function officialDomainScore(url) {
  const host = hostname(url);
  if (!host || isMediaOrDiscovery(url)) return -10;
  let score = 0;
  if (/\.(go|or|ac)\.kr$/.test(host) || /\.(gov|edu|org)$/.test(host)) score += 4;
  if (TRUSTED_PLATFORM_DOMAINS.some((domain) => matchesDomain(host, domain))) score += 4;
  const path = (() => { try { return new URL(url).pathname.toLowerCase(); } catch { return ''; } })();
  if (/(newsroom|press|notice|event|competition|contest|challenge|campaign|hackathon|festival|program)/.test(path)) score += 2;
  return score;
}

function tokens(value) {
  return new Set(normalizeTitle(value).split(' ').filter((token) => token.length > 1));
}

function titleSimilarity(a, b) {
  const left = tokens(a);
  const right = tokens(b);
  if (!left.size || !right.size) return 0;
  let intersection = 0;
  for (const token of left) if (right.has(token)) intersection += 1;
  return intersection / Math.max(left.size, right.size);
}

function isDuplicate(candidate, contests) {
  const url = canonicalUrl(candidate.official_url || candidate.source_url);
  return contests.some((contest) => {
    const existingUrl = canonicalUrl(contest.official_url || contest.source_url);
    return (url && existingUrl && url === existingUrl)
      || titleSimilarity(candidate.title, contest.title) >= 0.78;
  });
}

async function fetchPage(url, timeoutMs = FETCH_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'text/html,application/xhtml+xml,application/rss+xml,application/xml;q=0.9,*/*;q=0.5',
        'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.7',
      },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return { text: await response.text(), url: response.url, status: response.status };
  } finally {
    clearTimeout(timer);
  }
}

function feedUrl(feed) {
  return `https://news.google.com/rss/search?q=${encodeURIComponent(feed.query)}&hl=${feed.language}&gl=${feed.country}&ceid=${feed.edition}`;
}

function parseFeed(xml, feed) {
  return [...xml.matchAll(/<item\b[\s\S]*?<\/item>/gi)]
    .slice(0, MAX_FEED_ITEMS)
    .map((match) => {
      const block = match[0];
      const source = tag(block, 'source');
      const rawTitle = tag(block, 'title');
      const escapedSource = source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const title = rawTitle.replace(new RegExp(`\\s+-\\s+${escapedSource}$`, 'i'), '').trim();
      return {
        title,
        link: tag(block, 'link'),
        published_at: tag(block, 'pubDate'),
        publisher: source,
        description: stripHtml(tag(block, 'description')),
        scope: feed.scope,
        feed_query: feed.query,
      };
    })
    .filter((item) => item.title && item.link && CONTEST_PATTERN.test(item.title) && TOPIC_PATTERN.test(item.title));
}

function metaContent(html, key) {
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name)=["']${key}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${key}["']`, 'i'),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return decodeXml(match[1]);
  }
  return '';
}

function pageTitle(html) {
  return metaContent(html, 'og:title') || decodeXml(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '');
}

function pageDescription(html) {
  return metaContent(html, 'og:description') || metaContent(html, 'description');
}

function extractLinks(html, baseUrl) {
  const links = [];
  for (const match of html.matchAll(/<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>/gi)) {
    try {
      const url = new URL(decodeXml(match[1]), baseUrl);
      if (!['http:', 'https:'].includes(url.protocol)) continue;
      const canonical = canonicalUrl(url.toString());
      if (canonical && !links.includes(canonical)) links.push(canonical);
    } catch {
      // Ignore malformed links.
    }
  }
  return links;
}

function parseNumericDate(year, month, day) {
  const y = Number(year);
  const m = Number(month);
  const d = Number(day);
  if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d) || m < 1 || m > 12 || d < 1 || d > 31) return null;
  const date = new Date(Date.UTC(y, m - 1, d, 14, 59, 59));
  return Number.isNaN(date.getTime()) ? null : date;
}

function inferYear(month, day, now) {
  let year = now.getUTCFullYear();
  const candidate = parseNumericDate(year, month, day);
  if (candidate && candidate.getTime() < now.getTime() - 45 * 86_400_000) year += 1;
  return year;
}

const MONTHS = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
};

function extractDates(text, now) {
  const dates = [];
  for (const match of text.matchAll(/(20\d{2})\s*[.\-/년]\s*(\d{1,2})\s*[.\-/월]\s*(\d{1,2})\s*일?/g)) {
    const date = parseNumericDate(match[1], match[2], match[3]);
    if (date) dates.push(date);
  }
  for (const match of text.matchAll(/(?<!\d)(\d{1,2})\s*월\s*(\d{1,2})\s*일/g)) {
    const year = inferYear(match[1], match[2], now);
    const date = parseNumericDate(year, match[1], match[2]);
    if (date) dates.push(date);
  }
  for (const match of text.matchAll(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2})(?:st|nd|rd|th)?(?:,\s*(20\d{2}))?/gi)) {
    const month = MONTHS[match[1].toLowerCase()];
    const year = match[3] ? Number(match[3]) : inferYear(month, match[2], now);
    const date = parseNumericDate(year, month, match[2]);
    if (date) dates.push(date);
  }
  for (const match of text.matchAll(/\b(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)(?:\s+(20\d{2}))?/gi)) {
    const month = MONTHS[match[2].toLowerCase()];
    const year = match[3] ? Number(match[3]) : inferYear(month, match[1], now);
    const date = parseNumericDate(year, month, match[1]);
    if (date) dates.push(date);
  }
  return dates;
}

function extractDeadline(text, now) {
  const snippets = [];
  for (const match of text.matchAll(DEADLINE_MARKER)) {
    snippets.push(text.slice(Math.max(0, match.index - 40), Math.min(text.length, match.index + 220)));
  }
  const candidates = snippets.flatMap((snippet) => extractDates(snippet, now));
  const future = candidates
    .filter((date) => date.getTime() > now.getTime() - 6 * 3_600_000)
    .filter((date) => date.getTime() < now.getTime() + 550 * 86_400_000)
    .sort((a, b) => a.getTime() - b.getTime());
  if (!future.length) return null;
  const near = future.filter((date) => date.getTime() <= future[0].getTime() + 120 * 86_400_000);
  return near[near.length - 1] || future[0];
}

function dateKey(date) {
  return date.toISOString().slice(0, 10);
}

function dDay(deadline, now) {
  const day = (value) => Math.floor(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()) / 86_400_000);
  return Math.max(0, day(deadline) - day(now));
}

function organizerFromText(text, url, publisher) {
  const match = text.match(/(?:주최(?:·주관)?|주관|organizer|organized by|hosted by)\s*[:：]?\s*([^|\n<>]{2,60})/i);
  if (match) return stripHtml(match[1]).replace(/\s{2,}/g, ' ').slice(0, 60);
  const host = hostname(url);
  if (host) return host.replace(/\.(com|co\.kr|go\.kr|or\.kr|org|net|io|ai)$/i, '');
  return publisher || '공식 주최기관';
}

function categoriesFor(text) {
  const categories = [];
  const add = (label) => { if (!categories.includes(label)) categories.push(label); };
  if (/(AI|인공지능|생성형|machine learning)/i.test(text)) add('AI');
  if (/(영상|숏폼|film|video|shorts?)/i.test(text)) add('AI 영상');
  if (/(앱|웹|바이브코딩|app|web|coding)/i.test(text)) add('앱·웹');
  if (/(해커톤|hackathon)/i.test(text)) add('해커톤');
  if (/(스타트업|startup|pitch)/i.test(text)) add('스타트업');
  if (/(디자인|이미지|art|design|photo)/i.test(text)) add('이미지·디자인');
  if (!categories.length) add('AI 콘텐츠');
  return categories.slice(0, 4);
}

function aiUsage(text) {
  if (/(AI\s*(활용|사용)\s*(필수|의무)|생성형\s*AI.{0,20}(필수|의무)|must\s+(?:use|include).{0,20}AI|AI-powered\s+solution\s+required)/i.test(text)) return 'required';
  return 'allowed_not_required';
}

function eligibilityFor(text, scope) {
  const patterns = [
    /(?:참가\s*대상|지원\s*자격|응모\s*자격)\s*[:：]?\s*([^|\n]{5,140})/i,
    /(?:eligibility|who can apply|open to)\s*[:：]?\s*([^|\n]{5,140})/i,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return stripHtml(match[1]).slice(0, 140);
  }
  return scope === 'domestic'
    ? '국내 참가 가능. 세부 자격은 공식 모집 페이지에서 확인'
    : '글로벌 참가 자격은 공식 모집 페이지에서 확인';
}

function prizeDisplay(text) {
  const korean = text.match(/(?:총\s*상금|상금)\s*[:：]?\s*([0-9,.]+\s*(?:억\s*원|천만\s*원|백만\s*원|만\s*원|만원|원))/i);
  if (korean) return korean[1].replace(/\s+/g, ' ').trim();
  const dollar = text.match(/(?:prize|prize pool|awards?)\s*[:：]?\s*(US\$|\$)\s*([0-9,.]+(?:\s*(?:million|thousand|M|K))?)/i);
  if (dollar) return `${dollar[1]}${dollar[2]}`;
  return '공식 페이지 확인';
}

function summaryFor(description, feedDescription, title) {
  const value = stripHtml(description || feedDescription || `${title} 참가자를 모집하는 공모전입니다.`);
  return value.length > 220 ? `${value.slice(0, 217).trim()}...` : value;
}

function isGloballyOpen(text) {
  return /(worldwide|global applicants?|open to all countries|international participants?|전 세계|국적 제한 없음|한국.*참가 가능)/i.test(text);
}

function pageSignals(html, url, feedItem, now) {
  const text = stripHtml(html);
  const title = pageTitle(html) || feedItem.title;
  const combined = `${title} ${pageDescription(html)} ${text.slice(0, 80_000)}`;
  const deadline = extractDeadline(combined, now);
  const relevant = CONTEST_PATTERN.test(combined) && TOPIC_PATTERN.test(combined);
  const officialScore = officialDomainScore(url);
  return { text: combined, title, description: pageDescription(html), deadline, relevant, officialScore };
}

async function resolveArticle(feedItem) {
  const page = await fetchPage(feedItem.link);
  const canonical = metaContent(page.text, 'og:url');
  const resolved = canonical ? canonicalUrl(canonical) : canonicalUrl(page.url);
  return { ...page, url: resolved || page.url };
}

async function findOfficialPage(article, feedItem, now) {
  const directSignals = pageSignals(article.text, article.url, feedItem, now);
  if (directSignals.relevant && directSignals.deadline && directSignals.officialScore >= 2 && !isMediaOrDiscovery(article.url)) {
    return { url: article.url, html: article.text, signals: directSignals };
  }

  const links = extractLinks(article.text, article.url)
    .filter((url) => !isMediaOrDiscovery(url))
    .sort((a, b) => officialDomainScore(b) - officialDomainScore(a))
    .slice(0, MAX_OFFICIAL_LINKS);

  for (const url of links) {
    try {
      const page = await fetchPage(url, 10_000);
      const canonical = metaContent(page.text, 'og:url');
      const finalUrl = canonical ? canonicalUrl(canonical) : canonicalUrl(page.url);
      const signals = pageSignals(page.text, finalUrl || page.url, feedItem, now);
      if (signals.relevant && signals.deadline && signals.officialScore >= 2) {
        return { url: finalUrl || page.url, html: page.text, signals };
      }
    } catch {
      // Keep checking the remaining links.
    }
  }

  return null;
}

function toContest(feedItem, official, now) {
  const { signals } = official;
  const deadline = signals.deadline;
  const text = signals.text;
  const scope = feedItem.scope === 'overseas' ? 'overseas' : 'domestic';
  const title = stripHtml(signals.title || feedItem.title).replace(/\s+[|｜-]\s+[^|｜-]{2,50}$/g, '').trim().slice(0, 140);
  const categories = categoriesFor(`${title} ${text.slice(0, 10_000)}`);
  const soloFriendly = /(개인\s*(참가|지원)|1인|individuals?|solo)/i.test(text);
  const beginnerFriendly = /(누구나|경력\s*무관|초보|beginners?|open to anyone)/i.test(text);
  const koreanEligible = scope === 'domestic' || isGloballyOpen(text);
  const prize = prizeDisplay(text);
  const deadlineIso = scope === 'domestic'
    ? `${dateKey(deadline)}T23:59:59+09:00`
    : dateKey(deadline);

  return {
    title,
    organizer: organizerFromText(text, official.url, feedItem.publisher),
    category: categories,
    official_url: official.url,
    source_url: feedItem.link,
    published_at: feedItem.published_at ? new Date(feedItem.published_at).toISOString().slice(0, 10) : dateKey(now),
    application_start: dateKey(now),
    deadline: deadlineIso,
    d_day: dDay(deadline, now),
    total_prize: { display: prize },
    top_prize: { display: '공식 페이지 확인' },
    eligibility: eligibilityFor(text, scope),
    team_allowed: /(팀|team|startup|기업)/i.test(text),
    submission_format: '제출 형식과 규격은 공식 모집 페이지에서 확인',
    ai_usage_status: aiUsage(text),
    ai_usage_note: aiUsage(text) === 'required' ? '공식 모집 페이지에서 AI 활용 조건을 확인함' : 'AI 관련 공모전으로 자동 확인됨. 세부 사용 조건은 원문 확인',
    required_assets: [],
    region: scope === 'domestic' ? '대한민국 · 공식 페이지 확인' : '글로벌 · 온라인 여부 확인',
    scope,
    korean_eligible: koreanEligible,
    status: 'open',
    summary: summaryFor(signals.description, feedItem.description, title),
    why_recommended: `${categories.join(' · ')} 분야의 새 모집 공고로 확인됐습니다. 참가 전 공식 페이지에서 세부 규격을 다시 확인하세요.`,
    difficulty: '확인 중',
    estimated_days: '3~14일',
    beginner_friendly: beginnerFriendly,
    solo_friendly: soloFriendly,
    recommendation_score: Math.min(86, 70 + (signals.officialScore * 2) + (prize !== '공식 페이지 확인' ? 4 : 0) + (soloFriendly ? 3 : 0)),
    fact_check_status: 'auto_verified_official',
    fact_check_note: '공개 검색 결과에서 발견한 뒤 공식 모집 페이지의 공모전 문구와 마감일을 자동 대조함',
    risk_factors: ['자동 발굴 항목이므로 접수 전 공식 원문 재확인 필요'],
    last_verified_at: now.toISOString(),
    auto_discovered: true,
    discovery_source: 'Google News RSS + official page cross-check',
  };
}

function candidateRecord(feedItem, reason, officialUrl = '') {
  return {
    title: feedItem.title,
    publisher: feedItem.publisher,
    source_url: feedItem.link,
    official_url: officialUrl,
    scope: feedItem.scope,
    discovered_at: new Date().toISOString(),
    reason,
    feed_query: feedItem.feed_query,
  };
}

async function readJson(path, fallback) {
  try { return JSON.parse(await readFile(path, 'utf8')); } catch { return fallback; }
}

const now = new Date();
const payload = await readJson(DATA_PATH, { generated_at: now.toISOString(), default_filters: { hide_closed: true }, contests: [] });
const candidatePayload = await readJson(CANDIDATE_PATH, { generated_at: now.toISOString(), candidates: [] });
const contests = Array.isArray(payload.contests) ? payload.contests : [];
const discoveredItems = [];
const feedErrors = [];

for (const feed of FEEDS) {
  try {
    const response = await fetchPage(feedUrl(feed));
    discoveredItems.push(...parseFeed(response.text, feed));
  } catch (error) {
    feedErrors.push({ query: feed.query, error: error instanceof Error ? error.message : 'feed_error' });
  }
}

const uniqueFeedItems = [];
for (const item of discoveredItems) {
  if (uniqueFeedItems.some((existing) => titleSimilarity(existing.title, item.title) >= 0.85)) continue;
  uniqueFeedItems.push(item);
}

const additions = [];
const pending = [];

for (const feedItem of uniqueFeedItems) {
  if (isDuplicate({ title: feedItem.title, source_url: feedItem.link }, [...contests, ...additions])) continue;
  let article;
  try {
    article = await resolveArticle(feedItem);
  } catch (error) {
    pending.push(candidateRecord(feedItem, `source_fetch_failed:${error instanceof Error ? error.message : 'unknown'}`));
    continue;
  }

  let official;
  try {
    official = await findOfficialPage(article, feedItem, now);
  } catch (error) {
    pending.push(candidateRecord(feedItem, `official_check_failed:${error instanceof Error ? error.message : 'unknown'}`, article.url));
    continue;
  }

  if (!official) {
    pending.push(candidateRecord(feedItem, 'official_page_or_deadline_not_verified', article.url));
    continue;
  }

  const contest = toContest(feedItem, official, now);
  if (contest.scope === 'overseas' && !contest.korean_eligible) {
    pending.push(candidateRecord(feedItem, 'overseas_korean_eligibility_not_verified', official.url));
    continue;
  }
  if (isDuplicate(contest, [...contests, ...additions])) continue;
  if (additions.length >= MAX_VISIBLE_ADDITIONS) {
    pending.push(candidateRecord(feedItem, 'visible_addition_limit', official.url));
    continue;
  }
  additions.push(contest);
}

const publishedKeys = new Set(additions.flatMap((item) => [canonicalUrl(item.official_url), normalizeTitle(item.title)]).filter(Boolean));
const mergedCandidates = [...pending, ...(Array.isArray(candidatePayload.candidates) ? candidatePayload.candidates : [])]
  .filter((candidate) => !publishedKeys.has(canonicalUrl(candidate.official_url || candidate.source_url)) && !publishedKeys.has(normalizeTitle(candidate.title)))
  .filter((candidate, index, array) => array.findIndex((other) => canonicalUrl(other.official_url || other.source_url) === canonicalUrl(candidate.official_url || candidate.source_url) || titleSimilarity(other.title, candidate.title) >= 0.85) === index)
  .slice(0, MAX_CANDIDATES);

const output = {
  ...payload,
  generated_at: now.toISOString(),
  discovery: {
    last_run_at: now.toISOString(),
    feeds_checked: FEEDS.length,
    feed_items_found: uniqueFeedItems.length,
    auto_added: additions.length,
    queued_for_review: pending.length,
    feed_errors: feedErrors,
  },
  contests: [...additions, ...contests],
};

const candidateOutput = {
  generated_at: now.toISOString(),
  review_required: true,
  candidates: mergedCandidates,
};

await writeFile(DATA_PATH, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
await writeFile(CANDIDATE_PATH, `${JSON.stringify(candidateOutput, null, 2)}\n`, 'utf8');
console.log(`Contest discovery finished: ${additions.length} auto-added, ${pending.length} queued, ${feedErrors.length} feed errors.`);
