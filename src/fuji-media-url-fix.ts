const FUJI_MEDIA_REAL = 'https://media.githubusercontent.com/media/parkchewon486/luna-astryx-scene-kit/main/public/publicpresetsfuji-real-snap.png';
const FUJI_MEDIA_ANIME = 'https://media.githubusercontent.com/media/parkchewon486/luna-astryx-scene-kit/main/public/publicpresetsfuji-anime-mood.png';
const FUJI_GITHUB_REAL = 'https://github.com/parkchewon486/luna-astryx-scene-kit/raw/main/public/publicpresetsfuji-real-snap.png';
const FUJI_GITHUB_ANIME = 'https://github.com/parkchewon486/luna-astryx-scene-kit/raw/main/public/publicpresetsfuji-anime-mood.png';

let fujiMediaTimer: number | undefined;
let fujiMediaInterval: number | undefined;

function forceFujiImage(img: HTMLImageElement | null, mediaSrc: string, githubSrc: string) {
  if (!img) return;

  if (img.dataset.fujiMediaSrc !== mediaSrc) {
    img.dataset.fujiMediaSrc = mediaSrc;
    img.dataset.fujiGithubSrc = githubSrc;
    img.src = mediaSrc;
  }

  img.onerror = () => {
    if (img.src !== githubSrc) {
      img.src = githubSrc;
    }
  };
}

function getGalleryLabel() {
  return document.querySelector<HTMLElement>('.fujiGalleryPills button.active')?.textContent?.trim() ?? 'REAL SNAP';
}

function fixFujiMediaImages() {
  forceFujiImage(document.querySelector<HTMLImageElement>('.fujiCompositeMain'), FUJI_MEDIA_REAL, FUJI_GITHUB_REAL);
  forceFujiImage(document.querySelector<HTMLImageElement>('.fujiCompositeSub'), FUJI_MEDIA_ANIME, FUJI_GITHUB_ANIME);

  const galleryImage = document.querySelector<HTMLImageElement>('.fujiGalleryImage');
  if (galleryImage) {
    const label = getGalleryLabel();
    if (label.includes('ANIME')) {
      forceFujiImage(galleryImage, FUJI_MEDIA_ANIME, FUJI_GITHUB_ANIME);
    } else {
      forceFujiImage(galleryImage, FUJI_MEDIA_REAL, FUJI_GITHUB_REAL);
    }
  }
}

function installFujiMediaStyles() {
  if (document.getElementById('fuji-media-url-fix-style')) return;

  const style = document.createElement('style');
  style.id = 'fuji-media-url-fix-style';
  style.textContent = `
    .fujiCompositePreview::before {
      content: '';
      position: absolute;
      inset: 0;
      z-index: 0;
      background:
        radial-gradient(circle at 20% 10%, rgba(255,255,255,0.65), transparent 100px),
        linear-gradient(135deg, #eef4ff, #f8f5ee);
    }

    .fujiCompositeMain,
    .fujiCompositeSub {
      position: relative !important;
      z-index: 1 !important;
      opacity: 1 !important;
      visibility: visible !important;
    }

    .fujiCompositeSubWrap { z-index: 4 !important; }
    .fujiCompositeShade { z-index: 2 !important; }
    .fujiCompositeBadge { z-index: 5 !important; }
  `;
  document.head.appendChild(style);
}

function runFujiMediaFix() {
  installFujiMediaStyles();
  fixFujiMediaImages();
}

runFujiMediaFix();

const fujiMediaObserver = new MutationObserver(() => {
  window.clearTimeout(fujiMediaTimer);
  fujiMediaTimer = window.setTimeout(runFujiMediaFix, 80);
});

fujiMediaObserver.observe(document.documentElement, { childList: true, subtree: true, attributes: true });

window.clearInterval(fujiMediaInterval);
fujiMediaInterval = window.setInterval(runFujiMediaFix, 500);
window.setTimeout(() => window.clearInterval(fujiMediaInterval), 30000);
