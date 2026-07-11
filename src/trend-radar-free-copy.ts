function updateFreeRadarCopy() {
  const root = document.querySelector<HTMLElement>('.trendRadar');
  if (!root) return false;

  const eyebrow = root.querySelector<HTMLElement>('.trendRadarEyebrow span:last-child');
  if (eyebrow) eyebrow.textContent = '무료 공개 인기글 수집 · 최근 24시간';

  const intro = root.querySelector<HTMLElement>('.trendRadarHeader p');
  if (intro) intro.textContent = '공개 인기글 페이지에서 반응이 큰 소재를 모아 X 글감 형태로 정리해요.';

  const footerBadge = root.querySelector<HTMLElement>('.trendRadarFooter span');
  if (footerBadge) footerBadge.textContent = '무료 공개 페이지 수집 기반';

  const loadingTitle = root.querySelector<HTMLElement>('.trendRadarLoading strong');
  if (loadingTitle) loadingTitle.textContent = '공개 인기글 페이지를 살펴보고 있어요';

  const loadingText = root.querySelector<HTMLElement>('.trendRadarLoading p');
  if (loadingText) loadingText.textContent = '조회수와 반응량을 읽고, 중복과 위험 키워드를 규칙으로 걸러냅니다.';

  return true;
}

if (!updateFreeRadarCopy()) {
  const observer = new MutationObserver(() => {
    if (!updateFreeRadarCopy()) return;
    observer.disconnect();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
}
