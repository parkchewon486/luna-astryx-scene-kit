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
import './trend-radar-endpoint-fix.ts';
import './trend-radar.tsx';
import './trend-radar-free-copy.ts';
import './trend-radar-hotfix.css';
import './trend-radar-visitors.css';
import './trend-radar-visitors.ts';
import './trend-radar-title-safe.css';
import './mobile-nav.ts';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
