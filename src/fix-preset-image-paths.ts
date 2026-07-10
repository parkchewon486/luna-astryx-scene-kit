let presetImagePathTimer: number | undefined;
let presetImagePathInterval: number | undefined;

const PRESET_IMAGE_REWRITE_MAP = [
  {
    broken: '/presets/confession-after-school-walk.png',
    fixed: '/%20%20%20%20public:presets:confession-after-school-walk.png.PNG',
    alt: '고백 직전 하교길',
  },
  {
    broken: '/presets/digicam/2007-car-night-thumb.png',
    fixed: '/public:presets:digicam:2007-car-night-thumb.png.PNG',
    alt: '2007 차 안 디카',
  },
];

function rewritePresetImagePaths() {
  const images = Array.from(document.querySelectorAll<HTMLImageElement>('.nativePresetThumb img'));

  images.forEach((image) => {
    const currentSrc = image.getAttribute('src') ?? '';
    const currentAlt = image.getAttribute('alt') ?? '';

    const mapped = PRESET_IMAGE_REWRITE_MAP.find((item) => (
      currentSrc.includes(item.broken) || currentAlt === item.alt
    ));

    if (!mapped) return;
    if (currentSrc === mapped.fixed) return;

    image.src = mapped.fixed;
    image.setAttribute('src', mapped.fixed);
    image.dataset.fixedPresetImage = 'true';
  });
}

rewritePresetImagePaths();

const presetImagePathObserver = new MutationObserver(() => {
  window.clearTimeout(presetImagePathTimer);
  presetImagePathTimer = window.setTimeout(rewritePresetImagePaths, 60);
});

presetImagePathObserver.observe(document.documentElement, { childList: true, subtree: true, attributes: true });

window.clearInterval(presetImagePathInterval);
presetImagePathInterval = window.setInterval(rewritePresetImagePaths, 500);
window.setTimeout(() => window.clearInterval(presetImagePathInterval), 20000);
