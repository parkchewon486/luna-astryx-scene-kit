type CustomPreset = {
  id: string;
  title: string;
  note: string;
  category: '디카감성' | '치비이미지';
  bestFor: string;
  ratio: string;
  imageUrl: string;
  mood: string;
  scene: string;
  meta: string;
  image: string;
  video: string;
  camera: string;
  negative: string;
};

const CUSTOM_PRESETS: Record<string, CustomPreset> = {
  gothic: {
    id: 'gothic-gray',
    title: '흐린날 그레이빛 감성샷',
    note: '저채도 회청빛 도시 톤, 고딕 벽돌 건물 앞의 조용한 사색 컷',
    category: '디카감성',
    bestFor: '감정선 있는 인물 스냅',
    ratio: '4:5 인스타샷',
    imageUrl: '/presets/gothic-gray-mood.svg',
    mood: '그레이 도시 감성',
    scene: '고딕 벽돌 계단',
    meta: '4:5 / iPhone snapshot / 흐린날 자연광 / low saturation',
    image: `업로드한 얼굴 이미지를 인물 정체성 기준으로 사용해줘. 동일 인물 유지 최우선. 눈, 코, 입, 얼굴형, 턱선, 광대, 피부톤, 눈매, 입술 비율, 전체 인상을 최대한 유지해줘. 원본 인물 느낌은 살리되 자연스럽고 예쁘게 표현해줘. 과한 미인화 금지. 성형된 듯한 얼굴 금지. 과도한 피부 보정 금지. 과한 메이크업 금지. 아이돌 화보 느낌 금지. 인플루언서 촬영 느낌 금지.\n\n창백한 피부, 실제 피부결이 느껴지는 얼굴, 눈 밑에 아주 약한 피곤함, 살짝 지친 눈빛, 멀리 바라보는 몽환적인 표정. 카메라를 직접 보지 않고 고개는 살짝 들고 먼 곳을 바라본다. 긴 스트레이트 다크브라운 헤어, 자연스럽게 흐트러진 잔머리, 바람에 조금 흩어진 느낌.\n\n의상 고정: 크림색 골지 긴팔 가디건, 얇고 가벼운 소재, 몸에 자연스럽게 붙는 핏, 둥근 넥라인, 작은 단추 디테일. 하의는 faded charcoal wide jeans. 신발은 simple black shoes. 자켓 금지, 레이스 블라우스 금지, 트위드 자켓 금지, 체인 장식 금지, 명품 스타일 의상 금지.\n\n오래된 고딕 양식의 붉은 벽돌 건물 앞. 세월이 느껴지는 돌기둥, 어두운 아치형 창문, 낡은 석재 디테일, 비에 젖은 듯한 돌계단, 조용한 도시 거리. 사람 거의 없음. 붉은 벽돌은 채도를 많이 낮춰 회갈색으로 보이게. 회색과 청회색이 지배적인 도시 분위기. 비 오기 직전의 쓸쓸한 유럽 골목 느낌.\n\n구름 낀 오후, soft overcast daylight, 자연광, 확산된 빛, 강한 그림자 없음, 차갑고 습한 공기감. authentic iPhone snapshot, Instagram portrait photo, candid photography, 우연히 찍힌 자연스러운 스냅사진. 포즈 잡은 느낌 금지, fashion editorial 금지, studio photography 금지, 광고 사진 느낌 금지.\n\n4:5 세로 비율. 카메라는 인물보다 약간 낮은 위치, 거리 약 1.5~2m. 얼굴과 상체, 허벅지, 무릎 일부가 함께 보이는 구도. 전신샷 금지, 얼굴 클로즈업 금지, 헤드샷 금지. 돌계단에 자연스럽게 앉아 있고, 몸은 살짝 옆으로 향하고, 상체는 조금 앞으로 기울어져 있으며 팔은 무릎 위에 자연스럽게 놓인다.\n\n색보정은 cold gray urban tones, dusty blue-gray atmosphere, heavily desaturated colors, washed-out faded colors, very low saturation, desaturated gray-brown brick, cool blue-gray shadows, slightly underexposed, soft film grain, moody urban color grading, almost monochromatic color palette. 전체 분위기는 quiet loneliness, dreamy melancholy, urban solitude, old gothic city, gentle sadness, contemplative mood.`,
    video: `6초 영상. 흐린 오후, 오래된 고딕 벽돌 건물 앞 젖은 돌계단에 인물이 자연스럽게 앉아 먼 곳을 바라본다. 카메라는 아이폰으로 우연히 찍은 듯 아주 미세한 handheld 느낌만 남긴다. 강한 움직임 없이 머리카락과 옷자락만 조금 흔들린다. 전체 색감은 차갑고 바랜 회청빛 도시톤, 저채도, 약한 필름 그레인, 조용한 고독감 유지.`,
    camera: `4:5 Instagram portrait. authentic iPhone snapshot. slightly low angle. camera distance 1.5 to 2m. face, upper body, thighs and partial knees visible. soft overcast daylight. shallow depth of field. slightly underexposed. cold gray urban tones. dusty blue-gray atmosphere. soft film grain.`,
    negative: `warm tones, orange glow, cozy vintage warmth, cinematic orange teal look, idol photoshoot, influencer look, fashion editorial, studio photography, advertising photo, heavy makeup, beauty retouch, plastic skin, over-smoothed skin, luxury styling, jacket, lace blouse, tweed jacket, chain detail, full body shot, headshot, tight crop, direct eye contact, overposed look, extra fingers, bad hands, blurry, watermark, text artifacts`,
  },
  chibi: {
    id: 'chibi-resin',
    title: '볼꼬집 미니 치비',
    note: '프로필 사진을 프리미엄 레진 아트돌 느낌으로 바꾸는 치비 프리셋',
    category: '치비이미지',
    bestFor: '프로필 기반 캐릭터화',
    ratio: '1:1 정사각형',
    imageUrl: '/presets/chibi-resin-doll.svg',
    mood: '치비 레진돌',
    scene: '손바닥 위',
    meta: '1:1 / macro doll photography / palm pose / cheek pinch',
    image: `CHIBI RESIN ART DOLL ON PALM. SEAMLESS PREMIUM RESIN DOLL VERSION. GENDER-ADAPTIVE VERSION. UPLOAD ONLY ONE PROFILE PHOTO.\n\nUse the uploaded profile photo as the only identity reference. Create a tiny premium handcrafted chibi resin art doll based on the uploaded person. The final result must clearly look like a collectible artisan resin doll. It must NOT look like a tiny real human. It must NOT look like a shrunken person. It must look like a seamless premium resin doll first.\n\nPreserve the uploaded person's identity clearly and recognizably: gender, adult age impression, facial identity, face shape, eye shape, nose shape, mouth shape, lip shape, smile impression, cheek shape, skin tone translated into resin tone, hairstyle, hair length, bangs, hair volume, hair silhouette, hair color, accessories visible in the uploaded photo, and overall recognizable appearance. Do not change gender. Do not make the doll look like a child or baby.\n\nThe face must be a stylized premium resin doll face with smooth polished resin surface, clean sculpted facial planes, soft doll-like finish, oversized chibi doll head, tiny seamless doll body, large glossy glass-like doll eyes, cute refined proportions, artisan resin doll sculpt quality, and museum-quality collectible finish. Keep the original eye angle, eye spacing, and expression.\n\nNO VISIBLE JOINTS. The doll must have a seamless resin doll body. Do not show visible ball joints, round elbow joints, round knee joints, wrist joints, ankle joints, segmented limbs, joint gaps, mechanical articulation, or exposed cut lines. Arms and legs should look smooth, soft, and seamless.\n\nIf female, use a cute premium black doll dress: black off-shoulder mini dress, soft puff sleeves, delicate lace trim, tiny ribbon detail at the waist, slightly flared skirt, white frilly ankle socks, glossy black Mary Jane doll shoes, small delicate necklace if suitable. No lingerie, no swimsuit, no overly sexy pose.\n\nIf male, use cute casual streetwear: oversized gray cotton hoodie, relaxed blue jeans, white Adidas Samba style sneakers, black three stripes, clean casual resin doll styling.\n\nScene: a realistic human palm is holding the tiny doll. The doll is sitting comfortably in the center of the palm. A second realistic human hand gently pinches the doll's right cheek with thumb and index finger. The cheek must visibly squish in a cute way. The doll is looking directly at the camera. Only one doll. Full body visible, head fully visible, both arms and legs visible, shoes visible. Warm cozy bedroom, amber bedside lamp, dark curtains, soft cinematic bokeh, small floating white doodle hearts, luxury collectible doll photography mood. Macro collectible doll photography, slightly top-down angle, 85mm lens look, shallow depth of field, professional studio lighting, ultra detailed doll craftsmanship, high-end toy catalog photography, square composition, 1:1 ratio.`,
    video: `5초 영상. 손바닥 위에 앉은 프리미엄 치비 레진돌. 다른 손이 볼을 아주 살짝 꼬집고, 볼이 귀엽게 눌린다. 작은 흰색 하트 드로잉이 주변에 살짝 떠오른다. 따뜻한 침실 조명, 얕은 심도, 고급 토이 카탈로그 느낌. 인형은 한 개만 유지.`,
    camera: `1:1 square composition. macro collectible doll photography. slightly top-down angle. 85mm lens look. shallow depth of field. warm amber bedside lamp. high-end toy catalog photography. full doll visible on a realistic palm.`,
    negative: `real human face, miniature human, shrunken person, photorealistic human skin, pores, wrinkles, visible ball joints, BJD joints, round elbow joints, round knee joints, wrist joints, ankle joints, segmented limbs, joint gaps, mechanical articulation, wrong gender, gender swap, generic cute face, child face, baby face, oversized baby eyes, anime, cartoon, Funko Pop, Barbie, plastic toy, action figure, identity loss, changed hairstyle, wrong outfit, duplicate doll, duplicate face, bad hands, extra fingers, missing fingers, cropped body, cropped feet, blurry, low quality, text artifacts, watermark, logo artifacts`,
  },
};

