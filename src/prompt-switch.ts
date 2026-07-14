type SwitchTool = 'gemini' | 'gpt' | 'midjourney' | 'grok';
type SwitchMode = 'create' | 'edit';
type NegativeStrength = 'normal' | 'strong';

type SwitchOptions = {
  mode: SwitchMode;
  ratio: string;
  preserveIdentity: boolean;
  preserveWardrobe: boolean;
  negativeStrength: NegativeStrength;
};

type SwitchResult = {
  prompt: string;
  settings: string;
  note: string;
};

type RecentItem = {
  source: string;
  mode: SwitchMode;
  ratio: string;
  createdAt: number;
};

const ROOT_ID = 'prompt-switch-root';
const STORAGE_KEY = 'luna-prompt-switch-recent-v1';
const tools: Array<[SwitchTool, string]> = [
  ['gemini', 'Gemini'],
  ['gpt', 'GPT'],
  ['midjourney', 'Midjourney'],
  ['grok', 'Grok'],
];

const examples = [
  {
    title: '서울 여름밤 인물샷',
    tag: 'PHOTO',
    prompt: '여름밤 서울 골목을 걷는 성인 한국 여성. 애쉬브라운 헤어, 자연스러운 피부, 흰 셔츠와 데님. 후지필름 느낌, 4:5 비율. 얼굴과 헤어 유지. 손 오류와 글자 깨짐 금지.',
  },
  {
    title: '제품 광고 이미지',
    tag: 'AD',
    prompt: '투명한 탄산수 병을 주인공으로 한 여름 제품 광고. 병 중앙 라벨에는 정확히 "LUNA SPARKLING". 차가운 물방울, 밝은 자연광, 깨끗한 흰 배경, 1:1 비율. 다른 문구와 로고는 넣지 않는다.',
  },
  {
    title: '참조 이미지 수정',
    tag: 'EDIT',
    prompt: '업로드한 이미지에서 셔츠 색상만 깊은 검정으로 바꾼다. 얼굴, 헤어, 체형, 포즈, 배경, 조명, 원래 의상 핏은 그대로 유지한다.',
  },
];

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function normalize(value: string) {
  return value.replace(/\r/g, '').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
}

function negativeTerms(strength: NegativeStrength) {
  const normal = ['distorted hands', 'extra fingers', 'facial asymmetry', 'duplicate subjects', 'unreadable text', 'watermark'];
  if (strength === 'normal') return normal;
  return [
    ...normal,
    'missing fingers',
    'fused limbs',
    'crossed eyes',
    'waxy skin',
    'altered identity',
    'warped clothing',
    'broken background geometry',
    'random logos',
    'captions',
  ];
}

function preserveText(options: SwitchOptions) {
  const items: string[] = [];
  if (options.preserveIdentity) items.push('the exact facial identity, age impression, hairstyle, hair color, skin tone, and body proportions');
  if (options.preserveWardrobe) items.push('the exact clothing design, colors, materials, fit, neckline, sleeve length, hemline, shoes, and accessories');
  return items;
}

function compactMidjourney(source: string) {
  return normalize(source)
    .replace(/(이미지를?|사진을?|장면을?)?\s*(생성|제작|그려|만들어)\s*(줘|주세요|낸다|주세요\.)?/g, '')
    .replace(/해\s*주세요/g, '')
    .replace(/[。.!?]+/g, ',')
    .replace(/\n+/g, ', ')
    .replace(/,\s*,+/g, ', ')
    .replace(/^,\s*|,\s*$/g, '')
    .trim();
}

function mapGrokRatio(ratio: string) {
  if (ratio === '4:5') return { ratio: '3:4', note: 'Grok Imagine 공식 지원 비율에 맞춰 4:5를 3:4로 제안했어요.' };
  return { ratio, note: '' };
}

function mapGptSize(ratio: string) {
  if (ratio === '1:1') return '1024x1024';
  if (ratio === '16:9') return '1536x1024';
  return '1024x1536';
}

