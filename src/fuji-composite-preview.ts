const FUJI_REAL_IMAGE = '/publicpresetsfuji-real-snap.png';
const FUJI_ANIME_IMAGE = '/publicpresetsfuji-anime-mood.png';

const FUJI_GALLERY = [
  { src: FUJI_REAL_IMAGE, label: 'REAL SNAP', alt: '후지필름 감성 실사 스냅' },
  { src: FUJI_ANIME_IMAGE, label: 'ANIME MOOD', alt: '후지필름 감성 청춘 애니 무드' },
];

let fujiCompositeTimer: number | undefined;
let fujiGalleryIndex = 0;

function installFujiCompositeStyles() {
  const old = document.getElementById('fuji-composite-preview-style');
  if (old) old.remove();

  const style = document.createElement('style');
  style.id = 'fuji-composite-preview-style';
  style.textContent = `
    .fujiPresetButton.hasFujiComposite {
      overflow: hidden !important;
    }

    .fujiCompositePreview {
      position: relative !important;
      display: block !important;
      width: 100% !important;
      aspect-ratio: 16 / 10 !important;
      margin: -2px 0 18px !important;
      padding: 0 !important;
      border: 1px solid rgba(118, 149, 230, 0.24) !important;
      border-radius: 28px !important;
      overflow: hidden !important;
      background: linear-gradient(135deg, #f7f8fc 0%, #eef4ff 100%) !important;
      cursor: zoom-in !important;
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,1),
        0 16px 34px rgba(17, 19, 31, 0.08) !important;
    }

    .fujiCompositeMain {
      width: 100% !important;
      height: 100% !important;
      object-fit: cover !important;
      object-position: center center !important;
      display: block !important;
      transform: none !important;
      filter: saturate(0.96) contrast(0.98) !important;
    }

    .fujiCompositeSubWrap {
      position: absolute !important;
      right: 16px !important;
      bottom: 16px !important;
      z-index: 3 !important;
      width: 34% !important;
      max-width: 160px !important;
      min-width: 92px !important;
      aspect-ratio: 4 / 5 !important;
      border-radius: 20px !important;
      overflow: hidden !important;
      border: 2px solid rgba(255,255,255,0.88) !important;
      background: #fff !important;
      box-shadow: 0 16px 34px rgba(17,19,31,0.22) !important;
    }

    .fujiCompositeSub {
      width: 100% !important;
      height: 100% !important;
      object-fit: cover !important;
      object-position: center center !important;
      display: block !important;
      transform: none !important;
    }

    .fujiCompositeShade {
      position: absolute !important;
      inset: 0 !important;
      z-index: 2 !important;
      pointer-events: none !important;
      background:
        linear-gradient(180deg, rgba(17,19,31,0.02), rgba(17,19,31,0.28)),
        radial-gradient(circle at 96% 96%, rgba(255,255,255,0.16), transparent 160px) !important;
    }

    .fujiCompositeBadge {
      position: absolute !important;
      z-index: 4 !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      min-height: 30px !important;
      padding: 0 12px !important;
      border-radius: 999px !important;
      font-size: 10px !important;
      font-weight: 950 !important;
      letter-spacing: 0.12em !important;
      box-shadow: 0 8px 18px rgba(16, 24, 40, 0.14) !important;
      backdrop-filter: blur(12px) !important;
      pointer-events: none !important;
    }

    .fujiCompositeBadge.real {
      left: 14px !important;
      bottom: 14px !important;
      background: rgba(255,255,255,0.9) !important;
      color: #11131f !important;
    }

    .fujiCompositeBadge.anime {
      right: 14px !important;
      top: 14px !important;
      background: rgba(17,19,31,0.88) !important;
      color: #fff !important;
    }

    .fujiGalleryOverlay {
      position: fixed !important;
      inset: 0 !important;
      z-index: 100001 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      padding: 16px !important;
      background: rgba(9, 12, 20, 0.86) !important;
      backdrop-filter: blur(18px) !important;
      overflow: auto !important;
      overscroll-behavior: contain !important;
    }

    .fujiGalleryFrame {
      position: relative !important;
      width: fit-content !important;
      height: fit-content !important;
      max-width: calc(100vw - 32px) !important;
      max-height: calc(100dvh - 32px) !important;
      margin: auto !important;
    }

    .fujiGalleryImage {
      width: auto !important;
      height: auto !important;
      max-width: calc(100vw - 32px) !important;
      max-height: calc(100dvh - 32px) !important;
      object-fit: contain !important;
      display: block !important;
      border-radius: 22px !important;
      background: #f4f6fb !important;
      box-shadow: 0 30px 90px rgba(0,0,0,0.38) !important;
    }

    .fujiGalleryClose,
    .fujiGalleryNav {
      position: fixed !important;
      z-index: 100002 !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      border: 0 !important;
      border-radius: 999px !important;
      background: rgba(255,255,255,0.16) !important;
      color: #fff !important;
      cursor: pointer !important;
      box-shadow: 0 10px 26px rgba(0,0,0,0.22) !important;
      backdrop-filter: blur(12px) !important;
    }

    .fujiGalleryClose {
      top: max(14px, env(safe-area-inset-top)) !important;
      right: max(14px, env(safe-area-inset-right)) !important;
      width: 44px !important;
      height: 44px !important;
      font-size: 26px !important;
      font-weight: 900 !important;
    }

    .fujiGalleryNav {
      top: 50% !important;
      width: 46px !important;
      height: 46px !important;
      transform: translateY(-50%) !important;
      font-size: 30px !important;
      font-weight: 900 !important;
    }

    .fujiGalleryPrev { left: 16px !important; }
    .fujiGalleryNext { right: 16px !important; }

    .fujiGalleryPills {
      position: fixed !important;
      left: 50% !important;
      bottom: max(16px, env(safe-area-inset-bottom)) !important;
      transform: translateX(-50%) !important;
      z-index: 100002 !important;
      display: inline-flex !important;
      gap: 8px !important;
      padding: 7px !important;
      border-radius: 999px !important;
      background: rgba(255,255,255,0.14) !important;
      backdrop-filter: blur(12px) !important;
    }

    .fujiGalleryPills button {
      border: 0 !important;
      border-radius: 999px !important;
      padding: 8px 11px !important;
      background: rgba(255,255,255,0.1) !important;
      color: #fff !important;
      font-size: 10px !important;
      font-weight: 950 !important;
      letter-spacing: 0.08em !important;
      cursor: pointer !important;
    }

    .fujiGalleryPills button.active {
      background: rgba(255,255,255,0.88) !important;
      color: #11131f !important;
    }

    @media (max-width: 640px) {
      .fujiCompositePreview {
        aspect-ratio: 16 / 11 !important;
        border-radius: 22px !important;
        margin-bottom: 16px !important;
      }

      .fujiCompositeSubWrap {
        width: 38% !important;
        right: 11px !important;
        bottom: 11px !important;
        border-radius: 16px !important;
      }

      .fujiCompositeBadge {
        min-height: 26px !important;
        padding: 0 10px !important;
        font-size: 8.5px !important;
      }

      .fujiCompositeBadge.real {
        left: 11px !important;
        bottom: 11px !important;
      }

      .fujiCompositeBadge.anime {
        right: 11px !important;
        top: 11px !important;
      }

      .fujiGalleryOverlay { padding: 10px !important; }
      .fujiGalleryImage {
        max-width: calc(100vw - 20px) !important;
        max-height: calc(100dvh - 20px) !important;
        border-radius: 18px !important;
      }
      .fujiGalleryNav {
        width: 40px !important;
        height: 40px !important;
        font-size: 24px !important;
        background: rgba(17,19,31,0.45) !important;
      }
      .fujiGalleryPrev { left: 10px !important; }
      .fujiGalleryNext { right: 10px !important; }
    }
  `;

  document.head.appendChild(style);
}