let activeCustomPreset: CustomPreset | null = null;
let customTimer: number | undefined;

function fullCustomPrompt(preset: CustomPreset) {
  return `IMAGE PROMPT\n\n${preset.image}\n\nVIDEO PROMPT\n\n${preset.video}\n\nCAMERA NOTE\n\n${preset.camera}\n\nNEGATIVE PROMPT\n\n${preset.negative}`;
}

function currentPresetTab() {
  return Array.from(document.querySelectorAll<HTMLElement>('.presetTab')).find((tab) => tab.classList.contains('active'))?.textContent?.trim() ?? '';
}

function getPickers() {
  return Array.from(document.querySelectorAll<HTMLElement>('.picker'));
}

function addChip(pickerIndex: number, label: string, emoji: string, onClick: () => void) {
  const chips = getPickers()[pickerIndex]?.querySelector<HTMLElement>('.chips');
  if (!chips || chips.querySelector(`[data-custom-chip="${label}"]`)) return;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'chip customChip';
  button.dataset.customChip = label;
  button.innerHTML = `<span>${emoji}</span>${label}`;
  button.addEventListener('click', onClick);
  chips.appendChild(button);
}

function setChipActive(pickerIndex: number, label: string) {
  const picker = getPickers()[pickerIndex];
  if (!picker) return;
  picker.querySelectorAll('.chip').forEach((chip) => chip.classList.remove('active'));
  Array.from(picker.querySelectorAll<HTMLElement>('.chip')).find((chip) => chip.textContent?.includes(label))?.classList.add('active');
}

