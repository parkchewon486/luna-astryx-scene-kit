// @ts-nocheck
const fs = require('fs');
const path = require('path');

type RequestLike = { method?: string };
type ResponseLike = {
  status(code: number): ResponseLike;
  setHeader(name: string, value: string): void;
  json(body: unknown): void;
};

export const config = { runtime: 'nodejs' };

export default function handler(request: RequestLike, response: ResponseLike) {
  if (request.method && request.method !== 'GET') {
    response.status(405).json({ error: 'GET 요청만 지원합니다.' });
    return;
  }

  try {
    const filePath = path.join(process.cwd(), 'public', 'data', 'trends.json');
    const payload = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    response.setHeader('Cache-Control', 'no-store, max-age=0');
    response.status(200).json(payload);
  } catch (error) {
    response.status(503).json({
      error: '저장된 핫이슈 데이터를 불러오지 못했어요.',
      detail: error instanceof Error ? error.message : String(error),
    });
  }
}
