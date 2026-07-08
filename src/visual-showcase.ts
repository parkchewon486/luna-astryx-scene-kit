type VisualTone = {
  key: string;
  label: string;
  emoji: string;
  tag: string;
};

const VISUAL_TONES: VisualTone[] = [
  { key: '후지필름', label: 'FUJI', emoji: '🎞️', tag: 'muted green · soft blue' },
  { key: '디카', label: 'DICA', emoji: '📸', tag: 'flash · y2k memory' },
  { key: '로맨스', label: 'ROMANCE', emoji: '🎬', tag: 'school · soft light' },
  { key: '정류장', label: 'NIGHT', emoji: '🌙', tag: 'streetlight · calm air' },
  { key: '창가', label: 'WINDOW', emoji: '🌧️', tag: 'rain · quiet mood' },
  { key: '치비', label: 'CHIBI', emoji: '🧸', tag: 'avatar · resin doll' },
  { key: '밴드', label: 'BAND', emoji: '🎤', tag: 'music · video scene' },
  { key: '보컬', label: 'VOCAL', emoji: '🎙️', tag: 'close-up · performance' },
  { key: '광화문', label: 'STREET', emoji: '🇰🇷', tag: 'crowd · wide shot' },
];

const SHOWCASE_ITEMS = [
  {
    title: '후지필름 애니 무드',
    desc: '차분한 필름톤의 한국 골목 청춘 애니 컷',
    tone: 'fuji',
    emoji: '🎞️',
  },
  {
    title: '2007 디카 기억',
    desc: '직광 플래시와 오래된 compact camera 분위기',
    tone: 'dica',
    emoji: '📸',
  },
  {
    title: '비 오는 창가',
    desc: '흐린 창가빛과 낮은 대비의 조용한 장면',
    tone: 'rain',
    emoji: '🌧️',
  },
  {
    title: '치비 레진돌',
    desc: '프로필 사진을 귀여운 아트돌 무드로 정리',
    tone: 'chibi',
    emoji: '🧸',
  },
  {
    title: '청춘 로맨스',
    desc: '하교길, 정류장, 눈빛 중심의 장면 설계',
    tone: 'romance',
    emoji: '🎬',
  },
];

let visualTimer: number | undefined;

function pickTone(title: string, note: string) {
  const text = `${title} ${note}`;
  return VISUAL_TONES.find((tone) => text.includes(tone.key)) ?? {
    key: 'default',
    label: 'SCENE',
    emoji: '✨',
    tag: 'prompt · scene kit',
  };
}

function enhancePresetCard(card: HTMLElement) {
  if (card.querySelector('.presetThumb')) return;

  const title = card.querySelector('strong')?.textContent?.trim() ?? '';
  const note = card.querySelector('span')?.textContent?.trim() ?? '';
  const tone = pickTone(title, note);

  const thumb = document.createElement('div');
  thumb.className = `presetThumb presetThumb-${tone.label.toLowerCase()}`;
  thumb.innerHTML = `
    <div class="presetThumbGlow"></div>
    <div class="presetThumbScene">
      <span class="presetThumbEmoji">${tone.emoji}</span>
      <span class="presetThumbLabel">${tone.label}</span>
    </div>
    <small>${tone.tag}</small>
  `;

  card.prepend(thumb);
}

function makeShowcaseSection() {
  const section = document.createElement('section');
  section.className = 'showcaseSection';
  section.dataset.visualShowcase = 'true';
  section.innerHTML = `
    <div class="showcaseHeader">
      <p class="kicker">SHOWCASE</p>
      <h2>프리셋으로 만들 수 있는 장면들</h2>
      <p>글자만 있는 도구가 아니라, 어떤 결과물을 노리는지 한눈에 보이도록 예시 무드 카드를 추가했습니다.</p>
    </div>
    <div class="showcaseGrid">
      ${SHOWCASE_ITEMS.map((item, index) => `
        <article class="showcaseCard showcase-${item.tone}" style="--delay:${index * 80}ms">
          <div class="showcaseVisual">
            <span>${item.emoji}</span>
            <i></i>
            <b></b>
          </div>
          <div class="showcaseCopy">
            <strong>${item.title}</strong>
            <p>${item.desc}</p>
          </div>
        </article>
      `).join('')}
    </div>
  `;
  return section;
}

