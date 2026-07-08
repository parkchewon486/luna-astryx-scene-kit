type FujiPreset = {
  id: string;
  title: string;
  note: string;
  mood: string;
  scene: string;
  meta: string;
  image: string;
  video: string;
  camera: string;
  negative: string;
};

const FUJI_PRESETS: FujiPreset[] = [
  {
    id: 'fuji-walk',
    title: '후지필름 산책컷',
    note: '차분한 필름 톤과 부드러운 색감으로 골목 산책 장면을 만드는 프리셋',
    mood: '후지필름 감성',
    scene: '골목 산책',
    meta: '미디엄샷 / 정면 시선 / 35mm 자연 시야 / 부드러운 창가빛',
    image: '4:5 인스타 비율. 후지필름 감성의 한국 골목 산책 장면. 미디엄샷 구도, 정면 시선, 35mm 자연 시야 렌즈 느낌. 채도는 과하지 않고 차분한 필름 톤을 유지한다. 초록과 하늘색은 은은하게 살아 있고, 피부톤은 자연스럽고 부드럽다. 은은한 필름 그레인, 살짝 눌린 콘트라스트, 후지 특유의 담백한 색감. 자연스러운 한국 감성, 첫 프레임으로 쓰기 좋은 이미지.',
    video: '6초 영상. 카메라는 인물을 따라 아주 부드럽게 움직인다. 골목을 걷는 잔잔한 무드, 과한 연기 없이 자연스러운 반응만 담는다. 후지필름 특유의 차분한 필름 톤, 부드러운 색 분리, 은은한 필름 감성을 유지한다. 갑작스러운 줌, 과한 손동작, 과장된 표정은 피한다.',
    camera: '35mm 자연 시야 느낌. 미디엄샷. 정면 시선. 채도를 살짝 눌러 필름스러운 여백을 만들고, 그린/블루 계열은 부드럽게 정리한다. 대비는 강하지 않게, 피부는 자연스럽게 유지한다. 필름 그레인이 아주 약하게 느껴지도록 정리한다.',
    negative: 'extra fingers, distorted hands, plastic skin, oversaturated colors, excessive contrast, neon color cast, harsh sharpening, unreadable text, broken facial symmetry, awkward pose',
  },
  {
    id: 'fuji-real-snap',
    title: '후지필름 실사 스냅',
    note: '애니 느낌을 줄이고 실제 카메라로 찍은 거리 사진처럼 만드는 프리셋',
    mood: '후지필름 실사',
    scene: '골목 산책',
    meta: '상반신 샷 / 살짝 측면 / 35mm 자연 시야 / 자연광',
    image: '4:5 인스타 비율. photorealistic Korean street snapshot. Fujifilm X100V style, 35mm natural field of view, candid walking moment in a quiet Korean alley. Natural skin texture, realistic face proportions, soft daylight, muted greens and blues, slightly faded highlights, gentle film grain, low contrast, calm everyday mood. The person should look natural, not overly posed, not over-beautified, and not like a studio portrait.',
    video: '6초 영상. 실제 카메라로 찍은 거리 스냅처럼 자연스럽게 진행한다. 인물은 골목을 천천히 걷고, 카메라는 손에 들고 따라가는 듯 아주 약하게 흔들린다. Fujifilm X100V 느낌의 차분한 색감, 낮은 대비, 은은한 필름 그레인을 유지한다. 연기, 포즈, 표정은 모두 과하지 않게 둔다.',
    camera: 'Fujifilm X100V style. 35mm natural view. Keep realistic skin texture, soft daylight, muted greens and blues, slightly faded highlights, low contrast, gentle film grain. Avoid studio lighting and over-clean digital sharpness.',
    negative: 'anime, illustration, manga line art, webtoon style, doll face, plastic skin, over-beautified face, oversaturated colors, excessive contrast, harsh sharpening, extra fingers, distorted hands, unreadable text, awkward pose, fake bokeh',
  },
  {
    id: 'fuji-anime-mood',
    title: '후지필름 애니 무드',
    note: '후지필름 색감을 입힌 한국 청춘 애니 장면용 프리셋',
    mood: '후지필름 애니',
    scene: '골목 산책',
    meta: '미디엄샷 / 정면 시선 / 35mm 자연 시야 / 여름 자연광',
    image: '4:5 인스타 비율. 후지필름 감성의 한국 골목 청춘 애니 컷. 두 인물은 과하게 포즈를 취하지 않고 자연스럽게 서 있거나 천천히 걷는다. 배경은 햇빛이 부드럽게 내려앉은 조용한 한국 골목, 초록 잎과 하늘색은 은은하게 살아 있다. 선화는 섬세하지만 과하게 번쩍이지 않게, 색감은 차분한 필름 톤으로 정리한다. 살짝 눌린 콘트라스트, 부드러운 하이라이트, 은은한 필름 그레인, 청춘 영화 같은 공기감.',
    video: '6초 영상. 한국 청춘 애니의 한 장면처럼 두 인물이 골목에서 천천히 움직인다. 머리카락과 교복 자락만 살짝 흔들리고, 카메라는 느린 줌인 또는 아주 부드러운 팔로우샷으로 움직인다. 후지필름 느낌의 차분한 그린/블루 톤과 낮은 대비를 유지한다. 표정 변화는 작고 자연스럽게, 과장된 애니 액션은 피한다.',
    camera: 'Anime cinematic frame with Fujifilm-inspired color. 35mm natural view, soft daylight, muted green and blue tones, gentle film grain, low contrast, clean but not glossy linework. Keep the mood quiet, youthful, and cinematic.',
    negative: 'photorealistic face mixed with anime body, over-shiny eyes, neon colors, oversaturated colors, excessive contrast, harsh line art, distorted hands, extra fingers, unreadable text, broken name tag, awkward pose, duplicated person',
  },
  {
    id: 'fuji-rain-window',
    title: '후지필름 비 오는 창가',
    note: '창문 빗방울과 흐린 자연광을 살리는 차분한 필름 프리셋',
    mood: '후지필름 감성',
    scene: '비 오는 창가',
    meta: '상반신 샷 / 창밖 시점 / 50mm 인물 렌즈 / 흐린 창가빛',
    image: '4:5 인스타 비율. 후지필름 감성의 비 오는 창가 인물 장면. 창문에는 작은 빗방울이 맺혀 있고, 바깥 풍경은 살짝 흐리게 번진다. 인물은 창가 가까이에 앉거나 기대어 있으며 과한 포즈 없이 조용한 표정만 남긴다. 색감은 채도를 낮춘 그린/블루 톤, 부드러운 회색빛 하이라이트, 약한 필름 그레인, 낮은 대비. 자연스러운 한국 감성, 차분하고 오래된 사진 같은 분위기.',
    video: '6초 영상. 창밖 빗방울이 아주 천천히 흐르고, 인물은 시선을 살짝 돌리거나 숨을 고르는 정도로만 움직인다. 카메라는 거의 고정되어 있고 아주 느린 줌인만 허용한다. 후지필름 특유의 부드러운 색 분리, 낮은 대비, 흐린 창가빛을 유지한다. 갑작스러운 움직임, 과한 표정, 강한 네온 반사는 피한다.',
    camera: '50mm portrait lens feel. Soft rainy window light, muted green and blue tones, low contrast, slightly faded highlights, gentle film grain. Keep the face natural and the mood quiet. Use shallow depth only lightly.',
    negative: 'heavy rainstorm, dramatic thunder, neon reflection, oversaturated colors, excessive contrast, plastic skin, extra fingers, distorted hands, unreadable text, broken face symmetry, overacting, harsh sharpening',
  },
  {
    id: 'fuji-cafe-window',
    title: '후지필름 카페 창가',
    note: '카페 창가의 따뜻한 빛과 필름 색감을 살리는 프리셋',
    mood: '후지필름 감성',
    scene: '카페 창가',
    meta: '미디엄샷 / 살짝 측면 / 35mm 자연 시야 / 따뜻한 창가빛',
    image: '4:5 인스타 비율. 후지필름 감성의 카페 창가 장면. 인물은 창가 자리에 자연스럽게 앉아 있고, 테이블 위에는 커피잔이나 작은 소품이 과하지 않게 놓여 있다. 따뜻한 창가빛이 얼굴과 손에 부드럽게 닿는다. 색감은 크림색, 브라운, muted green을 중심으로 차분하게 정리한다. 과한 보정 없이 자연스러운 피부톤, 약한 필름 그레인, 살짝 눌린 콘트라스트, 조용한 오후의 분위기.',
    video: '6초 영상. 인물은 카페 창가에서 컵을 가볍게 만지거나 창밖을 바라본다. 움직임은 작고 자연스럽다. 카메라는 느린 줌인 또는 고정샷을 유지한다. 따뜻한 창가빛, 후지필름스러운 낮은 대비, 부드러운 브라운/그린 톤을 유지한다. 컵, 손, 얼굴이 깨지지 않게 안정적으로 유지한다.',
    camera: '35mm natural view. Warm window light, muted cream and brown tones, soft greens, low contrast, gentle film grain. Keep it calm, realistic, and not overly polished.',
    negative: 'crowded cafe, unreadable menu text, extra fingers, distorted hands, plastic skin, oversaturated orange, excessive contrast, harsh sharpening, awkward cup holding, broken face symmetry, fake smile',
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

function applyFujiPreset(preset: FujiPreset) {
  activeFujiPreset = preset;
  fujiMode = true;

  setChipActive(0, preset.mood);
  setChipActive(1, preset.scene);

  const previewTitle = document.querySelector<HTMLElement>('.scenePreview strong');
  if (previewTitle) previewTitle.textContent = `${preset.mood} · ${preset.scene}`;

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
}

function ensureFujiControls() {
  const pickers = getPickers();
  const moodChips = pickers[0]?.querySelector('.chips');
  const sceneChips = pickers[1]?.querySelector('.chips');

  const moodDefaults = new Map<string, FujiPreset>();
  const sceneDefaults = new Map<string, FujiPreset>();

  FUJI_PRESETS.forEach((preset) => {
    if (!moodDefaults.has(preset.mood)) moodDefaults.set(preset.mood, preset);
    if (!sceneDefaults.has(preset.scene)) sceneDefaults.set(preset.scene, preset);
  });

  moodDefaults.forEach((preset, mood) => {
    if (moodChips && !moodChips.querySelector(`[data-fuji-runtime="${mood}"]`)) {
      moodChips.appendChild(makeChip(mood, mood.includes('애니') ? '🎨' : '🎞️', () => applyFujiPreset(preset)));
    }
  });

  sceneDefaults.forEach((preset, scene) => {
    if (sceneChips && !sceneChips.querySelector(`[data-fuji-runtime="${scene}"]`)) {
      const emoji = scene.includes('카페') ? '☕' : scene.includes('비') ? '🌧️' : '🚶';
      sceneChips.appendChild(makeChip(scene, emoji, () => applyFujiPreset(preset)));
    }
  });
}

function makeFujiPresetCard(preset: FujiPreset) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'presetButton fujiPresetButton';
  button.dataset.fujiPreset = preset.id;
  button.innerHTML = `
    <strong>${preset.title}</strong>
    <span>${preset.note}</span>
    <div class="presetMetaGrid">
      <span><b>TYPE</b>${preset.id.includes('real') ? 'Photo Real' : preset.id.includes('anime') ? 'Anime Mood' : 'Image Prompt'}</span>
      <span><b>BEST FOR</b>${preset.scene}</span>
      <span><b>RATIO</b>4:5 인스타샷</span>
    </div>
    <small>${preset.mood} · ${preset.meta.split('/')[2]?.trim() ?? '35mm 자연 시야'}</small>
  `;
  button.addEventListener('click', () => applyFujiPreset(preset));
  return button;
}

function ensureFujiPresetCards() {
  const list = document.querySelector<HTMLElement>('.presetList');
  if (!list) return;

  FUJI_PRESETS.forEach((preset) => {
    if (!list.querySelector(`[data-fuji-preset="${preset.id}"]`)) {
      list.appendChild(makeFujiPresetCard(preset));
    }
  });
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
  ensureFujiPresetCards();
  if (fujiMode) applyFujiPreset(activeFujiPreset);
}

runFujiRuntime();

const observer = new MutationObserver(() => {
  window.clearTimeout(observerTimer);
  observerTimer = window.setTimeout(runFujiRuntime, 80);
});

observer.observe(document.documentElement, { childList: true, subtree: true });
