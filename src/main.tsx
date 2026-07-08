import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '@astryxdesign/core/reset.css';
import '@astryxdesign/core/astryx.css';
import '@astryxdesign/theme-y2k/theme.css';
import './index.css';

import App from './App.tsx';
import './mobile-fix.css';
import './audience-info.css';
import './fuji-runtime.ts';
import './prompt-card-copy.ts';
import './visual-showcase.ts';
import './custom-real-presets.ts';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
