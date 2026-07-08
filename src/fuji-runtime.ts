type FujiPreset = {
  id: string;
  label: string;
  title: string;
  note: string;
  meta: string;
  image: string;
  video: string;
  camera: string;
  negative: string;
};

const FUJI_MOOD = '후지필름 감성';
const FUJI_SCENE = '골목 산책';

const FUJI_PRESETS: FujiPreset[] = [
  {
    id: 'real',
    label: '실사 스냅',
    title: '후지필름 실사 스냅',
    note: '실제 카메라로 찍은 한국 골목 사진처럼 만드는 하위 버전',
    meta: '상반신 샷 / 살짝 측면 / 35mm 자연 시야 / 자연광',
    image: '4:5 인스타 비율. photorealistic Korean street snapshot. Fujifilm X100V style, 35mm natural field of view, candid walking moment in a quiet Korean alley. Natural skin texture, realistic face proportions, soft daylight, muted greens and blues, slightly faded highlights, gentle film grain, low contrast, calm everyday mood. The person should look natural, not overly posed, not over-beautified, and not like a studio portrait.',
    video: '6초 영상. 실제 카메라로 찍은 거리 스냅처럼 자연스럽게 진행한다. 인물은 골목을 천천히 걷고, 카메라는 손에 들고 따라가는 듯 아주 약하게 흔들린다. Fujifilm X100V 느낌의 차분한 색감, 낮은 대비, 은은한 필름 그레인을 유지한다. 연기, 포즈, 표정은 모두 과하지 않게 둔다.',
    camera: 'Fujifilm X100V style. 35mm natural view. Keep realistic skin texture, soft daylight, muted greens and blues, slightly faded highlights, low contrast, gentle film grain. Avoid studio lighting and over-clean digital sharpness.',
    negative: 'anime, illustration, manga line art, webtoon style, doll face, plastic skin, over-beautified face, oversaturated colors, excessive contrast, harsh sharpening, extra fingers, distorted hands, unreadable text, awkward pose, fake bokeh',
  },
  {
    id: 'anime',
    label: '애니 무드',
    title: '후지필름 애니 무드',
    note: '후지필름 색감을 입힌 한국 청춘 애니 컷 하위 버전',
    meta: '미디엄샷 / 정면 시선 / 35mm 자연 시야 / 여름 자연광',
    image: '4:5 인스타 비율. 후지필름 감성의 한국 골목 청춘 애니 컷. 두 인물은 과하게 포즈를 취하지 않고 자연스럽게 서 있거나 천천히 걷는다. 배경은 햇빛이 부드럽게 내려앉은 조용한 한국 골목, 초록 잎과 하늘색은 은은하게 살아 있다. 선화는 섬세하지만 과하게 번쩍이지 않게, 색감은 차분한 필름 톤으로 정리한다. 살짝 눌린 콘트라스트, 부드러운 하이라이트, 은은한 필름 그레인, 청춘 영화 같은 공기감.',
    video: '6초 영상. 한국 청춘 애니의 한 장면처럼 두 인물이 골목에서 천천히 움직인다. 머리카락과 교복 자락만 살짝 흔들리고, 카메라는 느린 줌인 또는 아주 부드러운 팔로우샷으로 움직인다. 후지필름 느낌의 차분한 그린/블루 톤과 낮은 대비를 유지한다. 표정 변화는 작고 자연스럽게, 과장된 애니 액션은 피한다.',
    camera: 'Anime cinematic frame with Fujifilm-inspired color. 35mm natural view, soft daylight, muted green and blue tones, gentle film grain, low contrast, clean but not glossy linework. Keep the mood quiet, youthful, and cinematic.',
    negative: 'photorealistic face mixed with anime body, over-shiny eyes, neon colors, oversaturated colors, excessive contrast, harsh line art, distorted hands, extra fingers, unreadable text, broken name tag, awkward pose, duplicated person',
  },
];

