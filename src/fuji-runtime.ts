const FUJI_TEXT = {
  mood: '후지필름 감성',
  scene: '골목 산책',
  image: '4:5 인스타 비율. 후지필름 감성의 골목 산책 장면. 미디엄샷 구도, 정면 시선, 35mm 자연 시야 렌즈 느낌. 채도는 과하지 않고 차분한 필름 톤을 유지한다. 초록과 하늘색은 은은하게 살아 있고, 피부톤은 자연스럽고 부드럽다. 은은한 필름 그레인, 살짝 눌린 콘트라스트, 후지 특유의 담백한 색감. 자연스러운 한국 감성, 첫 프레임으로 쓰기 좋은 이미지.',
  video: '6초 영상. 카메라는 인물을 따라 아주 부드럽게 움직인다. 골목을 걷는 잔잔한 무드, 과한 연기 없이 자연스러운 반응만 담는다. 후지필름 특유의 차분한 필름 톤, 부드러운 색 분리, 은은한 필름 감성을 유지한다. 갑작스러운 줌, 과한 손동작, 과장된 표정은 피한다.',
  camera: '35mm 자연 시야 느낌. 미디엄샷. 정면 시선. 채도를 살짝 눌러 필름스러운 여백을 만들고, 그린/블루 계열은 부드럽게 정리한다. 대비는 강하지 않게, 피부는 자연스럽게 유지한다. 필름 그레인이 아주 약하게 느껴지도록 정리한다.',
  negative: 'extra fingers, distorted hands, plastic skin, oversaturated colors, excessive contrast, neon color cast, harsh sharpening, unreadable text, broken facial symmetry, awkward pose',
};

let fujiMode = false;
let observerTimer: number | undefined;

function fullFujiPrompt() {
  return `IMAGE PROMPT\n\n${FUJI_TEXT.image}\n\nVIDEO PROMPT\n\n${FUJI_TEXT.video}\n\nCAMERA NOTE\n\n${FUJI_TEXT.camera}\n\nNEGATIVE PROMPT\n\n${FUJI_TEXT.negative}`;
}

function getPickers() {
  return Array.from(document.querySelectorAll<HTMLElement>('.picker'));
}

function makeChip(label: string, emoji: string, onClick: () => void) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'chip fujiChip';
  button.dataset.fujiRuntime = label;
  button.innerHTML = `<span>${emoji}</span>${label}`;
  button.addEventListener('click', onClick);
  return button;
}

function setChipActive(pickerIndex: number, label: string) {
  const picker = getPickers()[pickerIndex];
  if (!picker) return;
  picker.querySelectorAll('.chip').forEach((chip) => chip.classList.remove('active'));
  const chip = Array.from(picker.querySelectorAll<HTMLElement>('.chip')).find((item) => item.textContent?.includes(label));
  chip?.classList.add('active');
}

function applyFujiUI() {
  fujiMode = true;
  setChipActive(0, FUJI_TEXT.mood);
  setChipActive(1, FUJI_TEXT.scene);

  const previewTitle = document.querySelector<HTMLElement>('.scenePreview strong');
  if (previewTitle) previewTitle.textContent = `${FUJI_TEXT.mood} · ${FUJI_TEXT.scene}`;

  const previewMeta = document.querySelector<HTMLElement>('.scenePreview span');
  if (previewMeta) previewMeta.textContent = '미디엄샷 / 정면 시선 / 35mm 자연 시야 / 부드러운 창가빛';

  document.querySelectorAll<HTMLElement>('.promptCard').forEach((card) => {
    const title = card.querySelector('span')?.textContent?.trim();
    const body = card.querySelector('p');
    if (!body) return;
    if (title === 'IMAGE PROMPT') body.textContent = FUJI_TEXT.image;
    if (title === 'VIDEO PROMPT') body.textContent = FUJI_TEXT.video;
    if (title === 'CAMERA NOTE') body.textContent = FUJI_TEXT.camera;
    if (title === 'NEGATIVE PROMPT') body.textContent = FUJI_TEXT.negative;
  });
}

function ensureFujiControls() {
  const pickers = getPickers();
  const moodChips = pickers[0]?.querySelector('.chips');
  const sceneChips = pickers[1]?.querySelector('.chips');

  if (moodChips && !moodChips.querySelector('[data-fuji-runtime="후지필름 감성"]')) {
    moodChips.appendChild(makeChip(FUJI_TEXT.mood, '🎞️', applyFujiUI));
  }

  if (sceneChips && !sceneChips.querySelector('[data-fuji-runtime="골목 산책"]')) {
    sceneChips.appendChild(makeChip(FUJI_TEXT.scene, '🚶', applyFujiUI));
  }
}

function makeFujiPresetCard() {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'presetButton fujiPresetButton';
  button.dataset.fujiPreset = 'true';
  button.innerHTML = `
    <strong>후지필름 산책컷</strong>
    <span>차분한 필름 톤과 부드러운 색감으로 골목 산책 장면을 만드는 프리셋</span>
    <div class="presetMetaGrid">
      <span><b>TYPE</b>Image Prompt</span>
      <span><b>BEST FOR</b>SNS Photo</span>
      <span><b>RATIO</b>4:5 인스타샷</span>
    </div>
    <small>후지필름 감성 · 35mm 자연 시야</small>
  `;
  button.addEventListener('click', applyFujiUI);
  return button;
}

function ensureFujiPreset() {
  const list = document.querySelector<HTMLElement>('.presetList');
  if (!list || list.querySelector('[data-fuji-preset="true"]')) return;
  list.appendChild(makeFujiPresetCard());
}

function installCopyHook() {
  if (document.body.dataset.fujiCopyHook === 'true') return;
  document.body.dataset.fujiCopyHook = 'true';

  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement | null;
    const button = target?.closest('button');
    if (!button || !fujiMode) return;
    if (!button.textContent?.includes('전체 프롬프트 복사')) return;

    window.setTimeout(() => {
      navigator.clipboard?.writeText(fullFujiPrompt()).catch(() => undefined);
    }, 60);
  }, true);
}

function installStyles() {
  if (document.getElementById('fuji-runtime-style')) return;
  const style = document.createElement('style');
  style.id = 'fuji-runtime-style';
  style.textContent = `
    .fujiChip span { filter: saturate(0.92); }
    .fujiPresetButton {
      border-color: rgba(118, 149, 230, 0.22) !important;
      background:
        radial-gradient(circle at 94% 0%, rgba(207, 239, 255, 0.64), transparent 130px),
        linear-gradient(180deg, rgba(255, 255, 255, 1), rgba(247, 251, 255, 0.94)) !important;
    }
  `;
  document.head.appendChild(style);
}

function runFujiRuntime() {
  installStyles();
  installCopyHook();
  ensureFujiControls();
  ensureFujiPreset();
  if (fujiMode) applyFujiUI();
}

runFujiRuntime();

const observer = new MutationObserver(() => {
  window.clearTimeout(observerTimer);
  observerTimer = window.setTimeout(runFujiRuntime, 80);
});

observer.observe(document.documentElement, { childList: true, subtree: true });
