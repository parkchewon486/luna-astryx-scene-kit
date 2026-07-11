type RequestLike = { method?: string; body?: unknown };
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

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    sendJson(response, { error: 'OpenAI API 키가 연결되지 않았어요.' }, 503);
    return;
  }

  try {
    const prompt = `너는 한국 X 콘텐츠 편집자다.

반드시 아래 원문 URL을 웹 검색 도구로 직접 확인하고, 검색 결과의 제목만 보고 쓰지 마라.
원문 URL: ${url.toString()}
제목 힌트: ${title || '(없음)'}

작업 순서:
1. 원문 페이지 또는 해당 글의 본문 내용을 확인한다.
2. 본문에서 구체적인 사실을 최소 2개 찾는다.
3. 확인한 사실만 사용해 한국 X용 글을 쓴다.
4. 본문을 확인하지 못했으면 초안을 만들지 말고 정확히 SOURCE_UNREADABLE만 출력한다.

작성 조건:
- 350~650자 한국어
- 첫 문장은 강하게, 과장 금지
- 실제 본문 내용을 3~5문장으로 정리
- 당사자 주장과 확인된 사실 구분
- 조롱, 신상 추측, 단정 금지
- 마지막에는 자연스러운 질문 1문장
- 원문 문장 장문 복사 금지
- 해시태그 금지
- 출력은 완성된 초안만`;

    const aiResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini',
        store: false,
        tools: [
          {
            type: 'web_search',
            search_context_size: 'high',
            filters: { allowed_domains: [url.hostname] },
          },
        ],
        tool_choice: 'auto',
        include: ['web_search_call.action.sources'],
        input: prompt,
      }),
    });

    const payload = await aiResponse.json() as Record<string, unknown>;
    if (!aiResponse.ok) {
      const error = payload.error && typeof payload.error === 'object'
        ? payload.error as Record<string, unknown>
        : null;
      sendJson(response, { error: typeof error?.message === 'string' ? error.message : '원문 분석 요청에 실패했어요.' }, 502);
      return;
    }

    const draft = extractOutputText(payload).trim();
    if (!draft || draft === 'SOURCE_UNREADABLE') {
      sendJson(response, { error: '본문을 확인하지 못했어요.' }, 422);
      return;
    }

    sendJson(response, {
      draft: `${draft}\n\n원문: ${url.toString()}`,
      source_url: url.toString(),
      method: 'web_search',
    });
  } catch (error) {
    sendJson(response, { error: error instanceof Error ? error.message : '원문 분석 중 오류가 생겼어요.' }, 500);
  }
}
