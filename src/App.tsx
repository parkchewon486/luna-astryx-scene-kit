import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';

import './App.css';

type Category = '전체' | '인물' | '캐릭터' | '푸드' | '시네마' | '공포' | '광고';
type CardSize = 'portrait' | 'landscape' | 'square';
type CoverName =
  | 'cu'
  | 'sea'
  | 'digicam'
  | 'pico'
  | 'mae'
  | 'pasta'
  | 'orange'
  | 'royal'
  | 'dmz'
  | 'ghost'
  | 'chibi'
  | 'romance';

type PromptItem = {
  id: string;
  title: string;
  eyebrow: string;
  description: string;
  category: Exclude<Category, '전체'>;
  tools: string[];
  ratio: string;
  year: string;
  tags: string[];
  prompt: string;
  videoPrompt?: string;
  note?: string;
  cover: CoverName;
  size: CardSize;
  featured?: boolean;
};

const promptItems: PromptItem[] = [
  {
    id: 'cu-midnight-beer',
    title: '한여름 심야 CU 맥주',
    eyebrow: 'LATE NIGHT SNAP',
    description: '퇴근길 첫 모금 직전의 표정과 편의점 불빛을 함께 잡는 실사 프롬프트',
    category: '광고',
    tools: ['GPT Image', 'Grok Video'],
    ratio: '16:9',
    year: '2026.08',
    tags: ['실사', 'identity lock', '스마트폰 플래시', '맥주 CF'],
    cover: 'cu',
    size: 'landscape',
    featured: true,
    prompt: `Use the uploaded portrait photo as the sole identity reference.

Preserve the subject's real identity with high consistency, including face shape, facial proportions, eyes, eyebrows, nose, lips, jawline, skin tone, age impression, hairstyle, hair color, visible glasses, facial hair, accessories, and overall recognizable appearance.

Do not replace the subject with a generic attractive model. Do not beautify, rejuvenate, reshape, feminize, masculinize, or alter facial proportions.

Create one highly realistic horizontal 16:9 smartphone photo.

SCENE
A hot, humid Korean midsummer night outside a real CU convenience store. The background includes the recognizable purple-and-lime CU sign, bright interior lighting, glass windows, beverage crates, convenience-store shelves, small posters, parked cars or scooters, roadside trees, and a quiet street after midnight. The atmosphere feels warm, humid, calm, and nostalgic.

POSE
The subject sits naturally on a purple plastic chair beside a round white plastic table. Hold one cold blue CASS Fresh beer can a few centimeters from the lips without drinking. Look naturally toward the beer can with a relaxed smile, soft eyes, and the expression of someone happily anticipating the first sip after a long day. The beer can must never cover the face.

OUTFIT
If the uploaded portrait shows feminine clothing, preserve the visible outfit as accurately as possible, including color, fabric, neckline, sleeves, and accessories.

If the uploaded portrait shows masculine clothing, replace the outfit with a plain white Nike crew-neck short-sleeve T-shirt, black athletic training shorts above the knees, white ankle socks, and white Nike running shoes. Keep the clothing casual, realistic, and naturally wrinkled.

HAIR
Preserve the hairstyle, hairline, hair color, glasses, facial hair, and accessories from the uploaded portrait. Allow only slight movement from the humid night air.

TABLE
Place one opened Korean potato-chip bag, one small white paper cup, one folded convenience-store receipt, and subtle condensation marks on the table.

CAMERA
Friend's point of view. 26–28mm smartphone lens. Frame from waist or mid-thigh upward. The face is the primary focus while the CU storefront remains clearly visible behind the subject.

LIGHTING
Use realistic smartphone flash. Mix warm flash on the subject with the cool fluorescent CU lighting. Natural skin texture, pores, slight summer shine, realistic clothing texture, mild smartphone noise, and shallow background softness. The image should feel like an authentic late-night snapshot, not an advertisement or fashion shoot.

NEGATIVE
No identity drift. No generic face. No beauty filter. No altered facial proportions. No enlarged eyes. No incorrect hairstyle. No missing glasses. No missing facial hair. No extra people. No extra fingers. No oversized hands. No warped limbs. No beer touching the lips. No drinking pose. No random can text. Only “CASS” and “FRESH” on the can. No distorted logo. No CGI. No studio lighting. No watermark.`,
    videoPrompt: `Create an 8-second highly realistic smartphone video using the generated CU still as the first frame.

The subject does not look at the camera at any point. The camera feels like a friend quietly filming from the other side of the table.

0.0–1.2 sec: The subject looks at the cold beer can with a tired but pleased expression. Condensation glistens on the can. The humid night air moves a few loose hairs.

1.2–5.5 sec: The subject brings the can to the lips and takes one long, satisfying drink. Show two or three natural swallows through subtle throat movement. The can tilts gradually. Keep the face stable and recognizable. No exaggerated gulping, no spilling, no sudden camera move.

5.5–7.0 sec: The subject lowers the can, looks slightly away toward the quiet street, and releases one small, natural Korean refreshment sound, “캬.” It should sound short, breathy, and involuntary, not acted or shouted.

7.0–8.0 sec: A small relieved smile remains. The subject keeps looking toward the street or the can, never into the lens.

Audio: soft convenience-store ambience, distant road noise, faint refrigerator hum, subtle can movement, realistic swallowing, one restrained “캬.”

Avoid overacting, ad-like posing, eye contact with the camera, loud exclamation, repeated drinking, facial drift, hand deformation, can-label distortion, fast zoom, and camera shake.`,
    note: '맥주를 마신 뒤 카메라를 보지 않게 고정한 최종 연출본입니다.',
  },
  {
    id: 'seaside-hand-portrait',
    title: '바닷가 손바닥 장난',
    eyebrow: 'GOLDEN HOUR PORTRAIT',
    description: '한쪽 눈은 또렷하게 남기고 손 크기 오류를 줄인 바닷가 인물 컷',
    category: '인물',
    tools: ['GPT Image', 'Grok Video'],
    ratio: '3:4',
    year: '2026.08',
    tags: ['인물 고정', '손 오류 방지', '골든아워', '바닷가'],
    cover: 'sea',
    size: 'portrait',
    prompt: `Use the uploaded portrait photo as the sole and primary identity reference for the subject.

Preserve the subject’s real identity with high consistency. Keep the person clearly recognizable as the same individual from the uploaded image, even though one hand partially covers part of the face. Preserve the true face shape, facial proportions, visible eye shape, eyebrows, nose structure, lips, jawline, cheekbones, skin tone, age impression, hairstyle, hairline, natural asymmetry, accessories, and overall presence.

Do not replace the subject with a generic model face. Do not overly beautify, rejuvenate, glamorize, reshape, or alter facial proportions.

Create one realistic vertical 3:4 seaside portrait at golden hour.

The subject stands near calm water, facing the camera with a gentle, natural smile. Raise one hand toward the lens in a playful candid gesture, as though lightly blocking the camera. The palm faces the lens and covers roughly one-third of the face.

The hand must look like a normal human hand and must not dominate the frame. Keep the wrist and palm slightly farther from the lens than a typical wide-angle pose. Use a natural 50–70mm portrait perspective rather than an ultra-wide lens. Fingers are relaxed, naturally spaced, and softly out of focus.

At least one eye must remain fully visible, sharply focused, and unobstructed. Enough of the nose, mouth, cheek, and jawline must remain visible to preserve identity. The subject should still be unmistakably recognizable.

Warm sunlight passes gently between two fingers, creating a restrained flare. Preserve the uploaded hairstyle while allowing light wind movement. Use realistic skin texture, soft backlight, shallow depth of field, calm water, and a hazy warm horizon.

No oversized hand, no giant palm, no stretched fingers, no fused fingers, no missing fingers, no extra fingers, no hand covering the entire face, no face change, no generic beauty face, no plastic skin, no excessive lens flare, no heavy blur, no warped shoulder, no duplicated arm, no watermark.`,
    videoPrompt: `Create a 6-second natural seaside portrait video from the generated still.

The subject keeps the same face and hairstyle. The hand stays in nearly the same position and makes only a tiny relaxed movement. The fingers do not open wider and the palm does not move closer to the lens.

A light sea breeze moves a few hair strands. Sunlight flickers softly between the fingers. The subject gives one small, genuine smile and maintains calm eye contact through the visible eye.

Use a nearly locked camera with only gentle handheld breathing. No zoom, no dramatic hand wave, no face drift, no finger morphing, no exaggerated smile, and no sudden head turn.`,
  },
  {
    id: 'digicam-car',
    title: '2007 차 안 디카',
    eyebrow: 'DIGICAM MEMORY',
    description: '차창 밖 보케와 직광 플래시를 살린 Y2K 야간 스냅',
    category: '인물',
    tools: ['GPT Image', 'Grok Video'],
    ratio: '5:5',
    year: '2026.07',
    tags: ['디카', 'Y2K', '직광 플래시', '차 안'],
    cover: 'digicam',
    size: 'square',
    featured: true,
    prompt: `5:5 X 썸네일 비율. 업로드한 얼굴 레퍼런스를 기준으로 인물의 얼굴 느낌과 헤어를 자연스럽게 유지한다.

2007 디카 기억 감성에 세련된 도심 야경 무드를 더한 차 안 장면. 인물은 밤의 도시 불빛이 보이는 차창 옆 뒷좌석에 자연스럽게 앉아 있다.

미디엄 클로즈업, 살짝 측면, 앞좌석 쪽에서 찍은 시선. 전경 프레임은 아주 가볍게만 들어온다. 창밖에는 노란 가로등, 빨간 브레이크등, 흰 도로 조명이 둥글게 번진 도시 보케가 보인다.

디카 직광 플래시가 얼굴과 상체를 또렷하게 밝히고 배경은 어둡고 깊게 남긴다. 인물은 과하게 포즈를 취하지 않고 카메라를 방금 알아챈 듯한 작은 미소와 차분한 눈빛을 유지한다.

피부는 과보정 없이 자연스럽게, 살짝 거친 디지털 노이즈와 부드러운 그레인을 남긴다. 웹앱 대표 이미지로 쓰기 좋은 깔끔한 첫 프레임.

NEGATIVE
front headrest blocking face, flat gray seat dominant background, empty dull car interior, overacting, glam pose, luxury editorial studio look, plastic skin, over-smoothed skin, heavy beauty retouching, distorted hands, extra fingers, unreadable text, face change, duplicated person, warped car interior, excessive blur, fast zoom, camera shake, harsh HDR, watermark, logo`,
    videoPrompt: `6초 영상. 카메라는 앞좌석 쪽에서 손에 든 작은 디카처럼 아주 미세하게 움직인다.

인물은 차창 옆 뒷좌석에 앉아 창밖 도심 불빛을 잠깐 바라보다가 카메라 쪽으로 시선을 옮긴다. 미디엄샷에서 작은 표정 변화만 담고 과한 손동작이나 포즈는 피한다.

창밖 도시 불빛 보케와 차 안의 어두운 공기가 함께 살아 있어야 한다. 갑작스러운 줌, 과한 시점 이동, 불필요한 연기, 얼굴 변화는 피한다.`,
  },
  {
    id: 'pico-reference-sheet',
    title: '피코 실사 레퍼런스 시트',
    eyebrow: 'MINIATURE CREATURE',
    description: '2.5cm 크기의 피코를 인형처럼 보이지 않게 다시 세운 캐릭터 시트',
    category: '캐릭터',
    tools: ['GPT Image'],
    ratio: '16:9',
    year: '2026.08',
    tags: ['피코', '매크로 실사', '캐릭터 시트', '2.5cm'],
    cover: 'pico',
    size: 'landscape',
    featured: true,
    prompt: `Use the uploaded Pico reference sheet only to preserve Pico’s identity, scale, fur color, tiny side ears, sleepy expression, short tail, yellow Post-it habit, and faint heart-shaped rump fur whorl.

Create a brand-new, highly photorealistic animation reference sheet for Pico. Do not imitate the previous rendering style. Rebuild Pico from scratch as a biologically plausible miniature mammal.

Pico is exactly 2.5 cm tall.

Pico must look like a real living creature photographed with a macro lens, not a plush toy, doll, mascot, figurine, CGI character, game character, or stylized 3D animal.

BODY
Pico has a compact bean-shaped body with no visible neck, a slightly forward-curved back, a softly projecting lower belly, and fuller weight around the rump. The body is not perfectly round, not egg-shaped, not spherical, and not symmetrical. The head is slightly smaller than before.

FACE
The face is broad and almost flat. The muzzle is extremely short and softly blended into the face. Avoid a puppy snout, hamster muzzle, rabbit muzzle, bear muzzle, or seal face.

EARS AND EYES
The ears are very small, low-set, rounded leaf-shaped ears emerging from the sides of the head. The eyes are tiny, moist, dark brown eyes with a visible brown iris, pupil, and one thin natural catchlight. Avoid bead eyes, sticker eyes, giant glossy eyes, and toy-like symmetry.

FUR
Use dry, soft, airy cream-beige fur. Show individual guard hairs, dense undercoat, direction changes, natural color variation, tiny muzzle hairs, slightly longer cheek and body fur, mild asymmetry, and realistic compression where the body touches the ground. The fur must look fluffy and dry, never wet, oily, clumped, brushed into a costume, or wrapped around human-like hands.

TAIL AND RUMP
Include a very short natural tail. On the rump, create a faint heart-shaped fur whorl formed only by the changing direction of real fur. It must not look drawn, shaved, stamped, dyed, or pasted on.

SHEET CONTENT
Show front, three-quarter, side, back, curled sleeping pose, walking pose, tiny paws, feet, ear detail, tail detail, eye detail, scale comparison beside a computer Enter key, and Pico holding a small blank yellow Post-it.

Use clean editorial spacing on a warm off-white background. Macro-photography realism, soft neutral studio light, believable anatomy, consistent scale and identity in every panel.

No hamster face, no plush texture, no doll paws, no furry gloves, no wet fur, no missing tail, no oversized head, no perfectly round body, no long muzzle, no rabbit ears, no human hands, no extra limbs, no duplicated Pico, no text artifacts, no watermark.`,
    note: '젖은 털, 햄스터 얼굴, 털장갑처럼 보이는 손을 막기 위해 다시 쓴 버전입니다.',
  },
  {
    id: 'mae-hwajeon-dough',
    title: '매화 키친 화전 반죽',
    eyebrow: 'MAE’S JOSEON KITCHEN',
    description: '찹쌀 반죽의 질감과 손동작을 음식 작화 중심으로 보여주는 장면',
    category: '푸드',
    tools: ['GPT Image', 'Seedance'],
    ratio: '9:16',
    year: '2026.07',
    tags: ['매화 키친', '조선', '푸드 애니', 'ASMR'],
    cover: 'mae',
    size: 'portrait',
    prompt: `Use Image 1 only as Mae’s identity reference.

Create a vertical 9:16 image in a warm Joseon-era kitchen, matching the same visual world as the previous hwajeon scenes. Show scene 3 of the process: Mae is gently pinching off a small piece of glutinous rice dough from a larger soft dough mass in a ceramic bowl.

This is NOT cooked rice and NOT rice balls. The dough must look like smooth, moist, slightly sticky glutinous rice dough, with a soft elastic surface and no visible rice grains. Mae is taking only a small chestnut-sized piece from the main dough.

On a shallow white Joseon-style ceramic plate beside the bowl, place 3 to 5 small irregular dough portions that were already pinched off. Each dough piece should be small, soft, slightly uneven, and handmade, not perfectly round.

Show Mae’s hands clearly as the main focus. Her face may appear softly in frame, but smaller than the hands and dough. Keep her appearance exactly consistent with the character sheet: young Joseon woman, center-parted black hair in a long braid, dark plum ribbon, ivory jeogori, navy ribbon, charcoal apron, burgundy chima.

The bowl and plate must look traditional and stay visually consistent with the earlier scenes: one gray-white Joseon ceramic bowl for the dough, one shallow warm white ceramic plate for the small dough portions. No modern tools. No glass bowls. No modern kitchen props.

Composition: close 45-degree angle, hand-and-food focused, cinematic food close-up.
Lighting: warm late-afternoon light through hanji window.
Style: polished 2D anime character art for Mae and background, but premium high-end Japanese anime food illustration for the dough with rich realistic material texture. Illustrated and painterly, not photorealistic.

No text, no letters, no labels, no captions, no watermark, no extra people, no dog, no duplicate hands, no extra fingers, no rice grains, no rice-ball appearance, no bread dough appearance, no mochi dessert styling, no oversized dough balls.`,
    videoPrompt: `6-second vertical food-ASMR animation. Mae gently pinches one chestnut-sized piece from the soft glutinous-rice dough, turns it once between her fingertips, and places it on the shallow ceramic plate.

The dough stretches only a few millimeters before separating. It must feel soft, moist, elastic, and slightly sticky, with no visible rice grains. Keep the bowl, plate, costume, hands, and camera angle fixed.

Audio: faint sticky dough pull, fingertips brushing ceramic, soft cloth movement, distant wood fire, quiet Joseon kitchen room tone.

No fast hand motion, no kneading, no rice-ball rolling, no extra dough pieces appearing, no duplicate hands, no camera orbit, no face drift.`,
  },
  {
    id: 'seafood-pasta-asmr',
    title: '해산물 파스타 ASMR',
    eyebrow: 'GOOGLE FLOW OMNI',
    description: '면과 해산물이 소스 속에서 섞이는 순간을 소리까지 살린 푸드 영상',
    category: '푸드',
    tools: ['GPT Image', 'Google Flow Omni', 'Grok'],
    ratio: '9:16',
    year: '2026.08',
    tags: ['파스타', '푸드 ASMR', 'Google Flow', '해산물'],
    cover: 'pasta',
    size: 'portrait',
    featured: true,
    prompt: `Create one vertical 9:16 cinematic food image of finished tomato seafood pasta.

Show one wide, shallow white ceramic bowl fully inside the frame. Do not crop the rim. In the center, arrange glossy spaghetti coated in a rich tomato-garlic sauce. Include plump pink-orange shrimp, opened black mussel shells with visible meat, small tomato pieces, finely chopped parsley, and a light sheen of olive oil.

The pasta should look freshly tossed, not dry and not flooded with sauce. Steam rises in thin natural wisps. Keep the seafood distributed through the noodles rather than placed as a decorative ring.

Set the bowl on a warm wooden table. Place one fork neatly to the left and one spoon neatly to the right. Add only restrained background props: a softly blurred olive-oil bottle, pepper mill, herbs, and a folded neutral napkin.

Camera: slightly elevated 35–45 degree food angle, 50mm food-photography perspective, shallow depth of field, the entire bowl readable.
Lighting: warm window-like key light with soft golden highlights on sauce and seafood, natural shadow, subtle bokeh.

High-end appetizing food photography, realistic ingredient texture, clean plating, no people.

No cropped plate, no missing utensils, no extra cutlery, no giant shrimp, no raw seafood, no closed empty mussels, no floating ingredients, no excessive garnish, no plastic noodles, no CGI gloss, no text, no watermark.`,
    videoPrompt: `Create a 7-second vertical food-ASMR video from the same pan and ingredients.

The camera remains in a close 45-degree food angle. Metal tongs lift a small bundle of spaghetti from the center, fold it back into the tomato sauce, and gently turn it through the shrimp and mussels. The noodles and seafood must visibly mix together rather than sliding as separate layers.

Sauce clings to the strands. One shrimp rolls naturally with the noodles. Two mussel shells shift slightly but remain intact. Steam rises continuously. A few parsley pieces move with the sauce.

Audio must be the star: wet pasta folding, light sauce bubbling, tongs touching the pan, soft shell clicks, and gentle steam. No music, no voice.

Keep the pan, utensils, noodle amount, shrimp count, mussels, sauce color, and lighting stable. No hand entering deeply into frame, no aggressive stirring, no flying food, no new ingredients appearing, no jump cut, no camera spin, no melting seafood.`,
  },
  {
    id: 'orange-tiramisu',
    title: '오렌지 티라미수 여름 CF',
    eyebrow: 'SUMMER DESSERT FILM',
    description: '오렌지 제스트와 차가운 크림의 결을 살린 상큼한 디저트 광고 컷',
    category: '광고',
    tools: ['GPT Image', 'Pollo AI'],
    ratio: '16:9',
    year: '2026.07',
    tags: ['오렌지', '티라미수', '디저트 CF', 'Pollo AI'],
    cover: 'orange',
    size: 'landscape',
    prompt: `Create a cinematic horizontal 16:9 food-commercial frame in a contemporary home kitchen.

Keep the visual world consistent across the full orange tiramisu series: cream cabinetry, pale stone island, late-summer sunlight, and one orange retro refrigerator in the left rear background.

Show a finished chilled orange tiramisu centered on a clean cream ceramic plate. The dessert has distinct soft layers: syrup-soaked ladyfingers, pale mascarpone cream, and a smooth top dusted lightly with fine orange zest. Add several fresh curls of orange zest and one restrained orange segment garnish. The cream must look cold, airy, and softly set, never rubbery.

Use a close food-commercial composition with the whole plate visible. Warm sunlight grazes the side of the dessert while cooler fill light keeps the cream clean and bright. Show tiny condensation on a nearby chilled glass and a few natural crumbs on the plate.

Premium summer dessert advertising, realistic food texture, elegant but homey, no excessive styling.

No chocolate cocoa powder, no coffee beans, no lemon, no giant orange slice, no melted cream, no collapsed layers, no plastic food, no cropped plate, no busy props, no text, no watermark.`,
    videoPrompt: `Create a 6-second horizontal food-commercial shot.

Start with a close view of the finished orange tiramisu. The camera makes one very slow 8–10 cm push-in. A hand enters only at the edge of frame and uses a small dessert fork to cut through the top cream and ladyfinger layers once.

The fork lifts one neat bite. Show the creamy cross-section, moist ladyfinger texture, and fine orange zest. The dessert remains stable and chilled. The orange retro refrigerator stays softly visible in the background.

Audio: delicate fork through cream, faint ceramic touch, soft room ambience. No voice and no music swell.

No fast zoom, no repeated cutting, no messy collapse, no dripping cream, no hand deformation, no plate movement, no background change.`,
  },
  {
    id: 'mae-royal-fish',
    title: '궁중 생선찜 마지막 고명',
    eyebrow: 'ROYAL KITCHEN SCENE',
    description: '매화와 상궁의 얼굴을 분리하고 생선과 고명 위치를 지키는 수정 프롬프트',
    category: '푸드',
    tools: ['GPT Image', 'Seedance'],
    ratio: '9:16',
    year: '2026.08',
    tags: ['조선 궁중', '생선찜', '캐릭터 고정', '푸드 애니'],
    cover: 'royal',
    size: 'portrait',
    prompt: `기존 8씬의 구성, 매화, 숭어, 놋찜기, 고명 배치와 카메라 구도는 그대로 유지한다.

상궁의 외형만 9씬 이미지와 완전히 동일하게 수정한다. 상궁은 매화보다 확실히 나이가 많은 성숙한 조선 궁중 상궁이며, 매화와 전혀 다른 얼굴이어야 한다. 부드럽지만 위엄 있는 눈매, 조금 더 넓고 성숙한 얼굴형, 차분한 표정, 단정하게 뒤로 올린 낮은 쪽머리와 땋은 머리 디테일을 유지한다.

상궁의 의상은 9씬과 동일한 짙은 녹색 저고리, 흰 동정, 짙은 자주색 치마와 허리띠로 고정한다. 매화와 같은 얼굴, 같은 머리 모양, 같은 리본 장식을 사용하지 않는다.

상궁은 손을 가지런히 모은 채 매화가 익은 숭어 위에 마지막 고명을 정리하는 모습을 조용히 살핀다. 매화의 얼굴, 의상, 손, 젓가락, 생선과 고명의 색과 위치는 변경하지 않는다.

9:16 vertical, high-end Japanese anime food illustration, cinematic food ASMR, illustrated and painterly, not photorealistic, warm Joseon royal kitchen morning light, food-focused semi-overhead close-up.

No duplicated woman, no identical faces, no matching hairstyles, no youthful court lady, no character replacement, no extra hands, no altered food arrangement.`,
  },
  {
    id: 'dmz-outpost',
    title: 'DMZ 야간 초소',
    eyebrow: 'HORROR ENVIRONMENT',
    description: '달빛, 갈대밭, 후방도로의 빈 간판으로 만드는 한국형 군대 공포 배경',
    category: '공포',
    tools: ['GPT Image', 'Grok Video'],
    ratio: '16:9',
    year: '2026.08',
    tags: ['DMZ', '공포', '환경 시트', '달빛'],
    cover: 'dmz',
    size: 'landscape',
    featured: true,
    prompt: `Create a cinematic horizontal 16:9 East Asian theatrical horror environment at a remote Korean front-line guard post at night.

The camera stands just behind and slightly to the side of a small weathered guard post. Beyond it, a narrow safe path runs beside a high wire fence. Past the fence lies a dense field of tall dry reeds. About 100 meters beyond the reeds, a quiet rear road and one enormous empty billboard rise above the landscape.

The billboard must be blank. No readable slogans, no political message, no logo, no flag, no military unit patch, and no national emblem.

A full moon hangs over the left side of the sky and casts cold silver light across the reeds. The guard post window emits only a weak dirty amber glow. Wind bends the reeds in uneven waves. The road is almost invisible except for a thin strip of moonlit ground beneath the billboard.

Composition: deep perspective from guard post to fence, reed field, rear road, and billboard. The billboard is distant but clearly readable as the visual destination. Keep the scene empty of people.

Style: East Asian cinema horror illustration, detailed ink line, watercolor and gouache texture, deep navy, charcoal, muted olive, silver moonlight, restrained warm interior light. Illustrated and painterly, not photorealistic.

No soldier visible, no ghost visible, no vehicles, no bright floodlights, no readable text, no flags, no propaganda slogan, no modern city lights, no fantasy castle, no excessive fog, no gore, no watermark.`,
    videoPrompt: `Create a 7-second horizontal horror shot from the same frame.

The camera remains locked near the guard post. Only the reeds move in irregular waves under the night wind. The weak window light flickers once. A loose metal part on the distant blank billboard moves slightly and makes one faint creak.

At 5.5 seconds, the reed movement briefly stops for less than one second, leaving an unnatural stillness. Nothing appears beneath the billboard yet.

Audio: cold wind through dry reeds, distant fence vibration, one low billboard creak, faint electrical hum from the guard post. No music and no dialogue.

No zoom, no camera pan, no ghost reveal, no soldier, no text appearing on the billboard, no sudden lightning, no jump scare.`,
  },
  {
    id: 'billboard-woman',
    title: '간판 아래 손짓하는 여자',
    eyebrow: 'THE DISTANT FIGURE',
    description: '멀리서만 보이는 하얀 원피스의 존재를 과장 없이 쌓는 공포 캐릭터 컷',
    category: '공포',
    tools: ['GPT Image', 'Grok Video'],
    ratio: '16:9',
    year: '2026.08',
    tags: ['공포 캐릭터', '실루엣', '빈 간판', '느린 손짓'],
    cover: 'ghost',
    size: 'portrait',
    prompt: `Use the established DMZ night environment and the same blank billboard.

Create one horizontal 16:9 horror frame viewed from the distant guard-post side of the reed field. Beneath the exact center of the billboard, place one very small pale woman standing on the rear road about 100 meters away.

She appears to be in her early twenties, thin and fragile, wearing a plain ankle-length off-white dress. Her long black hair hangs forward and completely hides her face. Her skin is extremely pale in the moonlight.

One arm hangs naturally. The other arm is raised only to chest height with the palm turned inward, making a slow, restrained beckoning gesture. Do not pose her like a zombie or dancer. She should be easy to miss at first glance.

Keep the woman small in frame. The empty billboard, dark road, and surrounding reeds remain larger visual elements. Cold moonlight outlines her dress, while her face remains unreadable.

East Asian theatrical horror illustration, ink, watercolor, and gouache, deep navy and dirty off-white, quiet dread, no gore.

No visible face, no glowing eyes, no open mouth, no blood, no torn flesh, no floating body, no giant figure, no extra person, no text on billboard, no flags, no fantasy effects, no watermark.`,
    videoPrompt: `Create a 6-second locked-off horror video.

The distant woman remains beneath the center of the blank billboard. For the first 3 seconds she is completely still. Then her raised hand bends inward once in one slow beckoning motion. Her body and feet do not move.

The reeds in the foreground continue moving, sometimes partially hiding her. Her hair stays over her face. The moonlight remains constant.

Audio: dry reeds, distant metal creak, one faint cloth movement. No voice, no whisper, no music, no jump scare.

No teleporting, no sudden close-up, no face reveal, no running, no extra arm, no distorted hand, no camera movement.`,
  },
  {
    id: 'chibi-resin-avatar',
    title: '볼꼬집 미니 치비',
    eyebrow: 'CHIBI RESIN AVATAR',
    description: '업로드한 얼굴의 특징을 남기면서 레진 컬렉터블로 바꾸는 프사형 프롬프트',
    category: '캐릭터',
    tools: ['GPT Image'],
    ratio: '5:5',
    year: '2026.07',
    tags: ['치비', '레진돌', '프로필', 'identity lock'],
    cover: 'chibi',
    size: 'square',
    prompt: `Use the uploaded profile photo as the only identity reference.

Preserve the person’s recognizable face shape, eye shape, eyebrows, nose, lips, hairstyle, hair color, skin tone, age impression, accessories, expression, and overall mood. Identity preservation has higher priority than cuteness.

Create a polished 5:5 collectible chibi resin-art avatar. Show the tiny character from the waist up, standing on an open human palm. A second normal-sized fingertip gently presses one cheek inward by only a few millimeters, creating a soft playful cheek pinch.

The chibi has a small rounded body, slightly oversized head, tiny shoulders, short arms, and clean resin craftsmanship. Keep the real person’s most recognizable facial traits. Do not turn the subject into a generic cute doll.

Use soft window light, warm neutral background, shallow depth of field, delicate glossy resin highlights, subtle cheek softness, and high-end collectible photography.

The human palm and fingertip must be anatomically correct and proportional. Keep all five fingers readable. The fingertip touches only one cheek and does not cover the eye or mouth.

No different person, no over-beautified face, no adult body proportions, no realistic human body, no extra fingers, no distorted hand, no giant fingertip, no crushed face, no melted resin, no broken eyes, no duplicate face, no creepy doll, no harsh shadow, no text, no watermark.`,
  },
  {
    id: 'after-school-confession',
    title: '고백 직전 하교길',
    eyebrow: 'YOUTH ROMANCE',
    description: '손잡기나 과한 연기 없이 눈빛과 작은 거리로 설레는 장면',
    category: '시네마',
    tools: ['GPT Image', 'Grok Video'],
    ratio: '16:9',
    year: '2026.07',
    tags: ['청춘 로맨스', '하교길', '노을', '50mm'],
    cover: 'romance',
    size: 'landscape',
    prompt: `16:9 와이드 영상 비율. 청춘 로맨스 감성의 하교길 장면. 노을이 지는 조용한 한국 골목길.

두 고등학생이 함께 걷다가 잠시 멈춘 순간이다. 남학생은 한 걸음 뒤에서 여학생을 바라보며 무언가 말하려는 듯 살짝 망설인다. 손은 주머니에 넣지 않고 가방끈을 가볍게 잡거나 손끝을 긴장한 듯 모은다.

여학생은 반 걸음 앞에서 돌아보며 남학생을 올려다본다. 표정은 밝게 웃기보다 예상한 듯하면서도 살짝 놀란 부드러운 표정. 두 사람 사이에는 손이 닿을 듯 닿지 않는 작은 거리감이 있다.

50mm 인물 렌즈, 미디엄샷, 살짝 측면, 노을 역광. 배경은 부드럽게 흐리고 두 인물의 눈빛과 침묵이 먼저 보이게 한다. 과한 포즈 없이 고백 직전의 조용한 떨림이 느껴지는 영상 첫 프레임. 자연스러운 한국 교복과 학생다운 백팩 디테일을 유지한다.

NEGATIVE
hand holding, kiss, hug, exaggerated romance pose, overacting, dramatic tears, broken text, distorted hands, extra fingers, duplicated people, face change, plastic skin, awkward pose, fast zoom, camera shake`,
    videoPrompt: `6초 영상. 노을이 지는 조용한 한국 골목길에서 두 고등학생이 함께 걷다가 자연스럽게 속도를 늦추고 잠시 멈춘다.

남학생은 반 걸음 뒤에서 여학생을 바라보며 무언가 말하려는 듯 망설인다. 손은 가방끈을 가볍게 잡거나 손끝을 작게 만지작거린다. 여학생은 반 걸음 앞에서 돌아보며 남학생을 올려다본다.

카메라는 50mm 인물 렌즈 느낌의 미디엄샷, 살짝 측면 구도, 노을 역광. 아주 느린 움직임만 사용하고 작은 시선 변화와 숨결, 머리카락의 미세한 흔들림 정도만 담는다.

손잡기, 포옹, 키스, 큰 표정, 갑작스러운 줌, 카메라 흔들림은 넣지 않는다.`,
  },
];

