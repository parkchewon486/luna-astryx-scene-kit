type CharacterSheetPreset = {
  id: string;
  title: string;
  note: string;
  image: string;
  badge: string;
  type: string;
  bestFor: string;
  ratio: string;
  mood: string;
  lens: string;
  prompt: string;
  negative: string;
};

const FEMALE_CHARACTER_SHEET_PROMPT = String.raw`[여자친구버전] 같이 첨부한 사란짱 이미지도 같이 넣어주세요.

Use the uploaded profile photo ONLY as the identity reference.

Create ONE polished 16:9 landscape anime character consistency sheet for a Korean female high-school student.

INPUT
Korean character name: [한글이름 두 자 넣으세요.]

NAME REUSE RULE
Use the single Korean character name provided in INPUT everywhere it is needed.
Automatically reuse this same Korean name in the CHARACTER REFERENCE title area, on the white rectangular blazer name tag, in uniform close-up panels, and in the NAME TAG PLACEMENT GUIDE. Do not ask for a separate name-tag input, English-name input, or school-name input. Under the Korean character name, add a natural English romanization in parentheses. Example: Korean title: 사란.

STRICT IDENTITY PRESERVATION — HIGHEST PRIORITY
Preserve the uploaded person's recognizable facial identity throughout the entire sheet. Keep the same face shape, facial proportions, eye shape, eyelids, eyebrows, nose shape, lip shape, jawline, cheek volume, skin tone, hairline, hairstyle, bangs, parting, hair texture, wave pattern, curl pattern if present, hair color, and overall facial impression. If glasses are visible, preserve frame shape, thickness, color, lens size, bridge shape, and how the glasses sit on the face. If glasses are not visible, do not add glasses. Do not replace her with a generic anime girl, do not turn her into an idol-like stranger, do not change gender, ethnicity, or identity between panels. The same person must remain recognizable in the large portrait, FRONT view, BACK view, SIDE view, expression panels, hair detail panels, and uniform detail panels.

PHOTO-DERIVED HAIR RULE
Derive the hairstyle directly from the uploaded profile photo. Preserve hair length, haircut silhouette, bangs, parting, volume, texture, wave pattern, curl pattern, hair color, and overall hair impression. If the back of the hairstyle is not visible, infer it naturally while preserving the same overall look. Keep the hairstyle identical across every panel.

FIXED FEMALE SCHOOL UNIFORM
Dress the character in this exact Korean female high-school uniform: fitted navy school blazer, thin gold piping along blazer lapels and outer edges, exactly TWO gold front buttons on the blazer, white dress shirt, navy tie with thin gold diagonal stripes, navy and charcoal plaid pleated skirt, navy knee-high socks, black leather loafers. The blazer must feel feminine, neat, and tailored. No trousers, pants, shorts, cardigan, oversized blazer, or extra accessories unless clearly visible in the uploaded profile photo.

JACKET LOGO LOCK — HIGHEST PRIORITY
Use one fixed standardized blazer crest across the entire sheet: navy-and-gold academic shield crest, dark navy background, elegant gold outer border, stylized gold letter R in the center, small gold crown above the letter R, gold laurel motif around the letter, positioned on the wearer's LEFT chest pocket area, placed directly below the white rectangular name tag. The crest must remain identical in every visible panel, including the large portrait, FRONT full-body view, SIDE view when chest is visible, expression panels, UNIFORM DETAIL close-ups, and NAME TAG PLACEMENT GUIDE. Do not redesign the crest, change the letter R, add another emblem, add a school name, add brands, or omit the crest.

NAME TAG LOCK — HIGHEST PRIORITY
Use one standardized white horizontal rectangular name tag with a thin dark border and the single Korean character name from INPUT. Place it on the wearer's LEFT chest directly above the navy-and-gold R crest. Keep it identical in font style, size, shape, color, and placement across the large portrait, full-body views, expression panels, uniform close-ups, and placement guide. Do not move it, alter the name, replace Korean letters with random text, or change tag shape.

JAPANESE THEATRICAL 2D ANIME STYLE LOCK — HIGHEST PRIORITY
Render the entire sheet in premium Japanese theatrical 2D animation style, like official character design artwork prepared for a Japanese animated feature film. Use hand-drawn Japanese 2D anime key visual quality, expressive illustrated faces, elegant intentional line art, cinematic cel shading, rich controlled painted shadows, subtle hand-painted highlights, refined anime eyes with natural iris detail, detailed 2D anime hair strands, carefully painted fabric folds, polished feature-film animation color grading, deep navy, warm ivory, soft skin tones, and controlled gold accents. Do not use photorealistic skin, live-action portrait lighting, pores, beauty-filter skin, glossy semi-realistic human rendering, 3D CGI, game-character rendering, plastic doll texture, webtoon style, or casual AI avatar style.

SHEET STYLE
Create a refined character reference sheet on a warm ivory paper background with clean editorial spacing, thin dark divider lines, balanced 16:9 landscape composition, clear readable labels, professional animation-production presentation, and neat panel alignment.

SHEET CONTENT — ALL IN ONE 16:9 PAGE
Include these sections clearly:
1. CHARACTER REFERENCE: one large upper-body portrait on the left, fixed female school uniform, Korean character name, romanization in parentheses, white name tag, navy-and-gold R crest.
2. FULL BODY: FRONT, BACK, SIDE full-body views of the same girl and uniform. Show plaid pleated skirt, navy knee-high socks, black loafers, full legs and feet, and exactly TWO gold blazer front buttons.
3. EXPRESSION: six panels: gentle neutral expression, soft smile, bright open-mouth smile, slightly surprised expression, thoughtful expression with one hand near chin, warm eyes-closed smile.
4. HAIR DETAIL: front, side, and back hair views, preserving the uploaded-photo hairstyle across all views. Show glasses only if present in the uploaded profile photo.
5. UNIFORM DETAIL: white name tag using the Korean name, fixed R crest, blazer lapel and gold piping, exactly two gold front buttons, blazer sleeve buttons, navy-and-gold striped tie, navy-and-charcoal plaid skirt fabric, black leather loafers.
6. COLOR GUIDE: circular swatches labeled hair, eyes, skin, blazer, shirt, tie, skirt, socks, shoes, accent gold. Derive hair, eye, and skin colors from the uploaded profile photo.
7. NAME TAG PLACEMENT GUIDE: blazer chest close-up beside clean line-art blazer guide. Use labels exactly: “1. 왼쪽 가슴 (추천)” “LEFT CHEST” “(RECOMMENDED)” and “2. 왼쪽 주머니 위” “ABOVE LEFT POCKET”. Show the same white name tag and navy-and-gold R crest in both examples.

TEXT RULES
Use these English headers clearly: CHARACTER REFERENCE, FULL BODY, FRONT, BACK, SIDE, EXPRESSION, HAIR DETAIL, UNIFORM DETAIL, COLOR GUIDE, NAME TAG PLACEMENT GUIDE. Render Korean text cleanly and correctly. Do not invent random Korean letters, replace the name, add a school name, or add unrelated text.

Final result: one finished 16:9 landscape Japanese theatrical 2D anime female student character consistency sheet with one recognizable person across every panel, the uploaded-photo hairstyle and glasses if present, exactly two gold blazer front buttons, one identical white Korean name tag, and one identical navy-and-gold R crest throughout the page.`;

