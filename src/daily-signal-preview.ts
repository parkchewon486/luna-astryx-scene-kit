const ROOT_ID = 'daily-signal-root';
const TOP_NAV_ID = 'luna-signal-top-nav';

const zodiacs = [
  ['양자리', '3.21–4.19', '♈'], ['황소자리', '4.20–5.20', '♉'], ['쌍둥이자리', '5.21–6.21', '♊'],
  ['게자리', '6.22–7.22', '♋'], ['사자자리', '7.23–8.22', '♌'], ['처녀자리', '8.23–9.22', '♍'],
  ['천칭자리', '9.23–10.22', '♎'], ['전갈자리', '10.23–11.22', '♏'], ['사수자리', '11.23–12.21', '♐'],
  ['염소자리', '12.22–1.19', '♑'], ['물병자리', '1.20–2.18', '♒'], ['물고기자리', '2.19–3.20', '♓'],
] as const;

const koreanZodiacs = [
  ['쥐띠', '子', '🐭', 2020], ['소띠', '丑', '🐮', 2021], ['호랑이띠', '寅', '🐯', 2022], ['토끼띠', '卯', '🐰', 2023],
  ['용띠', '辰', '🐲', 2024], ['뱀띠', '巳', '🐍', 2025], ['말띠', '午', '🐴', 2026], ['양띠', '未', '🐑', 2027],
  ['원숭이띠', '申', '🐵', 2028], ['닭띠', '酉', '🐔', 2029], ['개띠', '戌', '🐶', 2030], ['돼지띠', '亥', '🐷', 2031],
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

const yearFortunes = [
  '익숙한 방식에서 작은 변화를 주면 막혀 있던 일이 풀릴 수 있어요.',
  '사람의 말보다 실제 행동을 보고 판단하는 편이 유리해요.',
  '오전에 정리한 우선순위가 오후의 여유를 만들어줘요.',
  '예상 밖의 연락이 오더라도 서두르지 말고 조건부터 살펴보세요.',
  '지출을 결정하기 전 한 번 더 비교하면 만족도가 높아져요.',
  '가까운 사람과 솔직하게 대화하면 오해가 쉽게 풀릴 수 있어요.',
  '오늘은 새로운 시작보다 진행 중인 일을 마무리하는 힘이 좋아요.',
  '작은 칭찬과 감사 표현이 관계의 분위기를 부드럽게 바꿔줘요.',
  '몸이 보내는 피로 신호를 무시하지 말고 짧게라도 쉬어가세요.',
  '계획을 다른 사람에게 설명하는 과정에서 좋은 답이 보여요.',
  '지금 당장 결론 내리지 않아도 되는 일은 하루 더 지켜봐도 괜찮아요.',
  '평소 자신 있던 분야에서 기회가 생길 가능성이 높아요.',
];

const yearActions = [
  '오늘의 핵심은 한 가지를 끝까지 마치는 거예요.',
  '중요한 결정은 감정보다 확인된 정보를 우선하세요.',
  '먼저 연락하고 먼저 정리하는 태도가 좋은 결과로 이어져요.',
  '무리한 약속보다 지킬 수 있는 약속 하나가 더 중요해요.',
  '오후에는 속도를 늦추고 실수를 한 번 점검해 보세요.',
  '혼자 고민하기보다 믿을 만한 사람의 의견을 들어보세요.',
  '작은 성과도 기록해 두면 다음 선택이 쉬워져요.',
  '불편한 일은 미루기보다 짧게라도 바로 처리하는 편이 좋아요.',
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

function luck(seed: number) {
  const colors = ['라일락', '아쿠아 블루', '버터 옐로', '로즈 핑크', '딥 네이비', '민트'];
  const times = ['오전 9시', '오전 11시', '오후 2시', '오후 5시', '저녁 8시'];
  return {
    color: colors[seed % colors.length],
    time: times[Math.floor(seed / 7) % times.length],
    score: 72 + seed % 25,
  };
}

function representativeYears(baseYear: number) {
  const currentYear = Number(todayKey().slice(0, 4));
  let latest = baseYear;
  while (latest > currentYear) latest -= 12;
  return Array.from({ length: 6 }, (_, index) => latest - (5 - index) * 12);
}

function zodiacCard(name: string, period: string, icon: string, index: number) {
  const seed = hash(`${todayKey()}-별자리-${name}`);
  const signal = luck(seed);
  return `
    <article class="dailyZodiacCard" data-signal-card="star-${index}">
      <span class="dailyZodiacIcon">${icon}</span>
      <small>${period}</small>
      <strong>${name}</strong>
      <em>${signal.score}점</em>
      <p>${fortunes[seed % fortunes.length]}</p>
      <span class="dailyCardMeta">행운의 색 ${signal.color} · 좋은 시간 ${signal.time}</span>
    </article>`;
}

function animalCard(name: string, hanja: string, icon: string, baseYear: number, index: number) {
  const seed = hash(`${todayKey()}-띠-${name}`);
  const signal = luck(seed);
  const years = representativeYears(baseYear);
  return `
    <button type="button" class="dailyZodiacCard dailyAnimalCard" data-animal-index="${index}" aria-expanded="false" aria-controls="daily-animal-detail-${index}">
      <span class="dailyZodiacIcon">${icon}</span>
      <small>${hanja} · ${years.map((year) => String(year).slice(-2)).join(' · ')}년생</small>
      <strong>${name}</strong>
      <em>${signal.score}점</em>
      <p>${fortunes[seed % fortunes.length]}</p>
      <span class="dailyCardMeta">행운의 색 ${signal.color} · 좋은 시간 ${signal.time}</span>
      <b class="dailyDetailCue">연도별 상세보기 →</b>
    </button>`;
}

function animalDetail(name: string, hanja: string, icon: string, baseYear: number, index: number) {
  const overallSeed = hash(`${todayKey()}-띠상세-${name}`);
  const overall = luck(overallSeed);
  const years = representativeYears(baseYear);
  const yearItems = years.map((year, yearIndex) => {
    const seed = hash(`${todayKey()}-${name}-${year}`);
    const first = yearFortunes[(seed + yearIndex) % yearFortunes.length];
    const second = yearActions[(Math.floor(seed / 11) + yearIndex) % yearActions.length];
    return `
      <article class="dailyYearItem">
        <strong>${year}년생</strong>
        <p>${first} ${second}</p>
      </article>`;
  }).join('');

  return `
    <section id="daily-animal-detail-${index}" class="dailyAnimalDetail" data-animal-detail="${index}" hidden>
      <header class="dailyAnimalDetailHead">
        <div class="dailyAnimalDetailTitle">
          <span>${icon}</span>
          <div><small>${hanja} · 오늘의 상세 신호</small><h4>${name} 연도별 운세</h4></div>
        </div>
        <button type="button" data-animal-close="${index}" aria-label="${name} 상세 닫기">닫기</button>
      </header>
      <div class="dailyAnimalOverall">
        <strong>${fortunes[overallSeed % fortunes.length]}</strong>
        <span>오늘의 점수 ${overall.score} · 행운의 색 ${overall.color} · 좋은 시간 ${overall.time}</span>
      </div>
      <div class="dailyYearGrid">${yearItems}</div>
      <p class="dailyYearNotice">대표 출생연도 기준입니다. 1~2월 출생자는 음력 설 시점에 따라 실제 띠가 달라질 수 있어요.</p>
    </section>`;
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
      <div class="dailyZodiacGrid">${zodiacs.map((item, index) => zodiacCard(item[0], item[1], item[2], index)).join('')}</div>

      <div class="dailySectionHead dailyAnimalHead">
        <div><small>12 KOREAN ZODIAC SIGNALS</small><h3>띠별 운세</h3></div>
        <span>띠 카드를 누르면 출생연도별 상세 운세가 열려요</span>
      </div>
      <div class="dailyZodiacGrid dailyAnimalGrid">${koreanZodiacs.map((item, index) => animalCard(item[0], item[1], item[2], item[3], index)).join('')}</div>
      <div class="dailyAnimalDetails">${koreanZodiacs.map((item, index) => animalDetail(item[0], item[1], item[2], item[3], index)).join('')}</div>
    </section>`;
}

function getRoot() {
  return document.getElementById(ROOT_ID) as HTMLElement | null;
}

function closeAnimalDetails(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>('[data-animal-detail]').forEach((detail) => { detail.hidden = true; });
  root.querySelectorAll<HTMLButtonElement>('[data-animal-index]').forEach((card) => card.setAttribute('aria-expanded', 'false'));
}

function bindRoot(root: HTMLElement) {
  if (root.dataset.dailyDetailBound === '1') return;
  root.dataset.dailyDetailBound = '1';
  root.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    const close = target.closest<HTMLElement>('[data-animal-close]');
    if (close) {
      closeAnimalDetails(root);
      return;
    }

    const card = target.closest<HTMLButtonElement>('[data-animal-index]');
    if (!card) return;
    const index = card.dataset.animalIndex;
    const detail = index ? root.querySelector<HTMLElement>(`[data-animal-detail="${index}"]`) : null;
    if (!detail) return;

    const willOpen = detail.hidden;
    closeAnimalDetails(root);
    if (!willOpen) return;
    detail.hidden = false;
    card.setAttribute('aria-expanded', 'true');
    window.requestAnimationFrame(() => detail.scrollIntoView({ behavior: 'smooth', block: 'nearest' }));
  });
}

function mount() {
  const existing = getRoot();
  if (existing) {
    existing.dataset.signalGroup = 'daily';
    bindRoot(existing);
    return true;
  }

  const main = document.querySelector<HTMLElement>('main.page');
  if (!main) return false;
  const topNav = document.getElementById(TOP_NAV_ID);
  if (topNav?.parentElement === main) topNav.insertAdjacentHTML('afterend', template());
  else main.insertAdjacentHTML('beforeend', template());

  const root = getRoot();
  if (!root) return false;
  bindRoot(root);
  return true;
}

function start() {
  if (mount()) return;
  const observer = new MutationObserver(() => {
    if (!mount()) return;
    observer.disconnect();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
else start();