function convert(sourceValue: string, options: SwitchOptions): Record<SwitchTool, SwitchResult> {
  const source = normalize(sourceValue);
  const avoid = negativeTerms(options.negativeStrength);
  const preserves = preserveText(options);
  const preserveSentence = preserves.length ? `Preserve ${preserves.join(' and ')}.` : '';
  const editKeep = options.mode === 'edit' ? 'Keep everything else unchanged.' : '';
  const grokRatio = mapGrokRatio(options.ratio);
  const midjourneyNo = avoid.join(' ');
  const compact = compactMidjourney(source);

  const gptPrompt = options.mode === 'edit'
    ? `Edit the provided image.\n\nCHANGE ONLY\n${source}\n\nPRESERVE\n${preserveSentence || 'Preserve the original subject, composition, lighting, geometry, and background unless the requested change requires it.'}\n${editKeep}\n\nAVOID\nAvoid ${avoid.join(', ')}.`
    : `Create an image from the following creative brief.\n\nSCENE AND SUBJECT\n${source}\n\nCAMERA AND COMPOSITION\nCompose the image for a ${options.ratio} aspect ratio. Keep the subject, action, environment, lighting, materials, and visible text faithful to the brief.\n\nPRESERVE\n${preserveSentence || 'Keep all details explicitly marked as fixed or unchanged in the brief.'}\n\nAVOID\nAvoid ${avoid.join(', ')}.`;

  const geminiPrompt = options.mode === 'edit'
    ? `제공된 이미지를 수정해 주세요. 다음 변경만 적용하세요.\n\n${source}\n\n${preserveSentence ? `${preserveSentence}\n` : ''}그 밖의 인물, 배경, 조명, 카메라 위치, 배치와 세부 요소는 바꾸지 마세요. 이미지 비율은 ${options.ratio}로 유지하거나 설정해 주세요. ${avoid.join(', ')}가 생기지 않게 해 주세요.`
    : `다음 설명을 바탕으로 이미지를 만들어 주세요.\n\n${source}\n\n이미지는 ${options.ratio} 비율로 구성하고, 장면의 주인공·행동·장소·조명·색감·재질·문구를 입력 내용에 맞게 표현해 주세요. ${preserveSentence ? `${preserveSentence} ` : ''}${avoid.join(', ')}가 생기지 않게 해 주세요.`;

  const midjourneyPrompt = `${compact}${preserves.length ? `, preserve ${preserves.join(' and ')}` : ''} --ar ${options.ratio} --no ${midjourneyNo}`;

  const grokPrompt = options.mode === 'edit'
    ? `Edit the provided image. Apply only this change: ${source}\n\n${preserveSentence || 'Preserve the original subject, composition, lighting, background, and geometry.'} ${editKeep} Avoid ${avoid.join(', ')}.`
    : `Generate an image from this brief: ${source}\n\n${preserveSentence} Avoid ${avoid.join(', ')}.`;

  return {
    gemini: {
      prompt: geminiPrompt,
      settings: `response_format\naspect_ratio: ${options.ratio}\nimage_size: 2K`,
      note: options.mode === 'edit' ? '멀티턴 수정에 맞춰 변경할 내용과 유지할 내용을 분리했어요.' : '자연어 요청형으로 풀고 비율·해상도는 설정값으로 분리했어요.',
    },
    gpt: {
      prompt: gptPrompt,
      settings: `mode: ${options.mode === 'edit' ? 'edit' : 'generate'}\nsize: ${mapGptSize(options.ratio)}\nquality: high`,
      note: options.ratio === '4:5' ? 'GPT Image 지원 크기에 맞춰 세로형 1024x1536을 제안했어요.' : '장면 → 디테일 → 촬영 → 유지 → 제외 순서로 정리했어요.',
    },
    midjourney: {
      prompt: midjourneyPrompt,
      settings: `aspect ratio: --ar ${options.ratio}\ndefault version: current\nparameters: prompt end only`,
      note: '긴 요청을 시각 구절로 압축하고 제외 항목과 비율 파라미터를 맨 끝에 배치했어요.',
    },
    grok: {
      prompt: grokPrompt,
      settings: `model: grok-imagine-image-quality\naspect_ratio: ${grokRatio.ratio}\nresolution: 2k\nn: 1`,
      note: grokRatio.note || '프롬프트와 API 설정값을 나눴어요.',
    },
  };
}

