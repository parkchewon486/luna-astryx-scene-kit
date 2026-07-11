type RequestLike = { method?: string; body?: unknown };
type ResponseLike = {
  status(code: number): ResponseLike;
  setHeader(name: string, value: string): void;
  json(body: unknown): void;
};

const ALLOWED_HOSTS = new Set([
  'pann.nate.com','www.fmkorea.com','fmkorea.com','gall.dcinside.com','bbs.ruliweb.com',
  'www.ppomppu.co.kr','ppomppu.co.kr','www.clien.net','clien.net','theqoo.net',
  'web.humoruniv.com','humoruniv.com','mlbpark.donga.com','www.instiz.net','instiz.net',
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
      const row = part as Record<string, unknown>;
      if (row.type === 'output_text' && typeof row.text === 'string') return row.text;
    }
  }
  return '';
}

function parseDraft(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return null;
  try {
    const parsed = JSON.parse(trimmed) as { status?: string; draft?: string; evidence?: string[] };
    if (parsed.status !== 'ok' || !parsed.draft || !Array.isArray(parsed.evidence) || parsed.evidence.length < 2) return null;
    return { draft: parsed.draft.trim(), evidence: parsed.evidence };
  } catch {
    return null;
  }
}

export default async function handler(request: RequestLike, response: ResponseLike) {
  if (request.method !== 'POST') return sendJson(response, { error: 'POST 요청만 지원합니다.' }, 405);

  const body = request.body && typeof request.body === 'object' ? request.body as Record<string, unknown> : {};
  const rawUrl = typeof body.url === 'string' ? body.url.trim() : '';
  const title = typeof body.title === 'string' ? body.title.trim() : '';

  let url: URL;
  try { url = new URL(rawUrl); } catch { return sendJson(response, { error: '원문 주소가 올바르지 않아요.' }, 400); }
  if (!['http:', 'https:'].includes(url.protocol) || !ALLOWED_HOSTS.has(url.hostname)) {
    return sendJson(response, { error: '허용된 공개 커뮤니티 주소만 분석할 수 있어요.' }, 400);
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return sendJson(response, { error: 'OpenAI API 키가 연결되지 않았어요.' }, 503);

  const prompt = `아래 원문 URL을 반드시 직접 열어 본문을 읽어라. 검색 결과 제목이나 미리보기 문구만으로 쓰지 마라.\n\n원문 URL: ${url.toString()}\n제목: ${title || '(제목 없음)'}\n\n작업:\n1. 원문 본문에서 확인되는 구체적 사실을 최소 2개 추출한다.\n2. 그 사실만 사용해 한국 X용 초안을 350~650자로 작성한다.\n3. 본문을 충분히 읽지 못했으면 초안을 만들지 않는다.\n4. 원문에 없는 상황, 댓글 반응, 감정, 결론을 지어내지 않는다.\n5. 마지막 문장은 자연스러운 질문 한 문장으로 끝낸다.\n6. 해시태그와 제목표는 넣지 않는다.\n\n반드시 아래 JSON만 출력한다.\n본문 확인 성공: {"status":"ok","evidence":["본문에서 확인한 사실1","본문에서 확인한 사실2"],"draft":"완성된 X 초안"}\n본문 확인 실패: {"status":"fail","evidence":[],"draft":""}`;

  try {
    const aiResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-5-mini',
        store: false,
        tools: [{
          type: 'web_search',
          search_context_size: 'high',
          filters: { allowed_domains: [url.hostname] },
          user_location: { type: 'approximate', country: 'KR', city: 'Seoul', region: 'Seoul' },
        }],
        tool_choice: 'auto',
        input: prompt,
      }),
    });

    const payload = await aiResponse.json() as Record<string, unknown>;
    if (!aiResponse.ok) {
      const error = payload.error && typeof payload.error === 'object' ? payload.error as Record<string, unknown> : null;
      return sendJson(response, { error: typeof error?.message === 'string' ? error.message : '원문 분석 요청에 실패했어요.' }, 502);
    }

    const result = parseDraft(extractOutputText(payload));
    if (!result) return sendJson(response, { error: '본문을 충분히 읽지 못해 초안을 만들지 않았어요.' }, 422);

    return sendJson(response, {
      draft: `${result.draft}\n\n원문: ${url.toString()}`,
      source_url: url.toString(),
      evidence: result.evidence,
      grounded: true,
    });
  } catch (error) {
    return sendJson(response, { error: error instanceof Error ? error.message : '원문 분석 중 오류가 생겼어요.' }, 500);
  }
}
