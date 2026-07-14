const ENTRY_ROOT_ID = 'prompt-switch-root';
type EntryMode = 'form' | 'frame';

function entryMenuTemplate() {
  return `
    <nav class="promptSwitchEntryMenu" aria-label="프롬프트 시작 방식">
      <div class="promptSwitchEntryMeta"><span>INPUT 02</span><i></i><span>OUTPUT 04</span></div>
      <button type="button" class="promptSwitchEntryCard active" data-entry-mode="form" aria-pressed="true">
        <span class="promptSwitchEntryNumber">01</span>
        <span class="promptSwitchEntryCopy">
          <small>FORM</small>
          <strong>텍스트로 시작</strong>
          <em>작성한 프롬프트를 4개 AI 문법으로</em>
        </span>
        <span class="promptSwitchEntryTag">PROMPT → 4 AI</span>
      </button>
      <button type="button" class="promptSwitchEntryCard" data-entry-mode="frame" aria-pressed="false">
        <span class="promptSwitchEntryNumber">02</span>
        <span class="promptSwitchEntryCopy">
          <small>FRAME</small>
          <strong>이미지로 시작</strong>
          <em>사진을 읽어 카메라뷰와 네거티브까지</em>
        </span>
        <span class="promptSwitchEntryTag">IMAGE → 4 AI</span>
      </button>
    </nav>`;
}

function framePreviewTemplate() {
  return `
    <aside class="promptSwitchFramePreview" aria-live="polite">
      <small>FRAME · IMAGE TO PROMPT</small>
      <strong>한 장의 사진을<br>4개의 언어로 읽어요.</strong>
      <p>피사체, 조명, 색감, 구도와 렌즈 느낌을 분석하고 카메라뷰와 이미지 맞춤 네거티브가 모두 갖춰졌을 때만 결과를 열어요.</p>
      <div><span>CAMERA VIEW · REQUIRED</span><span>NEGATIVE · REQUIRED</span><span>4 AI</span></div>
    </aside>`;
}

function enhanceEntryMenu(root: HTMLElement) {
  if (root.dataset.entryMenuBound === '1') return;
  const head = root.querySelector<HTMLElement>('.promptSwitchHead');
  const workspace = root.querySelector<HTMLElement>('.promptSwitchWorkspace');
  const inputCard = root.querySelector<HTMLElement>('.promptSwitchInputCard');
  const result = root.querySelector<HTMLElement>('.promptSwitchResult');
  const createRadio = root.querySelector<HTMLInputElement>('input[name="switch-mode"][value="create"]');
  const editRadio = root.querySelector<HTMLInputElement>('input[name="switch-mode"][value="edit"]');
  const runButton = root.querySelector<HTMLButtonElement>('[data-switch-run]');
  if (!head || !workspace || !inputCard || !result || !createRadio || !editRadio || !runButton) return;

  root.dataset.entryMenuBound = '1';

  const eyebrow = head.querySelector<HTMLElement>('.promptSwitchEyebrow');
  const title = head.querySelector<HTMLElement>('h2');
  const description = head.querySelector<HTMLElement>('p:not(.promptSwitchEyebrow)');
  if (eyebrow) eyebrow.textContent = 'PROMPT SWITCH · DUAL INPUT';
  if (title) title.innerHTML = 'FORM <span>/</span> FRAME';
  if (description) description.textContent = '텍스트와 이미지, 두 개의 시작점에서 Gemini · GPT · Midjourney · Grok용 프롬프트로 바꿔요.';

  head.insertAdjacentHTML('afterend', entryMenuTemplate());
  result.insertAdjacentHTML('afterend', framePreviewTemplate());

  const menu = root.querySelector<HTMLElement>('.promptSwitchEntryMenu');
  const framePreview = root.querySelector<HTMLElement>('.promptSwitchFramePreview');
  const inputLabel = inputCard.querySelector<HTMLElement>(':scope > label');
  const originalRunHtml = runButton.innerHTML;

  const setMode = (mode: EntryMode) => {
    root.dataset.promptEntryMode = mode;
    menu?.querySelectorAll<HTMLButtonElement>('[data-entry-mode]').forEach((button) => {
      const active = button.dataset.entryMode === mode;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    const targetRadio = mode === 'frame' ? editRadio : createRadio;
    targetRadio.checked = true;
    targetRadio.dispatchEvent(new Event('change', { bubbles: true }));

    if (inputLabel) inputLabel.textContent = mode === 'frame' ? '참고 이미지' : '내가 만든 프롬프트';
    runButton.disabled = false;
    runButton.innerHTML = mode === 'frame'
      ? '이미지 분석해 4개 프롬프트 만들기 <span>→</span>'
      : originalRunHtml;

    const upload = root.querySelector<HTMLElement>('[data-switch-upload-preview]');
    if (upload && mode === 'frame') upload.hidden = false;
    if (framePreview) framePreview.hidden = mode !== 'frame' || root.dataset.frameResultReady === '1';

    root.dispatchEvent(new CustomEvent('prompt-switch:mode-change', {
      detail: { mode },
    }));
  };

  menu?.addEventListener('click', (event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-entry-mode]');
    if (!button) return;
    setMode(button.dataset.entryMode === 'frame' ? 'frame' : 'form');
  });

  setMode('form');
}

function mountEntryMenu() {
  const root = document.getElementById(ENTRY_ROOT_ID) as HTMLElement | null;
  if (!root) return false;
  enhanceEntryMenu(root);
  return root.dataset.entryMenuBound === '1';
}

function startEntryMenu() {
  if (mountEntryMenu()) return;
  const observer = new MutationObserver(() => {
    if (!mountEntryMenu()) return;
    observer.disconnect();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startEntryMenu, { once: true });
} else {
  startEntryMenu();
}
