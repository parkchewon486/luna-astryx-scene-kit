const OFFICIAL_OUTPUT_ROOT_ID = 'prompt-switch-root';

type OfficialRatio = '1:1' | '4:5' | '3:4' | '9:16' | '16:9';

function officialGptSize(ratio: OfficialRatio) {
  if (ratio === '1:1') return '1024x1024';
  if (ratio === '4:5') return '1024x1280';
  if (ratio === '3:4') return '960x1280';
  if (ratio === '9:16') return '1152x2048';
  return '2048x1152';
}

function readFrameRatio(root: HTMLElement): OfficialRatio {
  const geminiSettings = root.querySelector<HTMLElement>('[data-switch-output="gemini"] .promptSwitchSetting pre')?.textContent ?? '';
  const match = geminiSettings.match(/aspect_ratio:\s*(1:1|4:5|3:4|9:16|16:9)/i);
  return (match?.[1] as OfficialRatio | undefined) ?? '4:5';
}

function normalizeOfficialOutputs(root: HTMLElement) {
  if (!root.querySelector('.promptSwitchFrameQa')) return;
  const ratio = readFrameRatio(root);

  const gptOutput = root.querySelector<HTMLElement>('[data-switch-output="gpt"]');
  if (gptOutput && gptOutput.dataset.officialRules !== ratio) {
    const settings = gptOutput.querySelector<HTMLElement>('.promptSwitchSetting pre');
    const note = gptOutput.querySelector<HTMLElement>('.promptSwitchNote');
    if (settings) {
      settings.textContent = [
        'model: gpt-image-2',
        'endpoint: images.edits (reference image)',
        `size: ${officialGptSize(ratio)}`,
        'quality: high',
        'input_fidelity parameter: omit',
      ].join('\n');
    }
    if (note) note.textContent = 'GPT Image 참조 이미지 워크플로에 맞춰 섹션을 나눴어요. gpt-image-2는 입력 이미지를 자동 고충실도로 처리하므로 input_fidelity 값은 넣지 않아요.';
    gptOutput.dataset.officialRules = ratio;
  }

  const grokOutput = root.querySelector<HTMLElement>('[data-switch-output="grok"]');
  if (grokOutput && grokOutput.dataset.officialRules !== ratio) {
    const prompt = grokOutput.querySelector<HTMLElement>('[data-switch-prompt="grok"]');
    const settings = grokOutput.querySelector<HTMLElement>('.promptSwitchSetting pre');
    const note = grokOutput.querySelector<HTMLElement>('.promptSwitchNote');
    if (prompt) {
      prompt.textContent = (prompt.textContent ?? '')
        .replace(/Use a (?:1:1|4:5|3:4|9:16|16:9) aspect ratio\./i, `Use a ${ratio} aspect ratio.`);
    }
    if (settings) {
      settings.textContent = [
        'model: grok-imagine-image-quality',
        `aspect_ratio: ${ratio}`,
        'resolution: 2k',
        'reference images: 1',
      ].join('\n');
    }
    if (note) note.textContent = 'Grok Imagine의 자연어 참조 이미지 방식과 설정 가능한 비율·해상도·참조 이미지 값을 분리했어요.';
    grokOutput.dataset.officialRules = ratio;
  }
}

function mountOfficialOutputRules() {
  const root = document.getElementById(OFFICIAL_OUTPUT_ROOT_ID) as HTMLElement | null;
  if (!root) return false;

  normalizeOfficialOutputs(root);
  if (root.dataset.officialOutputObserver === '1') return true;
  root.dataset.officialOutputObserver = '1';

  let queued = false;
  const observer = new MutationObserver(() => {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(() => {
      queued = false;
      normalizeOfficialOutputs(root);
    });
  });
  observer.observe(root, { childList: true, subtree: true });
  return true;
}

function startOfficialOutputRules() {
  if (mountOfficialOutputRules()) return;
  const observer = new MutationObserver(() => {
    if (!mountOfficialOutputRules()) return;
    observer.disconnect();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startOfficialOutputRules, { once: true });
} else {
  startOfficialOutputRules();
}
