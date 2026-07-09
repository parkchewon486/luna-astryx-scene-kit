let presetPriorityTimer: number | undefined;
let presetPriorityInterval: number | undefined;

function installPresetPriorityStyles() {
  const old = document.getElementById('preset-library-priority-style');
  if (old) old.remove();

  const style = document.createElement('style');
  style.id = 'preset-library-priority-style';
  style.textContent = `
    .page {
      display: flex !important;
      flex-direction: column !important;
    }

    .heroGrid { order: 1 !important; }
    .bottomGrid { order: 2 !important; }
    .howGrid { order: 3 !important; }
    .benefitSection { order: 4 !important; }
    .mainGrid { order: 5 !important; }

    .bottomGrid.lunaPresetMoved {
      display: grid !important;
      grid-template-columns: 1fr !important;
      gap: 22px !important;
      margin: 30px 0 !important;
    }

    .bottomGrid.lunaPresetMoved .presetPanel {
      order: 1 !important;
      min-height: auto !important;
      padding: clamp(24px, 3vw, 34px) !important;
      border-radius: 42px !important;
      background:
        radial-gradient(circle at 88% 8%, rgba(199, 244, 255, 0.68), transparent 230px),
        radial-gradient(circle at 6% 100%, rgba(194, 166, 106, 0.16), transparent 190px),
        linear-gradient(180deg, rgba(255, 255, 255, 0.99), rgba(246, 249, 255, 0.9)) !important;
      box-shadow:
        0 34px 92px rgba(17, 19, 31, 0.1),
        inset 0 1px 0 rgba(255,255,255,1) !important;
    }

    .bottomGrid.lunaPresetMoved .astryxPanel {
      order: 2 !important;
      min-height: auto !important;
    }

    .bottomGrid.lunaPresetMoved .presetPanel::before {
      content: 'START HERE';
      position: relative;
      z-index: 2;
      display: inline-flex;
      align-items: center;
      width: fit-content;
      min-height: 34px;
      margin-bottom: 2px;
      padding: 0 12px;
      border-radius: 999px;
      background: #11131f;
      color: #ffffff;
      font-family: 'Space Grotesk', sans-serif;
      font-size: 10px;
      font-weight: 950;
      letter-spacing: 0.16em;
      box-shadow: 0 12px 24px rgba(17,19,31,0.16);
    }

    .bottomGrid.lunaPresetMoved .presetPanel > h2 {
      font-size: clamp(34px, 4vw, 54px) !important;
      letter-spacing: -0.085em !important;
    }

    .presetStartGuide {
      position: relative;
      z-index: 2;
      margin: -8px 0 0;
      padding: 14px 16px;
      border: 1px solid rgba(118, 149, 230, 0.18);
      border-radius: 20px;
      background: rgba(255, 255, 255, 0.74);
      color: #40465f;
      font-size: 14px;
      font-weight: 900;
      line-height: 1.62;
      word-break: keep-all;
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.95), 0 14px 28px rgba(17,19,31,0.055);
      backdrop-filter: blur(16px);
    }

    .bottomGrid.lunaPresetMoved .presetTabs {
      position: relative;
      z-index: 2;
      overflow-x: auto;
      padding-bottom: 6px;
      scrollbar-width: none;
    }

    .bottomGrid.lunaPresetMoved .presetTabs::-webkit-scrollbar {
      display: none;
    }

    .bottomGrid.lunaPresetMoved .presetList {
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)) !important;
      gap: 16px !important;
    }

    .bottomGrid.lunaPresetMoved .presetButton {
      min-height: 190px !important;
      border-radius: 28px !important;
    }

    @media (max-width: 720px) {
      .bottomGrid.lunaPresetMoved {
        margin: 22px 0 !important;
        gap: 18px !important;
      }

      .bottomGrid.lunaPresetMoved .presetPanel {
        padding: 22px !important;
        border-radius: 32px !important;
      }

      .bottomGrid.lunaPresetMoved .presetPanel > h2 {
        font-size: 36px !important;
      }

      .presetStartGuide {
        font-size: 13px;
        padding: 13px 14px;
      }

      .bottomGrid.lunaPresetMoved .presetList {
        grid-template-columns: 1fr !important;
        gap: 14px !important;
      }

      .bottomGrid.lunaPresetMoved .presetButton {
        min-height: 160px !important;
      }
    }
  `;
  document.head.appendChild(style);
}

function ensurePresetStartGuide(presetPanel: HTMLElement) {
  if (presetPanel.querySelector('.presetStartGuide')) return;

  const help = presetPanel.querySelector<HTMLElement>('.presetHelp');
  const guide = document.createElement('p');
  guide.className = 'presetStartGuide';
  guide.textContent = '처음이라면 여기서 시작하세요. 완성된 프리셋을 고르면 프롬프트가 바로 채워지고, 아래에서 직접 조합도 이어갈 수 있어요.';

  if (help) {
    help.insertAdjacentElement('afterend', guide);
  } else {
    const title = presetPanel.querySelector('h2');
    title?.insertAdjacentElement('afterend', guide);
  }
}

function movePresetLibraryUp() {
  installPresetPriorityStyles();

  const bottomGrid = document.querySelector<HTMLElement>('.bottomGrid');
  const presetPanel = document.querySelector<HTMLElement>('.presetPanel');

  if (!bottomGrid || !presetPanel) return;

  bottomGrid.classList.add('lunaPresetMoved');
  ensurePresetStartGuide(presetPanel);
}

movePresetLibraryUp();

const presetPriorityObserver = new MutationObserver(() => {
  window.clearTimeout(presetPriorityTimer);
  presetPriorityTimer = window.setTimeout(movePresetLibraryUp, 80);
});

presetPriorityObserver.observe(document.documentElement, { childList: true, subtree: true, attributes: true });

window.clearInterval(presetPriorityInterval);
presetPriorityInterval = window.setInterval(movePresetLibraryUp, 500);
