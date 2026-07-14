const ROOT_ID = 'daily-signal-root';
const TAB_KEY = 'daily';
const TOP_NAV_ID = 'luna-signal-top-nav';
const MOBILE_NAV_ID = 'luna-mobile-nav';

let dailySelected = location.hash === '#daily';

const zodiacs = [
  ['양자리', '3.21–4.19', '♈'], ['황소자리', '4.20–5.20', '♉'], ['쌍둥이자리', '5.21–6.21', '♊'],
  ['게자리', '6.22–7.22', '♋'], ['사자자리', '7.23–8.22', '♌'], ['처녀자리', '8.23–9.22', '♍'],
  ['천칭자리', '9.23–10.22', '♎'], ['전갈자리', '10.23–11.22', '♏'], ['사수자리', '11.23–12.21', '♐'],
  ['염소자리', '12.22–1.19', '♑'], ['물병자리', '1.20–2.18', '♒'], ['물고기자리', '2.19–3.20', '♓'],
] as const;

const koreanZodiacs = [
  ['쥐띠', '子', '🐭'], ['소띠', '丑', '🐮'], ['호랑이띠', '寅', '🐯'], ['토끼띠', '卯', '🐰'],
  ['용띠', '辰', '🐲'], ['뱀띠', '巳', '🐍'], ['말띠', '午', '🐴'], ['양띠', '未', '🐑'],
  ['원숭이띠', '申', '🐵'], ['닭띠', '酉', '🐔'], ['개띠', '戌', '🐶'], ['돼지띠', '亥', '🐷'],
] as const;

const fortunes = [
  '작게 시작한 일이 생각보다 빠르게 반응을 얻는 날이에요.',
  '미뤄둔 연락 하나가 오늘의 분위기를 바꿔줄 수 있어요.',
  '낯선 제안보다 익숙한 일의 완성도를 높이는 쪽이 유리해요.',
  '오늘은 속도보다 타이밍이 더 중요해요. 한 번 더 보고 움직여요.',
  '사람들 사이에서 당신의 감각이 유난히 돋보이는 날이에요.',
  '머릿속에만 있던 아이디어를 메모로 꺼내면 좋은 연결이 생겨요.',
  '조용히 정리한 선택이 오후에 큰 여유로 돌아와요.',
  '가볍게 건넨 말이 좋은 기회로 이어질 수 있어요.',
  '주변의 반응보다 내 기준을 먼저 믿어도 괜찮은 날이에요.',
  '오늘의 행운은 새로운 것보다 오래 좋아한 것에서 찾아와요.',
  '해야 할 일을 하나만 고르면 나머지도 자연스럽게 풀려요.',
  '기분 좋은 우연이 생길 수 있으니 평소보다 한 발 먼저 움직여요.',
];

function hash(input: string) {
  let value = 2166136261;
  for (const char of input) value = Math.imul(value ^ char.charCodeAt(0), 16777619);
  return Math.abs(value >>> 0);
}

function todayKey() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date());
}

function todayLabel() {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(new Date());
}

function signalCard(name: string, note: string, icon: string, index: number, kind: 'star' | '띠') {
  const seed = hash(`${todayKey()}-${kind}-${name}`);
  const score = 72 + seed % 25;
  const colors = ['라일락', '아쿠아 블루', '버터 옐로', '로즈 핑크', '딥 네이비', '민트'];
  const times = ['오전 9시', '오전 11시', '오후 2시', '오후 5시', '저녁 8시'];
  return `
    <article class="dailyZodiacCard ${kind === '띠' ? 'dailyAnimalCard' : ''}" data-signal-card="${kind}-${index}">
      <span class="dailyZodiacIcon">${icon}</span>
      <small>${note}</small>
      <strong>${name}</strong>
      <em>${score}점</em>
      <p>${fortunes[seed % fortunes.length]}</p>
      <span class="dailyCardMeta">행운의 색 ${colors[seed % colors.length]} · 좋은 시간 ${times[seed % times.length]}</span>
    </article>`;
}

