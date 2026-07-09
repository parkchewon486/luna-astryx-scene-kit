const HERO_SHOWCASE_IMAGES = [
  {
    src: '/publicpresetsfuji-real-snap.png',
    fallback: '/presets/fuji-real-snap.png',
    label: 'FUJI REAL',
    title: 'Golden Hour Snap',
    tags: ['#Fujifilm', '#35mmLens', '#SoftLight'],
  },
  {
    src: '/character-reference-female.png',
    fallback: '/character-reference-male.png',
    label: 'CHARACTER',
    title: 'Reference Sheet',
    tags: ['#CharacterSheet', '#AnimeStyle', '#Consistency'],
  },
  {
    src: '/presets:gothic-gray-mood.png.PNG',
    fallback: '/publicpresetsfuji-real-snap.png',
    label: 'GRAY SNAP',
    title: 'Moody Portrait',
    tags: ['#GrayTone', '#Portrait', '#Cinematic'],
  },
  {
    src: '/presets:chibi-resin-doll.png.PNG',
    fallback: '/character-reference-female.png',
    label: 'CHIBI',
    title: 'Profile Doll',
    tags: ['#ResinDoll', '#Avatar', '#CuteDetail'],
  },
];

let heroUpgradeTimer: number | undefined;
let heroUpgradeInterval: number | undefined;

