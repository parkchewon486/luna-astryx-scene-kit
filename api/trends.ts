// @ts-nocheck
const storedPayload = require('../public/data/trends.json');

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

  response.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  response.setHeader('CDN-Cache-Control', 'no-store');
  response.setHeader('Vercel-CDN-Cache-Control', 'no-store');
  response.status(200).json({
    ...storedPayload,
    served_at: new Date().toISOString(),
    api_build: 'trends-bundled-json-v1',
  });
}
