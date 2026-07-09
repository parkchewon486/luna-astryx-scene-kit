let heroContactTimer: number | undefined;
let heroContactInterval: number | undefined;

const CONTACT_EMAIL = 'lunakimxx1@gmail.com';
const CONTACT_SUBJECT = 'Luna Prompt Studio 협업 문의';

function installHeroContactStyles() {
  const old = document.getElementById('hero-contact-cta-style');
  if (old) old.remove();

  const style = document.createElement('style');
  style.id = 'hero-contact-cta-style';
  style.textContent = `
    .lunaContactButton {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 8px !important;
      min-height: 48px !important;
      max-width: 100% !important;
      padding: 0 18px !important;
      border: 1px solid rgba(118, 149, 230, 0.28) !important;
      border-radius: 999px !important;
      background:
        radial-gradient(circle at 18% 0%, rgba(207, 239, 255, 0.94), transparent 80px),
        linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(237, 229, 255, 0.92)) !important;
      color: #11131f !important;
      text-decoration: none !important;
      font-family: inherit !important;
      font-size: 14px !important;
      font-weight: 950 !important;
      letter-spacing: -0.03em !important;
      line-height: 1.15 !important;
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,1),
        0 14px 28px rgba(17,19,31,0.08) !important;
      transition: transform 160ms ease, box-shadow 160ms ease !important;
    }

    .lunaContactButton:active {
      transform: translateY(1px) scale(0.99) !important;
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,1),
        0 8px 18px rgba(17,19,31,0.08) !important;
    }

    .lunaContactButton .contactLabel {
      white-space: nowrap !important;
    }

    .lunaContactButton .contactEmail {
      display: inline-block !important;
      max-width: 210px !important;
      overflow-wrap: anywhere !important;
      word-break: break-word !important;
      color: #5864c7 !important;
    }

    @media (max-width: 640px) {
      .heroActions {
        gap: 10px !important;
      }

      .lunaContactButton {
        width: 100% !important;
        min-height: 54px !important;
        padding: 0 14px !important;
        font-size: 13px !important;
      }

      .lunaContactButton .contactEmail {
        max-width: 190px !important;
      }
    }
  `;

  document.head.appendChild(style);
}

function openGmailCompose(event: Event) {
  event.preventDefault();

  const appUrl = `googlegmail://co?to=${encodeURIComponent(CONTACT_EMAIL)}&subject=${encodeURIComponent(CONTACT_SUBJECT)}`;
  const webUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(CONTACT_EMAIL)}&su=${encodeURIComponent(CONTACT_SUBJECT)}`;

  window.location.href = appUrl;

  window.setTimeout(() => {
    window.location.href = webUrl;
  }, 650);
}

function ensureHeroContactButton() {
  const heroActions = document.querySelector<HTMLElement>('.heroActions');
  if (!heroActions) return;

  heroActions.querySelectorAll('.lunaHeroHidden').forEach((item) => {
    const element = item as HTMLElement;
    element.classList.remove('lunaHeroHidden');
    element.removeAttribute('aria-hidden');
    if ('tabIndex' in element) element.tabIndex = 0;
  });

  if (!heroActions.querySelector('.lunaContactButton')) {
    const contact = document.createElement('a');
    contact.className = 'lunaContactButton';
    contact.href = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(CONTACT_EMAIL)}&su=${encodeURIComponent(CONTACT_SUBJECT)}`;
    contact.target = '_blank';
    contact.rel = 'noreferrer';
    contact.innerHTML = `<span class="contactLabel">Gmail 문의 :</span><span class="contactEmail">${CONTACT_EMAIL}</span>`;
    contact.addEventListener('click', openGmailCompose);

    const profileButton = Array.from(heroActions.children).find((item) => item.textContent?.includes('프로필 보기'));
    if (profileButton) {
      heroActions.insertBefore(contact, profileButton);
    } else {
      heroActions.appendChild(contact);
    }
  }

  heroActions.classList.add('lunaContactReady');
}

function runHeroContactPatch() {
  installHeroContactStyles();
  ensureHeroContactButton();
}

runHeroContactPatch();

const heroContactObserver = new MutationObserver(() => {
  window.clearTimeout(heroContactTimer);
  heroContactTimer = window.setTimeout(runHeroContactPatch, 80);
});

heroContactObserver.observe(document.documentElement, { childList: true, subtree: true });

window.clearInterval(heroContactInterval);
heroContactInterval = window.setInterval(runHeroContactPatch, 500);
window.setTimeout(() => window.clearInterval(heroContactInterval), 15000);