const MALE_CHARACTER_SHEET_PROMPT = String.raw`[남자친구버전] 오류를 줄이고자 한다면 제가 올려드린 바보님 시트를 같이 첨부하세요.

Use the uploaded profile photo ONLY as the identity reference.

The uploaded reference must be ONE real profile photo of ONE person only. Do not use a collage. Do not use an image that already contains both a real person and an anime character. Do not use multiple people in the reference image.

Create ONE polished 16:9 landscape anime character consistency sheet for a Korean male high-school student.

INPUT
Korean character name: [한글이름 두 자 넣으세요.]

NAME REUSE RULE
Use the single Korean character name provided in INPUT everywhere it is needed. Automatically reuse this same Korean name in the CHARACTER REFERENCE title area, on the white rectangular blazer name tag, in uniform close-up panels, and in the NAME TAG PLACEMENT GUIDE. Do not request a separate name-tag input, English-name input, or school-name input. Under the Korean character name, add a natural English romanization in parentheses. Example: Korean title: 바보.

STRICT IDENTITY PRESERVATION — HIGHEST PRIORITY
Preserve the uploaded person's recognizable facial identity throughout the entire sheet. Keep the same face shape, facial proportions, eye shape, eyelids, eyebrows, nose shape, lip shape, jawline, cheek volume, skin tone, hairline, hairstyle, bangs, parting, hair texture, curl pattern if present, hair color, and overall facial impression. If glasses are visible, preserve frame shape, thickness, color, lens size, bridge shape, and how the glasses sit on the face. If glasses are not visible, do not add glasses. Do not replace him with a generic anime boy, do not turn him into an idol-like stranger, do not change gender, ethnicity, or identity between panels. The same person must remain recognizable in the large portrait, FRONT view, BACK view, SIDE view, expression panels, hair detail panels, and uniform detail panels.

PHOTO-DERIVED HAIR RULE
Derive the hairstyle directly from the uploaded profile photo. Preserve hair length, haircut silhouette, bangs, parting, volume, texture, wave pattern, curl pattern, sideburns, hair color, and overall hair impression. If the back of the hairstyle is not visible, infer it naturally while preserving the same overall look. Keep the hairstyle identical across every panel.

FIXED MALE SCHOOL UNIFORM
Dress the character in this exact Korean male high-school uniform: fitted navy school blazer, thin gold piping along blazer lapels and outer edges, exactly TWO gold front buttons on the blazer, white dress shirt, navy tie with thin gold diagonal stripes, charcoal-gray straight school slacks, black leather loafers. The blazer should feel neat, tailored, and youthful. No plaid trousers, shorts, cardigan, oversized blazer, streetwear styling, or extra accessories unless clearly visible in the uploaded profile photo.

JACKET LOGO LOCK — HIGHEST PRIORITY
Use one fixed standardized blazer crest across the entire sheet. This exact crest must match the female student character sheets. The blazer crest must always be a navy-and-gold academic shield crest with dark navy background, elegant gold outer border, stylized gold letter R in the center, small gold crown above the R, gold laurel motif around the letter, positioned on the wearer's LEFT chest pocket area, placed directly below the white rectangular name tag. Keep the same shield shape, colors, letter R, crown, laurel, size, and placement. Show the exact same crest in the large portrait, FRONT full-body view, SIDE view when chest is visible, expression panels, UNIFORM DETAIL close-ups, and NAME TAG PLACEMENT GUIDE. Do not redesign it, change the letter R, add another emblem, add a school name, add brands, or omit the crest.

NAME TAG LOCK — HIGHEST PRIORITY
Use one standardized white horizontal rectangular name tag with a thin dark border and the single Korean character name from INPUT. Place it on the wearer's LEFT chest, appearing on the viewer's RIGHT side in front-facing panels, directly above the navy-and-gold R crest. Keep it identical in font style, size, shape, color, and placement across all relevant panels. Do not move it, alter the name, replace Korean letters with random text, or change tag shape.

JAPANESE THEATRICAL 2D ANIME STYLE LOCK — HIGHEST PRIORITY
Render the entire sheet in premium Japanese theatrical 2D animation style, like official character design artwork prepared for a Japanese animated feature film. Use hand-drawn Japanese 2D anime key visual quality, expressive illustrated faces, elegant intentional line art, cinematic cel shading, rich controlled painted shadows, subtle hand-painted highlights, refined anime eyes with natural iris detail, detailed 2D anime hair strands, carefully painted fabric folds, polished feature-film animation color grading, deep navy, warm ivory, soft skin tones, and controlled gold accents. Do not use photorealistic skin, live-action portrait lighting, pores, beauty-filter skin, glossy semi-realistic human rendering, 3D CGI, game-character rendering, plastic doll texture, webtoon style, or casual AI avatar style.

SHEET STYLE
Create a refined character reference sheet on a warm ivory paper background with clean editorial spacing, thin dark divider lines, balanced 16:9 landscape composition, clear readable labels, professional animation-production presentation, and neat panel alignment.

SHEET CONTENT — ALL IN ONE 16:9 PAGE
Include these sections clearly:
1. CHARACTER REFERENCE: one large upper-body portrait on the left, fixed male school uniform, Korean character name, romanization in parentheses, white name tag, navy-and-gold R crest.
2. FULL BODY: FRONT, BACK, SIDE full-body views of the same boy and same uniform. Show charcoal-gray straight school slacks, black leather loafers, full legs and feet, and exactly TWO gold blazer front buttons.
3. EXPRESSION: six panels: gentle neutral expression, soft smile, bright open-mouth smile, slightly surprised expression, thoughtful expression with one hand near chin, warm eyes-closed smile.
4. HAIR DETAIL: front, side, and back hair views, preserving the uploaded-photo hairstyle across all views. Show glasses only if present in the uploaded profile photo.
5. UNIFORM DETAIL: white name tag using the Korean name, fixed R crest, blazer lapel and gold piping, exactly two gold front buttons, blazer sleeve buttons, navy-and-gold striped tie, charcoal-gray slacks fabric, black leather loafers.
6. COLOR GUIDE: circular swatches labeled hair, eyes, skin, blazer, shirt, tie, pants, shoes, accent gold. Derive hair, eye, and skin colors from the uploaded profile photo.
7. NAME TAG PLACEMENT GUIDE: blazer chest close-up beside clean line-art blazer guide. Use labels exactly: “1. 왼쪽 가슴 (추천)” “LEFT CHEST” “(RECOMMENDED)” and “2. 왼쪽 주머니 위” “ABOVE LEFT POCKET”. Show the same white name tag and navy-and-gold R crest in both examples.

TEXT RULES
Use these English headers clearly: CHARACTER REFERENCE, FULL BODY, FRONT, BACK, SIDE, EXPRESSION, HAIR DETAIL, UNIFORM DETAIL, COLOR GUIDE, NAME TAG PLACEMENT GUIDE. Render Korean text cleanly and correctly. Do not invent random Korean letters, replace the name, add a school name, or add unrelated text.

NEGATIVE CONSTRAINTS
No extra characters, no female character, no chibi proportions, no photorealistic face, no semi-realistic portrait rendering, no live-action lighting, no 3D CGI, no game-art style, no plastic doll texture, no webtoon style, no generic AI anime face, no idol makeover, no inconsistent face, no inconsistent hairstyle, no inconsistent glasses, no inconsistent uniform, no plaid pants, no shorts, no missing hands, no extra fingers, no broken anatomy, no cropped feet in full-body views, no distorted glasses, no blurry layout, no unreadable text, no nonsense labels, no different crest designs, no changed name-tag placement, no extra blazer front buttons, no multi-person reference confusion, no mixed real-person-and-anime reference image.

Final result: one finished 16:9 landscape Japanese theatrical 2D anime male student character consistency sheet with one recognizable person across every panel, the uploaded-photo hairstyle and glasses if present, exactly two gold blazer front buttons, one identical white Korean name tag, and one identical navy-and-gold R crest throughout the page.`;

