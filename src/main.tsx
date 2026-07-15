import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '@astryxdesign/core/reset.css';
import '@astryxdesign/core/astryx.css';
import '@astryxdesign/theme-y2k/theme.css';
import './index.css';

import App from './App.tsx';
import './mobile-fix.css';
import './mobile-nav.css';
import './audience-info.css';
import './prompt-card-copy.ts';
import './visual-showcase.ts';
import './custom-real-presets.ts';
import './preset-image-lightbox.ts';
import './astryx-build-cleanup.css';
import './preset-native-clean.css';
import './luna-video-autoplay.ts';
import './fix-preset-image-paths.ts';
import './character-sheet-presets.ts';
import './character-sheet-cleanup.ts';
import './luna-character-wording.ts';
import './fujifilm-first.ts';
import './trend-radar-endpoint-fix.ts';
import './trend-radar.tsx';
import './trend-radar-status-help.css';
import './trend-radar-status-help.ts';
import './trend-radar-free-copy.ts';
import './trend-radar-hotfix.css';
import './trend-radar-visitors.css';
import './trend-radar-title-safe.css';
import './x-viral-preview.css';
import './x-viral-preview.ts';
import './mobile-nav.ts';
import './visitor-counter-status.ts';
import './luna-signal-brand.css';
import './luna-signal-brand.ts';
import './content-refresh-schedule.ts';
import './daily-signal-preview.css';
import './daily-signal-preview.ts';
import './daily-signal-dashboard.css';
import './daily-signal-dashboard.ts';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

function loadContestRadarAfterAppRender() {
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      void import('./contest-radar.tsx')
        .then(() => import('./contest-radar-mount-hotfix.ts'))
        .catch((error) => console.error('공모전 레이더 로드 실패', error));
    });
  });
}

loadContestRadarAfterAppRender();
