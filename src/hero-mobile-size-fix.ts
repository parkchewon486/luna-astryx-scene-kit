let heroMobileFixTimer: number | undefined;
let heroMobileFixInterval: number | undefined;

function installHeroMobileSizeFix() {
  const old = document.getElementById('hero-mobile-size-fix-style');
  if (old) old.remove();

  const style = document.createElement('style');
  style.id = 'hero-mobile-size-fix-style';
  style.textContent = `
    @media (max-width: 720px) {
      .page {
        padding-top: 18px !important;
      }

      .heroGrid.lunaHeroShowcase {
        min-height: auto !important;
        padding: 18px !important;
        gap: 18px !important;
        border-radius: 30px !important;
        margin-bottom: 26px !important;
      }

      .heroGrid.lunaHeroShowcase::after {
        inset: 9px !important;
        border-radius: 24px !important;
      }

      .lunaHeroCopy {
        gap: 14px !important;
      }

      .lunaHeroEyebrow {
        max-width: 100% !important;
        padding: 8px 11px !important;
        border-radius: 22px !important;
        font-size: 9px !important;
        line-height: 1.45 !important;
        letter-spacing: 0.14em !important;
      }

      .lunaHeroTitle {
        max-width: 100% !important;
        font-size: clamp(36px, 10.5vw, 48px) !important;
        line-height: 1.02 !important;
        letter-spacing: -0.07em !important;
      }

      .lunaHeroLead {
        max-width: 100% !important;
        color: #454b64 !important;
        font-size: 14px !important;
        line-height: 1.62 !important;
        font-weight: 820 !important;
      }

      .lunaHeroActions {
        gap: 10px !important;
      }

      .lunaPrimaryCTA {
        min-height: 52px !important;
        padding: 0 16px !important;
        font-size: 14px !important;
        box-shadow:
          0 6px 0 rgba(17,19,31,0.12),
          0 20px 42px rgba(92,70,244,0.24),
          inset 0 1px 0 rgba(255,255,255,0.32) !important;
      }

      .lunaSecondaryNote {
        min-height: 44px !important;
        padding: 0 12px !important;
        font-size: 12px !important;
        line-height: 1.25 !important;
      }

      .lunaMiniComposer {
        gap: 11px !important;
        margin-top: 0 !important;
        padding: 13px !important;
        border-radius: 22px !important;
      }

      .lunaMiniComposer::before {
        font-size: 9px !important;
        letter-spacing: 0.14em !important;
      }

      .lunaMiniChips {
        gap: 7px !important;
      }

      .lunaMiniChip {
        min-height: 31px !important;
        padding: 0 9px !important;
        font-size: 11px !important;
      }

      .lunaMiniOutput {
        padding: 12px !important;
        border-radius: 18px !important;
      }

      .lunaMiniOutput b {
        font-size: 9px !important;
      }

      .lunaTypingLine {
        font-size: 12px !important;
        line-height: 1.55 !important;
      }

      .lunaHeroShowcaseDeck {
        margin-top: 2px !important;
      }

      .lunaVisualCard,
      .lunaVisualCard.large {
        min-height: 188px !important;
        border-radius: 24px !important;
      }

      .lunaVisualMeta {
        left: 12px !important;
        right: 12px !important;
        bottom: 12px !important;
      }

      .lunaVisualMeta strong {
        font-size: 20px !important;
      }

      .lunaVisualMeta em,
      .lunaHoverTags span {
        font-size: 9px !important;
      }
    }

    @media (max-width: 390px) {
      .lunaHeroTitle {
        font-size: 34px !important;
        line-height: 1.04 !important;
      }

      .lunaHeroLead {
        font-size: 13.5px !important;
      }

      .lunaMiniComposer {
        display: none !important;
      }
    }
  `;
  document.head.appendChild(style);
}

function runHeroMobileSizeFix() {
  installHeroMobileSizeFix();
}

runHeroMobileSizeFix();

const heroMobileFixObserver = new MutationObserver(() => {
  window.clearTimeout(heroMobileFixTimer);
  heroMobileFixTimer = window.setTimeout(runHeroMobileSizeFix, 120);
});

heroMobileFixObserver.observe(document.documentElement, { childList: true, subtree: true });

window.clearInterval(heroMobileFixInterval);
heroMobileFixInterval = window.setInterval(runHeroMobileSizeFix, 800);
window.setTimeout(() => window.clearInterval(heroMobileFixInterval), 25000);