const CHARACTER_SHEET_PRESETS: CharacterSheetPreset[] = [
  {
    id: 'character-sheet-female',
    title: '여자 캐릭터 시트',
    note: '일관된 얼굴, 의상, 표정, 전신 기준을 잡는 여성 캐릭터 레퍼런스 시트',
    image: '/character-reference-female.png',
    badge: 'FEMALE SHEET',
    type: 'Image Prompt',
    bestFor: 'Female Character Consistency',
    ratio: '16:9 가로 시트',
    mood: '일본 극장판 2D 애니',
    lens: '레퍼런스 보드',
    prompt: FEMALE_CHARACTER_SHEET_PROMPT,
    negative: 'No extra characters, no male character, no chibi proportions, no photorealistic face, no 3D CGI, no webtoon style, no generic AI anime face, no inconsistent face, no inconsistent hairstyle, no inconsistent uniform, no trousers, no pants, no shorts, no missing hands, no extra fingers, no broken anatomy, no cropped feet, no unreadable text, no random Korean letters, no different crest designs, no changed name-tag placement, no extra blazer front buttons',
  },
  {
    id: 'character-sheet-male',
    title: '남자 캐릭터 시트',
    note: '일관된 얼굴, 의상, 표정, 전신 기준을 잡는 남성 캐릭터 레퍼런스 시트',
    image: '/character-reference-male.png',
    badge: 'MALE SHEET',
    type: 'Image Prompt',
    bestFor: 'Male Character Consistency',
    ratio: '16:9 가로 시트',
    mood: '일본 극장판 2D 애니',
    lens: '레퍼런스 보드',
    prompt: MALE_CHARACTER_SHEET_PROMPT,
    negative: 'No extra characters, no female character, no chibi proportions, no photorealistic face, no 3D CGI, no webtoon style, no generic AI anime face, no inconsistent face, no inconsistent hairstyle, no inconsistent uniform, no plaid pants, no shorts, no missing hands, no extra fingers, no broken anatomy, no cropped feet, no unreadable text, no random Korean letters, no different crest designs, no changed name-tag placement, no extra blazer front buttons, no multi-person reference confusion',
  },
];

