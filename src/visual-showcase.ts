type VisualTone = {
  key: string;
  label: string;
  emoji: string;
  tag: string;
  scene: string;
};

const VISUAL_TONES: VisualTone[] = [
  { key: '후지필름', label: 'FUJI', emoji: '🎞️', tag: 'muted green · soft blue', scene: 'alley' },
  { key: '디카', label: 'DICA', emoji: '📸', tag: 'flash · y2k memory', scene: 'flash' },
  { key: '로맨스', label: 'ROMANCE', emoji: '🎬', tag: 'school · soft light', scene: 'school' },
  { key: '정류장', label: 'NIGHT', emoji: '🌙', tag: 'bus stop · streetlight', scene: 'night' },
  { key: '창가', label: 'WINDOW', emoji: '🌧️', tag: 'rain · quiet mood', scene: 'window' },
  { key: '치비', label: 'CHIBI', emoji: '🧸', tag: 'avatar · resin doll', scene: 'chibi' },
  { key: '밴드', label: 'BAND', emoji: '🎤', tag: 'music room · stage', scene: 'band' },
  { key: '보컬', label: 'VOCAL', emoji: '🎙️', tag: 'close-up · performance', scene: 'band' },
  { key: '광화문', label: 'STREET', emoji: '🇰🇷', tag: 'crowd · wide shot', scene: 'street' },
];

let visualTimer: number | undefined;

function pickTone(title: string, note: string) {
  const text = `${title} ${note}`;
  return VISUAL_TONES.find((tone) => text.includes(tone.key)) ?? {
    key: 'default',
    label: 'SCENE',
    emoji: '✨',
    tag: 'prompt · scene kit',
    scene: 'default',
  };
}

function sceneMarkup(scene: string, emoji: string, label: string, tag: string) {
  return `
    <div class="sceneCanvas scene-${scene}">
      <div class="sceneSky"></div>
      <div class="sceneSun"></div>
      <div class="sceneBack"></div>
      <div class="sceneMid"></div>
      <div class="sceneGround"></div>
      <div class="scenePerson one"></div>
      <div class="scenePerson two"></div>
      <div class="sceneProp"></div>
      <div class="sceneBadge"><span>${emoji}</span><b>${label}</b></div>
      <small>${tag}</small>
    </div>
  `;
}

function enhancePresetCard(card: HTMLElement) {
  if (card.querySelector('.presetThumb')) return;

  const title = card.querySelector('strong')?.textContent?.trim() ?? '';
  const note = card.querySelector('span')?.textContent?.trim() ?? '';
  const tone = pickTone(title, note);

  const thumb = document.createElement('div');
  thumb.className = 'presetThumb';
  thumb.innerHTML = sceneMarkup(tone.scene, tone.emoji, tone.label, tone.tag);
  card.prepend(thumb);
}

function removeShowcaseSection() {
  document.querySelectorAll('[data-visual-showcase="true"], .showcaseSection').forEach((section) => {
    section.remove();
  });
}

