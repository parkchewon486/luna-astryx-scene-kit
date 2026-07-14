type ReferenceTool = 'gemini' | 'gpt' | 'midjourney' | 'grok';

type ReferenceResult = {
  prompt: string;
  settings: string;
  note: string;
};

type PromptParts = {
  subject: string[];
  scene: string[];
  camera: string[];
  look: string[];
  text: string[];
  avoidSentences: string[];
  all: string[];
};

const REFERENCE_FORM_ROOT_ID = 'prompt-switch-root';
const referenceTools: Array<[ReferenceTool, string]> = [
  ['gemini', 'Gemini'],
  ['gpt', 'GPT'],
  ['midjourney', 'Midjourney'],
  ['grok', 'Grok'],
];

function escapeReferenceHtml(value: unknown) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function cleanSource(value: string) {
  return value
    .replace(/\r/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function cleanSentence(value: string) {
  return value
    .replace(/^[-•*\d.)\s]+/u, '')
    .replace(/\s+/g, ' ')
    .replace(/[。.!?！？]+$/u, '')
    .trim();
}

function tokenSet(value: string) {
  return new Set(
    value
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .split(/\s+/)
      .filter((token) => token.length > 1),
  );
}

function similarity(a: string, b: string) {
  const aa = tokenSet(a);
  const bb = tokenSet(b);
  if (!aa.size || !bb.size) return 0;
  let common = 0;
  aa.forEach((token) => { if (bb.has(token)) common += 1; });
  return common / Math.min(aa.size, bb.size);
}

function uniqueSentences(items: string[]) {
  const result: string[] = [];
  items.forEach((item) => {
    const cleaned = cleanSentence(item);
    if (!cleaned) return;
    const duplicateIndex = result.findIndex((existing) => similarity(existing, cleaned) >= 0.78);
    if (duplicateIndex < 0) {
      result.push(cleaned);
      return;
    }
    if (cleaned.length > result[duplicateIndex].length) result[duplicateIndex] = cleaned;
  });
  return result;
}

function splitSentences(source: string) {
  return uniqueSentences(
    cleanSource(source)
      .replace(/\n+/g, '. ')
      .split(/(?<=[。.!?！？])\s+|;\s*/u),
  );
}

function isAvoidSentence(sentence: string) {
  return /(금지|제외|없게|없도록|말아|않게|않도록|avoid|without|\bno\b|distort|extra finger|watermark|깨짐|오류)/i.test(sentence);
}

function analyzePrompt(source: string): PromptParts {
  const all = splitSentences(source);
  const parts: PromptParts = {
    subject: [], scene: [], camera: [], look: [], text: [], avoidSentences: [], all,
  };

  all.forEach((sentence) => {
    if (isAvoidSentence(sentence)) {
      parts.avoidSentences.push(sentence);
      return;
    }
    if (/(문구|텍스트|글자|로고|라벨|title|caption|typography)/i.test(sentence)) {
      parts.text.push(sentence);
      return;
    }
    if (/(아이폰|스마트폰|카메라|렌즈|구도|프레이밍|셀카|스냅|촬영|샷|클로즈업|전신|미디엄|광각|망원|심도|비율|aspect|portrait|close[- ]?up|full[- ]?body|composition)/i.test(sentence)) {
      parts.camera.push(sentence);
      return;
    }
    if (/(조명|빛|색감|필름|피부|질감|재질|리얼|실사|포토리얼|무드|분위기|채도|콘트라스트|그레인|lighting|color|texture|realistic|photoreal|mood|film)/i.test(sentence)) {
      parts.look.push(sentence);
      return;
    }
    if (/(인물|여성|남성|사람|캐릭터|주인공|모델|얼굴|헤어|머리|체형|의상|동물|제품|병|object|person|woman|man|character|subject)/i.test(sentence)) {
      parts.subject.push(sentence);
      return;
    }
    parts.scene.push(sentence);
  });

  return parts;
}

function stripRatio(value: string) {
  return value
    .replace(/(?:이미지\s*)?(?:비율|aspect ratio)?\s*[:：]?\s*\b\d{1,2}\s*[:：]\s*\d{1,2}\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/^\s*[,·/]\s*|\s*[,·/]\s*$/g, '')
    .trim();
}

function visualPhrase(value: string) {
  return stripRatio(value)
    .replace(/^(?:내|이|이건)\s*(?:캐릭터\s*)?(?:이미지|사진)(?:야|입니다|예요|이에요)?$/u, '')
    .replace(/^(?:나는|내가)\s+/u, '')
    .replace(/(?:이미지를?|사진을?|장면을?)\s*(?:만들어|생성해|그려)\s*(?:줘|주세요)?/gu, '')
    .replace(/(?:보고\s*싶어|원해|원합니다)$/u, '')
    .replace(/(?:나와야\s*해|표현해\s*줘|표현해\s*주세요|해\s*줘|해주세요|해줘)$/u, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/^\s*[,·/]\s*|\s*[,·/]\s*$/g, '')
    .trim();
}

function compactVisual(parts: PromptParts) {
  const ordered = [
    ...parts.subject,
    ...parts.scene,
    ...parts.camera,
    ...parts.look,
    ...parts.text,
  ]
    .map(visualPhrase)
    .filter(Boolean);

  return uniqueSentences(ordered).join(', ');
}

function lines(items: string[], fallback = '') {
  const cleaned = uniqueSentences(items.map(stripRatio)).filter(Boolean);
  return cleaned.length ? cleaned.map((item) => `- ${item}`).join('\n') : fallback;
}

function extractNoTerms(parts: PromptParts, addSafeguards: boolean) {
  const joined = parts.avoidSentences.join(' ').toLowerCase();
  const terms: string[] = [];
  const add = (condition: boolean, value: string) => { if (condition && !terms.includes(value)) terms.push(value); };

  add(/손|손가락|finger|hand/.test(joined), 'extra fingers');
  add(/중복|복제|duplicate/.test(joined), 'duplicate subjects');
  add(/글자|문구|텍스트|text|caption/.test(joined), 'unreadable text');
  add(/워터마크|watermark/.test(joined), 'watermark');
  add(/로고|logo/.test(joined), 'random logos');
  add(/왜곡|비대칭|distort|asymmetr/.test(joined), 'distorted anatomy');

  if (addSafeguards) {
    ['extra fingers', 'duplicate subjects', 'unreadable text', 'watermark'].forEach((term) => {
      if (!terms.includes(term)) terms.push(term);
    });
  }
  return terms;
}

function referenceIdentityKorean(keepIdentity: boolean, keepWardrobe: boolean) {
  const parts: string[] = [];
  if (keepIdentity) parts.push('첨부한 레퍼런스 이미지 속 주인공의 얼굴 특징, 얼굴형, 나이 인상, 헤어와 자연스러운 체형 비율을 동일하게 유지하세요.');
  if (keepWardrobe) parts.push('원문이 변경을 요구하지 않는 한 레퍼런스의 의상 디자인, 색상, 소재, 핏과 액세서리를 유지하세요.');
  return parts.join(' ');
}

function referenceIdentityEnglish(keepIdentity: boolean, keepWardrobe: boolean) {
  const parts: string[] = [];
  if (keepIdentity) parts.push('Treat the attached reference image as the authoritative identity source for the main subject. Preserve the same facial features, face shape, age impression, hairstyle, and natural body proportions.');
  if (keepWardrobe) parts.push('Preserve the reference wardrobe, colors, materials, fit, and accessories unless the brief explicitly changes them.');
  return parts.join(' ');
}

function gptSize(ratio: string) {
  if (ratio === '1:1') return '1024x1024';
  if (ratio === '4:5') return '1024x1280';
  if (ratio === '3:4') return '960x1280';
  if (ratio === '9:16') return '1152x2048';
  return '2048x1152';
}

function buildReferenceResults(
  source: string,
  ratio: string,
  keepIdentity: boolean,
  keepWardrobe: boolean,
  addSafeguards: boolean,
): Record<ReferenceTool, ReferenceResult> {
  const parts = analyzePrompt(source);
  const identityKo = referenceIdentityKorean(keepIdentity, keepWardrobe);
  const identityEn = referenceIdentityEnglish(keepIdentity, keepWardrobe);
  const noTerms = extractNoTerms(parts, addSafeguards);
  const compact = compactVisual(parts) || cleanSource(source);
  const explicitConstraints = lines(parts.avoidSentences);

  const geminiSections = [
    identityKo,
    '다음 요구를 하나의 이미지로 생성하세요. 이미지의 목적과 촬영 의도를 먼저 이해한 뒤, 아래 순서대로 세부 요소를 반영하세요.',
    `1. 주인공과 핵심 장면\n${lines([...parts.subject, ...parts.scene], `- ${compact}`)}`,
    parts.camera.length ? `2. 카메라와 화면 구성\n${lines(parts.camera)}` : '',
    parts.look.length ? `3. 빛·색감·질감\n${lines(parts.look)}` : '',
    parts.text.length ? `4. 화면 속 문구\n${lines(parts.text)}` : '',
    explicitConstraints ? `5. 지켜야 할 조건\n${explicitConstraints}` : '',
    `출력은 ${ratio} 비율로 구성하세요. 금지어를 반복하기보다 사용자가 원하는 상태를 긍정적으로 구현하세요.`,
  ].filter(Boolean).join('\n\n');

  const gptSections = [
    'Create a new image using the attached reference image and the brief below.',
    identityEn,
    `SUBJECT AND SCENE\n${lines([...parts.subject, ...parts.scene], `- ${compact}`)}`,
    parts.camera.length ? `CAMERA AND COMPOSITION\n${lines(parts.camera)}` : '',
    parts.look.length ? `LIGHTING, COLOR, AND SURFACE\n${lines(parts.look)}` : '',
    parts.text.length ? `VISIBLE TEXT\n${lines(parts.text)}` : '',
    explicitConstraints ? `CONSTRAINTS\n${explicitConstraints}` : '',
    `OUTPUT\n- Aspect ratio: ${ratio}\n- Preserve the brief's candidness, realism, and intentional imperfections. Do not add beauty retouching or editorial polish unless the brief asks for it.`,
  ].filter(Boolean).join('\n\n');

  const midjourneyParams = [
    `--ar ${ratio}`,
    keepIdentity ? '--ow 100' : '',
    noTerms.length ? `--no ${noTerms.join(', ')}` : '',
  ].filter(Boolean).join(' ');
  const midjourneyPrompt = `${compact} ${midjourneyParams}`.trim();

  const grokParts = [
    `Create a new ${ratio} image from the attached source image.`,
    keepIdentity ? 'Keep the same person, facial features, hairstyle, age impression, and natural proportions from the source image.' : '',
    keepWardrobe ? 'Keep the source wardrobe and accessories unless the request changes them.' : '',
    compact,
    explicitConstraints ? `Follow these constraints: ${parts.avoidSentences.join('; ')}.` : '',
  ].filter(Boolean).join(' ');

  return {
    gemini: {
      prompt: geminiSections,
      settings: `model: gemini-3.1-flash-image\ninput: text + 1 image\nresponse_format: image\naspect_ratio: ${ratio}\nimage_size: 2K`,
      note: 'Gemini 공식 가이드의 상세한 맥락, 단계별 지시, 카메라 언어, 긍정형 제약 방식을 반영했어요.',
    },
    gpt: {
      prompt: gptSections,
      settings: `model: gpt-image-2\nendpoint: images/edits\nreference images: 1\nsize: ${gptSize(ratio)}\nquality: high\ninput_fidelity: omit (automatic high fidelity)`,
      note: 'GPT Image의 참조 이미지 편집 워크플로와 자동 고충실도 입력 처리를 반영하고, 지시를 짧은 섹션으로 정리했어요.',
    },
    midjourney: {
      prompt: midjourneyPrompt,
      settings: `${keepIdentity ? 'reference type: Omni Reference (V7)' : 'reference type: Image Prompt'}\nreference images: 1\n${keepIdentity ? 'omni weight: --ow 100\n' : ''}aspect ratio: --ar ${ratio}\nparameters: prompt end only`,
      note: keepIdentity
        ? 'Midjourney 공식 가이드에 맞춰 짧은 시각 구절로 압축하고, 인물은 Omni Reference 1장과 기본 가중치로 연결했어요.'
        : 'Midjourney 공식 가이드에 맞춰 짧은 시각 구절과 끝부분 파라미터로 구성했어요.',
    },
    grok: {
      prompt: grokParts,
      settings: `model: grok-imagine-image-quality\nendpoint: images/edits\nsource image: 1\nimage field: URL, base64 data URI, or file_id\naspect ratio: requested in prompt (${ratio})`,
      note: 'xAI 이미지 편집 문서처럼 소스 이미지와 직접적인 자연어 변경 요청을 함께 쓰는 형태로 만들었어요.',
    },
  };
}

function referenceSettingsLabel(tool: ReferenceTool) {
  if (tool === 'midjourney') return 'OFFICIAL PARAMETERS';
  if (tool === 'gemini') return 'GEMINI SETTINGS';
  if (tool === 'gpt') return 'GPT IMAGE SETTINGS';
  return 'XAI EDIT SETTINGS';
}

function referenceDocsUrl(tool: ReferenceTool) {
  if (tool === 'gemini') return 'https://ai.google.dev/gemini-api/docs/image-generation';
  if (tool === 'gpt') return 'https://developers.openai.com/api/docs/guides/image-generation';
  if (tool === 'midjourney') return 'https://docs.midjourney.com/hc/en-us/articles/36285124473997-Omni-Reference';
  return 'https://docs.x.ai/developers/model-capabilities/images/editing';
}

function renderReferenceResults(root: HTMLElement, results: Record<ReferenceTool, ReferenceResult>) {
  const target = root.querySelector<HTMLElement>('[data-switch-result]');
  if (!target) return;

  target.innerHTML = `
    <div class="promptSwitchTabs" role="tablist">
      ${referenceTools.map(([tool, label], index) => `<button type="button" role="tab" data-switch-tool="${tool}" class="${index === 0 ? 'active' : ''}" aria-selected="${index === 0}">${label}</button>`).join('')}
    </div>
    ${referenceTools.map(([tool, label], index) => {
      const result = results[tool];
      return `<article class="promptSwitchOutput ${index === 0 ? 'active' : ''}" data-switch-output="${tool}">
        <div class="promptSwitchOutputTop"><div><small>${label.toUpperCase()} · OFFICIAL METHOD</small><strong>제조사 방식 변환 결과</strong></div><button type="button" data-switch-copy="${tool}">복사</button></div>
        <pre data-switch-prompt="${tool}">${escapeReferenceHtml(result.prompt)}</pre>
        <div class="promptSwitchSetting"><small>${referenceSettingsLabel(tool)}</small><pre>${escapeReferenceHtml(result.settings)}</pre></div>
        <p class="promptSwitchNote">${escapeReferenceHtml(result.note)}</p>
        <a href="${referenceDocsUrl(tool)}" target="_blank" rel="noreferrer">반영한 공식 문서 보기 ↗</a>
      </article>`;
    }).join('')}`;
}

function decorateReferenceForm(root: HTMLElement) {
  root.dataset.referenceForm = '2';

  const identityLabel = root.querySelector<HTMLElement>('[data-switch-identity] + span');
  if (identityLabel) identityLabel.textContent = '레퍼런스 인물 사용';

  const wardrobeLabel = root.querySelector<HTMLElement>('[data-switch-wardrobe] + span');
  if (wardrobeLabel) wardrobeLabel.textContent = '레퍼런스 의상 유지';

  const negative = root.querySelector<HTMLSelectElement>('[data-switch-negative]');
  if (negative) {
    const normal = negative.querySelector<HTMLOptionElement>('option[value="normal"]');
    const strong = negative.querySelector<HTMLOptionElement>('option[value="strong"]');
    if (normal) normal.textContent = '원문 제외만';
    if (strong) strong.textContent = '기본 오류 방지 추가';
    if (root.dataset.referenceNegativeReady !== '2') {
      negative.value = 'normal';
      root.dataset.referenceNegativeReady = '2';
    }
  }

  const inputCard = root.querySelector<HTMLElement>('.promptSwitchInputCard');
  const inputLabel = inputCard?.querySelector<HTMLElement>('label[for="prompt-switch-input"]');
  const existingGuide = inputCard?.querySelector<HTMLElement>('[data-reference-form-guide]');
  if (existingGuide) {
    existingGuide.innerHTML = '<b>OFFICIAL METHOD · 1 REFERENCE</b><span>실제 생성할 AI에 레퍼런스 이미지 1장을 먼저 첨부하세요. 같은 원문을 복사하지 않고 Gemini·GPT Image·Midjourney·Grok의 공식 사용법에 맞게 서로 다른 형태로 변환합니다.</span><small>기본값은 원문에 적힌 제외 조건만 사용합니다.</small>';
  } else if (inputLabel) {
    inputLabel.insertAdjacentHTML('afterend', '<div class="promptSwitchReferenceGuide" data-reference-form-guide><b>OFFICIAL METHOD · 1 REFERENCE</b><span>실제 생성할 AI에 레퍼런스 이미지 1장을 먼저 첨부하세요. 같은 원문을 복사하지 않고 Gemini·GPT Image·Midjourney·Grok의 공식 사용법에 맞게 서로 다른 형태로 변환합니다.</span><small>기본값은 원문에 적힌 제외 조건만 사용합니다.</small></div>');
  }

  const input = root.querySelector<HTMLTextAreaElement>('#prompt-switch-input');
  if (input) input.placeholder = '원본 프롬프트를 붙여 넣어 주세요.\n\n각 AI 제조사의 공식 프롬프트 방식으로 재구성합니다.';
}

function bindReferenceForm(root: HTMLElement) {
  decorateReferenceForm(root);
  if (root.dataset.referenceFormBound === '2') return;
  root.dataset.referenceFormBound = '2';

  root.addEventListener('click', async (event) => {
    const target = event.target as HTMLElement;
    const run = target.closest<HTMLElement>('[data-switch-run]');
    if (run) {
      event.preventDefault();
      event.stopImmediatePropagation();

      const input = root.querySelector<HTMLTextAreaElement>('#prompt-switch-input');
      const source = cleanSource(input?.value ?? '');
      if (!source) {
        input?.focus();
        return;
      }

      const ratio = root.querySelector<HTMLSelectElement>('[data-switch-ratio]')?.value ?? '4:5';
      const keepIdentity = root.querySelector<HTMLInputElement>('[data-switch-identity]')?.checked ?? true;
      const keepWardrobe = root.querySelector<HTMLInputElement>('[data-switch-wardrobe]')?.checked ?? false;
      const addSafeguards = root.querySelector<HTMLSelectElement>('[data-switch-negative]')?.value === 'strong';
      renderReferenceResults(root, buildReferenceResults(source, ratio, keepIdentity, keepWardrobe, addSafeguards));
      root.querySelector<HTMLElement>('[data-switch-result]')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return;
    }

    const toolButton = target.closest<HTMLButtonElement>('[data-switch-tool]');
    if (toolButton) {
      const tool = toolButton.dataset.switchTool as ReferenceTool;
      root.querySelectorAll<HTMLButtonElement>('[data-switch-tool]').forEach((button) => {
        const active = button.dataset.switchTool === tool;
        button.classList.toggle('active', active);
        button.setAttribute('aria-selected', String(active));
      });
      root.querySelectorAll<HTMLElement>('[data-switch-output]').forEach((output) => {
        output.classList.toggle('active', output.dataset.switchOutput === tool);
      });
      return;
    }

    const copy = target.closest<HTMLButtonElement>('[data-switch-copy]');
    if (copy) {
      const tool = copy.dataset.switchCopy as ReferenceTool;
      const prompt = root.querySelector<HTMLElement>(`[data-switch-prompt="${tool}"]`)?.textContent ?? '';
      if (!prompt) return;
      await navigator.clipboard.writeText(prompt);
      const original = copy.textContent;
      copy.textContent = '복사 완료';
      window.setTimeout(() => { copy.textContent = original; }, 1400);
    }
  }, true);

  const observer = new MutationObserver(() => decorateReferenceForm(root));
  observer.observe(root, { childList: true, subtree: true });
}

function mountReferenceForm() {
  const root = document.getElementById(REFERENCE_FORM_ROOT_ID) as HTMLElement | null;
  if (!root) return false;
  bindReferenceForm(root);
  return true;
}

function startReferenceForm() {
  if (mountReferenceForm()) return;
  const observer = new MutationObserver(() => {
    if (!mountReferenceForm()) return;
    observer.disconnect();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startReferenceForm, { once: true });
} else {
  startReferenceForm();
}
