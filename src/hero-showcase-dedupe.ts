let heroDedupeTimer: number | undefined;
let heroDedupeInterval: number | undefined;

const CLEAN_HERO_CARDS = [
  {
    src: '/publicpresetsfuji-real-snap.png',
    label: 'FUJI REAL',
    title: 'Golden Hour Snap',
    tags: ['#Fujifilm', '#35mmLens', '#SoftLight'],
  },
  {
    src: '/character-reference-female.png',
    label: 'CHARACTER',
    title: 'Reference Sheet',
    tags: ['#CharacterSheet', '#AnimeStyle', '#Consistency'],
  },
];

function cleanHeroCard(item: typeof CLEAN_HERO_CARDS[number]) {
  return `
    <article class="lunaVisualCard lunaHeroCleanCard">
      <img src="${item.src}" alt="${item.title}" loading="eager" />
      <div class="lunaHoverTags">${item.tags.map((tag) => `<span>${tag}</span>`).join('')}</div>
      <div class="lunaVisualMeta">
        <em>${item.label}</em>
        <strong>${item.title}</strong>
      </div>
    </article>
  `;
}

function installHeroDedupeStyles() {
  const old = document.getElementById('hero-showcase-dedupe-style');
  if (old) old.remove();

  const style = document.createElement('style');
  style.id = 'hero-showcase-dedupe-style';
  style.textContent = `
    .lunaHeroShowcaseDeck.lunaHeroDedupeDeck {
      min-height: auto !important;
      grid-template-columns: 1fr !important;
      gap: 18px !important;
      align-content: center !important;
    }

    .lunaHeroDedupeDeck .lunaShowcaseColumn {
      display: grid !important;
      grid-template-columns: 1fr !important;
      gap: 18px !important;
      transform: none !important;
    }

    .lunaHeroDedupeDeck .lunaFloatingPanel {
      right: 18px !important;
      top: 18px !important;
      padding: 10px 13px !important;
      border-radius: 20px !important;
    }

    .lunaHeroDedupeDeck .lunaFloatingPanel b {
      font-size: 12px !important;
    }

    .lunaHeroDedupeDeck .lunaFloatingPanel small {
      font-size: 10px !important;
    }

    .lunaHeroCleanCard {
      min-height: 260px !important;
    }

    .lunaHeroCleanCard:first-child {
      min-height: 310px !important;
    }

    @media (max-width: 720px) {
      .lunaHeroShowcaseDeck.lunaHeroDedupeDeck {
        gap: 14px !important;
      }

      .lunaHeroDedupeDeck .lunaShowcaseColumn {
        gap: 14px !important;
      }

      .lunaHeroCleanCard,
      .lunaHeroCleanCard:first-child {
        min-height: 210px !important;
        border-radius: 24px !important;
      }

      .lunaHeroDedupeDeck .lunaFloatingPanel {
        display: none !important;
      }
    }
  `;
  document.head.appendChild(style);
}

function dedupeHeroShowcase() {
  installHeroDedupeStyles();

  const deck = document.querySelector<HTMLElement>('.lunaHeroShowcaseDeck');
  if (!deck) return;
  if (deck.dataset.heroDedupe === 'true') return;

  deck.dataset.heroDedupe = 'true';
  deck.classList.add('lunaHeroDedupeDeck');
  deck.innerHTML = `
    <div class="lunaFloatingPanel">
      <b>2 styles ready</b>
      <small>hover the cards</small>
    </div>
    <div class="lunaShowcaseColumn">
      ${CLEAN_HERO_CARDS.map(cleanHeroCard).join('')}
    </div>
  `;
}

dedupeHeroShowcase();

const heroDedupeObserver = new MutationObserver(() => {
  window.clearTimeout(heroDedupeTimer);
  heroDedupeTimer = window.setTimeout(dedupeHeroShowcase, 120);
});

heroDedupeObserver.observe(document.documentElement, { childList: true, subtree: true });

window.clearInterval(heroDedupeInterval);
heroDedupeInterval = window.setInterval(dedupeHeroShowcase, 800);
window.setTimeout(() => window.clearInterval(heroDedupeInterval), 25000);