function installVisualStyles() {
  const old = document.getElementById('visual-showcase-style');
  if (old) old.remove();

  const style = document.createElement('style');
  style.id = 'visual-showcase-style';
  style.textContent = `
    .presetButton { overflow: hidden !important; }

    .presetThumb {
      margin: -4px 0 16px;
      border-radius: 22px;
      overflow: hidden;
      border: 1px solid rgba(118, 149, 230, 0.18);
      box-shadow: inset 0 1px 0 rgba(255,255,255,1), 0 16px 30px rgba(17,19,31,0.06);
    }

    .sceneCanvas {
      position: relative;
      height: 152px;
      overflow: hidden;
      background: linear-gradient(180deg, #dff4ff 0%, #f6f8ff 58%, #eff6ee 100%);
      isolation: isolate;
    }

    .sceneCanvas::before {
      content: "";
      position: absolute;
      inset: 0;
      background-image:
        radial-gradient(circle at 18% 22%, rgba(255,255,255,0.95), transparent 76px),
        linear-gradient(90deg, rgba(255,255,255,0.18), transparent 18%, rgba(255,255,255,0.22) 52%, transparent 74%);
      opacity: 0.9;
      z-index: 1;
    }

    .sceneSky, .sceneSun, .sceneBack, .sceneMid, .sceneGround, .scenePerson, .sceneProp, .sceneBadge, .sceneCanvas small {
      position: absolute;
      z-index: 2;
    }

    .sceneSun {
      width: 64px;
      height: 64px;
      right: 24px;
      top: 20px;
      border-radius: 999px;
      background: rgba(255, 244, 203, 0.78);
      filter: blur(2px);
    }

    .sceneBack {
      left: 22px;
      right: 22px;
      bottom: 42px;
      height: 62px;
      border-radius: 26px 26px 10px 10px;
      background:
        linear-gradient(90deg, rgba(255,255,255,0.78) 0 18%, transparent 18% 24%, rgba(255,255,255,0.7) 24% 44%, transparent 44% 50%, rgba(255,255,255,0.68) 50% 72%, transparent 72% 77%, rgba(255,255,255,0.74) 77% 100%);
      opacity: 0.9;
    }

    .sceneMid {
      left: 0;
      right: 0;
      bottom: 35px;
      height: 48px;
      background: linear-gradient(90deg, rgba(96, 135, 116, 0.18), transparent 22%, rgba(93,103,200,0.09) 50%, transparent 74%, rgba(96,135,116,0.15));
      clip-path: polygon(0 55%, 14% 30%, 28% 48%, 44% 20%, 63% 50%, 78% 28%, 100% 54%, 100% 100%, 0 100%);
    }

    .sceneGround {
      left: 0;
      right: 0;
      bottom: 0;
      height: 52px;
      background: linear-gradient(180deg, rgba(255,255,255,0.7), rgba(208, 220, 230, 0.48));
    }

    .scenePerson {
      bottom: 30px;
      width: 22px;
      height: 48px;
      border-radius: 999px 999px 10px 10px;
      background: #15192a;
      box-shadow: 0 0 0 6px rgba(255,255,255,0.16);
    }

    .scenePerson::before {
      content: "";
      position: absolute;
      left: 4px;
      top: -12px;
      width: 14px;
      height: 14px;
      border-radius: 999px;
      background: #f2c7ad;
    }

    .scenePerson.one { left: 42%; }
    .scenePerson.two { left: calc(42% + 32px); height: 56px; opacity: 0.9; }

    .sceneBadge {
      left: 16px;
      top: 16px;
      display: flex;
      align-items: center;
      gap: 9px;
      min-height: 42px;
      padding: 6px 12px 6px 7px;
      border-radius: 999px;
      background: rgba(255,255,255,0.78);
      box-shadow: inset 0 1px 0 rgba(255,255,255,1), 0 8px 18px rgba(17,19,31,0.08);
      backdrop-filter: blur(12px);
    }

    .sceneBadge span {
      display: grid;
      place-items: center;
      width: 30px;
      height: 30px;
      border-radius: 12px;
      background: rgba(255,255,255,0.9);
      font-size: 18px;
    }

    .sceneBadge b {
      max-width: 150px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: #11131f;
      font-size: 11px;
      font-weight: 950;
      letter-spacing: 0.06em;
    }

    .sceneCanvas small {
      right: 14px;
      bottom: 14px;
      max-width: 58%;
      color: rgba(17,19,31,0.62);
      font-size: 10px;
      font-weight: 900;
      letter-spacing: 0.02em;
      text-align: right;
    }

    .scene-alley { background: linear-gradient(180deg, #d8f1e9 0%, #d9efff 54%, #f2efe4 100%); }
    .scene-alley .sceneBack { transform: perspective(180px) rotateX(8deg); }
    .scene-alley .sceneProp { left: 24px; top: 58px; width: 62px; height: 44px; border-radius: 999px; background: rgba(84,128,95,0.2); }

    .scene-flash { background: linear-gradient(135deg, #ffe7bf 0%, #d8f1ff 52%, #eee6ff 100%); }
    .scene-flash .sceneSun { left: 46px; top: 30px; width: 76px; height: 76px; background: rgba(255,255,255,0.95); box-shadow: 0 0 34px rgba(255,255,255,0.95); }
    .scene-flash .sceneProp { right: 24px; top: 56px; width: 48px; height: 34px; border-radius: 10px; background: rgba(17,19,31,0.74); }

    .scene-school { background: linear-gradient(180deg, #dfeeff 0%, #f1e9ff 58%, #fff4e4 100%); }
    .scene-school .sceneBack { bottom: 36px; height: 76px; background: linear-gradient(90deg, rgba(255,255,255,0.78) 0 46%, transparent 46% 52%, rgba(255,255,255,0.78) 52% 100%); }
    .scene-school .sceneProp { left: 18px; bottom: 32px; width: 78px; height: 14px; border-radius: 999px; background: rgba(93,103,200,0.12); }

    .scene-night { background: linear-gradient(180deg, #253155 0%, #6f7eb3 54%, #cbd8ff 100%); }
    .scene-night .sceneSun { right: 28px; top: 22px; background: rgba(255,245,201,0.9); width: 34px; height: 34px; }
    .scene-night .sceneBack { background: rgba(255,255,255,0.18); }
    .scene-night .scenePerson { background: #0f1324; }

    .scene-window { background: linear-gradient(180deg, #d7ecf5 0%, #eef5fb 58%, #f5f1ff 100%); }
    .scene-window .sceneBack { inset: 22px 22px 36px; height: auto; border-radius: 26px; background: rgba(255,255,255,0.52); border: 1px solid rgba(255,255,255,0.65); }
    .scene-window .sceneProp { inset: 34px 38px auto auto; width: 2px; height: 82px; background: rgba(93,103,200,0.18); box-shadow: -32px 4px 0 rgba(93,103,200,0.12), -68px -2px 0 rgba(93,103,200,0.1); }

    .scene-chibi { background: linear-gradient(135deg, #ffe5f1 0%, #eee5ff 52%, #d7f2ff 100%); }
    .scene-chibi .scenePerson { left: 50%; bottom: 36px; width: 42px; height: 42px; border-radius: 999px; transform: translateX(-50%); background: rgba(255,255,255,0.9); box-shadow: 0 0 0 18px rgba(255,255,255,0.26); }
    .scene-chibi .scenePerson::before { left: 12px; top: -18px; width: 18px; height: 18px; background: #f2c7ad; }
    .scene-chibi .scenePerson.two { display: none; }

    .scene-band { background: linear-gradient(180deg, #22283f 0%, #6c76ad 52%, #e9e7ff 100%); }
    .scene-band .sceneProp { left: 26px; bottom: 42px; width: 58px; height: 38px; border-radius: 999px; border: 6px solid rgba(255,255,255,0.42); }
    .scene-band .scenePerson { background: #13182b; }

    .scene-street { background: linear-gradient(180deg, #d9efff 0%, #e9f4ff 48%, #f1f1f7 100%); }
    .scene-street .scenePerson.one { left: 32%; }
    .scene-street .scenePerson.two { left: 58%; }
    .scene-street .sceneProp { right: 24px; bottom: 44px; width: 88px; height: 28px; border-radius: 999px; background: rgba(236,85,96,0.15); }

    @media (max-width: 640px) {
      .presetThumb {
        margin-bottom: 13px;
        border-radius: 20px;
      }

      .sceneCanvas {
        height: 126px;
      }
    }
  `;

  document.head.appendChild(style);
}

function runVisualUpgrade() {
  removeShowcaseSection();
  installVisualStyles();
  document.querySelectorAll<HTMLElement>('.presetButton').forEach(enhancePresetCard);
}

runVisualUpgrade();

const visualObserver = new MutationObserver(() => {
  window.clearTimeout(visualTimer);
  visualTimer = window.setTimeout(runVisualUpgrade, 100);
});

visualObserver.observe(document.documentElement, { childList: true, subtree: true });
