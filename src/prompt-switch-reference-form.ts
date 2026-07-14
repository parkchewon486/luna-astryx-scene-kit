type ReferenceTool = 'gemini' | 'gpt' | 'midjourney' | 'grok';

type ReferenceResult = {
  prompt: string;
  settings: string;
  note: string;
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

function referenceNegativeTerms(strength: 'normal' | 'strong') {
  const normal = ['extra fingers', 'malformed hands', 'duplicate subjects', 'unreadable text', 'watermark'];
  if (strength === 'normal') return normal;
  return [
    ...normal,
    'missing fingers',
    'fused limbs',
    'extra limbs',
    'warped clothing',
    'broken background geometry',
    'random logos',
    'captions',
  ];
}

function referenceIdentityEnglish(keepIdentity: boolean, keepWardrobe: boolean) {
  const parts: string[] = [];
  if (keepIdentity) {
    parts.push('Use the single uploaded reference image as the identity reference for the main subject. Match the reference person’s facial features, face shape, age impression, hairstyle, hair color, skin tone, and natural body proportions faithfully.');
  }
  if (keepWardrobe) {
    parts.push('Preserve the reference clothing design, colors, materials, fit, neckline, sleeve length, hemline, shoes, and accessories unless the original prompt explicitly requests a change.');
  }
  return parts.join(' ');
}

function referenceIdentityKorean(keepIdentity: boolean, keepWardrobe: boolean) {
  const parts: string[] = [];
  if (keepIdentity) {
    parts.push('함께 업로드한 레퍼런스 이미지 1장을 주인공의 정체성 기준으로 사용하세요. 레퍼런스 인물의 얼굴 특징, 얼굴형, 나이 인상, 헤어스타일, 머리색, 피부톤과 자연스러운 체형 비율을 충실하게 유지하세요.');
  }
  if (keepWardrobe) {
    parts.push('원본 프롬프트에서 변경을 요청하지 않은 한 레퍼런스의 의상 디자인, 색상, 소재, 핏, 네크라인, 소매 길이, 밑단, 신발과 액세서리를 유지하세요.');
  }
  return parts.join(' ');
}

function referenceGptSize(ratio: string) {
  if (ratio === '1:1') return '1024x1024';
  if (ratio === '16:9') return '1536x1024';
  return '1024x1536';
}

function buildReferenceResults(source: string, ratio: string, keepIdentity: boolean, keepWardrobe: boolean, strength: 'normal' | 'strong'): Record<ReferenceTool, ReferenceResult> {
  const avoid = referenceNegativeTerms(strength);
  const identityEn = referenceIdentityEnglish(keepIdentity, keepWardrobe);
  const identityKo = referenceIdentityKorean(keepIdentity, keepWardrobe);
  const referenceNoteKo = identityKo || '레퍼런스 이미지가 장면에 필요한 경우 원본 프롬프트의 지시를 우선해 사용하세요.';
  const referenceNoteEn = identityEn || 'Use the uploaded reference image only when it is relevant to the original prompt.';
  const faithfulFaceKo = keepIdentity ? ' 인물은 레퍼런스의 실제 얼굴 특징과 자연스러운 비율을 그대로 따르세요.' : '';
  const faithfulFaceEn = keepIdentity ? ' Keep the person’s appearance faithful to the reference without redesigning facial features.' : '';
  const midjourneyReference = keepIdentity
    ? `${referenceNoteEn} Keep the reference person’s natural facial features and proportions faithful.`
    : referenceNoteEn;

  const geminiPrompt = `${referenceNoteKo}\n원본 프롬프트의 인물 묘사와 장면 지시는 고쳐 쓰지 말고 그대로 실행하세요.${faithfulFaceKo} 레퍼런스 이미지는 선택한 유지 항목에만 사용하고, 장면·행동·배경·조명·카메라 지시는 아래 원문을 우선하세요.\n\n원본 프롬프트\n${source}\n\n출력 비율: ${ratio}\n제외: ${avoid.join(', ')}`;

  const gptPrompt = `Use one uploaded reference image together with this prompt.\n\nREFERENCE PRIORITY\n${referenceNoteEn}${faithfulFaceEn}\nUse the reference only for the selected preserved details. Follow the original prompt for the scene, action, environment, lighting, styling, and camera direction. Keep the original person description intact.\n\nORIGINAL PROMPT\n${source}\n\nOUTPUT\nAspect ratio: ${ratio}\nAvoid: ${avoid.join(', ')}.`;

  const midjourneyPrompt = `${midjourneyReference} Follow this original prompt without rewriting it: ${source} --ar ${ratio} --no ${avoid.join(', ')}`;

  const grokPrompt = `Use one uploaded reference image together with this prompt. ${referenceNoteEn}${faithfulFaceEn} Keep the original prompt unchanged and use it as the source of truth for the scene, action, environment, lighting, styling, and camera direction.\n\nORIGINAL PROMPT\n${source}\n\nAspect ratio: ${ratio}. Avoid ${avoid.join(', ')}.`;

  const commonNote = '원문은 재작성하지 않고, 각 AI에서 레퍼런스 이미지 1장을 함께 사용할 때 필요한 유지 지시만 덧붙였어요.';

  return {
    gemini: {
      prompt: geminiPrompt,
      settings: `reference images: 1\naspect_ratio: ${ratio}\nimage_size: 2K`,
      note: commonNote,
    },
    gpt: {
      prompt: gptPrompt,
      settings: `reference images: 1\nmode: image generation with reference\nsize: ${referenceGptSize(ratio)}\nquality: high`,
      note: commonNote,
    },
    midjourney: {
      prompt: midjourneyPrompt,
      settings: `reference image: attach 1 image with the prompt\naspect ratio: --ar ${ratio}\nparameters: prompt end only`,
      note: '레퍼런스 이미지 1장을 먼저 첨부한 뒤 이 프롬프트를 함께 사용하세요. 원문의 장면 묘사는 압축하거나 번역하지 않았어요.',
    },
    grok: {
      prompt: grokPrompt,
      settings: `reference images: 1\naspect_ratio: ${ratio}\nresolution: 2k`,
      note: commonNote,
    },
  };
}

function referenceSettingsLabel(tool: ReferenceTool) {
  if (tool === 'midjourney') return 'PARAMETERS';
  if (tool === 'gemini') return 'REFERENCE SETTINGS';
  return 'SETTINGS';
}

function referenceDocsUrl(tool: ReferenceTool) {
  if (tool === 'gemini') return 'https://ai.google.dev/gemini-api/docs/image-generation';
  if (tool === 'gpt') return 'https://developers.openai.com/api/docs/guides/image-generation';
  if (tool === 'midjourney') return 'https://docs.midjourney.com/hc/en-us/articles/32023408776205-Prompt-Basics';
  return 'https://docs.x.ai/developers/model-capabilities/imagine';
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
        <div class="promptSwitchOutputTop"><div><small>${label.toUpperCase()} PROMPT</small><strong>레퍼런스 1장용 프롬프트</strong></div><button type="button" data-switch-copy="${tool}">복사</button></div>
        <pre data-switch-prompt="${tool}">${escapeReferenceHtml(result.prompt)}</pre>
        <div class="promptSwitchSetting"><small>${referenceSettingsLabel(tool)}</small><pre>${escapeReferenceHtml(result.settings)}</pre></div>
        <p class="promptSwitchNote">${escapeReferenceHtml(result.note)}</p>
        <a href="${referenceDocsUrl(tool)}" target="_blank" rel="noreferrer">공식 사용법 보기 ↗</a>
      </article>`;
    }).join('')}`;
}

function decorateReferenceForm(root: HTMLElement) {
  root.dataset.referenceForm = '1';

  const identityLabel = root.querySelector<HTMLElement>('[data-switch-identity] + span');
  if (identityLabel) identityLabel.textContent = '레퍼런스 인물 사용';

  const wardrobeLabel = root.querySelector<HTMLElement>('[data-switch-wardrobe] + span');
  if (wardrobeLabel) wardrobeLabel.textContent = '레퍼런스 의상 유지';

  const negative = root.querySelector<HTMLSelectElement>('[data-switch-negative]');
  if (negative && root.dataset.referenceNegativeReady !== '1') {
    negative.value = 'normal';
    root.dataset.referenceNegativeReady = '1';
  }

  const inputCard = root.querySelector<HTMLElement>('.promptSwitchInputCard');
  const inputLabel = inputCard?.querySelector<HTMLElement>('label[for="prompt-switch-input"]');
  if (inputLabel && !inputCard?.querySelector('[data-reference-form-guide]')) {
    inputLabel.insertAdjacentHTML('afterend', '<div class="promptSwitchReferenceGuide" data-reference-form-guide><b>REFERENCE · 1 IMAGE</b><span>PROMPT SWITCH에는 이미지를 올리지 않아요. 실제 생성할 AI에 레퍼런스 이미지 1장을 먼저 첨부한 뒤 변환된 프롬프트를 함께 사용하세요.</span><small>인물이 없는 장면은 ‘레퍼런스 인물 사용’을 꺼 주세요.</small></div>');
  }

  const input = root.querySelector<HTMLTextAreaElement>('#prompt-switch-input');
  if (input) {
    input.placeholder = '원본 프롬프트를 그대로 붙여 넣어 주세요.\n\n실제 생성할 때는 각 AI에 레퍼런스 이미지 1장을 먼저 첨부합니다.';
  }
}

function bindReferenceForm(root: HTMLElement) {
  decorateReferenceForm(root);
  if (root.dataset.referenceFormBound === '1') return;
  root.dataset.referenceFormBound = '1';

  root.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    const run = target.closest<HTMLElement>('[data-switch-run]');
    if (!run) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    const input = root.querySelector<HTMLTextAreaElement>('#prompt-switch-input');
    const source = (input?.value ?? '').replace(/\r/g, '').trim();
    if (!source) {
      input?.focus();
      return;
    }

    const ratio = root.querySelector<HTMLSelectElement>('[data-switch-ratio]')?.value ?? '4:5';
    const keepIdentity = root.querySelector<HTMLInputElement>('[data-switch-identity]')?.checked ?? true;
    const keepWardrobe = root.querySelector<HTMLInputElement>('[data-switch-wardrobe]')?.checked ?? false;
    const strength = root.querySelector<HTMLSelectElement>('[data-switch-negative]')?.value === 'strong' ? 'strong' : 'normal';
    renderReferenceResults(root, buildReferenceResults(source, ratio, keepIdentity, keepWardrobe, strength));
    root.querySelector<HTMLElement>('[data-switch-result]')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
