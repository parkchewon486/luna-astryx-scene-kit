(() => {
  const CU = {
    poster: 'https://drive.google.com/uc?export=view&id=1amvBi3b5jyBf4yXsWVpWjgVmq3xzkrB7',
    video: 'https://drive.google.com/uc?export=download&id=1SQeJe3tFfXLzMMBcES5LCiMoUpJ6kzZL',
    imagePrompt: `Use the uploaded portrait photo as the sole identity reference.

Preserve the subject's real identity with high consistency, including face shape, facial proportions, eyes, eyebrows, nose, lips, jawline, skin tone, age impression, hairstyle, hair color, visible glasses, facial hair, accessories, and overall recognizable appearance.

Do not replace the subject with a generic attractive model.
Do not beautify, rejuvenate, reshape, feminize, masculinize, or alter facial proportions.

Create one highly realistic horizontal 16:9 smartphone photo.

SCENE
A hot, humid Korean midsummer night outside a real CU convenience store.

The background includes the recognizable purple-and-lime CU sign, bright interior lighting, glass windows, beverage crates, convenience-store shelves, small posters, parked cars or scooters, roadside trees, and a quiet street after midnight.

The atmosphere feels warm, humid, calm, and nostalgic.

POSE
The subject sits naturally on a purple plastic chair beside a round white plastic table.

Hold one cold blue CASS Fresh beer can a few centimeters from the lips without drinking.

Look naturally toward the beer can with a relaxed smile, soft eyes, and the expression of someone happily anticipating the first sip after a long day.

The beer can must never cover the face.

OUTFIT
If the uploaded portrait shows feminine clothing, preserve the visible outfit as accurately as possible, including color, fabric, neckline, sleeves, and accessories.

If the uploaded portrait shows masculine clothing, replace the outfit with a plain white Nike crew-neck short-sleeve T-shirt, black athletic training shorts above the knees, white ankle socks, and white Nike running shoes.

Keep the clothing casual, realistic, and naturally wrinkled.

HAIR
Preserve the hairstyle, hairline, hair color, glasses, facial hair, and accessories from the uploaded portrait.

Allow only slight movement from the humid night air.

TABLE
Place one opened Korean potato-chip bag, one small white paper cup, one folded convenience-store receipt, and subtle condensation marks.

CAMERA
Friend's point of view. 26–28mm smartphone lens. Frame from waist or mid-thigh upward.

The face is the primary focus while the CU storefront remains clearly visible behind the subject.

LIGHTING
Use realistic smartphone flash. Mix warm flash on the subject with the cool fluorescent CU lighting.

Natural skin texture, pores, slight summer shine, realistic clothing texture, mild smartphone noise, and shallow background softness.

The image should feel like an authentic late-night snapshot, not an advertisement or fashion shoot.

NEGATIVE
No identity drift. No generic face. No beauty filter. No altered facial proportions. No enlarged eyes. No incorrect hairstyle. No missing glasses. No missing facial hair. No extra people. No extra fingers. No oversized hands. No warped limbs. No beer touching the lips. No drinking pose. No random can text. Only "CASS" and "FRESH" on the can. No distorted logo. No CGI. No studio lighting. No watermark.`,
    videoPrompt: `@grok

Use the input image as the exact first frame. Create a highly realistic premium Korean summer beer commercial 6-second handheld smartphone video with slight natural handheld movement, fixed medium-close framing, no zoom, no camera angle change, no reframe. Preserve exact identity, face, blonde hair, outfit, body proportions, blue CASS Fresh beer can, CU storefront, purple plastic chair, white table, lighting, direct-flash look, background, and composition.

The woman is exhausted from intense summer heat with light natural sheen of humidity on her skin and posture showing genuine thirst and fatigue. She opens the cold beer can if needed and immediately brings it to her lips. She drinks continuously and naturally for 2 to 2.5 seconds with the beer genuinely flowing into her mouth. The can angle rises gradually and smoothly, never steep immediately. Two subtle clearly visible swallowing motions in her throat: first shortly after starting, second near the end. Lips remain sealed naturally around the can opening with no spilling, leaking, dripping, or running liquid. No cheek, mouth, or jaw inflation or deformation. Head tilts back only slightly, restrained and believable. Eyes softly closed or naturally lowered while drinking, fully absorbed in the cool sensation.

After the final swallow she stops and holds the can near her lips for a very brief moment, then lowers it slowly to chest level. She remains completely unaware of the camera at all times: never looks into the lens, never turns face toward camera, never smiles at the viewer or performs. Gaze stays naturally lowered and slightly off to the side as she quietly enjoys the cold sensation. She pauses 0.3-0.5 seconds after final swallow. Shoulders gently relax, eyelids soften, facial muscles loosen. She exhales softly through slightly parted lips with a very quiet short natural Korean beer-refreshment sound “캬…” that is low, breathy, restrained, and spontaneous. The “캬…” begins only after the beer is fully swallowed and the can has moved away from her lips. Mouth shape not exaggerated, not wide open, no dramatic eyebrow raise, no head throw, no theatrical or comedic reaction.

End still looking slightly downward and away from the camera, holding the beer can naturally near her chest, breathing calmly, with a faint trace of relief on her face. Realistic body motion, accurate lip contact, natural throat swallowing, subtle shoulder release, believable breathing. Premium beer commercial realism, hot summer atmosphere, refreshing cold beer sensation, restrained acting, natural human timing, cinematic lighting, realistic skin texture, stable facial identity, stable hands, stable rigid beer can with correct CASS branding, no visual distortion.

No eye contact with camera, no looking into lens, no turning toward viewer, no direct-to-camera smile, no posing after drinking, no exaggerated “캬,” no loud shout, no “아,” no “야,” no moaning, no singing, no spoken dialogue, no comedic acting, no dramatic facial expression, no wide-open mouth, no sudden head movement, no eyebrow raise, no beer spilling, no liquid on face, no swollen cheeks, no mouth deformation, no throat distortion, no extra fingers, no warped hand, no crushed or changing beer can, no camera zoom, no product presentation pose, no freeze-frame smile, no ending eye contact.`
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const escapeHtml = (text) => text.replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

  const toast = (text) => {
    document.querySelector('.cu-toast')?.remove();
    const node = document.createElement('div');
    node.className = 'cu-toast';
    node.textContent = text;
    document.body.append(node);
    window.setTimeout(() => node.remove(), 1700);
  };

  const copy = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      toast(`${label} 복사 완료`);
    } catch {
      toast('복사에 실패했어요');
    }
  };

  const promptBlock = (title, text) => `
    <section class="cu-prompt-block">
      <header><b>${title}</b><button type="button">복사</button></header>
      <pre>${escapeHtml(text)}</pre>
    </section>`;

  const closeModal = () => {
    document.querySelector('.cu-modal-layer')?.remove();
    document.body.classList.remove('modal-open');
  };

  const openModal = () => {
    document.querySelector('.cu-modal-layer')?.remove();
    const layer = document.createElement('div');
    layer.className = 'cu-modal-layer';
    layer.innerHTML = `
      <button class="cu-modal-backdrop" aria-label="닫기"></button>
      <article class="cu-modal" role="dialog" aria-modal="true">
        <header class="cu-modal-head">
          <div><span>FEATURED VIDEO · 01</span><h2>한여름 심야 CU 맥주</h2></div>
          <button class="cu-close" aria-label="닫기">×</button>
        </header>
        <div class="cu-modal-grid">
          <div class="cu-media-panel">
            <video controls playsinline poster="${CU.poster}"><source src="${CU.video}" type="video/mp4"></video>
            <div class="cu-meta-row"><span>광고</span><span>실사</span><span>여름밤</span><span>CU</span><span>CASS</span></div>
            <p>ChatGPT Image · Grok · 16:9 · 2026.08</p>
          </div>
          <div class="cu-copy-panel">
            <div class="cu-note"><b>DIRECTOR NOTE</b><p>퇴근길의 갈증과 첫 모금 뒤 조용히 풀리는 표정을 담은 여름 맥주 영상. 카메라를 끝까지 의식하지 않는 연출로 다듬었습니다.</p></div>
            ${promptBlock('이미지 프롬프트', CU.imagePrompt)}
            ${promptBlock('영상 프롬프트', CU.videoPrompt)}
            <button class="cu-copy-all" type="button">전체 프롬프트 복사</button>
          </div>
        </div>
      </article>`;

    document.body.append(layer);
    document.body.classList.add('modal-open');
    $('.cu-modal-backdrop', layer).onclick = closeModal;
    $('.cu-close', layer).onclick = closeModal;
    const blocks = layer.querySelectorAll('.cu-prompt-block');
    blocks[0].querySelector('button').onclick = () => copy(CU.imagePrompt, '이미지 프롬프트');
    blocks[1].querySelector('button').onclick = () => copy(CU.videoPrompt, '영상 프롬프트');
    $('.cu-copy-all', layer).onclick = () => copy(`IMAGE PROMPT\n\n${CU.imagePrompt}\n\nVIDEO PROMPT\n\n${CU.videoPrompt}`, '전체 프롬프트');
  };

  const mount = () => {
    const card = document.querySelector('.prompt-grid .prompt-card');
    if (!card || card.dataset.cuMounted) return false;

    card.dataset.cuMounted = 'true';
    card.classList.add('cu-featured-card');
    const openButton = $('.card-open', card);
    const oldCover = $('.prompt-cover', card);

    if (oldCover) {
      oldCover.outerHTML = `
        <div class="cu-featured-media">
          <video muted loop playsinline preload="metadata" poster="${CU.poster}"><source src="${CU.video}" type="video/mp4"></video>
          <div class="cu-featured-top"><span>FEATURED VIDEO</span><em>01</em></div>
          <div class="cu-play" aria-hidden="true">▶</div>
          <div class="cu-duration">00:06</div>
        </div>`;
    }

    const title = $('h2', card);
    if (title) title.textContent = '한여름 심야 CU 맥주';
    const description = $('.card-body > p', card);
    if (description) description.textContent = '뜨거운 퇴근길, 차가운 첫 모금과 조용한 “캬…”를 담은 여름 맥주 영상';
    const meta = $('.card-meta', card);
    if (meta) meta.innerHTML = '<span>대표 영상</span><span>16:9</span>';
    const footer = $('.card-footer span', card);
    if (footer) footer.textContent = 'ChatGPT Image · Grok';

    const video = $('video', card);
    card.addEventListener('mouseenter', () => video?.play().catch(() => {}));
    card.addEventListener('mouseleave', () => {
      if (!video) return;
      video.pause();
      video.currentTime = 0;
    });

    openButton.addEventListener('click', event => {
      event.preventDefault();
      event.stopImmediatePropagation();
      openModal();
    }, true);

    return true;
  };

  if (!mount()) {
    const observer = new MutationObserver(() => {
      if (mount()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeModal();
  });
})();