const MOBILE_NAV_ID = 'luna-mobile-nav';

function scrollToSelector(selector: string) {
  const target = document.querySelector<HTMLElement>(selector);
  if (!target) return;
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function mountMobileNav() {
  if (document.getElementById(MOBILE_NAV_ID)) return true;
  if (!document.body) return false;

  const nav = document.createElement('nav');
  nav.id = MOBILE_NAV_ID;
  nav.className = 'lunaMobileNav';
  nav.setAttribute('aria-label', '바로가기 메뉴');
  nav.innerHTML = `
    <button type="button" data-target=".heroGrid"><span>⌂</span><b>홈</b></button>
    <button type="button" data-target=".presetPanelPriority"><span>✦</span><b>프리셋</b></button>
    <button type="button" data-target=".mainGrid"><span>⚙</span><b>만들기</b></button>
    <button type="button" data-target=".trendRadar"><span>◉</span><b>핫이슈</b></button>
    <button type="button" data-target=".lunaContestRadarRoot, .contestRadar" class="contestNavButton"><span>◆</span><b>공모전</b></button>
    <button type="button" data-target=".resultPanel"><span>✓</span><b>결과</b></button>
  `;

  nav.addEventListener('click', (event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>('button[data-target]');
    if (!button) return;
    scrollToSelector(button.dataset.target ?? '');
  });

  document.body.appendChild(nav);
  document.body.classList.add('hasLunaMobileNav');
  return true;
}

if (!mountMobileNav()) {
  const observer = new MutationObserver(() => {
    if (!mountMobileNav()) return;
    observer.disconnect();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
}