let activeFujiPreset = FUJI_PRESETS[0];
let fujiMode = false;
let observerTimer: number | undefined;

function fullFujiPrompt() {
  return `IMAGE PROMPT\n\n${activeFujiPreset.image}\n\nVIDEO PROMPT\n\n${activeFujiPreset.video}\n\nCAMERA NOTE\n\n${activeFujiPreset.camera}\n\nNEGATIVE PROMPT\n\n${activeFujiPreset.negative}`;
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

function syncSubSelector() {
  document.querySelectorAll<HTMLElement>('.fujiSubButton').forEach((button) => {
    button.classList.toggle('active', button.dataset.fujiVariant === activeFujiPreset.id);
  });
}

function applyFujiPreset(preset: FujiPreset) {
  activeFujiPreset = preset;
  fujiMode = true;

  setChipActive(0, FUJI_MOOD);
  setChipActive(1, FUJI_SCENE);

  const previewTitle = document.querySelector<HTMLElement>('.scenePreview strong');
  if (previewTitle) previewTitle.textContent = `${FUJI_MOOD} · ${preset.label}`;

  const previewMeta = document.querySelector<HTMLElement>('.scenePreview span');
  if (previewMeta) previewMeta.textContent = preset.meta;

  document.querySelectorAll<HTMLElement>('.promptCard').forEach((card) => {
    const title = card.querySelector('span')?.textContent?.trim();
    const body = card.querySelector('p');
    if (!body) return;
    if (title === 'IMAGE PROMPT') body.textContent = preset.image;
    if (title === 'VIDEO PROMPT') body.textContent = preset.video;
    if (title === 'CAMERA NOTE') body.textContent = preset.camera;
    if (title === 'NEGATIVE PROMPT') body.textContent = preset.negative;
  });

  showFujiSubSelector();
  syncSubSelector();
}

function ensureFujiControls() {
  const pickers = getPickers();
  const moodChips = pickers[0]?.querySelector('.chips');
  const sceneChips = pickers[1]?.querySelector('.chips');

  if (moodChips && !moodChips.querySelector(`[data-fuji-runtime="${FUJI_MOOD}"]`)) {
    moodChips.appendChild(makeChip(FUJI_MOOD, '🎞️', () => applyFujiPreset(activeFujiPreset)));
  }

  if (sceneChips && !sceneChips.querySelector(`[data-fuji-runtime="${FUJI_SCENE}"]`)) {
    sceneChips.appendChild(makeChip(FUJI_SCENE, '🚶', () => applyFujiPreset(activeFujiPreset)));
  }
}

function makeFujiSubSelector() {
  const wrapper = document.createElement('section');
  wrapper.className = 'fujiSubPanel';
  wrapper.dataset.fujiSubPanel = 'true';
  wrapper.innerHTML = `
    <div class="fujiSubHeader">
      <span>FUJIFILM VERSION</span>
      <strong>후지필름 하위 버전 선택</strong>
      <p>먼저 후지필름 감성을 고르고, 아래에서 실사나 애니 톤을 선택하세요.</p>
    </div>
    <div class="fujiSubButtons"></div>
  `;

  const buttonBox = wrapper.querySelector<HTMLElement>('.fujiSubButtons');
  FUJI_PRESETS.forEach((preset) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'fujiSubButton';
    button.dataset.fujiVariant = preset.id;
    button.innerHTML = `<b>${preset.label}</b><small>${preset.note}</small>`;
    button.addEventListener('click', () => applyFujiPreset(preset));
    buttonBox?.appendChild(button);
  });

  return wrapper;
}

function showFujiSubSelector() {
  const pickers = getPickers();
  const firstPicker = pickers[0];
  if (!firstPicker) return;

  let panel = document.querySelector<HTMLElement>('[data-fuji-sub-panel="true"]');
  if (!panel) {
    panel = makeFujiSubSelector();
    firstPicker.insertAdjacentElement('afterend', panel);
  }

  panel.style.display = fujiMode ? 'block' : 'none';
  syncSubSelector();
}

