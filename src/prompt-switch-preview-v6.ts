const PREVIEW_ROOT_ID = 'prompt-switch-root';
type FrameTool = 'gemini' | 'gpt' | 'midjourney' | 'grok';
type EntryMode = 'form' | 'frame';

type FrameToolResult = {
  prompt: string;
  settings: string;
  note: string;
};

type FrameApiResponse = {
  error?: string;
  missing_fields?: string[];
  analysis?: {
    summary_ko?: string;
    camera_view?: Record<string, string>;
    negative_prompt?: string[];
  };
  results?: Record<FrameTool, FrameToolResult>;
  validation?: {
    camera_view?: boolean;
    negative_prompt?: boolean;
    negative_count?: number;
    tool_outputs?: boolean;
  };
  official_docs?: Record<FrameTool, string>;
};

const FRAME_TOOLS: Array<[FrameTool, string]> = [
  ['gemini', 'Gemini'],
  ['gpt', 'GPT'],
  ['midjourney', 'Midjourney'],
  ['grok', 'Grok'],
];

const DEFAULT_DOCS: Record<FrameTool, string> = {
  gemini: 'https://ai.google.dev/gemini-api/docs/image-generation',
  gpt: 'https://developers.openai.com/api/docs/guides/image-generation',
  midjourney: 'https://docs.midjourney.com/hc/en-us/articles/32023408776205-Prompt-Basics',
  grok: 'https://docs.x.ai/developers/model-capabilities/imagine',
};

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function escapeFrameHtml(value: unknown) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function settingsLabel(tool: FrameTool) {
  if (tool === 'midjourney') return 'PARAMETERS';
  if (tool === 'gemini') return 'RESPONSE FORMAT';
  return 'SETTINGS';
}

function nearestSupportedRatio(width: number, height: number) {
  const value = width / height;
  const candidates = [
    { label: '1:1', value: 1 },
    { label: '4:5', value: 4 / 5 },
    { label: '3:4', value: 3 / 4 },
    { label: '9:16', value: 9 / 16 },
    { label: '16:9', value: 16 / 9 },
  ];
  return candidates.reduce((best, candidate) => (
    Math.abs(Math.log(value / candidate.value)) < Math.abs(Math.log(value / best.value))
      ? candidate
      : best
  )).label;
}

function loadImageElement(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('이미지 파일을 읽지 못했어요.'));
    };
    image.src = url;
  });
}

function canvasBlob(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('분석용 이미지 변환에 실패했어요.'));
    }, 'image/jpeg', quality);
  });
}

function blobDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('분석용 이미지를 읽지 못했어요.'));
    reader.readAsDataURL(blob);
  });
}

