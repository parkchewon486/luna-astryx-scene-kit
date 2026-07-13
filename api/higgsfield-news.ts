type RequestLike = { method?: string };
type ResponseLike = {
  status(code: number): ResponseLike;
  setHeader(name: string, value: string): void;
  json(body: unknown): void;
};

type NewsItem = {
  title: string;
  description: string;
  category: string;
  url: string;
};

type GoogleTranslation = unknown;
type MemoryTranslation = { responseData?: { translatedText?: string } };

export const config = { runtime: 'nodejs', maxDuration: 10 };

function send(response: ResponseLike, body: unknown, status = 200) {
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=1800');
  response.status(status).json(body);
}

function decodeHtml(value: string) {
  return value
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&apos;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&nbsp;', ' ');
}

function plainText(html: string) {
  return decodeHtml(
    html
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' '),
  ).replace(/\s+/g, ' ').trim();
}

function collapseRepeatedTitle(value: string) {
  const text = value.replace(/^Open\s+/i, '').trim();
  const words = text.split(/\s+/);
  for (let size = 1; size <= Math.floor(words.length / 2); size += 1) {
    if (words.length % size !== 0) continue;
    const block = words.slice(0, size).join(' ');
    let repeated = true;
    for (let offset = size; offset < words.length; offset += size) {
      if (words.slice(offset, offset + size).join(' ') !== block) {
        repeated = false;
        break;
      }
    }
    if (repeated) return block;
  }
  return text;
}

function categoryFor(title: string, description: string) {
  const text = `${title} ${description}`.toLowerCase();
  if (/contest|challenge|prize|\$\d/.test(text)) return '콘테스트';
  if (/plugin|premiere|after effects|davinci|figma/.test(text)) return '플러그인';
  if (/model|seedream|gemini|seed audio|seedance|veo|kling|wan/.test(text)) return '새 모델';
  if (/app builder|explainer|studio|supercomputer|mcp|cli|canvas|influencer/.test(text)) return '새 기능';
  return '업데이트';
}

function extractNews(html: string) {
  const items: Array<NewsItem & { position: number }> = [];
  const seen = new Set<string>();
  const anchorPattern = /<a\b[^>]*href\s*=\s*(["'])(.*?)\1[^>]*>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;

  while ((match = anchorPattern.exec(html)) !== null) {
    const rawHref = decodeHtml(match[2]).trim();
    if (!rawHref || rawHref.startsWith('#') || rawHref.startsWith('mailto:') || rawHref.startsWith('javascript:')) continue;

    let url: URL;
    try {
      url = new URL(rawHref, 'https://higgsfield.ai/');
    } catch {
      continue;
    }
    if (url.hostname !== 'higgsfield.ai' && url.hostname !== 'www.higgsfield.ai') continue;
    if (/\/(privacy|terms|cookie|community|library|profile)(\/|$)/i.test(url.pathname)) continue;

    const text = plainText(match[3]).replace(/^Open\s+/i, '').trim();
    const colon = text.indexOf(':');
    if (colon < 4) continue;

    const title = collapseRepeatedTitle(text.slice(0, colon));
    const description = text.slice(colon + 1).trim();
    if (title.length < 4 || title.length > 120 || description.length < 12 || description.length > 360) continue;
    if (/your browser|loading the media|copyright|all rights reserved/i.test(`${title} ${description}`)) continue;

    const key = `${title.toLowerCase()}|${url.pathname}${url.search}`;
    if (seen.has(key)) continue;
    seen.add(key);
    items.push({
      title,
      description,
      category: categoryFor(title, description),
      url: url.toString(),
      position: match.index,
    });
  }

  return items
    .sort((a, b) => a.position - b.position)
    .slice(0, 6)
    .map(({ position: _position, ...item }) => item);
}

function parseGoogleTranslation(payload: GoogleTranslation) {
  if (!Array.isArray(payload) || !Array.isArray(payload[0])) return '';
  return payload[0]
    .map((part: unknown) => Array.isArray(part) && typeof part[0] === 'string' ? part[0] : '')
    .join('')
    .trim();
}

function hasKorean(value: string) {
  return /[가-힣]/.test(value);
}

async function translate(value: string) {
  if (!value || hasKorean(value)) return value;
  const text = value.slice(0, 700);

  try {
    const googleUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ko&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(googleUrl, { cache: 'no-store' });
    if (response.ok) {
      const translated = parseGoogleTranslation(await response.json());
      if (translated && hasKorean(translated)) return translated;
    }
  } catch {
    // Try the fallback provider below.
  }

  try {
    const memoryUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en%7Cko`;
    const response = await fetch(memoryUrl, { cache: 'no-store' });
    if (response.ok) {
      const payload = await response.json() as MemoryTranslation;
      const translated = payload.responseData?.translatedText?.trim() ?? '';
      if (translated && hasKorean(translated)) return translated;
    }
  } catch {
    // The item is omitted when Korean translation is unavailable.
  }

  return '';
}

async function translateItems(items: NewsItem[]) {
  const translated = await Promise.all(items.map(async (item) => {
    const [title, description] = await Promise.all([
      translate(item.title),
      translate(item.description),
    ]);
    return title && description ? { ...item, title, description } : null;
  }));
  return translated.filter((item): item is NewsItem => item !== null);
}

export default async function handler(request: RequestLike, response: ResponseLike) {
  if (request.method && request.method !== 'GET') {
    return send(response, { error: 'GET only' }, 405);
  }

  try {
    const page = await fetch('https://higgsfield.ai/', {
      cache: 'no-store',
      headers: {
        Accept: 'text/html,application/xhtml+xml',
        'User-Agent': 'Mozilla/5.0 (compatible; LunaSignal/1.0; +https://lunakim-studio.vercel.app)',
      },
    });
    if (!page.ok) throw new Error(`Higgsfield 응답 오류 ${page.status}`);

    const sourceItems = extractNews(await page.text());
    if (!sourceItems.length) throw new Error('Higgsfield 공식 업데이트를 찾지 못했어요.');

    const items = await translateItems(sourceItems);
    if (!items.length) throw new Error('Higgsfield 소식을 한국어로 옮기지 못했어요.');

    return send(response, {
      source: 'https://higgsfield.ai/',
      fetched_at: new Date().toISOString(),
      items,
    });
  } catch (error) {
    return send(response, {
      source: 'https://higgsfield.ai/',
      fetched_at: new Date().toISOString(),
      items: [],
      error: error instanceof Error ? error.message : 'Higgsfield 연결에 실패했어요.',
    }, 502);
  }
}
