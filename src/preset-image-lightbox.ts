let presetLightboxTimer: number | undefined;

function installPresetLightboxStyles() {
  const old = document.getElementById('preset-image-lightbox-style');
  if (old) old.remove();

  const style = document.createElement('style');
  style.id = 'preset-image-lightbox-style';
  style.textContent = `
    .forceRealPreview,
    .realPresetThumb {
      height: 230px !important;
      cursor: zoom-in !important;
      background: #eef3f8 !important;
    }

    .forceRealPreview img,
    .realPresetThumb img {
      width: 100% !important;
      height: 100% !important;
      object-fit: cover !important;
      object-position: center center !important;
      image-rendering: auto !important;
      transform: none !important;
    }

    .forceRealPreview::after,
    .realPresetThumb::after {
      content: "전체 보기";
      position: absolute;
      right: 12px;
      top: 12px;
      z-index: 4;
      padding: 7px 10px;
      border-radius: 999px;
      background: rgba(17, 19, 31, 0.88);
      color: #fff;
      font-size: 10px;
      font-weight: 950;
      letter-spacing: 0.08em;
      box-shadow: 0 8px 18px rgba(17,19,31,0.18);
      backdrop-filter: blur(10px);
    }

    .presetImageLightbox {
      position: fixed;
      inset: 0;
      z-index: 99999;
      display: grid;
      place-items: center;
      padding: 22px;
      background: rgba(10, 12, 22, 0.76);
      backdrop-filter: blur(18px);
      animation: presetLightboxFade 180ms ease both;
    }

    .presetImageLightbox figure {
      position: relative;
      width: min(94vw, 980px);
      height: min(86vh, 980px);
      margin: 0;
      display: grid;
      place-items: center;
      border-radius: 28px;
      overflow: hidden;
      background: rgba(255,255,255,0.94);
      box-shadow: 0 30px 90px rgba(0,0,0,0.35);
    }

    .presetImageLightbox img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      background: #f4f6fb;
      display: block;
    }

    .presetImageClose {
      position: absolute;
      top: 14px;
      right: 14px;
      z-index: 2;
      width: 44px;
      height: 44px;
      border: 0;
      border-radius: 999px;
      background: rgba(17,19,31,0.9);
      color: #fff;
      font-size: 22px;
      font-weight: 900;
      line-height: 1;
      cursor: pointer;
      box-shadow: 0 10px 22px rgba(0,0,0,0.24);
    }

    .presetImageCaption {
      position: absolute;
      left: 16px;
      bottom: 16px;
      z-index: 2;
      max-width: calc(100% - 32px);
      padding: 10px 13px;
      border-radius: 999px;
      background: rgba(255,255,255,0.86);
      color: #11131f;
      font-size: 12px;
      font-weight: 950;
      letter-spacing: -0.02em;
      box-shadow: 0 10px 24px rgba(17,19,31,0.14);
      backdrop-filter: blur(12px);
    }

    @keyframes presetLightboxFade {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @media (max-width: 640px) {
      .forceRealPreview,
      .realPresetThumb {
        height: 206px !important;
      }

      .presetImageLightbox {
        padding: 12px;
      }

      .presetImageLightbox figure {
        width: 96vw;
        height: 82vh;
        border-radius: 22px;
      }
    }
  `;

  document.head.appendChild(style);
}

function openPresetLightbox(src: string, alt: string) {
  document.querySelector('.presetImageLightbox')?.remove();

  const overlay = document.createElement('div');
  overlay.className = 'presetImageLightbox';
  overlay.innerHTML = `
    <figure>
      <button class="presetImageClose" type="button" aria-label="이미지 닫기">×</button>
      <img src="${src}" alt="${alt}" />
      <figcaption class="presetImageCaption">${alt || '프리셋 미리보기'}</figcaption>
    </figure>
  `;

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay || (event.target as HTMLElement).classList.contains('presetImageClose')) {
      overlay.remove();
    }
  });

  document.addEventListener('keydown', function onEsc(event) {
    if (event.key === 'Escape') {
      overlay.remove();
      document.removeEventListener('keydown', onEsc);
    }
  });

  document.body.appendChild(overlay);
}

function attachPresetImageLightbox() {
  installPresetLightboxStyles();

  document.querySelectorAll<HTMLElement>('.forceRealPreview, .realPresetThumb').forEach((thumb) => {
    if (thumb.dataset.lightboxReady === 'true') return;
    thumb.dataset.lightboxReady = 'true';

    thumb.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      const img = thumb.querySelector<HTMLImageElement>('img');
      if (!img) return;

      openPresetLightbox(img.currentSrc || img.src, img.alt || thumb.textContent?.trim() || '프리셋 미리보기');
    }, true);
  });
}

attachPresetImageLightbox();

const presetLightboxObserver = new MutationObserver(() => {
  window.clearTimeout(presetLightboxTimer);
  presetLightboxTimer = window.setTimeout(attachPresetImageLightbox, 80);
});

presetLightboxObserver.observe(document.documentElement, { childList: true, subtree: true });