function makeFujiParentPresetCard() {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'presetButton fujiPresetButton';
  button.dataset.fujiPreset = 'parent';
  button.innerHTML = `
    <strong>후지필름 감성</strong>
    <span>차분한 필름 색감으로 실사 스냅과 청춘 애니 무드를 선택하는 프리셋</span>
    <div class="presetMetaGrid">
      <span><b>STEP 1</b>감성 선택</span>
      <span><b>STEP 2</b>실사 / 애니</span>
      <span><b>RATIO</b>4:5 인스타샷</span>
    </div>
    <small>후지필름 감성 안에서 하위 버전을 고르는 방식</small>
  `;
  button.addEventListener('click', () => applyFujiPreset(activeFujiPreset));
  return button;
}

function ensureFujiParentPresetCard() {
  const list = document.querySelector<HTMLElement>('.presetList');
  if (!list) return;

  list.querySelectorAll('[data-fuji-preset]').forEach((item) => {
    if ((item as HTMLElement).dataset.fujiPreset !== 'parent') item.remove();
  });

  if (!list.querySelector('[data-fuji-preset="parent"]')) {
    list.appendChild(makeFujiParentPresetCard());
  }
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
    .fujiSubPanel {
      display: none;
      margin: -2px 0 18px;
      padding: 16px;
      border: 1px solid rgba(118, 149, 230, 0.2);
      border-radius: 24px;
      background:
        radial-gradient(circle at 96% 0%, rgba(207, 239, 255, 0.6), transparent 150px),
        linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 255, 0.94));
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 1), 0 14px 30px rgba(17, 19, 31, 0.06);
    }
    .fujiSubHeader span {
      display: block;
      color: #5d67c8;
      font-size: 10px;
      font-weight: 950;
      letter-spacing: 0.16em;
      margin-bottom: 7px;
    }
    .fujiSubHeader strong {
      display: block;
      color: #11131f;
      font-size: 18px;
      font-weight: 950;
      letter-spacing: -0.04em;
      margin-bottom: 5px;
    }
    .fujiSubHeader p {
      margin: 0 0 12px;
      color: #60677c;
      font-size: 12px;
      font-weight: 800;
      line-height: 1.5;
      word-break: keep-all;
    }
    .fujiSubButtons {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
    }
    .fujiSubButton {
      min-width: 0;
      padding: 14px;
      border: 1px solid rgba(118, 149, 230, 0.22);
      border-radius: 18px;
      background: rgba(255, 255, 255, 0.78);
      color: #172033;
      text-align: left;
      cursor: pointer;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9), 0 10px 20px rgba(17, 19, 31, 0.05);
    }
    .fujiSubButton.active {
      border-color: rgba(93, 103, 200, 0.42);
      background: linear-gradient(135deg, rgba(207, 239, 255, 0.96), rgba(237, 229, 255, 0.94));
    }
    .fujiSubButton b {
      display: block;
      font-size: 15px;
      font-weight: 950;
      margin-bottom: 5px;
    }
    .fujiSubButton small {
      display: block;
      color: #60677c;
      font-size: 11px;
      font-weight: 800;
      line-height: 1.45;
      word-break: keep-all;
    }
    @media (max-width: 640px) {
      .fujiSubPanel { padding: 14px; border-radius: 22px; }
      .fujiSubButtons { grid-template-columns: 1fr; }
      .fujiSubButton { padding: 13px; }
    }
  `;
  document.head.appendChild(style);
}

function runFujiRuntime() {
  installStyles();
  installCopyHook();
  ensureFujiControls();
  ensureFujiParentPresetCard();
  if (fujiMode) applyFujiPreset(activeFujiPreset);
}

runFujiRuntime();

const observer = new MutationObserver(() => {
  window.clearTimeout(observerTimer);
  observerTimer = window.setTimeout(runFujiRuntime, 80);
});

observer.observe(document.documentElement, { childList: true, subtree: true });
