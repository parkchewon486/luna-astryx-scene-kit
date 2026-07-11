function enhanceRadarTitle() {
  const title = document.querySelector<HTMLHeadingElement>('#trend-radar-title');
  if (!title) return false;
  if (title.dataset.designed === 'true') return true;

  title.dataset.designed = 'true';
  title.setAttribute('aria-label', '오늘의 핫이슈 레이더');
  title.innerHTML = `
    <span class="trendRadarTitleKicker">오늘의</span>
    <span class="trendRadarTitleMain">핫이슈</span>
    <span class="trendRadarTitleRadar">RADAR</span>
  `;
  return true;
}

if (!enhanceRadarTitle()) {
  const observer = new MutationObserver(() => {
    if (!enhanceRadarTitle()) return;
    observer.disconnect();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
}
