// @ts-nocheck

type RequestLike = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string | string[] | undefined>;
};

type ResponseLike = {
  status(code: number): ResponseLike;
  setHeader(name: string, value: string): void;
  json(body: unknown): void;
};

type CameraView = {
  shot_size: string;
  camera_angle: string;
  viewpoint: string;
  lens_estimate: string;
  subject_distance: string;
  composition: string;
  depth_of_field: string;
};

type FrameAnalysis = {
  summary_ko: string;
  subject: string;
  environment: string;
  lighting: string;
  color_palette: string;
  materials: string;
  mood: string;
  medium: string;
  style: string;
  visible_text: string;
  aspect_ratio: string;
  camera_view: CameraView;
  negative_prompt: string[];
};

type ToolResult = {
  prompt: string;
  settings: string;
  note: string;
};

type ToolName = 'gemini' | 'gpt' | 'midjourney' | 'grok';

export const config = {
  runtime: 'nodejs',
  maxDuration: 60,
};

const BUILD_ID = 'frame-analysis-v1-20260714';
const MAX_DATA_URL_LENGTH = 3_800_000;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT = 8;
const rateBuckets = new Map<string, { count: number; resetAt: number }>();

const CAMERA_FIELDS: Array<keyof CameraView> = [
  'shot_size',
  'camera_angle',
  'viewpoint',
  'lens_estimate',
  'subject_distance',
  'composition',
  'depth_of_field',
];

const ANALYSIS_SCHEMA = {
  type: 'object',
  properties: {
    summary_ko: { type: 'string' },
    subject: { type: 'string' },
    environment: { type: 'string' },
    lighting: { type: 'string' },
    color_palette: { type: 'string' },
    materials: { type: 'string' },
    mood: { type: 'string' },
    medium: { type: 'string' },
    style: { type: 'string' },
    visible_text: { type: 'string' },
    aspect_ratio: { type: 'string' },
    camera_view: {
      type: 'object',
      properties: {
        shot_size: { type: 'string' },
        camera_angle: { type: 'string' },
        viewpoint: { type: 'string' },
        lens_estimate: { type: 'string' },
        subject_distance: { type: 'string' },
        composition: { type: 'string' },
        depth_of_field: { type: 'string' },
      },
      required: CAMERA_FIELDS,
      additionalProperties: false,
    },
    negative_prompt: {
      type: 'array',
      items: { type: 'string' },
    },
  },
  required: [
    'summary_ko',
    'subject',
    'environment',
    'lighting',
    'color_palette',
    'materials',
    'mood',
    'medium',
    'style',
    'visible_text',
    'aspect_ratio',
    'camera_view',
    'negative_prompt',
  ],
  additionalProperties: false,
};

function sendJson(response: ResponseLike, body: unknown, status = 200) {
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store, max-age=0');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('X-Frame-Analysis-Build', BUILD_ID);
  response.status(status).json(body);
}

function asString(value: unknown) {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return '';
}

function uniqueStrings(value: unknown) {
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(value.map(asString).filter(Boolean)));
}

function requestIp(request: RequestLike) {
  const forwarded = request.headers?.['x-forwarded-for'];
  const raw = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  return asString(raw).split(',')[0]?.trim() || 'unknown';
}

