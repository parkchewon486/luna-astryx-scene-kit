let heroContactRestoreTimer: number | undefined;
let heroContactRestoreInterval: number | undefined;

const CONTACT_EMAIL = 'lunakimxx1@gmail.com';
const X_PROFILE = 'https://x.com/checheluna3';

function installHeroContactBarStyles() {
  const old = document.getElementById('hero-contact-bar-restore-style');
  if (old) old.remove();

  const style = document.createElement('style');
  style.id = 'hero-contact-bar-restore-style';
  style.textContent = `
    .lunaHeroContactBar {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 9px;
      margin-top: -4px;
    }

    .lunaHeroContactLink {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      min-height: 40px;
      padding: 0 13px;
      border: 1px solid rgba(17, 19, 31, 0.09);
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.72);
      color: #24283c;
      font-size: 12px;
      font-weight: 950;
      line-height: 1;
      text-decoration: none;
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,0.95),
        0 12px 28px rgba(17,19,31,0.07);
      backdrop-filter: blur(18px);
      transition: transform 0.16s ease, box-shadow 0.16s ease, background 0.16s ease;
    }

    .lunaHeroContactLink:hover {
      transform: translateY(-2px);
      background: rgba(255,255,255,0.9);
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,1),
        0 18px 34px rgba(17,19,31,0.1);
    }

    .lunaHeroContactIcon {
      display: grid;
      place-items: center;
      width: 24px;
      height: 24px;
      border-radius: 999px;
      background: #11131f;
      color: #fff;
      font-family: 'Space Grotesk', sans-serif;
      font-size: 11px;
      font-weight: 950;
      flex: 0 0 24px;
    }

    .lunaHeroContactLink.gmail .lunaHeroContactIcon {
      background: linear-gradient(135deg, #ea4335, #fbbc05);
    }

    .lunaHeroContactLink.xprofile .lunaHeroContactIcon {
      background: #11131f;
    }

    @media (max-width: 720px) {
      .lunaHeroContactBar {
        display: grid;
        grid-template-columns: 1fr;
        gap: 8px;
        width: 100%;
      }

      .lunaHeroContactLink {
        width: 100%;
        justify-content: flex-start;
        min-height: 42px;
        padding: 0 12px;
        font-size: 12px;
      }
    }
  `;
  document.head.appendChild(style);
}

function heroContactBarMarkup() {
  const subject = encodeURIComponent('Luna Prompt Studio 문의');
  return `
    <div class="lunaHeroContactBar" data-hero-contact-bar="true" aria-label="Luna contact links">
      <a class="lunaHeroContactLink gmail" href="mailto:${CONTACT_EMAIL}?subject=${subject}">
        <span class="lunaHeroContactIcon">G</span>
        <span>Gmail 문의 : ${CONTACT_EMAIL}</span>
      </a>
      <a class="lunaHeroContactLink xprofile" href="${X_PROFILE}" target="_blank" rel="noreferrer">
        <span class="lunaHeroContactIcon">𝕏</span>
        <span>X 프로필 : @checheluna3</span>
      </a>
    </div>
  `;
}

function restoreHeroContactBar() {
  installHeroContactBarStyles();

  const heroCopy = document.querySelector<HTMLElement>('.lunaHeroCopy');
  if (!heroCopy) return;
  if (heroCopy.querySelector('[data-hero-contact-bar="true"]')) return;

  const actions = heroCopy.querySelector<HTMLElement>('.lunaHeroActions');
  if (actions) {
    actions.insertAdjacentHTML('afterend', heroContactBarMarkup());
  }
}

restoreHeroContactBar();

const heroContactRestoreObserver = new MutationObserver(() => {
  window.clearTimeout(heroContactRestoreTimer);
  heroContactRestoreTimer = window.setTimeout(restoreHeroContactBar, 120);
});

heroContactRestoreObserver.observe(document.documentElement, { childList: true, subtree: true });

window.clearInterval(heroContactRestoreInterval);
heroContactRestoreInterval = window.setInterval(restoreHeroContactBar, 800);
window.setTimeout(() => window.clearInterval(heroContactRestoreInterval), 25000);