function ensureCustomControls() {
  addChip(0, CUSTOM_PRESETS.gothic.mood, '🌫️', () => applyCustomPreset(CUSTOM_PRESETS.gothic));
  addChip(1, CUSTOM_PRESETS.gothic.scene, '🏛️', () => applyCustomPreset(CUSTOM_PRESETS.gothic));
}

function realThumb(preset: CustomPreset) {
  return `<div class="presetThumb realPresetThumb"><img src="${preset.imageUrl}" alt="${preset.title}" loading="lazy"/><em>${preset.title}</em></div>`;
}

function makeCustomCard(preset: CustomPreset) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `presetButton customRealPreset customRealPreset-${preset.id}`;
  button.dataset.customPreset = preset.id;
  button.innerHTML = `
    ${realThumb(preset)}
    <strong>${preset.title}</strong>
    <span>${preset.note}</span>
    <div class="presetMetaGrid">
      <span><b>TYPE</b>${preset.category === '치비이미지' ? 'Image Prompt' : 'Scene Prompt'}</span>
      <span><b>BEST FOR</b>${preset.bestFor}</span>
      <span><b>RATIO</b>${preset.ratio}</span>
    </div>
    <small>${preset.mood} · ${preset.scene}</small>
  `;
  button.addEventListener('click', () => applyCustomPreset(preset));
  return button;
}