function fujiCompositeMarkup() {
  return `
    <div class="fujiCompositePreview" data-fuji-gallery-open="true" role="button" tabindex="0" aria-label="후지필름 감성 미리보기 전체 보기">
      <img class="fujiCompositeMain" src="${FUJI_REAL_IMAGE}" alt="후지필름 감성 실사 스냅" loading="eager" />
      <div class="fujiCompositeShade"></div>
      <span class="fujiCompositeBadge real">REAL SNAP</span>
      <div class="fujiCompositeSubWrap">
        <img class="fujiCompositeSub" src="${FUJI_ANIME_IMAGE}" alt="후지필름 감성 애니 무드" loading="eager" />
      </div>
      <span class="fujiCompositeBadge anime">ANIME MOOD</span>
    </div>
  `;
}

function enhanceFujiPresetCard() {
  const card = document.querySelector<HTMLElement>('.fujiPresetButton[data-fuji-preset="parent"]');
  if (!card) return;

  card.classList.add('hasFujiComposite');

  const oldThumb = card.querySelector('.fujiCompositePreview');
  if (!oldThumb) {
    card.insertAdjacentHTML('afterbegin', fujiCompositeMarkup());
  }
}

function closeFujiGallery() {
  document.querySelector('.fujiGalleryOverlay')?.remove();
}

