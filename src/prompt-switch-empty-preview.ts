const EMPTY_STYLE_ROOT_ID = 'prompt-switch-root';

function applyPromptSwitchEmptyStyle(root: HTMLElement) {
  const empty = root.querySelector<HTMLElement>('.promptSwitchEmpty');
  const title = empty?.querySelector<HTMLElement>('strong');
  if (!empty || !title || title.dataset.emptyStyleApplied === '1') return false;

  title.dataset.emptyStyleApplied = '1';
  title.innerHTML = [
    '<span class="promptSwitchEmptyHand">프롬프트를 넣으면</span>',
    '<span class="promptSwitchEmptyClean">도구별 결과가 여기에 열려요.</span>',
  ].join('');
  return true;
}

function mountPromptSwitchEmptyStyle() {
  const root = document.getElementById(EMPTY_STYLE_ROOT_ID) as HTMLElement | null;
  if (!root) return false;

  applyPromptSwitchEmptyStyle(root);
  if (root.dataset.emptyStyleObserver === '1') return true;
  root.dataset.emptyStyleObserver = '1';

  let queued = false;
  const observer = new MutationObserver(() => {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(() => {
      queued = false;
      applyPromptSwitchEmptyStyle(root);
    });
  });
  observer.observe(root, { childList: true, subtree: true });
  return true;
}

function startPromptSwitchEmptyStyle() {
  if (mountPromptSwitchEmptyStyle()) return;
  const observer = new MutationObserver(() => {
    if (!mountPromptSwitchEmptyStyle()) return;
    observer.disconnect();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startPromptSwitchEmptyStyle, { once: true });
} else {
  startPromptSwitchEmptyStyle();
}