function detectConflicts(source: string) {
  const warnings: string[] = [];
  const ratios = Array.from(source.matchAll(/\b(\d{1,2})\s*[:：]\s*(\d{1,2})\b/g)).map((match) => `${match[1]}:${match[2]}`);
  if (new Set(ratios).size > 1) warnings.push(`비율이 여러 개 보여요: ${Array.from(new Set(ratios)).join(', ')}`);
  if (/(클로즈업|close[- ]?up)/i.test(source) && /(전신|풀샷|full[- ]?body|wide shot)/i.test(source)) warnings.push('클로즈업과 전신 촬영이 함께 들어 있어요.');
  if (/(텍스트 없음|글자 없음|no text)/i.test(source) && /["“][^"”]+["”]/.test(source)) warnings.push('문구 삽입 요청과 텍스트 제외 요청이 함께 들어 있어요.');
  return warnings;
}

function readRecent(): RecentItem[] {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(value) ? value.slice(0, 3) : [];
  } catch {
    return [];
  }
}

function writeRecent(item: RecentItem) {
  const current = readRecent().filter((entry) => entry.source !== item.source);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([item, ...current].slice(0, 3)));
}

function template() {
  return `
    <section id="${ROOT_ID}" class="promptSwitchPanel" data-signal-group="prompt" aria-label="PROMPT SWITCH">
      <header class="promptSwitchHead">
        <div>
          <p class="promptSwitchEyebrow">PROMPT SWITCH · OFFICIAL GUIDE BASED</p>
          <h2>하나의 프롬프트를<br><span>4개 AI용으로 변환</span></h2>
          <p>Gemini · GPT · Midjourney · Grok이 잘 읽는 방식으로 문장과 설정값을 나눠 드려요.</p>
        </div>
        <div class="promptSwitchTools" aria-label="지원 도구">
          ${tools.map(([, label], index) => `<span><i>${index + 1}</i>${label}</span>`).join('')}
        </div>
      </header>

      <div class="promptSwitchWorkspace">
        <div class="promptSwitchInputCard">
          <label for="prompt-switch-input">내가 만든 프롬프트</label>
          <textarea id="prompt-switch-input" rows="9" placeholder="프롬프트를 그대로 붙여 넣어 주세요.&#10;&#10;예: 여름밤 서울 골목을 걷는 성인 한국 여성. 애쉬브라운 헤어, 자연스러운 피부, 흰 셔츠와 데님. 후지필름 느낌, 4:5 비율. 얼굴과 헤어 유지."></textarea>
          <div class="promptSwitchCount"><span data-switch-count>0</span>자</div>

          <div class="promptSwitchControls">
            <fieldset>
              <legend>작업</legend>
              <label><input type="radio" name="switch-mode" value="create" checked><span>새 이미지</span></label>
              <label><input type="radio" name="switch-mode" value="edit"><span>이미지 수정</span></label>
            </fieldset>
            <label class="promptSwitchSelect">비율
              <select data-switch-ratio>
                <option>1:1</option><option selected>4:5</option><option>3:4</option><option>9:16</option><option>16:9</option>
              </select>
            </label>
            <label class="promptSwitchCheck"><input type="checkbox" data-switch-identity checked><span>인물 유지</span></label>
            <label class="promptSwitchCheck"><input type="checkbox" data-switch-wardrobe><span>의상 유지</span></label>
            <label class="promptSwitchSelect">제외 강도
              <select data-switch-negative><option value="normal">보통</option><option value="strong">강하게</option></select>
            </label>
          </div>

          <div class="promptSwitchWarnings" data-switch-warnings hidden></div>
          <button type="button" class="promptSwitchRun" data-switch-run>4개 도구로 변환하기 <span>→</span></button>
        </div>

        <div class="promptSwitchResult" data-switch-result>
          <div class="promptSwitchEmpty">
            <b>SWITCH READY</b>
            <strong>프롬프트를 넣으면<br>도구별 결과가 여기에 열려요.</strong>
            <p>원문 내용은 지키고, 각 서비스의 공식 사용 방식에 맞게 다시 정리합니다.</p>
          </div>
        </div>
      </div>

      <section class="promptSwitchRecent" aria-label="최근 변환">
        <div class="promptSwitchSubhead"><div><small>RECENT</small><h3>최근 변환</h3></div><span>이 기기에 최대 3개 저장</span></div>
        <div class="promptSwitchRecentList" data-switch-recent></div>
      </section>

      <section class="promptSwitchPopular" aria-label="인기 프롬프트">
        <div class="promptSwitchSubhead"><div><small>QUICK START</small><h3>인기 프롬프트</h3></div><span>눌러서 바로 테스트</span></div>
        <div class="promptSwitchPopularGrid">
          ${examples.map((item, index) => `<button type="button" data-switch-example="${index}"><small>${item.tag}</small><strong>${item.title}</strong><p>${escapeHtml(item.prompt)}</p><span>이 프롬프트 사용 →</span></button>`).join('')}
        </div>
      </section>
    </section>`;
}

