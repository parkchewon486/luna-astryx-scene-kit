const CONTEST_ROOT_ID = 'contest-radar-root';

function ensureContestRadarAttached() {
  const root = document.getElementById(CONTEST_ROOT_ID);
  if (!root) return false;
  if (root.isConnected) return true;

  const trend = document.getElementById('luna-trend-radar-root');
  const buildNotes = document.querySelector('.bottomGrid.buildNotesBottom');
  const page = document.querySelector('main.page');
  const anchor = trend ?? buildNotes;

  if (anchor?.parentElement) {
    anchor.insertAdjacentElement('afterend', root);
    return true;
  }

  if (page) {
    page.appendChild(root);
    return true;
  }

  return false;
}

function startContestRadarAttachmentWatch() {
  if (ensureContestRadarAttached()) return;

  const observer = new MutationObserver(() => {
    if (!ensureContestRadarAttached()) return;
    observer.disconnect();
  });

  observer.observe(document.documentElement, { childList: true, subtree: true });

  window.setTimeout(() => {
    ensureContestRadarAttached();
    observer.disconnect();
  }, 10000);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startContestRadarAttachmentWatch, { once: true });
} else {
  startContestRadarAttachmentWatch();
}
