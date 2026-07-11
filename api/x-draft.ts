type RequestLike = { method?: string; body?: unknown };
type ResponseLike = { status(code: number): ResponseLike; setHeader(name: string, value: string): void; json(body: unknown): void };

const ALLOWED_HOSTS = new Set([
  'pann.nate.com','www.fmkorea.com','gall.dcinside.com','bbs.ruliweb.com','www.ppomppu.co.kr',
  'www.clien.net','theqoo.net','web.humoruniv.com','mlbpark.donga.com','www.instiz.net',
]);

export const config = { runtime: 'nodejs', maxDuration: 60 };

function sendJson(response: ResponseLike, body: unknown, status = 200) {
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  response.status(status).json(body);
}

function extractOutputText(payload: unknown) {
  if (!payload || typeof payload !== 'object') return '';
  const record = payload as Record<string, unknown>;
  if (typeof record.output_text === 'string') return record.output_text;
  const output = Array.isArray(record.output) ? record.output : [];
  for (const item of output) {
    if (!item || typeof item !== 'object') continue;
    const content = Array.isArray((item as Record<string, unknown>).content)
      ? (item as Record<string, unknown>).content as unknown[] : [];
    for (const part of content) {
      if (!part || typeof part !== 'object') continue;
      const p = part as Record<string, unknown>;
      if (p.type === 'output_text' && typeof p.text === 'string') return p.text;
    }
  }
  return '';
}

function stripHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<\/p>|<\/div>|<\/li>|<\/article>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;|&#34;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<').replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function cleanText(text: string, title: string) {
  const blocked = ['로그인','회원가입','댓글','추천','신고','공유','목록','이전글','다음글','Copyright','개인정보처리방침','이용약관','광고'];
  const lines = text.split('\n').map((v) => v.trim()).filter((v) => v.length >= 2)
    .filter((v) => !blocked.some((w) => v === w || v.startsWith(`${w} `)));
  const joined = lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
  const titleOnly = joined.replace(title, '').trim();
  return titleOnly.slice(0, 14000);
}

async function fetchDirect(url: string, title: string) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1',
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.6',
        Referer: new URL(url).origin,
      },
      redirect: 'follow',
      signal: controller.signal,
    });
    if (!res.ok) return '';
    const html = await res.text();
    return cleanText(stripHtml(html), title);
  } catch {
    return '';
  } finally {
    clearTimeout(timer);
  }
}

async function fetchReader(url: string, title: string) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 18000);
  try {
    const readerUrl = `https://r.jina.ai/http://${url.replace(/^https?:\/\//, '')}`;
    const res = await fetch(readerUrl, {
      headers: { Accept: 'text/plain', 'X-Return-Format': 'markdown' },
      signal: controller.signal,
    });
    if (!res.ok) return '';
    const text = await res.text();
    return cleanText(text, title);
  } catch {
    return '';
  } finally {
    clearTimeout(timer);
  }
}

function hasEnoughBody(text: string, title: string) {
  const compact = text.replace(/\s+/g, ' ').trim();
  if (compact.length < 220) return false;
  const withoutTitle = compact.replace(title, '').trim();
  return withoutTitle.length >= 160;
}

export default async function handler(request: RequestLike, response: ResponseLike) {
  if (request.method !== 'POST') return sendJson(response, { error: 'POST 요청만 지원합니다.' }, 405);

  const body = request.body && typeof request.body === 'object' ? request.body as Record<string, unknown> : {};
  const rawUrl = typeof body.url === 'string' ? body.url.trim() : '';
  const title = typeof body.title === 'string' ? body.title.trim() : '';

  let url: URL;
  try { url = new URL(rawUrl); } catch { return sendJson(response, { error: '원문 주소가 올바르지 않아요.' }, 400); }
  if (!['http:','https:'].includes(url.protocol) || !ALLOWED_HOSTS.has(url.hostname)) {
    return sendJson(response, { error: '허용된 공개 커뮤니티 주소만 분석할 수 있어요.' }, 400);
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return sendJson(response, { error: 'OpenAI API 키가 연결되지 않았어요.' }, 503);

  try {
    let articleText = await fetchDirect(url.toString(), title);
    let method = 'direct';
    if (!hasEnoughBody(articleText, title)) {
      articleText = await fetchReader(url.toString(), title);
      method = 'reader';
    }
    if (!hasEnoughBody(articleText, title)) {
      return sendJson(response, { error: '원문 사이트가 본문 접근을 막아 내용을 읽지 못했어요.', code: 'SOURCE_BLOCKED' }, 422);
    }

    const prompt = `너는 한국 X 콘텐츠 편집자다. 아래 원문 본문을 읽고 바로 올릴 수 있는 X 초안을 작성해라.\n\n제목: ${title || '(제목 없음)'}\n원문 주소: ${url.toString()}\n원문 본문:\n${articleText}\n\n조건:\n- 본문에서 확인되는 구체적인 내용만 사용\n- 350~650자 한국어\n- 첫 문장은 강하게, 과장 금지\n- 실제 상황을 3~5문장으로 이해되게 정리\n- 당사자 주장과 확인된 사실 구분\n- 조롱, 신상 추측, 단정 금지\n- 마지막은 자연스러운 질문 1문장\n- 제목 되풀이 금지\n- 해시태그 금지\n- 출력은 완성된 초안만`;

    const aiResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-5-mini', store: false, input: prompt }),
    });
    const payload = await aiResponse.json() as Record<string, unknown>;
    if (!aiResponse.ok) {
      const err = payload.error && typeof payload.error === 'object' ? payload.error as Record<string, unknown> : null;
      return sendJson(response, { error: typeof err?.message === 'string' ? err.message : 'X 초안 생성에 실패했어요.' }, 502);
    }

    const draft = extractOutputText(payload).trim();
    if (!draft) return sendJson(response, { error: '생성된 초안을 읽지 못했어요.' }, 502);

    return sendJson(response, {
      draft: `${draft}\n\n원문: ${url.toString()}`,
      source_url: url.toString(),
      source_length: articleText.length,
      method,
    });
  } catch (error) {
    return sendJson(response, { error: error instanceof Error ? error.message : '원문 분석 중 오류가 생겼어요.' }, 500);
  }
}