function rateLimited(request: RequestLike) {
  const key = requestIp(request);
  const now = Date.now();
  const current = rateBuckets.get(key);
  if (!current || current.resetAt <= now) {
    rateBuckets.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  current.count += 1;
  return current.count > RATE_LIMIT;
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

function parseJsonObject(text: string) {
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  try {
    const parsed = JSON.parse(cleaned);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
  } catch {
    // Extract the outer object below.
  }
  const first = cleaned.indexOf('{');
  const last = cleaned.lastIndexOf('}');
  if (first >= 0 && last > first) return JSON.parse(cleaned.slice(first, last + 1));
  throw new Error('이미지 분석 결과를 JSON으로 읽지 못했어요.');
}

function normalizeAnalysis(raw: Record<string, unknown>): FrameAnalysis {
  const cameraRaw = raw.camera_view && typeof raw.camera_view === 'object'
    ? raw.camera_view as Record<string, unknown>
    : {};
  return {
    summary_ko: asString(raw.summary_ko),
    subject: asString(raw.subject),
    environment: asString(raw.environment),
    lighting: asString(raw.lighting),
    color_palette: asString(raw.color_palette),
    materials: asString(raw.materials),
    mood: asString(raw.mood),
    medium: asString(raw.medium),
    style: asString(raw.style),
    visible_text: asString(raw.visible_text),
    aspect_ratio: asString(raw.aspect_ratio),
    camera_view: {
      shot_size: asString(cameraRaw.shot_size),
      camera_angle: asString(cameraRaw.camera_angle),
      viewpoint: asString(cameraRaw.viewpoint),
      lens_estimate: asString(cameraRaw.lens_estimate),
      subject_distance: asString(cameraRaw.subject_distance),
      composition: asString(cameraRaw.composition),
      depth_of_field: asString(cameraRaw.depth_of_field),
    },
    negative_prompt: uniqueStrings(raw.negative_prompt),
  };
}

function validateAnalysis(analysis: FrameAnalysis) {
  const missing: string[] = [];
  const topFields: Array<keyof Omit<FrameAnalysis, 'camera_view' | 'negative_prompt'>> = [
    'summary_ko',
    'subject',
    'environment',
    'lighting',
    'color_palette',
    'materials',
    'mood',
    'medium',
    'style',
    'visible_text',
    'aspect_ratio',
  ];
  topFields.forEach((field) => {
    if (!analysis[field]) missing.push(field);
  });
  CAMERA_FIELDS.forEach((field) => {
    if (!analysis.camera_view[field]) missing.push(`camera_view.${field}`);
  });
  if (analysis.negative_prompt.length < 6) missing.push('negative_prompt(minimum 6)');
  return missing;
}

function buildAnalysisPrompt(meta: Record<string, unknown>, repairFields: string[] = []) {
  const repair = repairFields.length
    ? `\nPrevious output failed validation. Correct every missing field: ${repairFields.join(', ')}.`
    : '';
  return `Analyze the uploaded reference image for a prompt-conversion product.

Goal: describe the visible image so a user can generate a new image with a closely matching visual language in Gemini, GPT Image, Midjourney, and Grok Imagine. Do not identify any real person, character, brand owner, photographer, or artist. Describe visual evidence only. Do not claim exact EXIF data.

Input metadata supplied by the browser:
- pixel width: ${asString(meta.width) || 'unknown'}
- pixel height: ${asString(meta.height) || 'unknown'}
- nearest supported aspect ratio: ${asString(meta.ratio) || 'unknown'}

Output rules:
1. Write summary_ko in natural Korean. Write every other descriptive value in concise, production-ready English.
2. subject must cover visible subject count, appearance, clothing or object form, pose/action, and notable details without naming identity.
3. environment, lighting, color_palette, materials, mood, medium, and style must be specific to this image.
4. visible_text must contain only clearly readable text. Use "none clearly readable" when uncertain.
5. aspect_ratio should use the supplied nearest supported ratio when available.
6. camera_view is mandatory and every field must be filled:
   - shot_size
   - camera_angle
   - viewpoint
   - lens_estimate
   - subject_distance
   - composition
   - depth_of_field
7. lens_estimate must explicitly say it is approximate, for example "approximately a 50mm-equivalent look; EXIF unavailable".
8. negative_prompt is mandatory. Return at least 8 concise English phrases tailored to the uploaded image. Include relevant anatomy, geometry, text/logo, lighting, material, duplication, perspective, and artifact risks. Do not return only vague terms such as "bad quality".
9. Do not add a request to edit the uploaded image. This analysis is for creating a new image inspired by the reference.
10. Return only the requested JSON object.${repair}`;
}

async function analyzeWithOpenAI(apiKey: string, imageDataUrl: string, meta: Record<string, unknown>, repairFields: string[] = []) {
  const model = process.env.OPENAI_FRAME_MODEL?.trim() || 'gpt-5.6';
  const openAiResponse = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      store: false,
      input: [
        {
          role: 'user',
          content: [
            { type: 'input_text', text: buildAnalysisPrompt(meta, repairFields) },
            { type: 'input_image', image_url: imageDataUrl },
          ],
        },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'frame_reference_analysis',
          strict: true,
          schema: ANALYSIS_SCHEMA,
        },
      },
    }),
  });

  const payload = await openAiResponse.json() as Record<string, unknown>;
  if (!openAiResponse.ok) {
    const errorObject = payload.error && typeof payload.error === 'object'
      ? payload.error as Record<string, unknown>
      : null;
    const message = asString(errorObject?.message) || '이미지 분석 API 요청이 실패했어요.';
    const error = new Error(message);
    error.status = openAiResponse.status;
    throw error;
  }

  const text = extractOutputText(payload);
  if (!text) throw new Error('이미지 분석 결과에 텍스트가 없어요.');
  return {
    analysis: normalizeAnalysis(parseJsonObject(text)),
    model,
  };
}

function safeRatio(value: string) {
  const supported = new Set(['1:1', '4:5', '3:4', '9:16', '16:9']);
  return supported.has(value) ? value : '4:5';
}

