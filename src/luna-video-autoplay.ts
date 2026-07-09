let lunaVideoAutoplayTimer: number | undefined;
let lunaVideoAutoplayInterval: number | undefined;

function installLunaVideoAutoplayStyles() {
  const old = document.getElementById('luna-video-autoplay-style');
  if (old) old.remove();

  const style = document.createElement('style');
  style.id = 'luna-video-autoplay-style';
  style.textContent = `
    .videoFrame video {
      pointer-events: none !important;
    }

    .videoFrame video::-webkit-media-controls,
    .videoFrame video::-webkit-media-controls-panel,
    .videoFrame video::-webkit-media-controls-play-button,
    .videoFrame video::-webkit-media-controls-start-playback-button {
      display: none !important;
      opacity: 0 !important;
      -webkit-appearance: none !important;
    }
  `;
  document.head.appendChild(style);
}

function getLunaVideo() {
  return document.querySelector<HTMLVideoElement>('.videoFrame video');
}

function prepareLunaVideo(video: HTMLVideoElement) {
  video.muted = true;
  video.defaultMuted = true;
  video.autoplay = true;
  video.loop = true;
  video.playsInline = true;
  video.preload = 'auto';
  video.controls = false;
  video.setAttribute('muted', '');
  video.setAttribute('autoplay', '');
  video.setAttribute('loop', '');
  video.setAttribute('playsinline', '');
  video.setAttribute('webkit-playsinline', '');
  video.setAttribute('preload', 'auto');
  video.removeAttribute('controls');
}

function playLunaVideo() {
  installLunaVideoAutoplayStyles();

  const video = getLunaVideo();
  if (!video) return;

  prepareLunaVideo(video);

  const playPromise = video.play();
  if (playPromise && typeof playPromise.catch === 'function') {
    playPromise.catch(() => undefined);
  }
}

function runLunaVideoAutoplay() {
  window.clearTimeout(lunaVideoAutoplayTimer);
  lunaVideoAutoplayTimer = window.setTimeout(playLunaVideo, 60);
}

runLunaVideoAutoplay();

window.clearInterval(lunaVideoAutoplayInterval);
lunaVideoAutoplayInterval = window.setInterval(playLunaVideo, 700);
window.setTimeout(() => window.clearInterval(lunaVideoAutoplayInterval), 18000);

['touchstart', 'pointerdown', 'click', 'scroll', 'visibilitychange'].forEach((eventName) => {
  window.addEventListener(eventName, playLunaVideo, { passive: true });
});

const lunaVideoObserver = new MutationObserver(runLunaVideoAutoplay);
lunaVideoObserver.observe(document.documentElement, { childList: true, subtree: true });