function installHeroShowcaseStyles() {
  const old = document.getElementById('hero-showcase-upgrade-style');
  if (old) old.remove();

  const style = document.createElement('style');
  style.id = 'hero-showcase-upgrade-style';
  style.textContent = `
    .heroGrid.lunaHeroShowcase {
      position: relative !important;
      isolation: isolate !important;
      min-height: min(760px, calc(100vh - 72px)) !important;
      display: grid !important;
      grid-template-columns: minmax(0, 1.02fr) minmax(420px, 0.98fr) !important;
      gap: clamp(24px, 4vw, 56px) !important;
      align-items: center !important;
      margin-bottom: 42px !important;
      padding: clamp(22px, 4.5vw, 58px) !important;
      border: 1px solid rgba(255,255,255,0.72) !important;
      border-radius: clamp(34px, 5vw, 58px) !important;
      overflow: hidden !important;
      background:
        radial-gradient(circle at 12% 8%, rgba(255,255,255,0.96), transparent 250px),
        radial-gradient(circle at 72% 12%, rgba(159,139,255,0.24), transparent 330px),
        radial-gradient(circle at 92% 84%, rgba(126,235,255,0.28), transparent 360px),
        linear-gradient(135deg, rgba(255,255,255,0.88), rgba(245,247,255,0.66)) !important;
      box-shadow:
        0 42px 120px rgba(18, 24, 50, 0.14),
        inset 0 1px 0 rgba(255,255,255,0.96) !important;
      backdrop-filter: blur(28px) saturate(1.14) !important;
    }

    .heroGrid.lunaHeroShowcase::before {
      content: '';
      position: absolute;
      inset: -2px;
      z-index: -2;
      background:
        conic-gradient(from 210deg at 72% 26%, rgba(126,235,255,0.38), rgba(157,136,255,0.36), rgba(255,223,148,0.34), rgba(126,235,255,0.38));
      filter: blur(34px);
      opacity: 0.7;
      pointer-events: none;
      animation: lunaAuroraBreath 9s ease-in-out infinite alternate;
    }

    .heroGrid.lunaHeroShowcase::after {
      content: '';
      position: absolute;
      inset: 18px;
      z-index: -1;
      border-radius: clamp(26px, 4.5vw, 46px);
      border: 1px solid rgba(255,255,255,0.74);
      pointer-events: none;
    }

    .lunaHeroCopy {
      position: relative;
      z-index: 2;
      display: grid;
      gap: 22px;
      max-width: 780px;
    }

    .lunaHeroEyebrow {
      width: fit-content;
      margin: 0;
      padding: 10px 14px;
      border: 1px solid rgba(17,19,31,0.1);
      border-radius: 999px;
      background: rgba(255,255,255,0.78);
      color: #11131f;
      font-family: 'Space Grotesk', sans-serif;
      font-size: 11px;
      font-weight: 950;
      letter-spacing: 0.17em;
      box-shadow: 0 16px 34px rgba(17,19,31,0.08), inset 0 1px 0 rgba(255,255,255,0.94);
      backdrop-filter: blur(18px);
    }

    .lunaHeroTitle {
      margin: 0;
      max-width: 880px;
      color: #0d1020;
      font-family: 'Space Grotesk', 'Noto Sans KR', sans-serif;
      font-size: clamp(50px, 7vw, 106px);
      line-height: 0.92;
      letter-spacing: -0.095em;
      text-wrap: balance;
    }

    .lunaHeroTitle span {
      display: inline-block;
      background: linear-gradient(110deg, #0e1020 0%, #5744e8 46%, #8a6d35 78%, #0e1020 100%);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      filter: drop-shadow(0 18px 32px rgba(87,68,232,0.12));
    }

    .lunaHeroLead {
      max-width: 660px;
      margin: 0;
      color: #434a63;
      font-size: clamp(17px, 1.6vw, 22px);
      font-weight: 850;
      line-height: 1.72;
      word-break: keep-all;
    }

    .lunaHeroActions {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .lunaPrimaryCTA {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 62px;
      padding: 0 28px;
      border: 1px solid rgba(255,255,255,0.45);
      border-radius: 999px;
      overflow: hidden;
      background:
        radial-gradient(circle at 24% 20%, rgba(255,255,255,0.62), transparent 38px),
        linear-gradient(135deg, #11131f 0%, #5c46f4 54%, #8a6d35 100%);
      color: #fff;
      font-size: clamp(15px, 1.45vw, 18px);
      font-weight: 950;
      letter-spacing: -0.02em;
      cursor: pointer;
      box-shadow:
        0 10px 0 rgba(17,19,31,0.14),
        0 28px 60px rgba(92,70,244,0.3),
        inset 0 1px 0 rgba(255,255,255,0.34);
      transition: transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease;
    }

    .lunaPrimaryCTA::before {
      content: '';
      position: absolute;
      inset: -80% -18%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.42), transparent);
      transform: translateX(-70%) rotate(12deg);
      animation: lunaButtonSheen 3.8s ease-in-out infinite;
    }

    .lunaPrimaryCTA span {
      position: relative;
      z-index: 1;
    }

    .lunaPrimaryCTA:hover {
      transform: translateY(-4px) scale(1.015);
      filter: saturate(1.08) brightness(1.05);
      box-shadow:
        0 8px 0 rgba(17,19,31,0.12),
        0 36px 74px rgba(92,70,244,0.36),
        inset 0 1px 0 rgba(255,255,255,0.36);
    }

    .lunaPrimaryCTA:active {
      transform: translateY(4px) scale(0.99);
    }

    .lunaSecondaryNote {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      min-height: 48px;
      padding: 0 14px;
      border: 1px solid rgba(17,19,31,0.08);
      border-radius: 999px;
      background: rgba(255,255,255,0.68);
      color: #565d74;
      font-size: 13px;
      font-weight: 900;
      backdrop-filter: blur(16px);
    }

    .lunaMiniComposer {
      position: relative;
      display: grid;
      gap: 14px;
      max-width: 560px;
      margin-top: 4px;
      padding: 18px;
      border: 1px solid rgba(17,19,31,0.08);
      border-radius: 28px;
      background: rgba(255,255,255,0.68);
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.96), 0 20px 44px rgba(17,19,31,0.07);
      backdrop-filter: blur(18px);
    }

    .lunaMiniComposer::before {
      content: 'LIVE COMPOSER';
      position: absolute;
      right: 16px;
      top: 14px;
      color: #6b72f1;
      font-family: 'Space Grotesk', sans-serif;
      font-size: 10px;
      font-weight: 950;
      letter-spacing: 0.16em;
    }

    .lunaMiniChips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      padding-right: 112px;
    }

    .lunaMiniChip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      min-height: 34px;
      padding: 0 11px;
      border: 1px solid rgba(17,19,31,0.08);
      border-radius: 999px;
      background: rgba(255,255,255,0.86);
      color: #202338;
      font-size: 12px;
      font-weight: 900;
      box-shadow: 0 8px 18px rgba(17,19,31,0.055);
      animation: lunaChipPulse 4.8s ease-in-out infinite;
    }

    .lunaMiniChip:nth-child(2) { animation-delay: 0.35s; }
    .lunaMiniChip:nth-child(3) { animation-delay: 0.7s; }
    .lunaMiniChip:nth-child(4) { animation-delay: 1.05s; }

    .lunaMiniOutput {
      display: grid;
      gap: 8px;
      padding: 14px;
      border-radius: 20px;
      background: #11131f;
      color: #eefcff;
      box-shadow: 0 20px 42px rgba(17,19,31,0.18);
      overflow: hidden;
    }

    .lunaMiniOutput b {
      color: #aeb8ff;
      font-family: 'Space Grotesk', sans-serif;
      font-size: 10px;
      letter-spacing: 0.18em;
    }

    .lunaTypingLine {
      display: block;
      width: 100%;
      max-width: 450px;
      white-space: nowrap;
      overflow: hidden;
      border-right: 2px solid rgba(255,255,255,0.72);
      font-size: 13px;
      font-weight: 850;
      line-height: 1.55;
      animation: lunaTyping 4.8s steps(58, end) infinite, lunaCursor 0.8s step-end infinite;
    }

    .lunaHeroShowcaseDeck {
      position: relative;
      z-index: 2;
      min-height: 580px;
      display: grid;
      grid-template-columns: 0.92fr 1.08fr;
      gap: 16px;
      align-items: center;
    }

    .lunaShowcaseColumn {
      display: grid;
      gap: 16px;
    }

    .lunaShowcaseColumn:nth-child(1) {
      transform: translateY(34px);
    }

    .lunaVisualCard {
      position: relative;
      min-height: 230px;
      border: 1px solid rgba(255,255,255,0.72);
      border-radius: 34px;
      overflow: hidden;
      background:
        radial-gradient(circle at 20% 10%, rgba(255,255,255,0.76), transparent 90px),
        linear-gradient(135deg, #eaf2ff, #f8f5ee);
      box-shadow:
        0 28px 70px rgba(18, 24, 50, 0.16),
        inset 0 1px 0 rgba(255,255,255,0.9);
      transform: translateZ(0);
      transition: transform 0.28s ease, box-shadow 0.28s ease, filter 0.28s ease;
    }

    .lunaVisualCard.large {
      min-height: 330px;
    }

    .lunaVisualCard img {
      width: 100%;
      height: 100%;
      min-height: inherit;
      display: block;
      object-fit: cover;
      object-position: center;
      filter: saturate(0.98) contrast(0.98);
      transform: scale(1.02);
      transition: transform 0.45s ease, filter 0.45s ease;
    }

    .lunaVisualCard:hover {
      transform: translateY(-8px) rotateX(2deg) rotateY(-2deg);
      filter: saturate(1.04);
      box-shadow:
        0 38px 90px rgba(18, 24, 50, 0.22),
        inset 0 1px 0 rgba(255,255,255,0.94);
    }

    .lunaVisualCard:hover img {
      transform: scale(1.08);
      filter: saturate(1.06) contrast(1.02);
    }

    .lunaVisualCard::after {
      content: '';
      position: absolute;
      inset: 0;
      background:
        linear-gradient(180deg, rgba(17,19,31,0.04), rgba(17,19,31,0.56)),
        radial-gradient(circle at 20% 10%, rgba(255,255,255,0.26), transparent 150px);
      pointer-events: none;
    }

    .lunaVisualMeta {
      position: absolute;
      left: 16px;
      right: 16px;
      bottom: 16px;
      z-index: 2;
      display: grid;
      gap: 8px;
      color: #fff;
    }

    .lunaVisualMeta em {
      width: fit-content;
      padding: 8px 11px;
      border-radius: 999px;
      background: rgba(255,255,255,0.18);
      color: #fff;
      font-family: 'Space Grotesk', sans-serif;
      font-size: 10px;
      font-weight: 950;
      font-style: normal;
      letter-spacing: 0.13em;
      backdrop-filter: blur(12px);
    }

    .lunaVisualMeta strong {
      font-family: 'Space Grotesk', 'Noto Sans KR', sans-serif;
      font-size: clamp(20px, 2vw, 30px);
      font-weight: 950;
      letter-spacing: -0.06em;
      line-height: 1;
      text-shadow: 0 12px 30px rgba(0,0,0,0.34);
    }

    .lunaHoverTags {
      position: absolute;
      inset: 14px;
      z-index: 3;
      display: flex;
      flex-wrap: wrap;
      align-content: flex-start;
      gap: 8px;
      opacity: 0;
      transform: translateY(10px);
      transition: opacity 0.28s ease, transform 0.28s ease;
      pointer-events: none;
    }

    .lunaVisualCard:hover .lunaHoverTags {
      opacity: 1;
      transform: translateY(0);
    }

    .lunaHoverTags span {
      padding: 8px 10px;
      border-radius: 999px;
      background: rgba(255,255,255,0.76);
      color: #11131f;
      font-size: 11px;
      font-weight: 950;
      box-shadow: 0 12px 28px rgba(0,0,0,0.12);
      backdrop-filter: blur(12px);
    }

    .lunaFloatingPanel {
      position: absolute;
      right: 6%;
      top: 8%;
      z-index: 5;
      display: grid;
      gap: 6px;
      padding: 12px 14px;
      border: 1px solid rgba(255,255,255,0.5);
      border-radius: 22px;
      background: rgba(255,255,255,0.7);
      box-shadow: 0 20px 52px rgba(17,19,31,0.13);
      backdrop-filter: blur(18px);
      animation: lunaFloat 5.6s ease-in-out infinite;
    }

    .lunaFloatingPanel b {
      color: #11131f;
      font-family: 'Space Grotesk', sans-serif;
      font-size: 13px;
      font-weight: 950;
    }

    .lunaFloatingPanel small {
      color: #6a7087;
      font-size: 11px;
      font-weight: 900;
    }

    @keyframes lunaAuroraBreath {
      0% { transform: scale(1) rotate(0deg); opacity: 0.52; }
      100% { transform: scale(1.06) rotate(8deg); opacity: 0.82; }
    }

    @keyframes lunaButtonSheen {
      0%, 46% { transform: translateX(-72%) rotate(12deg); }
      100% { transform: translateX(72%) rotate(12deg); }
    }

    @keyframes lunaChipPulse {
      0%, 100% { transform: translateY(0); border-color: rgba(17,19,31,0.08); }
      45% { transform: translateY(-3px); border-color: rgba(92,70,244,0.28); }
    }

    @keyframes lunaTyping {
      0% { width: 0; }
      58%, 86% { width: 100%; }
      100% { width: 0; }
    }

    @keyframes lunaCursor {
      50% { border-color: transparent; }
    }

    @keyframes lunaFloat {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }

    @media (max-width: 1080px) {
      .heroGrid.lunaHeroShowcase {
        grid-template-columns: 1fr !important;
        min-height: auto !important;
      }

      .lunaHeroShowcaseDeck {
        min-height: auto;
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .lunaShowcaseColumn:nth-child(1) {
        transform: none;
      }
    }

    @media (max-width: 720px) {
      .heroGrid.lunaHeroShowcase {
        padding: 22px !important;
        border-radius: 34px !important;
      }

      .lunaHeroCopy {
        gap: 18px;
      }

      .lunaHeroTitle {
        font-size: clamp(46px, 14vw, 68px);
        letter-spacing: -0.08em;
      }

      .lunaHeroLead {
        font-size: 16px;
      }

      .lunaPrimaryCTA {
        width: 100%;
        min-height: 58px;
        padding: 0 18px;
      }

      .lunaSecondaryNote {
        width: 100%;
        justify-content: center;
      }

      .lunaMiniComposer {
        padding: 15px;
        border-radius: 24px;
      }

      .lunaMiniComposer::before {
        position: static;
        width: fit-content;
        order: -1;
      }

      .lunaMiniChips {
        padding-right: 0;
      }

      .lunaTypingLine {
        white-space: normal;
        border-right: 0;
        animation: none;
      }

      .lunaHeroShowcaseDeck {
        grid-template-columns: 1fr;
        gap: 14px;
      }

      .lunaShowcaseColumn {
        gap: 14px;
      }

      .lunaVisualCard,
      .lunaVisualCard.large {
        min-height: 240px;
        border-radius: 28px;
      }

      .lunaFloatingPanel {
        right: 16px;
        top: 16px;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .heroGrid.lunaHeroShowcase::before,
      .lunaPrimaryCTA::before,
      .lunaMiniChip,
      .lunaTypingLine,
      .lunaFloatingPanel {
        animation: none !important;
      }
    }
  `;
  document.head.appendChild(style);
}

