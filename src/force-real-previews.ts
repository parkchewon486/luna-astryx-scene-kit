const REAL_PREVIEW_MAP = [
  {
    key: '치비',
    title: '볼꼬집 미니 치비',
    note: '프로필 사진을 프리미엄 레진 아트돌 느낌으로 바꾸는 치비 프리셋',
    image: '/presets/chibi-resin-doll.svg',
    category: '치비이미지',
    badge: 'CHIBI RESIN',
  },
  {
    key: '흐린날 그레이빛',
    title: '흐린날 그레이빛 감성샷',
    note: '저채도 회청빛 도시 톤, 고딕 벽돌 건물 앞의 조용한 사색 컷',
    image: '/presets/gothic-gray-mood.svg',
    category: '디카감성',
    badge: 'GRAY SNAP',
  },
];

let forcePreviewTimer: number | undefined;
let forcePreviewInterval: number | undefined;

function getActiveTabText() {
  return Array.from(document.querySelectorAll<HTMLElement>('.presetTab'))
    .find((tab) => tab.classList.contains('active'))
    ?.textContent
    ?.trim() ?? '';
}

function realPreviewMarkup(item: (typeof REAL_PREVIEW_MAP)[number]) {
  return `
    <div class="presetThumb forceRealPreview" data-force-real-preview="${item.key}">
      <img src="${item.image}" alt="${item.title}" loading="eager" />
      <div class="forcePreviewShade"></div>
      <em>${item.badge}</em>
    </div>
  `;
}

function forceReplacePreview(card: HTMLElement, item: (typeof REAL_PREVIEW_MAP)[number]) {
  const current = card.querySelector<HTMLElement>('.forceRealPreview');
  if (current?.dataset.forceRealPreview === item.key) return;

  card.querySelectorAll('.presetThumb').forEach((thumb) => thumb.remove());
  card.insertAdjacentHTML('afterbegin', realPreviewMarkup(item));
  card.classList.add('hasForceRealPreview');
}

function makeGothicCard() {
  const item = REAL_PREVIEW_MAP[1];
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'presetButton forceGothicCard hasForceRealPreview';
  button.dataset.forceGothicCard = 'true';
  button.innerHTML = `
    ${realPreviewMarkup(item)}
    <strong>${item.title}</strong>
    <span>${item.note}</span>
    <div class="presetMetaGrid">
      <span><b>TYPE</b>Scene Prompt</span>
      <span><b>BEST FOR</b>감정선 있는 인물 스냅</span>
      <span><b>RATIO</b>4:5 인스타샷</span>
    </div>
    <small>그레이 도시 감성 · 고딕 벽돌 계단</small>
  `;
  button.addEventListener('click', () => {
    const chip = Array.from(document.querySelectorAll<HTMLButtonElement>('.chip')).find((item) => item.textContent?.includes('그레이 도시 감성'));
    chip?.click();
    window.setTimeout(() => {
      if (!chip) {
        document.querySelectorAll<HTMLElement>('.promptCard').forEach((card) => {
          const label = card.querySelector('span')?.textContent?.trim();
          const body = card.querySelector('p');
          if (!body) return;
          if (label === 'IMAGE PROMPT') body.textContent = '흐린날 그레이빛 감성샷. 업로드한 얼굴 이미지를 인물 정체성 기준으로 사용하고, 오래된 고딕 벽돌 건물 앞 젖은 돌계단에 자연스럽게 앉아 있는 4:5 iPhone snapshot. 차갑고 바랜 회청빛 도시톤, 저채도, 창백한 피부, 실제 피부결, 살짝 지친 눈빛, 먼 곳을 바라보는 몽환적인 표정, soft overcast daylight, quiet loneliness, dreamy melancholy.';
          if (label === 'VIDEO PROMPT') body.textContent = '6초 영상. 흐린 오후, 고딕 벽돌 건물 앞 젖은 돌계단에 인물이 자연스럽게 앉아 먼 곳을 바라본다. 아주 약한 handheld iPhone 느낌, 차갑고 바랜 회청빛 도시톤, 저채도, 약한 필름 그레인 유지.';
          if (label === 'CAMERA NOTE') body.textContent = '4:5 Instagram portrait, authentic iPhone snapshot, slightly low angle, 1.5~2m distance, soft overcast daylight, shallow depth of field, cold gray urban tones.';
          if (label === 'NEGATIVE PROMPT') body.textContent = 'warm tones, orange glow, idol photoshoot, influencer look, fashion editorial, studio photography, heavy makeup, beauty retouch, luxury styling, jacket, lace blouse, full body shot, headshot, tight crop, overposed look, bad hands, watermark';
        });
      }
    }, 80);
  });
  return button;
}

