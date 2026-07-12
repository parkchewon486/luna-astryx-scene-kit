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
    banner.setAttribute('aria-label', 'Luna Prompt Studio');
    banner.innerHTML = `
      <div class="promptStudioMark" aria-hidden="true"><span></span><span></span><span></span></div>
      <div>
        <p>PROMPT MENU</p>
        <h2><span>Luna</span> Prompt Studio</h2>
        <strong>무드 · 렌즈 · 조명 · 움직임까지, 바로 복사해 쓰는 프롬프트 제작 도구</strong>
      </div>
    `;
    presetPanel.parentElement?.insertBefore(banner, presetPanel);
  }

  document.title = 'Luna Signal';
  return true;
}

function mountLunaSignalBrand() {
  if (applyLunaSignalBrand()) return;

  let attempts = 0;
  const timer = window.setInterval(() => {
    attempts += 1;
    if (applyLunaSignalBrand() || attempts > 30) window.clearInterval(timer);
  }, 120);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountLunaSignalBrand, { once: true });
} else {
  mountLunaSignalBrand();
}