function replaceThumb(card: HTMLElement, preset: CustomPreset) {
  const existing = card.querySelector('.presetThumb');
  if (existing?.classList.contains('realPresetThumb')) return;
  existing?.remove();
  card.insertAdjacentHTML('afterbegin', realThumb(preset));
  card.classList.add('hasRealPreview');
}

function ensureCustomCards() {
  const list = document.querySelector<HTMLElement>('.presetList');
  if (!list) return;
  const tab = currentPresetTab();

  if (tab === '디카감성' && !list.querySelector('[data-custom-preset="gothic-gray"]')) {
    list.appendChild(makeCustomCard(CUSTOM_PRESETS.gothic));
  }

  if (tab === '치비이미지') {
    const chibiCards = Array.from(list.querySelectorAll<HTMLElement>('.presetButton')).filter((card) => {
      const title = card.querySelector('strong')?.textContent?.trim() ?? '';
      return title.includes('치비');
    });

    chibiCards.forEach((card) => {
      replaceThumb(card, CUSTOM_PRESETS.chibi);
      if (card.dataset.customChibiHook !== 'true') {
        card.dataset.customChibiHook = 'true';
        card.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopImmediatePropagation();
          applyCustomPreset(CUSTOM_PRESETS.chibi);
        }, true);
      }
    });

    if (!chibiCards.length && !list.querySelector('[data-custom-preset="chibi-resin"]')) {
      list.appendChild(makeCustomCard(CUSTOM_PRESETS.chibi));
    }
  }
}

function applyCustomPreset(preset: CustomPreset) {
  activeCustomPreset = preset;

  if (preset.id === 'gothic-gray') {
    setChipActive(0, preset.mood);
    setChipActive(1, preset.scene);
  } else {
    setChipActive(0, '치비 레진돌');
    setChipActive(1, '손바닥 위');
  }

  const previewTitle = document.querySelector<HTMLElement>('.scenePreview strong');
  if (previewTitle) previewTitle.textContent = `${preset.mood} · ${preset.scene}`;

  const previewMeta = document.querySelector<HTMLElement>('.scenePreview span');
  if (previewMeta) previewMeta.textContent = preset.meta;

  document.querySelectorAll<HTMLElement>('.promptCard').forEach((card) => {
    const label = card.querySelector('span')?.textContent?.trim();
    const body = card.querySelector('p');
    if (!body) return;
    if (label === 'IMAGE PROMPT') body.textContent = preset.image;
    if (label === 'VIDEO PROMPT') body.textContent = preset.video;
    if (label === 'CAMERA NOTE') body.textContent = preset.camera;
    if (label === 'NEGATIVE PROMPT') body.textContent = preset.negative;
  });

  document.querySelectorAll('.presetButton').forEach((card) => card.classList.remove('activeCustomPreset'));
  document.querySelectorAll<HTMLElement>('.presetButton').forEach((card) => {
    const title = card.querySelector('strong')?.textContent?.trim() ?? '';
    if (title === preset.title || (preset.id === 'chibi-resin' && title.includes('치비'))) {
      card.classList.add('activeCustomPreset');
    }
  });
}

