// @ts-nocheck
const X_PREVIEW_ITEMS = [
  { account: '@AI_CREATOR', topic: 'AI 영상 제작', title: '한 장의 이미지로 만든 짧은 영상이 빠르게 확산된 사례', note: '영상 결과물과 제작 과정을 함께 보여주는 포맷을 미리보기용으로 구성했어요.', angle: '결과물보다 제작 전후 비교를 먼저 보여주기', hook: '이 영상, 사실 이미지 한 장에서 시작됐습니다.' },
  { account: '@TECH_SIGNAL', topic: 'AI 업데이트', title: '새 기능을 직접 써본 짧은 후기형 게시물', note: '기능 소개보다 실제 사용 장면과 반응을 앞에 두는 글이 빠르게 퍼지는 형태예요.', angle: '업데이트 설명 대신 체감 변화 한 가지 강조', hook: '설명보다 직접 써보니 달라진 건 딱 하나였습니다.' },
  { account: '@IMAGE_LAB', topic: '이미지 생성', title: '같은 프롬프트를 여러 모델에 넣은 비교 게시물', note: '모델별 차이를 한눈에 보여주는 비교 이미지형 포스트를 위한 샘플 카드예요.', angle: '승자를 정하기보다 결과 차이를 질문으로 던지기', hook: '같은 문장인데 결과는 여기까지 달라졌습니다.' },
  { account: '@BUILDER_LOG', topic: '바이브코딩', title: '하루 만에 만든 작은 웹앱 제작 기록', note: '완성 화면과 시행착오를 짧게 묶은 빌드 로그형 게시물 예시예요.', angle: '기능 목록보다 만들면서 막힌 한 장면 강조', hook: '코드보다 오래 걸린 건 이 버튼 하나였습니다.' },
  { account: '@ROBOT_NOW', topic: '로봇·피지컬 AI', title: '로봇의 예상 밖 움직임을 담은 짧은 영상', note: '첫 2초에 놀라운 장면을 배치하는 영상형 바이럴 포스트를 가정했어요.', angle: '기술 설명 전에 가장 인간적인 움직임 보여주기', hook: '로봇인데 이 순간만큼은 사람보다 자연스러웠습니다.' },
  { account: '@CREATOR_NOTE', topic: '크리에이터 실험', title: '게시 시간과 첫 문장을 바꿔본 반응 실험', note: '작은 실험 결과를 숫자와 함께 공유하는 포맷의 미리보기예요.', angle: '성공담보다 예상과 달랐던 결과를 앞에 배치', hook: '조회수를 바꾼 건 이미지가 아니라 첫 문장이었습니다.' }
];

function buildXPreview() {
  const panel = document.createElement('section');
  panel.className = 'xViralPreviewPanel';
  panel.hidden = true;
  panel.innerHTML = `
    <div class="xViralPreviewNotice">
      <span>PREVIEW ONLY</span>
      <strong>X 바이럴 탭 미리보기</strong>
      <p>현재는 화면과 사용 방식을 확인하기 위한 샘플 데이터예요. 실제 운영 시에는 공개 URL과 반응 수치를 확인한 게시물만 표시됩니다.</p>
    </div>
    <div class="xViralPreviewGrid">
      ${X_PREVIEW_ITEMS.map((item, index) => `
        <article class="xViralPreviewCard">
          <div class="xViralPreviewTop"><b>#${index + 1}</b><span>${item.topic}</span></div>
          <small>${item.account}</small>
          <h3>${item.title}</h3>
          <p>${item.note}</p>
          <div><em>X ANGLE</em><p>${item.angle}</p></div>
          <blockquote>“${item.hook}”</blockquote>
          <button type="button" data-copy-x="${index}">훅 복사</button>
        </article>`).join('')}
    </div>`;
  return panel;
}

function mountXPreview() {
  const radar = document.querySelector('.trendRadar');
  if (!radar || radar.querySelector('.xViralTabs')) return false;
  const tabs = document.createElement('div');
  tabs.className = 'xViralTabs';
  tabs.innerHTML = '<button type="button" class="active" data-radar-mode="community">커뮤니티 HOT</button><button type="button" data-radar-mode="x">X 바이럴 <span>PREVIEW</span></button>';
  const panel = buildXPreview();
  const statusBar = radar.querySelector('.trendRadarStatusBar');
  if (statusBar) statusBar.insertAdjacentElement('beforebegin', tabs);
  else radar.prepend(tabs);
  tabs.insertAdjacentElement('afterend', panel);

  const communitySelectors = ['.trendRadarStatusBar','.trendRadarFilters','.trendRadarLoading','.trendRadarError','.trendRadarEmpty','.trendRadarGrid','.trendRadarList','.trendRadarFooter'];
  function setMode(mode) {
    tabs.querySelectorAll('button').forEach((button) => button.classList.toggle('active', button.getAttribute('data-radar-mode') === mode));
    communitySelectors.forEach((selector) => radar.querySelectorAll(selector).forEach((element) => { element.hidden = mode === 'x'; }));
    panel.hidden = mode !== 'x';
  }

  tabs.addEventListener('click', (event) => {
    const source = event.target instanceof Element ? event.target : null;
    const button = source ? source.closest('[data-radar-mode]') : null;
    if (!button) return;
    setMode(button.getAttribute('data-radar-mode') === 'x' ? 'x' : 'community');
  });

  panel.addEventListener('click', async (event) => {
    const source = event.target instanceof Element ? event.target : null;
    const button = source ? source.closest('[data-copy-x]') : null;
    if (!button) return;
    const item = X_PREVIEW_ITEMS[Number(button.getAttribute('data-copy-x'))];
    if (!item) return;
    try {
      await navigator.clipboard.writeText(item.hook);
      button.textContent = '복사됨';
      window.setTimeout(() => { button.textContent = '훅 복사'; }, 1400);
    } catch {
      button.textContent = '복사 실패';
    }
  });
  return true;
}

if (!mountXPreview()) {
  const observer = new MutationObserver(() => {
    if (!mountXPreview()) return;
    observer.disconnect();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
}

// Preview redeploy trigger: 2026-07-12T00:25+09:00