function visualCardMarkup(item: typeof HERO_SHOWCASE_IMAGES[number], index: number) {
  const tags = item.tags.map((tag) => `<span>${tag}</span>`).join('');
  const large = index === 1 ? ' large' : '';
  return `
    <article class="lunaVisualCard${large}">
      <img src="${item.src}" alt="${item.title}" loading="eager" data-hero-fallback="${item.fallback}" />
      <div class="lunaHoverTags">${tags}</div>
      <div class="lunaVisualMeta">
        <em>${item.label}</em>
        <strong>${item.title}</strong>
      </div>
    </article>
  `;
}

function heroMarkup() {
  return `
    <div class="lunaHeroCopy">
      <p class="lunaHeroEyebrow">LUNA PROMPT STUDIO · VISUAL PROMPT MIXER</p>
      <h1 class="lunaHeroTitle"><span>조합하고,<br />생성하고,<br />전율하라.</span></h1>
      <p class="lunaHeroLead">당신의 모든 프롬프트 아이디어를 한곳에 모았습니다. 버튼을 누르듯 무드, 렌즈, 조명, 비율을 조합하고 바로 쓸 수 있는 프롬프트로 완성하세요.</p>
      <div class="lunaHeroActions">
        <button class="lunaPrimaryCTA" type="button" data-hero-scroll="true"><span>나만의 완벽한 프롬프트 조합하기 →</span></button>
        <span class="lunaSecondaryNote">실사 · 애니 · 캐릭터시트 · 영상 첫 프레임</span>
      </div>
      <div class="lunaMiniComposer" aria-label="프롬프트 조합 미리보기">
        <div class="lunaMiniChips">
          <span class="lunaMiniChip">🎞️ 후지필름</span>
          <span class="lunaMiniChip">📷 35mm</span>
          <span class="lunaMiniChip">🌇 노을 역광</span>
          <span class="lunaMiniChip">🖼️ 4:5</span>
        </div>
        <div class="lunaMiniOutput">
          <b>PROMPT OUTPUT</b>
          <span class="lunaTypingLine">Korean cinematic street snapshot, soft film tone, natural pose, gentle grain...</span>
        </div>
      </div>
    </div>

    <aside class="lunaHeroShowcaseDeck" aria-label="Visual showcase gallery">
      <div class="lunaFloatingPanel">
        <b>4 styles ready</b>
        <small>hover the cards</small>
      </div>
      <div class="lunaShowcaseColumn">
        ${visualCardMarkup(HERO_SHOWCASE_IMAGES[0], 0)}
        ${visualCardMarkup(HERO_SHOWCASE_IMAGES[2], 2)}
      </div>
      <div class="lunaShowcaseColumn">
        ${visualCardMarkup(HERO_SHOWCASE_IMAGES[1], 1)}
        ${visualCardMarkup(HERO_SHOWCASE_IMAGES[3], 3)}
      </div>
    </aside>
  `;
}

