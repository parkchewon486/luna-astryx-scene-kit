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
      pointer-events: auto !important;
    }

    .forceRealPreview::after,
    .realPresetThumb::after,
    .hasForceRealPreview::before,
    .hasForceRealPreview::after,
    .customRealPreset::before,
    .customRealPreset::after,
    .forceGothicCard::before,
    .forceGothicCard::after {
      content: none !important;
      display: none !important;
    }

    .presetImageLightbox {
      position: fixed;
      inset: 0;
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 14px;
      background: rgba(10, 12, 22, 0.82);
      backdrop-filter: blur(18px);
      animation: presetLightboxFade 180ms ease both;
      overflow: auto;
      overscroll-behavior: contain;
    }

    .presetImageLightbox figure {
      position: relative;
      width: fit-content;
      height: fit-content;
      max-width: calc(100vw - 28px);
      max-height: calc(100dvh - 28px);
      margin: auto;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 24px;
      overflow: visible;
      background: transparent;
      box-shadow: none;
    }

    .presetImageLightbox img {
      width: auto !important;
      height: auto !important;
      max-width: calc(100vw - 28px) !important;
      max-height: calc(100dvh - 28px) !important;
      object-fit: contain !important;
      object-position: center center !important;
      background: #f4f6fb;
      display: block;
      border-radius: 22px;
      box-shadow: 0 30px 90px rgba(0,0,0,0.35);
    }

    .presetImageClose {
      position: fixed;
      top: max(12px, env(safe-area-inset-top));
      right: max(12px, env(safe-area-inset-right));
      z-index: 100000;
      width: 44px;
      height: 44px;
      border: 0;
      border-radius: 999px;
      background: rgba(17,19,31,0.92);
      color: #fff;
      font-size: 22px;
      font-weight: 900;
      line-height: 1;
      cursor: pointer;
      box-shadow: 0 10px 22px rgba(0,0,0,0.24);
    }

    .presetImageCaption {
      display: none !important;
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
        padding: 10px;
        align-items: center;
      }

      .presetImageLightbox figure {
        max-width: calc(100vw - 20px);
        max-height: calc(100dvh - 20px);
        border-radius: 20px;
      }

      .presetImageLightbox img {
        max-width: calc(100vw - 20px) !important;
        max-height: calc(100dvh - 20px) !important;
        border-radius: 18px;
      }
    }
  `;

  document.head.appendChild(style);
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"]/g, (char) => {
    if (char === '&') return '&amp;';
    if (char === '<') return '&lt;';
    if (char === '>') return '&gt;';
    return '&quot;';
  });
}

function openPresetLightbox(src: string, alt: string) {
  document.querySelector('.presetImageLightbox')?.remove();

  const overlay = document.createElement('div');
  overlay.className = 'presetImageLightbox';
  overlay.innerHTML = `
    <figure>
      <button class="presetImageClose" type="button" aria-label="이미지 닫기">×</button>
      <img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" />
      <figcaption class="presetImageCaption">${escapeHtml(alt || '프리셋 미리보기')}</figcaption>
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

function getThumbFromEvent(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return null;
  return target.closest<HTMLElement>('.forceRealPreview, .realPresetThumb');
}

function handlePresetImageClick(event: Event) {
  const thumb = getThumbFromEvent(event.target);
  if (!thumb) return;

  event.preventDefault();
  event.stopPropagation();
  if ('stopImmediatePropagation' in event) event.stopImmediatePropagation();

  const img = thumb.querySelector<HTMLImageElement>('img');
  if (!img) return;

  openPresetLightbox(img.currentSrc || img.src, img.alt || thumb.textContent?.trim() || '프리셋 미리보기');
}

function attachPresetImageLightbox() {
  installPresetLightboxStyles();

  if (document.body.dataset.presetImageLightboxGlobal === 'true') return;
  document.body.dataset.presetImageLightboxGlobal = 'true';

  document.addEventListener('click', handlePresetImageClick, true);
  document.addEventListener('touchend', handlePresetImageClick, true);
}

attachPresetImageLightbox();

const presetLightboxObserver = new MutationObserver(() => {
  window.clearTimeout(presetLightboxTimer);
  presetLightboxTimer = window.setTimeout(attachPresetImageLightbox, 80);
});

presetLightboxObserver.observe(document.documentElement, { childList: true, subtree: true });
