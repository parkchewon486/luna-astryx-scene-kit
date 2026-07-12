type ContestRecord = {
  title: string;
  ai_usage_status: string;
};

type ContestPayload = {
  contests?: ContestRecord[];
};

let contestReviewStarted = false;
let activeAiMode: 'required' | null = null;
let contestByTitle = new Map<string, ContestRecord>();

function normalizeTitle(value: string | null | undefined) {
  return (value ?? '').replace(/\s+/g, ' ').trim();
}

function setActiveButton(root: HTMLElement, button: HTMLButtonElement | null) {
  root.querySelectorAll<HTMLButtonElement>('.contestRadarFilters button').forEach((item) => {
    item.classList.toggle('active', item === button);
  });
}

function applyRequiredFilter(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>('.contestCard').forEach((card) => {
    const title = normalizeTitle(card.querySelector('h3')?.textContent);
    const contest = contestByTitle.get(title);
    card.hidden = contest?.ai_usage_status !== 'required';
  });

  const grid = root.querySelector<HTMLElement>('.contestRadarGrid');
  const state = root.querySelector<HTMLElement>('.contestRadarState[data-ai-required-empty]');
  const visibleCount = Array.from(root.querySelectorAll<HTMLElement>('.contestCard')).filter((card) => !card.hidden).length;

  if (grid) grid.hidden = visibleCount === 0;
  if (state) state.hidden = visibleCount > 0;
}

function resetManualFilter(root: HTMLElement) {
  activeAiMode = null;
  root.querySelectorAll<HTMLElement>('.contestCard').forEach((card) => { card.hidden = false; });
  const grid = root.querySelector<HTMLElement>('.contestRadarGrid');
  if (grid) grid.hidden = false;
  const state = root.querySelector<HTMLElement>('.contestRadarState[data-ai-required-empty]');
  if (state) state.hidden = true;
}

function ensureEmptyState(root: HTMLElement) {
  let state = root.querySelector<HTMLElement>('.contestRadarState[data-ai-required-empty]');
  if (state) return state;

  state = document.createElement('div');
  state.className = 'contestRadarState';
  state.dataset.aiRequiredEmpty = 'true';
  state.hidden = true;
  state.innerHTML = '<div><strong>AI 사용이 필수인 공모전이 아직 없어요</strong><p>AI 사용 가능 필터에서 선택형 공모전까지 함께 볼 수 있어요.</p></div>';
  const footer = root.querySelector('.contestRadarFooter');
  if (footer) footer.insertAdjacentElement('beforebegin', state);
  else root.appendChild(state);
  return state;
}

function enhanceTitle(root: HTMLElement) {
  const title = root.querySelector<HTMLHeadingElement>('#contest-radar-title');
  if (!title || title.dataset.designed === 'true') return;
  title.dataset.designed = 'true';
  title.className = 'contestRadarTitle';
  title.setAttribute('aria-label', '공모전 레이더');
  title.innerHTML = `
    <span class="contestRadarTitleKicker">이번엔 뭐 낼까?</span>
    <span class="contestRadarTitleMain">공모전</span>
    <span class="contestRadarTitleRadar">RADAR</span>
  `;
}

function enhanceFilters(root: HTMLElement) {
  const filters = root.querySelector<HTMLElement>('.contestRadarFilters');
  if (!filters) return;

  const aiAllowed = Array.from(filters.querySelectorAll<HTMLButtonElement>('button'))
    .find((button) => normalizeTitle(button.textContent) === 'AI 활용' || normalizeTitle(button.textContent) === 'AI 사용 가능');

  if (aiAllowed) {
    aiAllowed.textContent = 'AI 사용 가능';
    aiAllowed.dataset.aiAllowed = 'true';
  }

  if (!filters.querySelector('[data-ai-required="true"]')) {
    const required = document.createElement('button');
    required.type = 'button';
    required.textContent = 'AI 필수';
    required.dataset.aiRequired = 'true';
    required.setAttribute('aria-pressed', 'false');
    if (aiAllowed) filters.insertBefore(required, aiAllowed);
    else filters.appendChild(required);

    required.addEventListener('click', () => {
      activeAiMode = 'required';
      setActiveButton(root, required);
      required.setAttribute('aria-pressed', 'true');
      applyRequiredFilter(root);
    });
  }

  filters.querySelectorAll<HTMLButtonElement>('button:not([data-ai-required="true"])').forEach((button) => {
    if (button.dataset.reviewBound === 'true') return;
    button.dataset.reviewBound = 'true';
    button.addEventListener('click', () => {
      resetManualFilter(root);
      const required = filters.querySelector<HTMLButtonElement>('[data-ai-required="true"]');
      required?.setAttribute('aria-pressed', 'false');
    }, true);
  });
}

async function loadContestMap() {
  try {
    const response = await fetch(`/data/contests.json?review=${Date.now()}`, { cache: 'no-store' });
    const payload = await response.json() as ContestPayload;
    contestByTitle = new Map((payload.contests ?? []).map((contest) => [normalizeTitle(contest.title), contest]));
  } catch {
    contestByTitle = new Map();
  }
}

async function startContestReview(root: HTMLElement) {
  if (contestReviewStarted) return;
  contestReviewStarted = true;
  await loadContestMap();
  enhanceTitle(root);
  enhanceFilters(root);
  ensureEmptyState(root);

  let scheduled = false;
  const observer = new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      enhanceTitle(root);
      enhanceFilters(root);
      ensureEmptyState(root);
      if (activeAiMode === 'required') applyRequiredFilter(root);
    });
  });
  observer.observe(root, { childList: true, subtree: true });
}

function mountContestReview() {
  const root = document.querySelector<HTMLElement>('.contestRadar');
  if (!root) return false;
  void startContestReview(root);
  return true;
}

if (!mountContestReview()) {
  const observer = new MutationObserver(() => {
    if (!mountContestReview()) return;
    observer.disconnect();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
}