function fixHeroImages() {
  document.querySelectorAll<HTMLImageElement>('.lunaHeroShowcaseDeck img[data-hero-fallback]').forEach((img) => {
    if (img.dataset.heroFallbackReady === 'true') return;
    img.dataset.heroFallbackReady = 'true';
    img.addEventListener('error', () => {
      const fallback = img.dataset.heroFallback;
      if (fallback && img.getAttribute('src') !== fallback) img.src = fallback;
    });
  });
}

function installHeroEvents() {
  if (document.body.dataset.heroShowcaseEvents === 'true') return;
  document.body.dataset.heroShowcaseEvents = 'true';

  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement | null;
    const cta = target?.closest<HTMLElement>('[data-hero-scroll="true"]');
    if (!cta) return;

    event.preventDefault();
    const sceneControls = document.querySelector<HTMLElement>('.mainGrid, .builderPanel');
    sceneControls?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, true);
}

function upgradeHeroShowcase() {
  installHeroShowcaseStyles();
  installHeroEvents();

  const hero = document.querySelector<HTMLElement>('.heroGrid');
  if (!hero) return;

  if (hero.dataset.heroShowcaseUpgrade !== 'true') {
    hero.dataset.heroShowcaseUpgrade = 'true';
    hero.classList.add('lunaHeroShowcase');
    hero.innerHTML = heroMarkup();
  }

  fixHeroImages();
}

upgradeHeroShowcase();

const heroObserver = new MutationObserver(() => {
  window.clearTimeout(heroUpgradeTimer);
  heroUpgradeTimer = window.setTimeout(upgradeHeroShowcase, 120);
});

heroObserver.observe(document.documentElement, { childList: true, subtree: true });

window.clearInterval(heroUpgradeInterval);
heroUpgradeInterval = window.setInterval(upgradeHeroShowcase, 700);
window.setTimeout(() => window.clearInterval(heroUpgradeInterval), 25000);