function gptSize(ratio: string) {
  if (ratio === '1:1') return '1024x1024';
  if (ratio === '16:9') return '1536x1024';
  return '1024x1536';
}

function grokRatio(ratio: string) {
  return ratio === '4:5' ? '3:4' : ratio;
}

function cameraLine(camera: CameraView) {
  return `${camera.shot_size}; ${camera.camera_angle}; ${camera.viewpoint}; ${camera.lens_estimate}; ${camera.subject_distance}; ${camera.composition}; ${camera.depth_of_field}`;
}

function buildToolResults(analysis: FrameAnalysis): Record<ToolName, ToolResult> {
  const ratio = safeRatio(analysis.aspect_ratio);
  const negatives = analysis.negative_prompt.join(', ');
  const camera = cameraLine(analysis.camera_view);

  const geminiPrompt = `Create a new ${analysis.medium} image using the uploaded image as visual reference. Recreate its visual language without copying an identity or inventing unreadable text.\n\nSubject: ${analysis.subject}\nEnvironment: ${analysis.environment}\nLighting: ${analysis.lighting}\nCamera view: ${camera}\nColor palette: ${analysis.color_palette}\nMaterials and texture: ${analysis.materials}\nMood and style: ${analysis.mood}; ${analysis.style}\nVisible text: ${analysis.visible_text}\n\nCompose for a ${ratio} aspect ratio. Keep the subject count, spatial relationships, lighting direction, perspective, and material behavior coherent. Avoid: ${negatives}.`;

  const gptPrompt = `Use the uploaded reference image as visual guidance to generate a new image.\n\nREFERENCE GOAL\nRecreate the reference image's composition, atmosphere, lighting behavior, color relationships, and photographic language without identifying or copying a real person's identity.\n\nSUBJECT\n${analysis.subject}\n\nENVIRONMENT\n${analysis.environment}\n\nLIGHTING\n${analysis.lighting}\n\nCAMERA VIEW\nShot size: ${analysis.camera_view.shot_size}\nCamera angle: ${analysis.camera_view.camera_angle}\nViewpoint: ${analysis.camera_view.viewpoint}\nLens look: ${analysis.camera_view.lens_estimate}\nSubject distance: ${analysis.camera_view.subject_distance}\nComposition: ${analysis.camera_view.composition}\nDepth of field: ${analysis.camera_view.depth_of_field}\n\nCOLOR, MATERIALS, AND STYLE\n${analysis.color_palette}; ${analysis.materials}; ${analysis.mood}; ${analysis.medium}; ${analysis.style}\n\nVISIBLE TEXT\n${analysis.visible_text}\n\nNEGATIVE PROMPT\nAvoid ${negatives}.\n\nOUTPUT\nAspect ratio ${ratio}. Preserve believable anatomy, perspective, lighting, reflections, textures, and scene geometry.`;

  const midjourneyPrompt = `${analysis.subject}, ${analysis.environment}, ${analysis.lighting}, ${analysis.color_palette}, ${analysis.materials}, ${analysis.mood}, ${analysis.medium}, ${analysis.style}, ${analysis.camera_view.shot_size}, ${analysis.camera_view.camera_angle}, ${analysis.camera_view.viewpoint}, ${analysis.camera_view.lens_estimate}, ${analysis.camera_view.subject_distance}, ${analysis.camera_view.composition}, ${analysis.camera_view.depth_of_field} --ar ${ratio} --no ${analysis.negative_prompt.join(' ')}`;

  const grokPrompt = `Using the uploaded reference image, generate a new image with the same visual language. Subject: ${analysis.subject}. Environment: ${analysis.environment}. Lighting: ${analysis.lighting}. Camera view: ${camera}. Color palette and materials: ${analysis.color_palette}; ${analysis.materials}. Mood and style: ${analysis.mood}; ${analysis.medium}; ${analysis.style}. Visible text: ${analysis.visible_text}. Use a ${grokRatio(ratio)} aspect ratio. Avoid ${negatives}.`;

  return {
    gemini: {
      prompt: geminiPrompt,
      settings: `response_format: image\naspect_ratio: ${ratio}\nimage_size: 2K`,
      note: 'Gemini 공식 가이드의 상세 장면 설명, 조명, 카메라 각도와 렌즈 순서를 반영했어요.',
    },
    gpt: {
      prompt: gptPrompt,
      settings: `action: generate\nsize: ${gptSize(ratio)}\nquality: high\ninput_fidelity: high`,
      note: 'GPT Image 참조 이미지 워크플로에 맞춰 분석 항목을 섹션으로 분리했어요.',
    },
    midjourney: {
      prompt: midjourneyPrompt,
      settings: `reference: Image Prompt or Style Reference\naspect ratio: --ar ${ratio}\nnegative: --no at prompt end`,
      note: 'Midjourney 공식 권장대로 시각 구절을 압축하고 --ar와 --no를 끝에 배치했어요.',
    },
    grok: {
      prompt: grokPrompt,
      settings: `model: grok-imagine-image-quality\naspect_ratio: ${grokRatio(ratio)}\nresolution: 2k\nreference images: 1`,
      note: ratio === '4:5'
        ? 'Grok Imagine 설정에는 가까운 세로 비율인 3:4를 제안했어요.'
        : 'Grok Imagine의 자연어 참조 이미지 방식과 설정값을 분리했어요.',
    },
  };
}

