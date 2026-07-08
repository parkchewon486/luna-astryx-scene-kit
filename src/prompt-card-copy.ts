let promptCopyTimer: number | undefined;

function installPromptCardCopyStyles() {
  if (document.getElementById('prompt-card-copy-style')) return;

  const style = document.createElement('style');
  style.id = 'prompt-card-copy-style';
  style.textContent = `
    .promptCard {
      position: relative !important;
      padding-top: 24px !important;
    }

    .promptCopyButton {
      position: absolute;
      top: 18px;
      right: 18px;
      z-index: 5;
      min-height: 32px;
      padding: 0 13px;
      border: 1px solid rgba(118, 149, 230, 0.28);
      border-radius: 999px;
      background: linear-gradient(135deg, rgba(207, 239, 255, 0.96), rgba(237, 229, 255, 0.94));
      color: #172033;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9), 0 8px 18px rgba(17, 19, 31, 0.08);
      font-family: inherit;
      font-size: 11px;
      font-weight: 900;
      letter-spacing: 0.03em;
      cursor: pointer;
    }

    .promptCopyButton:active {
      transform: translateY(1px) scale(0.98);
    }

    @media (max-width: 640px) {
      .promptCard {
        padding-top: 54px !important;
      }

      .promptCopyButton {
        top: 15px;
        right: 15px;
        min-height: 30px;
        padding: 0 12px;
        font-size: 10px;
      }
    }
  `;

  document.head.appendChild(style);
}

function getPromptCopyText(card: HTMLElement) {
  const title = card.querySelector('span')?.textContent?.trim() ?? 'PROMPT';
  const body = card.querySelector('p')?.textContent?.trim() ?? '';
  return `${title}\n\n${body}`;
}

function attachCopyButton(card: HTMLElement) {
  if (card.querySelector('.promptCopyButton')) return;

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'promptCopyButton';
  button.textContent = 'Copy';
  button.setAttribute('aria-label', '이 프롬프트만 복사');

  button.addEventListener('click', async (event) => {
    event.preventDefault();
    event.stopPropagation();

    const text = getPromptCopyText(card);

    try {
      await navigator.clipboard.writeText(text);
      button.textContent = 'Copied';
      window.setTimeout(() => {
        button.textContent = 'Copy';
      }, 1200);
    } catch {
      button.textContent = 'Retry';
      window.setTimeout(() => {
        button.textContent = 'Copy';
      }, 1200);
    }
  });

  card.appendChild(button);
}

function installPromptCardCopyButtons() {
  installPromptCardCopyStyles();
  document.querySelectorAll<HTMLElement>('.promptCard').forEach(attachCopyButton);
}

installPromptCardCopyButtons();

const promptCopyObserver = new MutationObserver(() => {
  window.clearTimeout(promptCopyTimer);
  promptCopyTimer = window.setTimeout(installPromptCardCopyButtons, 80);
});

promptCopyObserver.observe(document.documentElement, { childList: true, subtree: true });