function template() {
  const seed = hash(todayKey());
  return `
    <section id="${ROOT_ID}" class="dailySignalPanel" aria-label="데일리 시그널 프리뷰" data-signal-group="daily" hidden>
      <div class="dailySignalHero">
        <div>
          <p class="dailyEyebrow">DAILY SIGNAL · 07:00 UPDATE</p>
          <h2><span>오늘을 먼저 읽는</span> 데일리 시그널</h2>
          <p>오늘의 운세와 별자리·띠별 신호를 가볍게 확인해요.</p>
        </div>
        <div class="dailyMoon" aria-hidden="true"><span>☾</span><i></i><i></i><i></i></div>
      </div>

      <div class="dailySummaryGrid">
        <article class="dailyTodayCard">
          <div class="dailyCardHead"><span>오늘의 운세</span><b>${todayLabel()}</b></div>
          <strong>${fortunes[seed % fortunes.length]}</strong>
          <p>오늘은 모든 일을 한꺼번에 해결하려 하기보다, 가장 마음이 가는 한 가지를 먼저 잡아보세요.</p>
          <div class="dailyLuckRow"><span>행운의 숫자 <b>${1 + seed % 9}</b></span><span>행운의 색 <b>라일락</b></span><span>좋은 시간 <b>오후 ${1 + seed % 6}시</b></span></div>
        </article>
        <article class="dailyMessageCard">
          <small>TODAY'S MESSAGE</small>
          <blockquote>“조급함을 내려놓는 순간, 보이지 않던 신호가 선명해져요.”</blockquote>
          <p>운세 콘텐츠는 재미로 가볍게 참고해 주세요.</p>
        </article>
      </div>

      <div class="dailySectionHead">
        <div><small>12 ZODIAC SIGNALS</small><h3>별자리 운세</h3></div>
        <span>생일에 맞는 별자리를 확인해 보세요</span>
      </div>
      <div class="dailyZodiacGrid">${zodiacs.map((item, index) => signalCard(item[0], item[1], item[2], index, 'star')).join('')}</div>

      <div class="dailySectionHead dailyAnimalHead">
        <div><small>12 KOREAN ZODIAC SIGNALS</small><h3>띠별 운세</h3></div>
        <span>나의 띠에 맞는 오늘의 신호를 확인해 보세요</span>
      </div>
      <div class="dailyZodiacGrid dailyAnimalGrid">${koreanZodiacs.map((item, index) => signalCard(item[0], item[1], item[2], index, '띠')).join('')}</div>
    </section>`;
}

function getRoot() {
  return document.getElementById(ROOT_ID) as HTMLElement | null;
}

function placeDailyButton(nav: HTMLElement) {
  let button = nav.querySelector<HTMLButtonElement>('[data-signal-tab="daily"]');
  if (!button) {
    button = document.createElement('button');
    button.type = 'button';
    button.dataset.signalTab = TAB_KEY;
    button.className = 'dailySignalTab';
    button.setAttribute('aria-pressed', 'false');
    button.innerHTML = nav.id === MOBILE_NAV_ID
      ? '<span>☀</span><b>데일리</b>'
      : '<b>데일리 시그널</b><small>TODAY</small>';
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      dailySelected = true;
      showDaily(true);
    });
  }

  const hotButton = nav.querySelector<HTMLElement>('[data-signal-tab="hot"]');
  if (hotButton && hotButton.nextElementSibling !== button) hotButton.after(button);
  else if (!button.isConnected) nav.prepend(button);
}

function ensureButtons() {
  [TOP_NAV_ID, MOBILE_NAV_ID].forEach((id) => {
    const nav = document.getElementById(id);
    if (nav) placeDailyButton(nav);
  });
}

function applyDailyState() {
  const root = getRoot();
  if (!root) return;
  root.dataset.signalGroup = TAB_KEY;

  if (!dailySelected) {
    root.hidden = true;
    return;
  }

  document.body.dataset.signalActive = TAB_KEY;
  history.replaceState(null, '', `${location.pathname}${location.search}#daily`);
  root.hidden = false;

  document.querySelectorAll<HTMLElement>('[data-signal-group]').forEach((element) => {
    element.hidden = element !== root;
  });
  document.querySelectorAll<HTMLButtonElement>('[data-signal-tab]').forEach((button) => {
    const selected = button.dataset.signalTab === TAB_KEY;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
}

function hideDailyAfterOtherTab() {
  dailySelected = false;
  const root = getRoot();
  if (!root) return;
  root.dataset.signalGroup = TAB_KEY;
  root.hidden = true;
}

function showDaily(scroll: boolean) {
  const root = getRoot();
  if (!root) return;
  dailySelected = true;
  applyDailyState();
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      applyDailyState();
      if (scroll) root.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

function mount() {
  const main = document.querySelector<HTMLElement>('main.page');
  if (!main) return false;

  if (!getRoot()) {
    const topNav = document.getElementById(TOP_NAV_ID);
    if (topNav?.parentElement === main) topNav.insertAdjacentHTML('afterend', template());
    else main.insertAdjacentHTML('afterbegin', template());
  }

  ensureButtons();
  applyDailyState();
  return true;
}

function start() {
  mount();

  document.addEventListener('click', (event) => {
    const button = (event.target as HTMLElement).closest<HTMLElement>('[data-signal-tab]');
    const tab = button?.dataset.signalTab;
    if (!tab) return;

    if (tab === TAB_KEY) {
      dailySelected = true;
      return;
    }

    hideDailyAfterOtherTab();
    window.setTimeout(hideDailyAfterOtherTab, 0);
    window.requestAnimationFrame(hideDailyAfterOtherTab);
  }, true);

  window.addEventListener('hashchange', () => {
    dailySelected = location.hash === '#daily';
    if (dailySelected) showDaily(false);
    else hideDailyAfterOtherTab();
  });

  let queued = false;
  const observer = new MutationObserver(() => {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        queued = false;
        mount();
        ensureButtons();
        applyDailyState();
      });
    });
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  let attempts = 0;
  const retry = window.setInterval(() => {
    attempts += 1;
    const ready = mount();
    if (ready || attempts >= 30) window.clearInterval(retry);
  }, 200);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
else start();