function installCustomCopyHook() {
  if (document.body.dataset.customPresetCopyHook === 'true') return;
  document.body.dataset.customPresetCopyHook = 'true';
  document.addEventListener('click', (event) => {
    const button = (event.target as HTMLElement | null)?.closest('button');
    if (!button || !activeCustomPreset) return;
    if (!button.textContent?.includes('전체 프롬프트 복사')) return;
    window.setTimeout(() => {
      if (activeCustomPreset) navigator.clipboard?.writeText(fullCustomPrompt(activeCustomPreset)).catch(() => undefined);
    }, 70);
  }, true);
}

function installCustomExitHook() {
  if (document.body.dataset.customPresetExitHook === 'true') return;
  document.body.dataset.customPresetExitHook = 'true';
  document.addEventListener('click', (event) => {
    const button = (event.target as HTMLElement | null)?.closest('button');
    if (!button) return;
    const isCustom = Boolean(button.dataset.customPreset || button.dataset.customChip || button.closest('.customRealPreset'));
    const isCopy = Boolean(button.classList.contains('promptCopyButton') || button.textContent?.includes('전체 프롬프트 복사'));
    if (!isCustom && !isCopy && (button.classList.contains('chip') || button.classList.contains('presetButton'))) {
      activeCustomPreset = null;
      document.querySelectorAll('.activeCustomPreset').forEach((item) => item.classList.remove('activeCustomPreset'));
    }
  }, true);
}

function installCustomStyles() {
  if (document.getElementById('custom-real-presets-style')) return;
  const style = document.createElement('style');
  style.id = 'custom-real-presets-style';
  style.textContent = `
    .realPresetThumb {
      position: relative !important;
      height: 174px !important;
      margin: -4px 0 16px !important;
      overflow: hidden !important;
      border-radius: 22px !important;
      background: #edf1f8 !important;
      border: 1px solid rgba(118, 149, 230, 0.2) !important;
      box-shadow: inset 0 1px 0 rgba(255,255,255,1), 0 16px 30px rgba(17,19,31,0.08) !important;
    }
    .realPresetThumb img {
      width: 100% !important;
      height: 100% !important;
      object-fit: cover !important;
      display: block !important;
      transform: scale(1.01) !important;
    }
    .realPresetThumb em {
      position: absolute;
      left: 12px;
      bottom: 12px;
      max-width: calc(100% - 24px);
      padding: 7px 10px;
      border-radius: 999px;
      background: rgba(255,255,255,0.78);
      color: #11131f;
      font-size: 11px;
      font-style: normal;
      font-weight: 950;
      letter-spacing: -0.02em;
      box-shadow: inset 0 1px 0 rgba(255,255,255,1), 0 8px 18px rgba(17,19,31,0.08);
      backdrop-filter: blur(12px);
    }
    .customRealPreset-gothic-gray,
    .activeCustomPreset.customRealPreset-gothic-gray {
      background: linear-gradient(180deg, rgba(248,250,255,0.98), rgba(235,241,248,0.94)) !important;
    }
    .activeCustomPreset {
      outline: 2px solid rgba(93, 103, 200, 0.42) !important;
      box-shadow: 0 18px 36px rgba(93,103,200,0.12) !important;
    }
    @media (max-width: 640px) {
      .realPresetThumb { height: 148px !important; border-radius: 20px !important; }
      .realPresetThumb em { font-size: 10px; }
    }
  `;
  document.head.appendChild(style);
}

function runCustomPresets() {
  installCustomStyles();
  installCustomCopyHook();
  installCustomExitHook();
  ensureCustomControls();
  ensureCustomCards();
}

runCustomPresets();

const customObserver = new MutationObserver(() => {
  window.clearTimeout(customTimer);
  customTimer = window.setTimeout(runCustomPresets, 120);
});

customObserver.observe(document.documentElement, { childList: true, subtree: true });
