const SIGNAL_POLISH_STYLE_ID = 'luna-signal-menu-polish-style';
const SIGNAL_WRITE_PANEL_ID = 'luna-signal-write-root';

function ensureSignalPolishStyle() {
  if (document.getElementById(SIGNAL_POLISH_STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = SIGNAL_POLISH_STYLE_ID;
  style.textContent = `
    #${SIGNAL_WRITE_PANEL_ID}{display:none!important}
    .signalTop [data-signal-tab="write"],
    .lunaMobileNav [data-signal-tab="write"]{display:none!important}
    @media(max-width:1024px){.lunaMobileNav{grid-template-columns:repeat(5,minmax(0,1fr))!important}}

    body .trendRadarActions button[data-copy-hook]{display:none!important}
    body .trendRadarActions button[data-copy-draft]{display:grid!important}

    .promptStudioBanner.signalUnifiedPrompt{
      display:block!important;
      margin:0 0 22px;
      padding:30px 34px 28px;
      border:1px solid rgba(111,99,217,.16);
      border-radius:28px;
      background:linear-gradient(135deg,rgba(255,255,255,.97),rgba(245,243,255,.92)),radial-gradient(circle at 90% 8%,rgba(107,214,238,.18),transparent 38%);
      box-shadow:0 20px 58px rgba(47,45,92,.09);
      overflow:hidden;
    }
    .promptStudioBanner.signalUnifiedPrompt::after{width:220px;height:220px;right:-86px;top:-126px}
    .signalUnifiedEyebrow{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:13px}
    .signalUnifiedBadge{display:inline-flex;align-items:center;min-height:28px;padding:0 12px;border-radius:999px;background:#151927;color:#fff;font:900 10px/1 'Manrope','Noto Sans KR',sans-serif;letter-spacing:.12em}
    .signalUnifiedNote{color:#766f88;font-size:11px;font-weight:850;letter-spacing:.04em}
    .signalUnifiedTitleRow{display:flex;align-items:flex-end;gap:12px;flex-wrap:wrap}
    .promptStudioBanner.signalUnifiedPrompt .signalUnifiedTitleRow h2{margin:0;color:#111522;font-family:'Noto Sans KR','Manrope',sans-serif;font-size:clamp(42px,6vw,68px);font-style:normal;font-weight:950;line-height:.92;letter-spacing:-.075em}
    .signalUnifiedEnglish{padding-bottom:5px;color:#7c7691;font:900 16px/1 'Manrope',sans-serif;letter-spacing:.22em}
    .promptStudioBanner.signalUnifiedPrompt>p{margin:20px 0 0;color:#5f6377;font-size:14px;font-weight:700;line-height:1.75;letter-spacing:0}

    #luna-signal-tools-root .signalHead,
    #luna-signal-global-root .signalHead{display:block;position:relative;margin-bottom:24px;padding:3px 0 5px}
    #luna-signal-tools-root .signalHead>div,
    #luna-signal-global-root .signalHead>div{display:block}
    #luna-signal-tools-root .signalHead small,
    #luna-signal-global-root .signalHead small{display:inline-flex;align-items:center;min-height:28px;padding:0 12px;border-radius:999px;background:#151927;color:#fff;font-size:10px;font-weight:950;letter-spacing:.12em}
    #luna-signal-tools-root .signalHead h2,
    #luna-signal-global-root .signalHead h2{display:flex;align-items:flex-end;gap:12px;flex-wrap:wrap;margin:14px 0 0;color:#111522;font-size:clamp(42px,6vw,68px);font-weight:950;line-height:.92;letter-spacing:-.075em}
    #luna-signal-tools-root .signalHead h2::after,
    #luna-signal-global-root .signalHead h2::after{padding-bottom:5px;color:#7c7691;font:900 16px/1 'Manrope',sans-serif;letter-spacing:.22em}
    #luna-signal-tools-root .signalHead h2::after{content:'TOOLBOX'}
    #luna-signal-global-root .signalHead h2::after{content:'SIGNAL'}
    #luna-signal-tools-root .signalHead p,
    #luna-signal-global-root .signalHead p{max-width:700px;margin:18px 0 0;color:#5f6377;font-size:14px;font-weight:700;line-height:1.75}
    #luna-signal-global-root .signalMeta{position:absolute;right:0;bottom:8px}

    .contestRadarHeader.signalUnifiedContest{align-items:flex-end}
    .contestRadarHeader.signalUnifiedContest .contestRadarEyebrow{margin-bottom:13px}
    .contestRadarHeader.signalUnifiedContest .contestRadarLive{display:inline-flex;align-items:center;min-height:28px;padding:0 12px;border-radius:999px;background:#151927;color:#fff;font-size:10px;font-weight:950;letter-spacing:.12em}
    .contestRadarHeader.signalUnifiedContest .contestRadarKicker{display:none}
    .contestRadarHeader.signalUnifiedContest .contestRadarTitleWrap{align-items:flex-end;gap:12px}
    .contestRadarHeader.signalUnifiedContest h2{font-family:'Noto Sans KR','Manrope',sans-serif;font-size:clamp(42px,6vw,68px);font-weight:950;line-height:.92;letter-spacing:-.075em}
    .contestRadarHeader.signalUnifiedContest .contestRadarWord::after{height:3px;bottom:-6px}
    .contestRadarHeader.signalUnifiedContest .contestRadarEnglish{padding-bottom:5px;color:#7c7691;font-size:16px;letter-spacing:.22em}
    .contestRadarHeader.signalUnifiedContest p{max-width:700px;margin-top:20px;color:#5f6377;font-weight:700;line-height:1.75}

    @media(max-width:720px){
      .promptStudioBanner.signalUnifiedPrompt{padding:24px 20px;border-radius:24px}
      .promptStudioBanner.signalUnifiedPrompt .signalUnifiedTitleRow h2,
      #luna-signal-tools-root .signalHead h2,
      #luna-signal-global-root .signalHead h2,
      .contestRadarHeader.signalUnifiedContest h2{font-size:44px}
      .signalUnifiedEnglish,
      #luna-signal-tools-root .signalHead h2::after,
      #luna-signal-global-root .signalHead h2::after,
      .contestRadarHeader.signalUnifiedContest .contestRadarEnglish{font-size:12px}
      #luna-signal-global-root .signalMeta{position:static;display:inline-block;margin-top:12px}
    }
  `;
  document.head.appendChild(style);
}

function decoratePromptStudioBanner() {
  const banner = document.querySelector<HTMLElement>('.promptStudioBanner');
  if (!banner || banner.dataset.signalUnified === '1') return;

  banner.dataset.signalUnified = '1';
  banner.classList.add('signalUnifiedPrompt');
  banner.innerHTML = `
    <div class="signalUnifiedEyebrow">
      <span class="signalUnifiedBadge">CREATE STUDIO</span>
      <span class="signalUnifiedNote">이미지 · 영상 프롬프트 제작</span>
    </div>
    <div class="signalUnifiedTitleRow">
      <h2>프롬프트 스튜디오</h2>
      <span class="signalUnifiedEnglish">STUDIO</span>
    </div>
    <p>무드, 렌즈, 조명, 움직임을 조합해 바로 복사할 수 있는 프롬프트를 만드세요.</p>
  `;
}

function polishSignalNavigation() {
  ensureSignalPolishStyle();

  document.querySelectorAll<HTMLElement>('[data-signal-tab="write"]').forEach((button) => button.remove());
  const writePanel = document.getElementById(SIGNAL_WRITE_PANEL_ID);
  if (writePanel) writePanel.hidden = true;

  if (location.hash === '#write' || document.body.dataset.signalActive === 'write') {
    const hotButton = document.querySelector<HTMLButtonElement>('[data-signal-tab="hot"]');
    hotButton?.click();
  }

  decoratePromptStudioBanner();
  document.querySelector<HTMLElement>('.contestRadarHeader')?.classList.add('signalUnifiedContest');
}

function applyLunaSignalBrand() {
  const hero = document.querySelector<HTMLElement>('.heroCopy');
  if (!hero) return false;

  const badge = hero.querySelector<HTMLElement>('.badge');
  if (badge) badge.textContent = 'CREATOR SIGNAL · ASTRYX Y2K THEME';

  const title = hero.querySelector<HTMLHeadingElement>('h1');
  if (title && !title.dataset.lunaSignalReady) {
    title.dataset.lunaSignalReady = 'true';
    title.classList.add('lunaSignalTitle');
    title.setAttribute('aria-label', 'Luna Signal');
    title.innerHTML = '<span class="lunaWord">Luna</span><span class="signalWord">Signal</span><span class="signalPulse" aria-hidden="true"></span>';
  }

  const lead = hero.querySelector<HTMLElement>('.lead');
  if (lead) {
    lead.innerHTML = '프롬프트 제작부터<br class="lunaSignalBreak" /> 핫이슈 탐색, 공모전 발견까지<br class="lunaSignalBreak" /> 콘텐츠 제작에 필요한 신호를 한곳에.';
  }

  const presetPanel = document.querySelector<HTMLElement>('.presetPanel');
  if (presetPanel && !document.querySelector('.promptStudioBanner')) {
    const banner = document.createElement('section');
    banner.className = 'promptStudioBanner';
    banner.setAttribute('aria-label', '프롬프트 스튜디오');
    presetPanel.parentElement?.insertBefore(banner, presetPanel);
  }

  document.title = 'Luna Signal';
  polishSignalNavigation();
  return true;
}

function mountLunaSignalBrand() {
  applyLunaSignalBrand();

  let queued = false;
  const observer = new MutationObserver(() => {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(() => {
      queued = false;
      applyLunaSignalBrand();
    });
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountLunaSignalBrand, { once: true });
} else {
  mountLunaSignalBrand();
}