function renderRecent(root: HTMLElement) {
  const list = root.querySelector<HTMLElement>('[data-switch-recent]');
  if (!list) return;
  const recent = readRecent();
  list.innerHTML = recent.length
    ? recent.map((item, index) => `
      <button type="button" data-switch-recent-index="${index}">
        <small>${item.mode === 'edit' ? 'IMAGE EDIT' : 'IMAGE CREATE'} · ${escapeHtml(item.ratio)}</small>
        <strong>${escapeHtml(item.source.length > 82 ? `${item.source.slice(0, 82)}…` : item.source)}</strong>
        <span>다시 열기 →</span>
      </button>`).join('')
    : '<div class="promptSwitchNoRecent">첫 변환이 저장되면 여기서 바로 다시 열 수 있어요.</div>';
}

function settingsLabel(tool: SwitchTool) {
  if (tool === 'midjourney') return 'PARAMETERS';
  if (tool === 'gemini') return 'RESPONSE FORMAT';
  return 'SETTINGS';
}

function docsUrl(tool: SwitchTool) {
  if (tool === 'gemini') return 'https://ai.google.dev/gemini-api/docs/image-generation';
  if (tool === 'gpt') return 'https://developers.openai.com/api/docs/guides/image-generation';
  if (tool === 'midjourney') return 'https://docs.midjourney.com/hc/en-us/articles/32023408776205-Prompt-Basics';
  return 'https://docs.x.ai/developers/model-capabilities/images/generation';
}

function renderResult(root: HTMLElement, results: Record<SwitchTool, SwitchResult>, activeTool: SwitchTool = 'gemini') {
  const target = root.querySelector<HTMLElement>('[data-switch-result]');
  if (!target) return;
  target.innerHTML = `
    <div class="promptSwitchTabs" role="tablist">
      ${tools.map(([tool, label]) => `<button type="button" role="tab" data-switch-tool="${tool}" class="${tool === activeTool ? 'active' : ''}" aria-selected="${tool === activeTool}">${label}</button>`).join('')}
    </div>
    ${tools.map(([tool, label]) => {
      const result = results[tool];
      return `<article class="promptSwitchOutput ${tool === activeTool ? 'active' : ''}" data-switch-output="${tool}">
        <div class="promptSwitchOutputTop"><div><small>${label.toUpperCase()} PROMPT</small><strong>복사용 프롬프트</strong></div><button type="button" data-switch-copy="${tool}">복사</button></div>
        <pre data-switch-prompt="${tool}">${escapeHtml(result.prompt)}</pre>
        <div class="promptSwitchSetting"><small>${settingsLabel(tool)}</small><pre>${escapeHtml(result.settings)}</pre></div>
        <p class="promptSwitchNote">${escapeHtml(result.note)}</p>
        <a href="${docsUrl(tool)}" target="_blank" rel="noreferrer">공식 사용법 보기 ↗</a>
      </article>`;
    }).join('')}`;
}

function getOptions(root: HTMLElement): SwitchOptions {
  const checkedMode = root.querySelector<HTMLInputElement>('input[name="switch-mode"]:checked');
  return {
    mode: checkedMode?.value === 'edit' ? 'edit' : 'create',
    ratio: root.querySelector<HTMLSelectElement>('[data-switch-ratio]')?.value ?? '4:5',
    preserveIdentity: root.querySelector<HTMLInputElement>('[data-switch-identity]')?.checked ?? true,
    preserveWardrobe: root.querySelector<HTMLInputElement>('[data-switch-wardrobe]')?.checked ?? false,
    negativeStrength: root.querySelector<HTMLSelectElement>('[data-switch-negative]')?.value === 'strong' ? 'strong' : 'normal',
  };
}

