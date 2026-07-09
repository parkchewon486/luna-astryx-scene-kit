const FUJI_RAW_REAL = 'https://raw.githubusercontent.com/parkchewon486/luna-astryx-scene-kit/main/public/publicpresetsfuji-real-snap.png';
const FUJI_RAW_ANIME = 'https://raw.githubusercontent.com/parkchewon486/luna-astryx-scene-kit/main/public/publicpresetsfuji-anime-mood.png';
const FUJI_LOCAL_REAL = '/publicpresetsfuji-real-snap.png';
const FUJI_LOCAL_ANIME = '/publicpresetsfuji-anime-mood.png';

let fujiImageFixTimer: number | undefined;
let fujiImageFixInterval: number | undefined;

function setImageWithFallback(img: HTMLImageElement | null, localSrc: string, rawSrc: string) {
  if (!img) return;

  const current = img.getAttribute('src') ?? '';
  if (current !== localSrc && current !== rawSrc) {
    img.src = localSrc;
  }

  if (img.dataset.fujiFallbackReady !== 'true') {
    img.dataset.fujiFallbackReady = 'true';
    img.addEventListener('error', () => {
      if (img.src !== rawSrc) img.src = rawSrc;
    });
  }

  if (img.complete && img.naturalWidth === 0) {
    img.src = rawSrc;
  }
}

function fixFujiCardImages() {
  setImageWithFallback(document.querySelector<HTMLImageElement>('.fujiCompositeMain'), FUJI_LOCAL_REAL, FUJI_RAW_REAL);
  setImageWithFallback(document.querySelector<HTMLImageElement>('.fujiCompositeSub'), FUJI_LOCAL_ANIME, FUJI_RAW_ANIME);
}

function activeGalleryLabel() {
  const active = document.querySelector<HTMLElement>('.fujiGalleryPills button.active');
  return active?.textContent?.trim() ?? 'REAL SNAP';
}

function fixFujiGalleryImage() {
  const img = document.querySelector<HTMLImageElement>('.fujiGalleryImage');
  if (!img) return;

  const label = activeGalleryLabel();
  if (label.includes('ANIME')) {
    setImageWithFallback(img, FUJI_LOCAL_ANIME, FUJI_RAW_ANIME);
  } else {
    setImageWithFallback(img, FUJI_LOCAL_REAL, FUJI_RAW_REAL);
  }
}

function installFujiImageFixStyles() {
  if (document.getElementById('fuji-image-path-fix-style')) return;

  const style = document.createElement('style');
  style.id = 'fuji-image-path-fix-style';
  style.textContent = `
    .fujiCompositePreview {
      min-height: 160px !important;
      background:
        radial-gradient(circle at 18% 0%, rgba(255,255,255,0.6), transparent 90px),
        linear-gradient(135deg, #f7f8fc 0%, #eaf2ff 100%) !important;
    }

    .fujiCompositeMain,
    .fujiCompositeSub,
    .fujiGalleryImage {
      opacity: 1 !important;
      visibility: visible !important;
    }

    .fujiCompositeMain:not([src]),
    .fujiCompositeSub:not([src]) {
      display: none !important;
    }
  `;
  document.head.appendChild(style);
}

function runFujiImagePathFix() {
  installFujiImageFixStyles();
  fixFujiCardImages();
  fixFujiGalleryImage();
}

runFujiImagePathFix();

const fujiImageFixObserver = new MutationObserver(() => {
  window.clearTimeout(fujiImageFixTimer);
  fujiImageFixTimer = window.setTimeout(runFujiImagePathFix, 80);
});

fujiImageFixObserver.observe(document.documentElement, { childList: true, subtree: true, attributes: true });

window.clearInterval(fujiImageFixInterval);
fujiImageFixInterval = window.setInterval(runFujiImagePathFix, 500);
window.setTimeout(() => window.clearInterval(fujiImageFixInterval), 30000);