export default async function handler(request: RequestLike, response: ResponseLike) {
  if (request.method !== 'POST') {
    sendJson(response, { error: 'POST 요청만 지원합니다.' }, 405);
    return;
  }

  if (rateLimited(request)) {
    sendJson(response, { error: '이미지 분석 요청이 잠시 많아요. 10분 뒤 다시 시도해 주세요.' }, 429);
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    sendJson(response, { error: 'FRAME 분석용 OPENAI_API_KEY가 연결되지 않았어요.' }, 503);
    return;
  }

  const body = request.body && typeof request.body === 'object'
    ? request.body as Record<string, unknown>
    : {};
  const imageDataUrl = asString(body.image_data_url);
  const meta = body.meta && typeof body.meta === 'object'
    ? body.meta as Record<string, unknown>
    : {};

  if (!/^data:image\/(?:png|jpeg|webp);base64,/i.test(imageDataUrl)) {
    sendJson(response, { error: 'PNG, JPG 또는 WEBP 이미지만 분석할 수 있어요.' }, 400);
    return;
  }
  if (imageDataUrl.length > MAX_DATA_URL_LENGTH) {
    sendJson(response, { error: '분석용 이미지가 너무 커요. 더 작은 이미지로 다시 시도해 주세요.' }, 413);
    return;
  }

  try {
    let first = await analyzeWithOpenAI(apiKey, imageDataUrl, meta);
    let missing = validateAnalysis(first.analysis);
    let retried = false;

    if (missing.length) {
      retried = true;
      first = await analyzeWithOpenAI(apiKey, imageDataUrl, meta, missing);
      missing = validateAnalysis(first.analysis);
    }

    if (missing.length) {
      sendJson(response, {
        error: '카메라뷰 또는 네거티브 검사를 통과하지 못했어요.',
        missing_fields: missing,
        validation: {
          camera_view: false,
          negative_prompt: first.analysis.negative_prompt.length >= 6,
        },
      }, 502);
      return;
    }

    const results = buildToolResults(first.analysis);
    const outputMissing = (Object.entries(results) as Array<[ToolName, ToolResult]>)
      .flatMap(([tool, value]) => [
        !value.prompt ? `${tool}.prompt` : '',
        !value.settings ? `${tool}.settings` : '',
        !value.prompt.toLowerCase().includes('camera') && tool !== 'midjourney' ? `${tool}.camera_view` : '',
        !value.prompt.toLowerCase().includes('avoid') && !value.prompt.includes('--no') ? `${tool}.negative_prompt` : '',
      ])
      .filter(Boolean);

    if (outputMissing.length) {
      sendJson(response, {
        error: '도구별 출력 누락 검사를 통과하지 못했어요.',
        missing_fields: outputMissing,
      }, 502);
      return;
    }

    sendJson(response, {
      generated_at: new Date().toISOString(),
      model_used: first.model,
      retried,
      analysis: first.analysis,
      results,
      validation: {
        camera_view: true,
        camera_fields: CAMERA_FIELDS,
        negative_prompt: true,
        negative_count: first.analysis.negative_prompt.length,
        tool_outputs: true,
      },
      official_docs: {
        gemini: 'https://ai.google.dev/gemini-api/docs/image-generation',
        gpt: 'https://developers.openai.com/api/docs/guides/image-generation',
        midjourney: 'https://docs.midjourney.com/hc/en-us/articles/32023408776205-Prompt-Basics',
        grok: 'https://docs.x.ai/developers/model-capabilities/imagine',
      },
      build: BUILD_ID,
    });
  } catch (error) {
    const status = Number(error?.status);
    const safeStatus = status >= 400 && status < 500 ? status : 500;
    sendJson(response, {
      error: error instanceof Error ? error.message : 'FRAME 이미지 분석 중 오류가 발생했어요.',
    }, safeStatus);
  }
}