function bind(root: HTMLElement) {
  if (root.dataset.switchBound === '1') return;
  root.dataset.switchBound = '1';
  const input = root.querySelector<HTMLTextAreaElement>('#prompt-switch-input');
  const count = root.querySelector<HTMLElement>('[data-switch-count]');
  const warnings = root.querySelector<HTMLElement>('[data-switch-warnings]');
  let currentResults: Record<SwitchTool, SwitchResult> | null = null;

  const refreshInput = () => {
    if (count) count.textContent = String(input?.value.length ?? 0);
    const conflicts = detectConflicts(input?.value ?? '');
    if (warnings) {
      warnings.hidden = conflicts.length === 0;
      warnings.innerHTML = conflicts.map((warning) => `<p>⚠ ${escapeHtml(warning)}</p>`).join('');
    }
  };

  input?.addEventListener('input', refreshInput);

  root.addEventListener('click', async (event) => {
    const target = event.target as HTMLElement;
    const run = target.closest<HTMLElement>('[data-switch-run]');
    if (run) {
      const source = normalize(input?.value ?? '');
      if (!source) {
        input?.focus();
        root.classList.add('promptSwitchNeedsInput');
        window.setTimeout(() => root.classList.remove('promptSwitchNeedsInput'), 700);
        return;
      }
      const options = getOptions(root);
      currentResults = convert(source, options);
      renderResult(root, currentResults);
      writeRecent({ source, mode: options.mode, ratio: options.ratio, createdAt: Date.now() });
      renderRecent(root);
      root.querySelector<HTMLElement>('[data-switch-result]')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return;
    }

    const toolButton = target.closest<HTMLButtonElement>('[data-switch-tool]');
    if (toolButton) {
      const tool = toolButton.dataset.switchTool as SwitchTool;
      root.querySelectorAll<HTMLButtonElement>('[data-switch-tool]').forEach((button) => {
        const active = button.dataset.switchTool === tool;
        button.classList.toggle('active', active);
        button.setAttribute('aria-selected', String(active));
      });
      root.querySelectorAll<HTMLElement>('[data-switch-output]').forEach((output) => output.classList.toggle('active', output.dataset.switchOutput === tool));
      return;
    }

    const copy = target.closest<HTMLButtonElement>('[data-switch-copy]');
    if (copy) {
      const tool = copy.dataset.switchCopy as SwitchTool;
      const prompt = root.querySelector<HTMLElement>(`[data-switch-prompt="${tool}"]`)?.textContent ?? currentResults?.[tool].prompt ?? '';
      if (!prompt) return;
      await navigator.clipboard.writeText(prompt);
      const original = copy.textContent;
      copy.textContent = '복사 완료';
      window.setTimeout(() => { copy.textContent = original; }, 1400);
      return;
    }

    const exampleButton = target.closest<HTMLButtonElement>('[data-switch-example]');
    if (exampleButton && input) {
      const item = examples[Number(exampleButton.dataset.switchExample)];
      if (!item) return;
      input.value = item.prompt;
      if (item.tag === 'EDIT') {
        const edit = root.querySelector<HTMLInputElement>('input[name="switch-mode"][value="edit"]');
        if (edit) edit.checked = true;
      }
      refreshInput();
      input.focus();
      root.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    const recentButton = target.closest<HTMLButtonElement>('[data-switch-recent-index]');
    if (recentButton && input) {
      const item = readRecent()[Number(recentButton.dataset.switchRecentIndex)];
      if (!item) return;
      input.value = item.source;
      const mode = root.querySelector<HTMLInputElement>(`input[name="switch-mode"][value="${item.mode}"]`);
      if (mode) mode.checked = true;
      const ratio = root.querySelector<HTMLSelectElement>('[data-switch-ratio]');
      if (ratio) ratio.value = item.ratio;
      refreshInput();
      root.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  renderRecent(root);
  refreshInput();
}

function mount() {
  const existing = document.getElementById(ROOT_ID) as HTMLElement | null;
  if (existing) {
    bind(existing);
    return true;
  }
  const main = document.querySelector<HTMLElement>('main.page');
  if (!main) return false;
  const hero = main.querySelector<HTMLElement>('.heroGrid');
  if (!hero) return false;
  hero.insertAdjacentHTML('afterend', template());
  const root = document.getElementById(ROOT_ID) as HTMLElement | null;
  if (!root) return false;
  bind(root);
  return true;
}

function start() {
  if (mount()) return;
  const observer = new MutationObserver(() => {
    if (!mount()) return;
    observer.disconnect();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
else start();