const categories: Category[] = ['전체', '인물', '캐릭터', '푸드', '시네마', '공포', '광고'];

const coverText: Record<CoverName, { mark: string; small: string }> = {
  cu: { mark: 'CU', small: 'MIDNIGHT · 00:47' },
  sea: { mark: 'SUN', small: 'SEA PORTRAIT' },
  digicam: { mark: '07', small: 'DIRECT FLASH' },
  pico: { mark: '2.5', small: 'CM · PICO' },
  mae: { mark: '梅', small: 'JOSEON KITCHEN' },
  pasta: { mark: 'ASMR', small: 'PASTA · OMNI' },
  orange: { mark: 'ORANGE', small: 'SUMMER DESSERT' },
  royal: { mark: '宮', small: 'ROYAL TABLE' },
  dmz: { mark: '100m', small: 'EMPTY BILLBOARD' },
  ghost: { mark: '…', small: 'BENEATH THE SIGN' },
  chibi: { mark: 'MINI', small: 'RESIN AVATAR' },
  romance: { mark: '6s', small: 'BEFORE CONFESSION' },
};

function App() {
  const [category, setCategory] = useState<Category>('전체');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [copyLabel, setCopyLabel] = useState('');
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      return JSON.parse(window.localStorage.getItem('luna-prompt-favorites') ?? '[]') as string[];
    } catch {
      return [];
    }
  });

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return promptItems.filter((item) => {
      const categoryMatch = category === '전체' || item.category === category;
      if (!categoryMatch) return false;
      if (!normalizedQuery) return true;

      const searchText = [
        item.title,
        item.eyebrow,
        item.description,
        item.category,
        item.ratio,
        ...item.tools,
        ...item.tags,
      ]
        .join(' ')
        .toLowerCase();

      return searchText.includes(normalizedQuery);
    });
  }, [category, query]);

  const selectedItem = useMemo(
    () => promptItems.find((item) => item.id === selectedId) ?? null,
    [selectedId],
  );

  useEffect(() => {
    window.localStorage.setItem('luna-prompt-favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    if (!selectedItem) return undefined;

    document.body.classList.add('modal-open');
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedId(null);
    };
    window.addEventListener('keydown', closeOnEscape);

    return () => {
      document.body.classList.remove('modal-open');
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [selectedItem]);

  async function copyText(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopyLabel(label);
      window.setTimeout(() => setCopyLabel(''), 1600);
    } catch {
      setCopyLabel('복사 실패');
      window.setTimeout(() => setCopyLabel(''), 1600);
    }
  }

  function toggleFavorite(id: string) {
    setFavorites((current) => (
      current.includes(id)
        ? current.filter((favoriteId) => favoriteId !== id)
        : [...current, id]
    ));
  }

  return (
    <main className="app-shell">
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Luna Prompt Archive home">
          <span>LUNA</span>
          <b>PROMPT ARCHIVE</b>
        </a>
        <nav className="header-links" aria-label="바로가기">
          <a href="#gallery">Gallery</a>
          <a href="https://x.com/checheluna3" target="_blank" rel="noreferrer">𝕏 @checheluna3</a>
        </nav>
      </header>

      <section className="hero" id="top">
        <div className="hero-kicker">
          <span>01</span>
          <p>루나가 직접 만들고, 실패하고, 다시 다듬은 프롬프트 보관소</p>
        </div>
        <h1>
          장면이 먼저 보이는
          <span>프롬프트 갤러리.</span>
        </h1>
        <div className="hero-bottom">
          <p>
            인물 고정부터 푸드 ASMR, 캐릭터 시트, 공포 콘티까지.
            결과가 잘 나온 작업만 골라 원문과 수정 메모를 함께 모았습니다.
          </p>
          <div className="hero-counts" aria-label="아카이브 통계">
            <div><b>{promptItems.length}</b><span>prompts</span></div>
            <div><b>{categories.length - 1}</b><span>collections</span></div>
            <div><b>2026</b><span>archive</span></div>
          </div>
        </div>
      </section>

      <section className="gallery-tools" id="gallery">
        <label className="search-box">
          <span aria-hidden="true">⌕</span>
          <input
            value={query}
            onChange={(event: { target: { value: string } }) => setQuery(event.target.value)}
            placeholder="피코, CU, 파스타, 골든아워…"
            aria-label="프롬프트 검색"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} aria-label="검색어 지우기">×</button>
          )}
        </label>

        <div className="category-row" role="tablist" aria-label="프롬프트 카테고리">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={category === item}
              className={category === item ? 'category-chip active' : 'category-chip'}
              onClick={() => setCategory(item)}
            >
              {item}
              <span>
                {item === '전체'
                  ? promptItems.length
                  : promptItems.filter((prompt) => prompt.category === item).length}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="gallery-section" aria-live="polite">
        <div className="gallery-heading">
          <p>{category === '전체' ? 'ALL PROMPTS' : `${category.toUpperCase()} COLLECTION`}</p>
          <span>{filteredItems.length}개의 프롬프트</span>
        </div>

        {filteredItems.length > 0 ? (
          <div className="prompt-grid">
            {filteredItems.map((item, index) => (
              <article
                className={`prompt-card prompt-card--${item.size}${item.featured ? ' featured' : ''}`}
                key={item.id}
              >
                <button
                  className="card-open"
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  aria-label={`${item.title} 프롬프트 열기`}
                >
                  <PromptCover item={item} index={index} />
                  <div className="card-body">
                    <div className="card-meta">
                      <span>{item.category}</span>
                      <span>{item.ratio}</span>
                    </div>
                    <h2>{item.title}</h2>
                    <p>{item.description}</p>
                    <div className="card-footer">
                      <span>{item.tools.join(' · ')}</span>
                      <b aria-hidden="true">↗</b>
                    </div>
                  </div>
                </button>

                <button
                  className={favorites.includes(item.id) ? 'favorite-button active' : 'favorite-button'}
                  type="button"
                  onClick={() => toggleFavorite(item.id)}
                  aria-label={favorites.includes(item.id) ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                >
                  {favorites.includes(item.id) ? '♥' : '♡'}
                </button>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span>⌕</span>
            <h2>검색 결과가 없어요.</h2>
            <p>다른 장면이나 툴 이름으로 찾아보세요.</p>
            <button type="button" onClick={() => { setQuery(''); setCategory('전체'); }}>전체 보기</button>
          </div>
        )}
      </section>

      <footer className="site-footer">
        <div>
          <span>LUNA PROMPT ARCHIVE</span>
          <p>Made from LunaKim’s real prompt experiments.</p>
        </div>
        <a href="mailto:lunakimxx1@gmail.com">lunakimxx1@gmail.com</a>
      </footer>

      {selectedItem && (
        <div className="modal-layer" role="presentation">
          <button className="modal-backdrop" type="button" onClick={() => setSelectedId(null)} aria-label="닫기" />
          <section className="prompt-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div className="modal-topbar">
              <div className="modal-number">{String(promptItems.findIndex((item) => item.id === selectedItem.id) + 1).padStart(2, '0')}</div>
              <button className="modal-close" type="button" onClick={() => setSelectedId(null)} aria-label="프롬프트 닫기">×</button>
            </div>

            <div className="modal-layout">
              <aside className="modal-visual">
                <PromptCover item={selectedItem} index={0} large />
                <div className="modal-tags">
                  {selectedItem.tags.map((tag) => <span key={tag}>#{tag}</span>)}
                </div>
                <dl className="modal-specs">
                  <div><dt>TYPE</dt><dd>{selectedItem.category}</dd></div>
                  <div><dt>RATIO</dt><dd>{selectedItem.ratio}</dd></div>
                  <div><dt>TOOLS</dt><dd>{selectedItem.tools.join(', ')}</dd></div>
                  <div><dt>DATE</dt><dd>{selectedItem.year}</dd></div>
                </dl>
              </aside>

              <div className="modal-content">
                <p className="modal-eyebrow">{selectedItem.eyebrow}</p>
                <h2 id="modal-title">{selectedItem.title}</h2>
                <p className="modal-description">{selectedItem.description}</p>

                {selectedItem.note && <div className="archive-note"><b>LUNA NOTE</b><span>{selectedItem.note}</span></div>}

                <PromptBlock
                  label="IMAGE PROMPT"
                  text={selectedItem.prompt}
                  onCopy={() => copyText(selectedItem.prompt, '이미지 프롬프트 복사 완료')}
                />

                {selectedItem.videoPrompt && (
                  <PromptBlock
                    label="VIDEO PROMPT"
                    text={selectedItem.videoPrompt}
                    onCopy={() => copyText(selectedItem.videoPrompt ?? '', '영상 프롬프트 복사 완료')}
                  />
                )}

                <button
                  className="copy-all"
                  type="button"
                  onClick={() => copyText(
                    selectedItem.videoPrompt
                      ? `IMAGE PROMPT\n\n${selectedItem.prompt}\n\nVIDEO PROMPT\n\n${selectedItem.videoPrompt}`
                      : selectedItem.prompt,
                    '전체 복사 완료',
                  )}
                >
                  전체 프롬프트 복사
                  <span>⌘ C</span>
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {copyLabel && <div className="copy-toast" role="status">✓ {copyLabel}</div>}
    </main>
  );
}

function PromptCover({ item, index, large = false }: { item: PromptItem; index: number; large?: boolean }) {
  const detail = coverText[item.cover];
  const style = { '--delay': `${(index % 6) * 80}ms` } as CSSProperties;

  return (
    <div className={`prompt-cover cover--${item.cover}${large ? ' prompt-cover--large' : ''}`} style={style}>
      <div className="cover-grid" />
      <span className="cover-index">{String(promptItems.findIndex((prompt) => prompt.id === item.id) + 1).padStart(2, '0')}</span>
      <div className="cover-mark">{detail.mark}</div>
      <div className="cover-caption">
        <span>{detail.small}</span>
        <b>{item.ratio}</b>
      </div>
    </div>
  );
}

function PromptBlock({ label, text, onCopy }: { label: string; text: string; onCopy: () => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="prompt-block">
      <div className="prompt-block-head">
        <span>{label}</span>
        <div>
          <button type="button" onClick={() => setExpanded((current) => !current)}>
            {expanded ? '접기' : '펼치기'}
          </button>
          <button type="button" onClick={onCopy}>복사</button>
        </div>
      </div>
      <pre className={expanded ? 'expanded' : ''}>{text}</pre>
    </section>
  );
}

export default App;