function renderFujiGallery() {
  const overlay = document.querySelector<HTMLElement>('.fujiGalleryOverlay');
  if (!overlay) return;

  const current = FUJI_GALLERY[fujiGalleryIndex];
  overlay.innerHTML = `
    <button class="fujiGalleryClose" type="button" aria-label="닫기">×</button>
    <button class="fujiGalleryNav fujiGalleryPrev" type="button" aria-label="이전 이미지">‹</button>
    <div class="fujiGalleryFrame">
      <img class="fujiGalleryImage" src="${current.src}" alt="${current.alt}" />
    </div>
    <button class="fujiGalleryNav fujiGalleryNext" type="button" aria-label="다음 이미지">›</button>
    <div class="fujiGalleryPills">
      ${FUJI_GALLERY.map((item, index) => `<button type="button" class="${index === fujiGalleryIndex ? 'active' : ''}" data-fuji-gallery-index="${index}">${item.label}</button>`).join('')}
    </div>
  `;
}

function openFujiGallery(index = 0) {
  fujiGalleryIndex = index;
  closeFujiGallery();
  const overlay = document.createElement('div');
  overlay.className = 'fujiGalleryOverlay';
  document.body.appendChild(overlay);
  renderFujiGallery();
}

function stepFujiGallery(direction: number) {
  fujiGalleryIndex = (fujiGalleryIndex + direction + FUJI_GALLERY.length) % FUJI_GALLERY.length;
  renderFujiGallery();
}

function installFujiCompositeEvents() {
  if (document.body.dataset.fujiCompositeEvents === 'true') return;
  document.body.dataset.fujiCompositeEvents = 'true';

  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement | null;

    if (target?.closest('[data-fuji-gallery-open="true"]')) {
      event.preventDefault();
      event.stopPropagation();
      if ('stopImmediatePropagation' in event) event.stopImmediatePropagation();
      openFujiGallery(0);
      return;
    }

    if (target?.closest('.fujiGalleryClose') || target?.classList.contains('fujiGalleryOverlay')) {
      event.preventDefault();
      closeFujiGallery();
      return;
    }

    if (target?.closest('.fujiGalleryPrev')) {
      event.preventDefault();
      event.stopPropagation();
      stepFujiGallery(-1);
      return;
    }

    if (target?.closest('.fujiGalleryNext')) {
      event.preventDefault();
      event.stopPropagation();
      stepFujiGallery(1);
      return;
    }

    const pill = target?.closest<HTMLElement>('[data-fuji-gallery-index]');
    if (pill) {
      event.preventDefault();
      event.stopPropagation();
      fujiGalleryIndex = Number(pill.dataset.fujiGalleryIndex ?? 0);
      renderFujiGallery();
    }
  }, true);

  document.addEventListener('keydown', (event) => {
    if (!document.querySelector('.fujiGalleryOverlay')) return;
    if (event.key === 'Escape') closeFujiGallery();
    if (event.key === 'ArrowLeft') stepFujiGallery(-1);
    if (event.key === 'ArrowRight') stepFujiGallery(1);
  });
}

function runFujiCompositePreview() {
  installFujiCompositeStyles();
  installFujiCompositeEvents();
  enhanceFujiPresetCard();
}

runFujiCompositePreview();

const fujiCompositeObserver = new MutationObserver(() => {
  window.clearTimeout(fujiCompositeTimer);
  fujiCompositeTimer = window.setTimeout(runFujiCompositePreview, 80);
});

fujiCompositeObserver.observe(document.documentElement, { childList: true, subtree: true });
