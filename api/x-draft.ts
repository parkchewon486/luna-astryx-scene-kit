type RequestLike = {
  method?: string;
  body?: unknown;
};

type ResponseLike = {
  status(code: number): ResponseLike;
  setHeader(name: string, value: string): void;
  json(body: unknown): void;
};

const ALLOWED_HOSTS = new Set([
  'pann.nate.com',
  'www.fmkorea.com',
  'gall.dcinside.com',
  'bbs.ruliweb.com',
  'www.ppomppu.co.kr',
  'www.clien.net',
  'theqoo.net',
  'web.humoruniv.com',
  'mlbpark.donga.com',
  'www.instiz.net',
]);

export const config = { runtime: 'nodejs', maxDuration: 60 };

function sendJson(response: ResponseLike, body: unknown, status = 200) {
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  response.status(status).json(body);
}

function decodeHtml(value: string) {
  return value
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
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function pickArticleHtml(html: string, host: string) {
  const candidates = host === 'pann.nate.com'
    ? [
        /<div[^>]+id=["']contentArea["'][^>]*>([\s\S]*?)<\/div>\s*<div[^>]+class=["'][^"']*(?:talk_end|reply|comment)/i,
        /<div[^>]+class=["'][^"']*(?:posting|talk_view|view_content|content)[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
      ]
    : [
        /<article[^>]*>([\s\S]*?)<\/article>/i,
        /<div[^>]+class=["'][^"']*(?:article|post|content|view)[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
      ];

  for (const pattern of candidates) {
    const match = html.match(pattern);
    if (match?.[1] && match[1].length > 120) return match[1];
  }
  return html;
}

function cleanArticleText(text: string) {
  const blocked = [
    '로그인', '회원가입', '댓글', '추천', '신고', '공유', '목록', '이전글', '다음글',
    'Copyright', '개인정보처리방침', '이용약관', '광고',
  ];

  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length >= 2)
    .filter((line) => !blocked.some((word) => line === word || line.startsWith(`${word} `)))
    .join('\n')
    .slice(0, 12000);
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

export default async function handler(request: RequestLike, response: ResponseLike) {
  if (request.method !== 'POST') {
    sendJson(response, { error: 'POST 요청만 지원합니다.' }, 405);
    return;
  }

  const body = request.body && typeof request.body === 'object'
    ? request.body as Record<string, unknown>
    : {};
  const rawUrl = typeof body.url === 'string' ? body.url.trim() : '';
  const title = typeof body.title === 'string' ? body.title.trim() : '';

  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    sendJson(response, { error: '원문 주소가 올바르지 않아요.' }, 400);
    return;
  }

  if (!['http:', 'https:'].includes(url.protocol) || !ALLOWED_HOSTS.has(url.hostname)) {
    sendJson(response, { error: '허용된 공개 커뮤니티 주소만 분석할 수 있어요.' }, 400);
    return;
  }

  try {
    const sourceResponse = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LunaTrendRadar/1.0)',
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'ko-KR,ko;q=0.9',
      },
      redirect: 'follow',
    });

    if (!sourceResponse.ok) {
      sendJson(response, { error: `원문을 읽지 못했어요. HTTP ${sourceResponse.status}` }, 502);
      return;
    }

    const html = await sourceResponse.text();
    const articleText = cleanArticleText(decodeHtml(pickArticleHtml(html, url.hostname)));

    if (articleText.length < 120) {
      sendJson(response, { error: '원문 본문을 충분히 읽지 못했어요. 원문 보기에서 직접 확인해 주세요.' }, 422);
      return;
    }

    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) {
      sendJson(response, {
        error: 'X 초안을 만들 OpenAI API 키가 연결되지 않았어요.',
        article_excerpt: articleText.slice(0, 1200),
      }, 503);
      return;
    }

    const prompt = `너는 한국 X 콘텐츠 편집자다. 아래 공개 커뮤니티 원문을 읽고, 사실을 덧붙이지 말고 바로 수정해 올릴 수 있는 X 초안을 작성해라.

제목: ${title || '(제목 없음)'}
원문 주소: ${url.toString()}
원문 본문:\n${articleText}

작성 조건:
- 350~650자 한국어
- 첫 1~2문장은 시선을 끌되 과장 금지
- 사건·갈등의 실제 내용을 3~5문장으로 이해되게 정리
- 당사자 주장과 확인된 사실을 구분
- 무리한 판단, 조롱, 신상 추측 금지
- 마지막에는 독자가 의견을 남길 수 있는 자연스러운 한 문장
- 원문 문장을 길게 복사하지 말 것
- 제목만 되풀이하지 말 것
- 출력은 완성된 X 초안만. 설명, 제목표, 따옴표, 해시태그는 넣지 말 것`;

    const aiResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini',
        store: false,
        input: prompt,
      }),
    });

    const payload = await aiResponse.json() as Record<string, unknown>;
    if (!aiResponse.ok) {
      const error = payload.error && typeof payload.error === 'object'
        ? payload.error as Record<string, unknown>
        : null;
      sendJson(response, { error: typeof error?.message === 'string' ? error.message : 'X 초안 생성에 실패했어요.' }, 502);
      return;
    }

    const draft = extractOutputText(payload).trim();
    if (!draft) {
      sendJson(response, { error: '생성된 X 초안을 읽지 못했어요.' }, 502);
      return;
    }

    sendJson(response, {
      draft: `${draft}\n\n원문: ${url.toString()}`,
      source_url: url.toString(),
      source_length: articleText.length,
    });
  } catch (error) {
    sendJson(response, { error: error instanceof Error ? error.message : '원문 분석 중 오류가 생겼어요.' }, 500);
  }
}
