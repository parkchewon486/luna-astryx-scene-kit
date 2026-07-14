const FORM_ONLY_ROOT_ID = 'prompt-switch-root';
const FORM_ONLY_PAGE_TITLE = 'Luna Prompt Studio | PROMPT SWITCH';

function formOnlyMenuTemplate() {
  return `
    <div class="promptSwitchEntryMeta"><span>INPUT 01</span><i></i><span>OUTPUT 04</span></div>
    <div class="promptSwitchEntryCard promptSwitchEntryCardSolo active" aria-current="true">
      <span class="promptSwitchEntryNumber">01</span>
      <span class="promptSwitchEntryCopy">
        <small>FORM · OPEN</small>
        <strong>텍스트로 시작</strong>
        <em>작성한 프롬프트를 4개 AI가 읽기 좋은 방식으로 변환해요.</em>
      </span>
      <span class="promptSwitchEntryTag">PROMPT → 4 AI</span>
    </div>`;
}

function polishedTitleTemplate() {
  return `
    <span class="promptSwitchTitleLine">프롬프트 하나로</span>
    <span class="promptSwitchTitleLine promptSwitchTitlePlay"><span class="promptSwitchTitleMark">4개의 AI</span>를 오가요<i aria-hidden="true">✦</i></span>`;
}

function cacheBadgeTemplate() {
  return `
    <div class="promptSwitchCache" data-switch-cache>
      <span>CACHE</span>
      <strong>3 HOURS</strong>
      <button type="button" aria-label="캐시 갱신 주기 설명" aria-expanded="false" data-switch-cache-help>?</button>
      <div class="promptSwitchCacheTip" role="tooltip" data-switch-cache-tip hidden>데이터를 3시간마다 새로 불러오는 주기</div>
    </div>`;
}

function emptyResultTemplate() {
  return `
    <div class="promptSwitchEmpty">
      <b>SWITCH READY</b>
      <strong>프롬프트를 넣으면<br>도구별 결과가 여기에 열려요.</strong>
      <p>원문 내용은 지키고, 각 서비스의 공식 사용 방식에 맞게 다시 정리합니다.</p>
    </div>`;
}

function bindCacheHelp(root: HTMLElement) {
  if (root.dataset.cacheHelpBound === '1') return;
  root.dataset.cacheHelpBound = '1';

  root.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    const button = target.closest<HTMLButtonElement>('[data-switch-cache-help]');
    const tip = root.querySelector<HTMLElement>('[data-switch-cache-tip]');
    const helpButton = root.querySelector<HTMLButtonElement>('[data-switch-cache-help]');

    if (button && tip) {
      const nextOpen = tip.hidden;
      tip.hidden = !nextOpen;
      button.setAttribute('aria-expanded', String(nextOpen));
      return;
    }

    if (tip && helpButton && !tip.hidden && !target.closest('[data-switch-cache]')) {
      tip.hidden = true;
      helpButton.setAttribute('aria-expanded', 'false');
    }
  });
}

function applyFormOnly(root: HTMLElement) {
  root.dataset.formOnly = '1';
  root.dataset.promptEntryMode = 'form';
  root.dataset.frameResultReady = '0';
  root.removeAttribute('data-switch-upload-name');

  if (document.title !== FORM_ONLY_PAGE_TITLE) document.title = FORM_ONLY_PAGE_TITLE;

  const head = root.querySelector<HTMLElement>('.promptSwitchHead');
  const eyebrow = head?.querySelector<HTMLElement>('.promptSwitchEyebrow');
  const title = head?.querySelector<HTMLElement>('h2');
  const description = head?.querySelector<HTMLElement>('p:not(.promptSwitchEyebrow)');

  if (eyebrow && eyebrow.textContent !== 'PROMPT SWITCH · FORM OPEN') eyebrow.textContent = 'PROMPT SWITCH · FORM OPEN';
  const polishedTitle = polishedTitleTemplate();
  if (title && title.innerHTML.trim() !== polishedTitle.trim()) title.innerHTML = polishedTitle;
  const descriptionCopy = '프롬프트를 붙여 넣으면 Gemini · GPT · Midjourney · Grok에 맞춰 문장과 설정값을 나눠 드려요.';
  if (description && description.textContent !== descriptionCopy) description.textContent = descriptionCopy;

  const headlineBlock = head?.querySelector<HTMLElement>(':scope > div:first-child');
  if (headlineBlock && !headlineBlock.querySelector('[data-switch-cache]')) {
    headlineBlock.insertAdjacentHTML('beforeend', cacheBadgeTemplate());
  }
  bindCacheHelp(root);

  let menu = root.querySelector<HTMLElement>('.promptSwitchEntryMenu');
  if (!menu && head) {
    head.insertAdjacentHTML('afterend', '<nav class="promptSwitchEntryMenu" aria-label="FORM 입력"></nav>');
    menu = root.querySelector<HTMLElement>('.promptSwitchEntryMenu');
  }
  if (menu && menu.dataset.formOnlyReady !== '1') {
    menu.dataset.formOnlyReady = '1';
    menu.setAttribute('aria-label', 'FORM 입력');
    menu.innerHTML = formOnlyMenuTemplate();
  }

  root.querySelectorAll<HTMLElement>('.promptSwitchFramePreview, [data-switch-upload-preview]').forEach((element) => element.remove());

  const createRadio = root.querySelector<HTMLInputElement>('input[name="switch-mode"][value="create"]');
  const editRadio = root.querySelector<HTMLInputElement>('input[name="switch-mode"][value="edit"]');
  if (editRadio) {
    editRadio.checked = false;
    editRadio.disabled = true;
  }
  if (createRadio && !createRadio.checked) {
    createRadio.checked = true;
    createRadio.dispatchEvent(new Event('change', { bubbles: true }));
  }

  const inputLabel = root.querySelector<HTMLElement>('.promptSwitchInputCard > label');
  if (inputLabel && inputLabel.textContent !== '내가 만든 프롬프트') inputLabel.textContent = '내가 만든 프롬프트';

  const runButton = root.querySelector<HTMLButtonElement>('[data-switch-run]');
  if (runButton) {
    runButton.disabled = false;
    const runHtml = '4개 도구로 변환하기 <span>→</span>';
    if (runButton.innerHTML !== runHtml) runButton.innerHTML = runHtml;
  }

  root.dispatchEvent(new CustomEvent('prompt-switch:mode-change', {
    detail: { mode: 'form' },
  }));

  const result = root.querySelector<HTMLElement>('[data-switch-result]');
  if (result?.querySelector('.promptSwitchFrameError, .promptSwitchFrameLoading, .promptSwitchFrameQa')) {
    result.innerHTML = emptyResultTemplate();
  }
}

function mountFormOnly() {
  const root = document.getElementById(FORM_ONLY_ROOT_ID) as HTMLElement | null;
  if (!root) return false;

  applyFormOnly(root);
  if (root.dataset.formOnlyObserver === '1') return true;
  root.dataset.formOnlyObserver = '1';

  let queued = false;
  const observer = new MutationObserver(() => {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(() => {
      queued = false;
      applyFormOnly(root);
    });
  });
  observer.observe(root, { childList: true, subtree: true });
  return true;
}

function startFormOnly() {
  if (mountFormOnly()) return;
  const observer = new MutationObserver(() => {
    if (!mountFormOnly()) return;
    observer.disconnect();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startFormOnly, { once: true });
} else {
  startFormOnly();
}

// Preview redeploy marker: 2026-07-14T08:18Z