function ensureShowcaseSection() {
  if (document.querySelector('[data-visual-showcase="true"]')) return;

  const bottomGrid = document.querySelector('.bottomGrid');
  if (!bottomGrid) return;

  bottomGrid.insertAdjacentElement('afterend', makeShowcaseSection());
}

function installVisualStyles() {
  if (document.getElementById('visual-showcase-style')) return;

  const style = document.createElement('style');
  style.id = 'visual-showcase-style';
  style.textContent = `
    .presetButton {
      overflow: hidden !important;
    }

    .presetThumb {
      position: relative;
      min-height: 124px;
      margin: -4px 0 16px;
      overflow: hidden;
      border: 1px solid rgba(118, 149, 230, 0.18);
      border-radius: 22px;
      background:
        radial-gradient(circle at 18% 22%, rgba(255, 255, 255, 0.92), transparent 88px),
        linear-gradient(135deg, rgba(207, 239, 255, 0.9), rgba(237, 229, 255, 0.86));
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.95),
        0 16px 30px rgba(17, 19, 31, 0.06);
    }

    .presetThumb::before,
    .presetThumb::after {
      content: "";
      position: absolute;
      border-radius: 999px;
      filter: blur(1px);
      opacity: 0.8;
    }

    .presetThumb::before {
      width: 120px;
      height: 120px;
      left: -28px;
      bottom: -44px;
      background: rgba(255, 255, 255, 0.74);
    }

    .presetThumb::after {
      width: 190px;
      height: 80px;
      right: -42px;
      top: 34px;
      background: rgba(93, 103, 200, 0.1);
      transform: rotate(-12deg);
    }

    .presetThumbScene {
      position: absolute;
      inset: 16px 16px auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      z-index: 2;
    }

    .presetThumbEmoji {
      display: grid;
      place-items: center;
      width: 48px;
      height: 48px;
      border-radius: 17px;
      background: rgba(255, 255, 255, 0.78);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 1), 0 8px 18px rgba(17, 19, 31, 0.08);
      font-size: 25px;
    }

    .presetThumbLabel {
      color: #11131f;
      font-size: 11px;
      font-weight: 950;
      letter-spacing: 0.16em;
    }

    .presetThumb small {
      position: absolute;
      left: 16px;
      right: 16px;
      bottom: 16px;
      z-index: 2;
      color: rgba(17, 19, 31, 0.68);
      font-size: 11px;
      font-weight: 900;
      letter-spacing: 0.03em;
    }

    .presetThumb-fuji,
    .showcase-fuji .showcaseVisual {
      background:
        radial-gradient(circle at 14% 20%, rgba(255, 255, 255, 0.95), transparent 86px),
        linear-gradient(135deg, rgba(205, 231, 218, 0.92), rgba(199, 225, 244, 0.84) 54%, rgba(237, 229, 255, 0.82));
    }

    .presetThumb-dica,
    .showcase-dica .showcaseVisual {
      background:
        radial-gradient(circle at 30% 18%, rgba(255, 255, 255, 0.98), transparent 70px),
        linear-gradient(135deg, rgba(255, 233, 204, 0.94), rgba(206, 235, 255, 0.8), rgba(236, 229, 255, 0.82));
    }

    .presetThumb-romance,
    .presetThumb-night,
    .showcase-romance .showcaseVisual {
      background:
        radial-gradient(circle at 70% 22%, rgba(255, 238, 210, 0.9), transparent 90px),
        linear-gradient(135deg, rgba(220, 232, 255, 0.96), rgba(237, 229, 255, 0.86), rgba(255, 232, 242, 0.74));
    }

    .presetThumb-window,
    .showcase-rain .showcaseVisual {
      background:
        radial-gradient(circle at 12% 22%, rgba(255, 255, 255, 0.88), transparent 80px),
        linear-gradient(135deg, rgba(206, 235, 255, 0.94), rgba(226, 235, 244, 0.86), rgba(237, 229, 255, 0.72));
    }

    .presetThumb-chibi,
    .showcase-chibi .showcaseVisual {
      background:
        radial-gradient(circle at 18% 24%, rgba(255, 255, 255, 0.94), transparent 84px),
        linear-gradient(135deg, rgba(255, 224, 238, 0.9), rgba(237, 229, 255, 0.88), rgba(207, 239, 255, 0.82));
    }

    .showcaseSection {
      margin: 18px 0 0;
      padding: 34px;
      border: 1px solid rgba(118, 149, 230, 0.18);
      border-radius: 34px;
      background:
        radial-gradient(circle at 90% 0%, rgba(207, 239, 255, 0.62), transparent 230px),
        linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 255, 0.94));
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 1), 0 18px 42px rgba(17, 19, 31, 0.07);
    }

    .showcaseHeader h2 {
      margin: 6px 0 10px;
      color: #11131f;
      font-size: clamp(34px, 5vw, 62px);
      line-height: 0.96;
      letter-spacing: -0.08em;
    }

    .showcaseHeader p:not(.kicker) {
      max-width: 720px;
      margin: 0 0 22px;
      color: #555b72;
      font-size: 15px;
      font-weight: 800;
      line-height: 1.65;
      word-break: keep-all;
    }

    .showcaseGrid {
      display: grid;
      grid-template-columns: repeat(5, minmax(0, 1fr));
      gap: 14px;
    }

    .showcaseCard {
      min-width: 0;
      overflow: hidden;
      border: 1px solid rgba(118, 149, 230, 0.16);
      border-radius: 26px;
      background: rgba(255, 255, 255, 0.78);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 1), 0 14px 30px rgba(17, 19, 31, 0.06);
      animation: showcaseRise 700ms ease both;
      animation-delay: var(--delay);
    }

    .showcaseVisual {
      position: relative;
      min-height: 145px;
      overflow: hidden;
    }

    .showcaseVisual span {
      position: absolute;
      left: 18px;
      top: 18px;
      display: grid;
      place-items: center;
      width: 48px;
      height: 48px;
      border-radius: 18px;
      background: rgba(255, 255, 255, 0.78);
      font-size: 25px;
      z-index: 2;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 1), 0 8px 20px rgba(17, 19, 31, 0.08);
    }

    .showcaseVisual i,
    .showcaseVisual b {
      position: absolute;
      display: block;
      border-radius: 999px;
    }

    .showcaseVisual i {
      width: 160px;
      height: 88px;
      right: -36px;
      bottom: 16px;
      background: rgba(255, 255, 255, 0.54);
      transform: rotate(-12deg);
    }

    .showcaseVisual b {
      width: 92px;
      height: 92px;
      left: 34px;
      bottom: -30px;
      background: rgba(93, 103, 200, 0.12);
    }

    .showcaseCopy {
      padding: 16px;
    }

    .showcaseCopy strong {
      display: block;
      color: #11131f;
      font-size: 17px;
      font-weight: 950;
      letter-spacing: -0.04em;
      margin-bottom: 7px;
    }

    .showcaseCopy p {
      margin: 0;
      color: #60677c;
      font-size: 12px;
      font-weight: 800;
      line-height: 1.5;
      word-break: keep-all;
    }

    @keyframes showcaseRise {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 980px) {
      .showcaseGrid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }

    @media (max-width: 640px) {
      .presetThumb {
        min-height: 108px;
        margin-bottom: 13px;
        border-radius: 20px;
      }

      .showcaseSection {
        padding: 22px 16px;
        border-radius: 28px;
      }

      .showcaseHeader h2 {
        font-size: clamp(34px, 10vw, 44px);
      }

      .showcaseHeader p:not(.kicker) {
        font-size: 13px;
      }

      .showcaseGrid {
        grid-template-columns: 1fr;
      }

      .showcaseVisual {
        min-height: 132px;
      }
    }
  `;

  document.head.appendChild(style);
}

function runVisualUpgrade() {
  installVisualStyles();
  document.querySelectorAll<HTMLElement>('.presetButton').forEach(enhancePresetCard);
  ensureShowcaseSection();
}

runVisualUpgrade();

const visualObserver = new MutationObserver(() => {
  window.clearTimeout(visualTimer);
  visualTimer = window.setTimeout(runVisualUpgrade, 100);
});

visualObserver.observe(document.documentElement, { childList: true, subtree: true });