let characterSheetMode = false;
let characterSheetTimer: number | undefined;
let characterSheetInterval: number | undefined;
let activeCharacterSheetPreset = CHARACTER_SHEET_PRESETS[0];

function characterFullPrompt(preset = activeCharacterSheetPreset) {
  return `IMAGE PROMPT\n\n${preset.prompt}\n\nVIDEO PROMPT\n\n정지 이미지 생성용 캐릭터 시트 프리셋입니다. 영상 제작 전 얼굴, 헤어, 교복, 이름표, 표정, 전신 기준을 먼저 고정하는 용도로 사용하세요.\n\nCAMERA NOTE\n\n16:9 landscape character consistency sheet. Warm ivory paper background. Clean editorial spacing. Japanese theatrical 2D anime production reference board. Large portrait, full-body turnaround, facial expressions, hair detail, uniform detail, color guide, and name tag placement guide in one sheet.\n\nNEGATIVE PROMPT\n\n${preset.negative}`;
}

function installCharacterSheetStyles() {
  const old = document.getElementById('character-sheet-preset-style');
  if (old) old.remove();

  const style = document.createElement('style');
  style.id = 'character-sheet-preset-style';
  style.textContent = `
    .characterSheetTab { position: relative !important; }
    .characterSheetPresetCard {
      background:
        radial-gradient(circle at 90% 0%, rgba(255, 231, 192, 0.38), transparent 180px),
        linear-gradient(180deg, rgba(255,255,255,0.99), rgba(252,248,241,0.96)) !important;
    }
    .characterSheetPresetCard .forceRealPreview {
      height: 240px !important;
      background: #f5efe6 !important;
      border-color: rgba(201, 157, 91, 0.28) !important;
      cursor: zoom-in !important;
    }
    .characterSheetPresetCard .forceRealPreview img {
      object-fit: contain !important;
      object-position: center center !important;
      background: #f5efe6 !important;
      transform: none !important;
    }
    .characterSheetPresetCard .forcePreviewShade { display: none !important; }
    .characterSheetPresetCard .forceRealPreview em {
      left: 12px !important;
      bottom: 12px !important;
      background: rgba(17, 19, 31, 0.88) !important;
      color: #fff !important;
    }
    .characterSheetPresetCard.activeCharacterSheetPreset {
      outline: 2px solid rgba(201, 157, 91, 0.5) !important;
      box-shadow: 0 18px 36px rgba(201, 157, 91, 0.13) !important;
    }
    @media (max-width: 640px) {
      .characterSheetPresetCard .forceRealPreview { height: 190px !important; }
    }
  `;
  document.head.appendChild(style);
}