async function prepareImageForAnalysis(file: File) {
  const image = await loadImageElement(file);
  const originalWidth = image.naturalWidth;
  const originalHeight = image.naturalHeight;
  if (!originalWidth || !originalHeight) throw new Error('이미지 크기를 확인하지 못했어요.');

  const maxEdge = 1600;
  const scale = Math.min(1, maxEdge / Math.max(originalWidth, originalHeight));
  const width = Math.max(1, Math.round(originalWidth * scale));
  const height = Math.max(1, Math.round(originalHeight * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('이미지 처리 기능을 사용할 수 없는 브라우저예요.');
  context.fillStyle = '#fff';
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);

  let blob = await canvasBlob(canvas, 0.86);
  for (const quality of [0.76, 0.66, 0.56]) {
    if (blob.size <= 2_650_000) break;
    blob = await canvasBlob(canvas, quality);
  }
  if (blob.size > 2_850_000) throw new Error('이미지가 너무 커요. 더 작은 파일로 다시 시도해 주세요.');

  return {
    dataUrl: await blobDataUrl(blob),
    width: originalWidth,
    height: originalHeight,
    ratio: nearestSupportedRatio(originalWidth, originalHeight),
    processedBytes: blob.size,
  };
}

function validateFramePayload(payload: FrameApiResponse) {
  const missing: string[] = [];
  if (!payload.validation?.camera_view) missing.push('camera_view');
  if (!payload.validation?.negative_prompt) missing.push('negative_prompt');
  if ((payload.validation?.negative_count ?? 0) < 6) missing.push('negative_prompt(minimum 6)');
  if (!payload.validation?.tool_outputs) missing.push('tool_outputs');

  FRAME_TOOLS.forEach(([tool]) => {
    const result = payload.results?.[tool];
    if (!result?.prompt?.trim()) missing.push(`${tool}.prompt`);
    if (!result?.settings?.trim()) missing.push(`${tool}.settings`);
    if (!result?.note?.trim()) missing.push(`${tool}.note`);
  });
  return missing;
}

function renderFrameLoading(target: HTMLElement) {
  target.innerHTML = `
    <div class="promptSwitchFrameLoading" role="status" aria-live="polite">
      <div><i></i><i></i><i></i></div>
      <small>FRAME ANALYSIS</small>
      <strong>카메라뷰와 네거티브를 검사하고 있어요</strong>
      <p>사진을 읽고 4개 생성형 도구의 공식 입력 방식으로 나누는 중이에요.</p>
    </div>`;
}

function renderFrameError(target: HTMLElement, message: string, missing: string[] = []) {
  target.innerHTML = `
    <div class="promptSwitchFrameError" role="alert">
      <small>FRAME CHECK FAILED</small>
      <strong>${escapeFrameHtml(message)}</strong>
      ${missing.length ? `<p>누락: ${escapeFrameHtml(missing.join(', '))}</p>` : '<p>이미지를 확인한 뒤 다시 분석해 주세요.</p>'}
    </div>`;
}

function renderFrameResult(target: HTMLElement, payload: FrameApiResponse) {
  const docs = { ...DEFAULT_DOCS, ...(payload.official_docs ?? {}) };
  const summary = payload.analysis?.summary_ko || '이미지 분석이 완료됐어요.';
  const negativeCount = payload.validation?.negative_count ?? payload.analysis?.negative_prompt?.length ?? 0;
  const results = payload.results as Record<FrameTool, FrameToolResult>;

  target.innerHTML = `
    <div class="promptSwitchFrameQa">
      <div><small>REFERENCE READ</small><strong>${escapeFrameHtml(summary)}</strong></div>
      <span>CAMERA VIEW ✓</span><span>NEGATIVE ${negativeCount} ✓</span><span>4 OUTPUTS ✓</span>
    </div>
    <div class="promptSwitchTabs" role="tablist">
      ${FRAME_TOOLS.map(([tool, label], index) => `<button type="button" role="tab" data-switch-tool="${tool}" class="${index === 0 ? 'active' : ''}" aria-selected="${index === 0}">${label}</button>`).join('')}
    </div>
    ${FRAME_TOOLS.map(([tool, label], index) => {
      const result = results[tool];
      return `<article class="promptSwitchOutput ${index === 0 ? 'active' : ''}" data-switch-output="${tool}">
        <div class="promptSwitchOutputTop"><div><small>${label.toUpperCase()} FRAME PROMPT</small><strong>복사용 프롬프트</strong></div><button type="button" data-switch-copy="${tool}">복사</button></div>
        <pre data-switch-prompt="${tool}">${escapeFrameHtml(result.prompt)}</pre>
        <div class="promptSwitchSetting"><small>${settingsLabel(tool)}</small><pre>${escapeFrameHtml(result.settings)}</pre></div>
        <p class="promptSwitchNote">${escapeFrameHtml(result.note)}</p>
        <a href="${escapeFrameHtml(docs[tool])}" target="_blank" rel="noreferrer">공식 사용법 보기 ↗</a>
      </article>`;
    }).join('')}`;
}

function enhancePromptSwitch(root: HTMLElement) {
  if (root.dataset.uploadPreviewBound === '1') return;

  const modeInputs = Array.from(root.querySelectorAll<HTMLInputElement>('input[name="switch-mode"]'));
  const controls = root.querySelector<HTMLElement>('.promptSwitchControls');
  const runButton = root.querySelector<HTMLButtonElement>('[data-switch-run]');
  const resultTarget = root.querySelector<HTMLElement>('[data-switch-result]');
  if (!controls || modeInputs.length === 0 || !runButton || !resultTarget) return;

  root.dataset.uploadPreviewBound = '1';

  modeInputs.forEach((input) => {
    const label = input.closest('label');
    const text = label?.querySelector('span');
    if (!text) return;
    text.textContent = input.value === 'edit' ? '이미지 기반' : '텍스트 기반';
  });

  const uploadSection = document.createElement('section');
  uploadSection.className = 'promptSwitchUploadPreview';
  uploadSection.dataset.switchUploadPreview = '';
  uploadSection.hidden = true;
  uploadSection.innerHTML = `
    <div class="promptSwitchUploadHeading">
      <div>
        <small>REFERENCE IMAGE · FRAME</small>
        <strong>마음에 드는 이미지 업로드</strong>
      </div>
      <span>PNG · JPG · WEBP</span>
    </div>
    <input type="file" accept="image/png,image/jpeg,image/webp" data-switch-upload-input hidden>
    <div class="promptSwitchDropzone" data-switch-dropzone tabindex="0" role="button" aria-label="참고 이미지 선택">
      <div class="promptSwitchUploadEmpty" data-switch-upload-empty>
        <b>＋</b>
        <strong>이미지를 끌어놓거나 눌러서 선택</strong>
        <p>사진의 장면·조명·카메라뷰·네거티브를 분석해요.</p>
      </div>
      <div class="promptSwitchUploadFilled" data-switch-upload-filled hidden>
        <img data-switch-upload-image alt="업로드한 참고 이미지 미리보기">
        <div>
          <strong data-switch-upload-name></strong>
          <span data-switch-upload-size></span>
          <p>분석할 때 최대 1600px로 줄여 전송하며 결과 생성 후 앱에 저장하지 않아요.</p>
        </div>
      </div>
    </div>
    <div class="promptSwitchUploadActions">
      <button type="button" data-switch-upload-choose>파일 선택</button>
      <button type="button" data-switch-upload-remove disabled>삭제</button>
    </div>
    <p class="promptSwitchUploadPolicy">사용 권한이 있는 이미지만 올려 주세요. 분석을 위해 이미지가 AI 서버로 전송됩니다.</p>
    <p class="promptSwitchUploadError" data-switch-upload-error hidden></p>
  `;

  controls.insertAdjacentElement('afterend', uploadSection);

  const fileInput = uploadSection.querySelector<HTMLInputElement>('[data-switch-upload-input]');
  const dropzone = uploadSection.querySelector<HTMLElement>('[data-switch-dropzone]');
  const emptyState = uploadSection.querySelector<HTMLElement>('[data-switch-upload-empty]');
  const filledState = uploadSection.querySelector<HTMLElement>('[data-switch-upload-filled]');
  const previewImage = uploadSection.querySelector<HTMLImageElement>('[data-switch-upload-image]');
  const fileName = uploadSection.querySelector<HTMLElement>('[data-switch-upload-name]');
  const fileSize = uploadSection.querySelector<HTMLElement>('[data-switch-upload-size]');
  const chooseButton = uploadSection.querySelector<HTMLButtonElement>('[data-switch-upload-choose]');
  const removeButton = uploadSection.querySelector<HTMLButtonElement>('[data-switch-upload-remove]');
  const uploadError = uploadSection.querySelector<HTMLElement>('[data-switch-upload-error]');
  const framePreview = root.querySelector<HTMLElement>('.promptSwitchFramePreview');

  let selectedFile: File | null = null;
  let previewUrl = '';
  let processing = false;
  let activeMode: EntryMode = root.dataset.promptEntryMode === 'frame' ? 'frame' : 'form';
  let formResultHtml = resultTarget.innerHTML;
  let frameResultHtml = '';

  const showUploadError = (message = '') => {
    if (!uploadError) return;
    uploadError.hidden = !message;
    uploadError.textContent = message;
  };

  const syncRunButton = () => {
    if (activeMode !== 'frame') return;
    runButton.disabled = !selectedFile || processing;
    if (processing) runButton.innerHTML = '이미지 분석 중 <span>···</span>';
    else if (selectedFile) runButton.innerHTML = '이미지 분석해 4개 프롬프트 만들기 <span>→</span>';
    else runButton.innerHTML = '이미지를 먼저 올려 주세요 <span>02</span>';
  };

  const clearFrameOutput = () => {
    frameResultHtml = '';
    root.dataset.frameResultReady = '0';
    if (activeMode === 'frame') resultTarget.innerHTML = formResultHtml;
    if (framePreview) framePreview.hidden = activeMode !== 'frame';
  };

  const resetFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = '';
    selectedFile = null;
    if (fileInput) fileInput.value = '';
    if (previewImage) previewImage.removeAttribute('src');
    if (emptyState) emptyState.hidden = false;
    if (filledState) filledState.hidden = true;
    if (removeButton) removeButton.disabled = true;
    root.removeAttribute('data-switch-upload-name');
    showUploadError();
    clearFrameOutput();
    syncRunButton();
  };

  const applyFile = (file?: File) => {
    showUploadError();
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      showUploadError('PNG, JPG, WEBP 이미지만 올릴 수 있어요.');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      showUploadError('원본 파일은 20MB 이하만 올릴 수 있어요.');
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    selectedFile = file;
    previewUrl = URL.createObjectURL(file);
    if (previewImage) previewImage.src = previewUrl;
    if (fileName) fileName.textContent = file.name;
    if (fileSize) fileSize.textContent = formatFileSize(file.size);
    if (emptyState) emptyState.hidden = true;
    if (filledState) filledState.hidden = false;
    if (removeButton) removeButton.disabled = false;
    root.dataset.switchUploadName = file.name;
    clearFrameOutput();
    syncRunButton();
  };

  const syncRadioMode = () => {
    const editMode = modeInputs.some((input) => input.checked && input.value === 'edit');
    uploadSection.hidden = !editMode;
  };

  const runFrameAnalysis = async () => {
    if (!selectedFile || processing) return;
    processing = true;
    showUploadError();
    syncRunButton();
    root.dataset.frameResultReady = '1';
    if (framePreview) framePreview.hidden = true;
    renderFrameLoading(resultTarget);
    resultTarget.setAttribute('aria-busy', 'true');

    try {
      const prepared = await prepareImageForAnalysis(selectedFile);
      const response = await fetch('/api/frame-analyze', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
        body: JSON.stringify({
          image_data_url: prepared.dataUrl,
          meta: {
            width: prepared.width,
            height: prepared.height,
            ratio: prepared.ratio,
            processed_bytes: prepared.processedBytes,
            original_name: selectedFile.name,
          },
        }),
      });
      const payload = await response.json() as FrameApiResponse;
      if (!response.ok) {
        throw Object.assign(new Error(payload.error || 'FRAME 분석을 완료하지 못했어요.'), {
          missing: payload.missing_fields ?? [],
        });
      }

      const missing = validateFramePayload(payload);
      if (missing.length) {
        throw Object.assign(new Error('카메라뷰·네거티브·도구별 결과 누락 검사를 통과하지 못했어요.'), { missing });
      }

      renderFrameResult(resultTarget, payload);
      frameResultHtml = resultTarget.innerHTML;
      root.dataset.frameResultReady = '1';
      resultTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'FRAME 이미지 분석 중 오류가 발생했어요.';
      const missing = Array.isArray((error as { missing?: unknown }).missing)
        ? (error as { missing: string[] }).missing
        : [];
      renderFrameError(resultTarget, message, missing);
      frameResultHtml = resultTarget.innerHTML;
      root.dataset.frameResultReady = '1';
    } finally {
      processing = false;
      resultTarget.removeAttribute('aria-busy');
      syncRunButton();
    }
  };

  modeInputs.forEach((input) => input.addEventListener('change', syncRadioMode));
  chooseButton?.addEventListener('click', () => fileInput?.click());
  dropzone?.addEventListener('click', () => fileInput?.click());
  dropzone?.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    fileInput?.click();
  });
  fileInput?.addEventListener('change', () => applyFile(fileInput.files?.[0]));
  removeButton?.addEventListener('click', resetFile);

  ['dragenter', 'dragover'].forEach((eventName) => {
    dropzone?.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropzone.classList.add('isDragging');
    });
  });
  ['dragleave', 'drop'].forEach((eventName) => {
    dropzone?.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropzone.classList.remove('isDragging');
    });
  });
  dropzone?.addEventListener('drop', (event) => applyFile(event.dataTransfer?.files?.[0]));

  root.addEventListener('prompt-switch:mode-change', (event) => {
    const nextMode = (event as CustomEvent<{ mode?: EntryMode }>).detail?.mode === 'frame' ? 'frame' : 'form';
    if (activeMode === 'form') formResultHtml = resultTarget.innerHTML;
    else frameResultHtml = resultTarget.innerHTML;
    activeMode = nextMode;

    if (activeMode === 'form') {
      resultTarget.innerHTML = formResultHtml;
      if (framePreview) framePreview.hidden = true;
    } else {
      if (frameResultHtml) {
        resultTarget.innerHTML = frameResultHtml;
        root.dataset.frameResultReady = '1';
        if (framePreview) framePreview.hidden = true;
      } else {
        root.dataset.frameResultReady = '0';
        if (framePreview) framePreview.hidden = false;
      }
    }
    syncRunButton();
  });

  runButton.addEventListener('click', (event) => {
    if (root.dataset.promptEntryMode !== 'frame') return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    void runFrameAnalysis();
  }, { capture: true });

  syncRadioMode();
  syncRunButton();
}

function mountPromptSwitchPreview() {
  const root = document.getElementById(PREVIEW_ROOT_ID) as HTMLElement | null;
  if (!root) return false;
  enhancePromptSwitch(root);
  return root.dataset.uploadPreviewBound === '1';
}

function startPromptSwitchPreview() {
  if (mountPromptSwitchPreview()) return;
  const observer = new MutationObserver(() => {
    if (!mountPromptSwitchPreview()) return;
    observer.disconnect();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startPromptSwitchPreview, { once: true });
} else {
  startPromptSwitchPreview();
}
