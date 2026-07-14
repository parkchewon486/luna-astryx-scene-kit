const DAILY_ROOT = 'daily-signal-root';
const DASHBOARD_ID = 'daily-creator-dashboard';

const dashboardCards = [
  {
    tab: 'hot',
    eyebrow: 'TODAY HOT',
    title: '오늘 뜨는 핫이슈',
    description: '지금 반응이 모이는 국내 커뮤니티 주제를 확인해요.',
    action: '핫이슈 보기',
    icon: '◉',
  },
  {
    tab: 'prompt',
    eyebrow: 'CREATE SIGNAL',
    title: '오늘의 프롬프트',
    description: '이미지와 영상 제작에 바로 쓸 수 있는 프롬프트를 만들어요.',
    action: '프롬프트 만들기',
    icon: '✦',
  },
  {
    tab: 'contest',
    eyebrow: 'CONTEST RADAR',
    title: '오늘 볼 공모전',
    description: '마감과 제작 조건을 확인하고 참여할 공모전을 찾아요.',
    action: '공모전 보기',
    icon: '◆',
  },
] as const;

function dashboardTemplate() {
  return `
    <section id="${DASHBOARD_ID}" class="dailyCreatorDashboard" aria-label="오늘의 크리에이터 시그널">
      <header class="dailyCreatorHead">
        <div>
          <small>CREATOR DAILY SIGNAL</small>
          <h3>오늘의 크리에이터 시그널</h3>
          <p>운세를 확인한 뒤 오늘 만들 콘텐츠까지 바로 이어가세요.</p>
        </div>
        <span>매일 새롭게 확인</span>
      </header>
      <div class="dailyCreatorGrid">
        ${dashboardCards.map((card) => `
          <button type="button" class="dailyCreatorCard" data-daily-go="${card.tab}">
            <span class="dailyCreatorIcon">${card.icon}</span>
            <small>${card.eyebrow}</small>
            <strong>${card.title}</strong>
            <p>${card.description}</p>
            <b>${card.action} →</b>
          </button>
        `).join('')}
      </div>
      <div class="dailySourceNote">
        <strong>콘텐츠 안내</strong>
        <p>오늘의 운세·별자리·띠별 운세는 Luna Signal이 제작한 엔터테인먼트 콘텐츠입니다. 중요한 결정은 실제 정보와 개인의 판단을 우선해 주세요.</p>
        <span>출처 · Luna Signal Daily Fortune</span>
      </div>
    </section>`;
}

function goToTab(tab: string) {
  const button = document.querySelector<HTMLButtonElement>(`[data-signal-tab="${tab}"]`);
  if (button) {
    button.click();
    return;
  }
  history.replaceState(null, '', `${location.pathname}${location.search}#${tab}`);
  window.dispatchEvent(new HashChangeEvent('hashchange'));
}

function mountDashboard() {
  const root = document.getElementById(DAILY_ROOT);
  if (!root) return false;
  if (!document.getElementById(DASHBOARD_ID)) root.insertAdjacentHTML('beforeend', dashboardTemplate());
  if (root.dataset.dashboardBound !== '1') {
    root.dataset.dashboardBound = '1';
    root.addEventListener('click', (event) => {
      const button = (event.target as HTMLElement).closest<HTMLElement>('[data-daily-go]');
      const tab = button?.dataset.dailyGo;
      if (tab) goToTab(tab);
    });
  }
  return true;
}

function startDashboard() {
  if (mountDashboard()) return;
  const observer = new MutationObserver(() => {
    if (!mountDashboard()) return;
    observer.disconnect();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startDashboard, { once: true });
else startDashboard();