function getPresetTabs() {
  return document.querySelector<HTMLElement>('.presetTabs');
}

function getPresetList() {
  return document.querySelector<HTMLElement>('.presetList');
}

function setCharacterTabActive() {
  document.querySelectorAll('.presetTab').forEach((tab) => tab.classList.remove('active'));
  document.querySelector<HTMLElement>('[data-character-sheet-tab="true"]')?.classList.add('active');
}

function ensureCharacterSheetTab() {
  const tabs = getPresetTabs();
  if (!tabs) return;

  if (!tabs.querySelector('[data-character-sheet-tab="true"]')) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'presetTab characterSheetTab';
    button.dataset.characterSheetTab = 'true';
    button.textContent = '캐릭터시트';
    tabs.appendChild(button);
  }
}

function characterCardMarkup() {
  return CHARACTER_SHEET_PRESETS.map((preset) => `
    <button type="button" class="presetButton characterSheetPresetCard ${activeCharacterSheetPreset.id === preset.id ? 'activeCharacterSheetPreset' : ''}" data-character-sheet-card="${preset.id}">
      <div class="presetThumb forceRealPreview" data-force-real-preview="${preset.id}">
        <img src="${preset.image}" alt="${preset.title}" loading="eager" />
        <div class="forcePreviewShade"></div>
        <em>${preset.badge}</em>
      </div>
      <strong>${preset.title}</strong>
      <span>${preset.note}</span>
      <div class="presetMetaGrid">
        <span><b>TYPE</b>${preset.type}</span>
        <span><b>BEST FOR</b>${preset.bestFor}</span>
        <span><b>RATIO</b>${preset.ratio}</span>
      </div>
      <small>${preset.mood} · ${preset.lens}</small>
    </button>
  `).join('');
}