function forceApplyRealPreviews() {
  const tab = getActiveTabText();
  const list = document.querySelector<HTMLElement>('.presetList');
  if (!list) return;

  const cards = Array.from(list.querySelectorAll<HTMLElement>('.presetButton'));

  cards.forEach((card) => {
    const title = card.querySelector('strong')?.textContent?.trim() ?? '';
    if (tab === '치비이미지' && title.includes('치비')) {
      forceReplacePreview(card, REAL_PREVIEW_MAP[0]);
    }
    if (title.includes('흐린날') || title.includes('그레이빛')) {
      forceReplacePreview(card, REAL_PREVIEW_MAP[1]);
    }
  });

  if (tab === '디카감성' && !list.querySelector('[data-force-gothic-card="true"]')) {
    list.appendChild(makeGothicCard());
  }
}

function installForcePreviewStyles() {
  const old = document.getElementById('force-real-preview-style');
  if (old) old.remove();

  const style = document.createElement('style');
  style.id = 'force-real-preview-style';
  style.textContent = `
    .forceRealPreview {
      position: relative !important;
      height: 178px !important;
      margin: -4px 0 16px !important;
      overflow: hidden !important;
      border-radius: 22px !important;
      border: 1px solid rgba(118, 149, 230, 0.22) !important;
      background: #edf1f8 !important;
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,1),
        0 16px 30px rgba(17,19,31,0.08) !important;
    }

    .forceRealPreview img {
      width: 100% !important;
      height: 100% !important;
      object-fit: cover !important;
      display: block !important;
      transform: scale(1.01) !important;
    }

    .forcePreviewShade {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, transparent 48%, rgba(17,19,31,0.32));
      pointer-events: none;
    }

    .forceRealPreview em {
      position: absolute;
      left: 12px;
      bottom: 12px;
      padding: 7px 10px;
      border-radius: 999px;
      background: rgba(255,255,255,0.82);
      color: #11131f;
      font-size: 10px;
      font-style: normal;
      font-weight: 950;
      letter-spacing: 0.12em;
      box-shadow: inset 0 1px 0 rgba(255,255,255,1), 0 8px 18px rgba(17,19,31,0.08);
      backdrop-filter: blur(12px);
    }

    .hasForceRealPreview .sceneCanvas {
      display: none !important;
    }

    @media (max-width: 640px) {
      .forceRealPreview {
        height: 152px !important;
        border-radius: 20px !important;
      }
    }
  `;
  document.head.appendChild(style);
}

function runForceRealPreviews() {
  installForcePreviewStyles();
  forceApplyRealPreviews();
}

runForceRealPreviews();

const forceObserver = new MutationObserver(() => {
  window.clearTimeout(forcePreviewTimer);
  forcePreviewTimer = window.setTimeout(runForceRealPreviews, 80);
});

forceObserver.observe(document.documentElement, { childList: true, subtree: true });

window.clearInterval(forcePreviewInterval);
forcePreviewInterval = window.setInterval(runForceRealPreviews, 700);
window.setTimeout(() => window.clearInterval(forcePreviewInterval), 12000);