function applyCharacterSheetPreset(preset = activeCharacterSheetPreset) {
  activeCharacterSheetPreset = preset;
  characterSheetMode = true;

  const previewTitle = document.querySelector<HTMLElement>('.scenePreview strong');
  if (previewTitle) previewTitle.textContent = `${preset.mood} · ${preset.title}`;

  const previewMeta = document.querySelector<HTMLElement>('.scenePreview span');
  if (previewMeta) previewMeta.textContent = `${preset.ratio} / 교복 레퍼런스 / 표정·전신·컬러 가이드`;

  document.querySelectorAll<HTMLElement>('.promptCard').forEach((card) => {
    const label = card.querySelector('span')?.textContent?.trim();
    const body = card.querySelector('p');
    if (!body) return;

    if (label === 'IMAGE PROMPT') body.textContent = preset.prompt;
    if (label === 'VIDEO PROMPT') body.textContent = '정지 이미지 생성용 캐릭터 시트 프리셋입니다. 영상 제작 전 얼굴, 헤어, 교복, 이름표, 표정, 전신 기준을 먼저 고정하는 용도로 사용하세요.';
    if (label === 'CAMERA NOTE') body.textContent = '16:9 landscape character consistency sheet. Warm ivory paper background. Clean editorial spacing. Japanese theatrical 2D anime production reference board. Large portrait, full-body turnaround, facial expressions, hair detail, uniform detail, color guide, and name tag placement guide in one sheet.';
    if (label === 'NEGATIVE PROMPT') body.textContent = preset.negative;
  });

  document.querySelectorAll('.characterSheetPresetCard').forEach((card) => card.classList.remove('activeCharacterSheetPreset'));
  document.querySelector<HTMLElement>(`[data-character-sheet-card="${preset.id}"]`)?.classList.add('activeCharacterSheetPreset');
}

function renderCharacterSheetPreset(force = false) {
  const list = getPresetList();
  if (!list) return;

  characterSheetMode = true;
  setCharacterTabActive();

  const alreadyRendered = list.dataset.characterSheetRendered === 'true' && list.querySelectorAll('[data-character-sheet-card]').length === CHARACTER_SHEET_PRESETS.length;
  if (!alreadyRendered || force) {
    list.innerHTML = characterCardMarkup();
    list.dataset.characterSheetRendered = 'true';
  }

  applyCharacterSheetPreset(activeCharacterSheetPreset);
}

function installCharacterEvents() {
  if (document.body.dataset.characterSheetEvents === 'true') return;
  document.body.dataset.characterSheetEvents = 'true';

  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement | null;
    const tab = target?.closest<HTMLElement>('[data-character-sheet-tab="true"]');
    if (tab) {
      event.preventDefault();
      event.stopPropagation();
      renderCharacterSheetPreset(true);
      return;
    }

    const otherTab = target?.closest<HTMLElement>('.presetTab:not([data-character-sheet-tab="true"])');
    if (otherTab) {
      characterSheetMode = false;
      const list = getPresetList();
      if (list) delete list.dataset.characterSheetRendered;
      return;
    }

    const card = target?.closest<HTMLElement>('[data-character-sheet-card]');
    if (card) {
      if (target?.closest('.forceRealPreview')) return;
      event.preventDefault();
      event.stopPropagation();
      const preset = CHARACTER_SHEET_PRESETS.find((item) => item.id === card.dataset.characterSheetCard);
      if (preset) {
        activeCharacterSheetPreset = preset;
        renderCharacterSheetPreset(true);
      }
      return;
    }

    const copyButton = target?.closest('button');
    if (characterSheetMode && copyButton?.textContent?.includes('전체 프롬프트 복사')) {
      window.setTimeout(() => {
        navigator.clipboard?.writeText(characterFullPrompt(activeCharacterSheetPreset)).catch(() => undefined);
      }, 70);
    }
  }, true);
}

function runCharacterSheetPreset() {
  installCharacterSheetStyles();
  installCharacterEvents();
  ensureCharacterSheetTab();

  if (characterSheetMode || document.querySelector<HTMLElement>('[data-character-sheet-tab="true"]')?.classList.contains('active')) {
    renderCharacterSheetPreset(false);
  }
}

runCharacterSheetPreset();

const characterSheetObserver = new MutationObserver(() => {
  window.clearTimeout(characterSheetTimer);
  characterSheetTimer = window.setTimeout(runCharacterSheetPreset, 120);
});

characterSheetObserver.observe(document.documentElement, { childList: true, subtree: true });

window.clearInterval(characterSheetInterval);
characterSheetInterval = window.setInterval(runCharacterSheetPreset, 650);
window.setTimeout(() => window.clearInterval(characterSheetInterval), 16000);
