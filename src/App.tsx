import { useMemo, useState } from 'react';

import { Button } from '@astryxdesign/core/Button';

import './App.css';

type PromptSet = {
  image: string;
  video: string;
  camera: string;
  negative: string;
};

type PresetItem = {
  title: string;
  note: string;
  mood: string;
  scene: string;
  shotSize: string;
  angle: string;
  lens: string;
  light: string;
  ratio: string;
  motion: string;
  previewImage?: string;
  previewBadge?: string;
  imageFit?: 'cover' | 'contain';
  customPrompts?: PromptSet;
};

type PresetGroup = {
  category: string;
  items: PresetItem[];
};

const moods = [
  { label: '2007 디카 기억', emoji: '📸' },
  { label: '후지필름 감성', emoji: '🎞️' },
  { label: '청춘 로맨스', emoji: '🎞️' },
  { label: '여름밤 시네마', emoji: '🌙' },
  { label: 'AI 뮤직비디오', emoji: '🎤' },
  { label: '비 오는 창가', emoji: '🌧️' },
  { label: '치비 레진돌', emoji: '🧸' },
];

const scenes = [
  { label: '차 안', emoji: '🚗' },
  { label: '골목 산책', emoji: '🚶' },
  { label: '하교길', emoji: '🏫' },
  { label: '야간 복도', emoji: '🚪' },
  { label: '정류장', emoji: '🚏' },
  { label: '음악실', emoji: '🎹' },
  { label: '광화문 거리', emoji: '🇰🇷' },
  { label: '손바닥 위', emoji: '🤲' },
];

const shotSizes = [
  { label: '클로즈업', emoji: '👁️' },
  { label: '상반신 샷', emoji: '🧍' },
  { label: '미디엄샷', emoji: '🎬' },
  { label: '풀샷', emoji: '🚶' },
  { label: '와이드샷', emoji: '🏙️' },
  { label: '오버숄더', emoji: '🎥' },
];

const angles = [
  { label: '정면 시선', emoji: '👀' },
  { label: '살짝 측면', emoji: '↘️' },
  { label: '로우앵글', emoji: '⬆️' },
  { label: '하이앵글', emoji: '⬇️' },
  { label: '창밖 시점', emoji: '🪟' },
  { label: '전경 프레임', emoji: '🖼️' },
];

const lenses = [
  { label: '디카 렌즈 느낌', emoji: '📷' },
  { label: '35mm 자연 시야', emoji: '🎥' },
  { label: '50mm 인물 렌즈', emoji: '📸' },
  { label: '85mm 압축감', emoji: '🔭' },
  { label: '어안렌즈 감성', emoji: '🐟' },
  { label: '시네마 렌즈', emoji: '🎞️' },
];

const lights = [
  { label: '디카 직광 플래시', emoji: '⚡' },
  { label: '부드러운 창가빛', emoji: '🪟' },
  { label: '여름밤 가로등', emoji: '🌙' },
  { label: '네온 반사광', emoji: '💜' },
  { label: '노을 역광', emoji: '🌇' },
  { label: '교실 형광등', emoji: '💡' },
];

const ratios = [
  { label: '16:9 와이드 영상', emoji: '🎬' },
  { label: '9:16 세로 영상', emoji: '📱' },
  { label: '4:5 인스타샷', emoji: '🖼️' },
  { label: '5:5 X 썸네일', emoji: '⬜' },
];

const motions = [
  { label: '고정샷', emoji: '📍' },
  { label: '느린 줌인', emoji: '🌀' },
  { label: '손에 들고 찍은 느낌', emoji: '🎥' },
  { label: '작은 시선 변화', emoji: '👀' },
  { label: '신나게 연주', emoji: '🥁' },
  { label: '바람에 흔들림', emoji: '🍃' },
];

const confessionAfterSchoolPrompts: PromptSet = {
  image: `16:9 와이드 영상 비율. 청춘 로맨스 감성의 하교길 장면. 노을이 지는 조용한 한국 골목길. 두 고등학생이 함께 걷다가 잠시 멈춘 순간이다. 남학생은 한 걸음 뒤에서 여학생을 바라보며 무언가 말하려는 듯 살짝 망설인다. 손은 주머니에 넣지 않고 가방끈을 가볍게 잡거나 손끝을 긴장한 듯 모은다. 여학생은 반 걸음 앞에서 돌아보며 남학생을 올려다본다. 표정은 밝게 웃기보다, 예상한 듯하면서도 살짝 놀란 부드러운 표정. 두 사람 사이에는 손이 닿을 듯 닿지 않는 작은 거리감이 있다.

50mm 인물 렌즈, 미디엄샷, 살짝 측면, 노을 역광. 배경은 부드럽게 흐리고, 두 인물의 눈빛과 침묵이 먼저 보이게 한다. 과한 포즈 없이, 고백 직전의 조용한 떨림이 느껴지는 영상 첫 프레임. 자연스러운 한국 교복 감성과 헤어스타일, 학생다운 백팩 디테일을 유지한다.`,
  video: `6초 영상. 청춘 로맨스 감성의 하교길 장면. 노을이 지는 조용한 한국 골목길에서 두 고등학생이 함께 걷다가 자연스럽게 속도를 늦추고 잠시 멈춘다. 남학생은 반 걸음 뒤에서 여학생을 바라보며 무언가 말하려는 듯 망설인다. 손은 주머니에 넣지 않고 가방끈을 가볍게 잡거나 손끝을 작게 만지작거린다. 여학생은 반 걸음 앞에서 돌아보며 남학생을 올려다본다. 표정은 환하게 웃기보다, 예상한 듯하면서도 살짝 놀란 부드러운 표정이다. 두 사람 사이에는 손이 닿을 듯 닿지 않는 작은 거리감을 남긴다.

카메라는 50mm 인물 렌즈 느낌의 미디엄샷, 살짝 측면 구도, 노을 역광. 아주 느린 움직임만 사용하고, 작은 시선 변화와 숨결, 머리카락의 미세한 흔들림 정도만 담는다. 배경은 부드럽게 흐리고 두 인물의 눈빛과 조용한 긴장감이 먼저 보이게 한다. 과한 연기 없이, 고백 직전의 조용한 떨림이 느껴지는 첫 장면처럼 만든다.`,
  camera: `50mm 인물 렌즈. 미디엄샷. 살짝 측면. 노을 역광. 16:9 와이드 영상. 조용한 한국 골목길에서 두 고등학생의 눈빛과 침묵을 먼저 보이게 한다. 배경은 부드럽게 흐리고, 두 사람 사이의 작고 어색한 거리감을 살린다. 과한 로맨스 포즈보다 멈칫하는 호흡과 시선 변화를 우선한다.`,
  negative: `hand holding, kiss, hug, exaggerated romance pose, overacting, dramatic tears, broken text, distorted hands, extra fingers, duplicated people, face change, plastic skin, awkward pose, fast zoom, camera shake`,
};

const digicamCarNightPrompts: PromptSet = {
  image: `5:5 X 썸네일 비율. 업로드한 얼굴 레퍼런스를 기준으로, 인물의 얼굴 느낌과 헤어를 자연스럽게 유지한다. 2007 디카 기억 감성에, 더 세련된 도심 야경 무드를 더한 차 안 장면. 인물은 밤의 도시 불빛이 보이는 차창 옆 뒷좌석에 자연스럽게 앉아 있다. 미디엄 클로즈업, 살짝 측면, 앞좌석 쪽에서 찍은 시선, 전경 프레임은 아주 가볍게만 들어온다. 창밖에는 노란 가로등, 빨간 브레이크등, 흰 도로 조명이 둥글게 번진 도시 보케가 보인다. 디카 직광 플래시가 얼굴과 상체를 또렷하게 밝히고, 배경은 어둡고 깊게 남긴다. 인물은 과하게 포즈를 취하지 않고, 카메라를 방금 알아챈 듯한 작은 미소와 차분한 눈빛을 유지한다. 피부는 과보정 없이 자연스럽게, 살짝 거친 디지털 노이즈와 부드러운 그레인을 남긴다. 웹앱 대표 이미지로 쓰기 좋은, 깔끔하고 예쁜 첫 프레임.`,
  video: `6초 영상. 카메라는 앞좌석 쪽에서 손에 든 작은 디카처럼 아주 미세하게 움직인다. 인물은 차창 옆 뒷좌석에 앉아 창밖 도심 불빛을 잠깐 바라보다가 카메라 쪽으로 시선을 옮긴다. 미디엄샷에서 작은 표정 변화만 담고, 과한 손동작이나 포즈는 피한다. 창밖 도시 불빛 보케와 차 안의 어두운 공기가 함께 살아 있어야 한다. 갑작스러운 줌, 과한 시점 이동, 불필요한 연기는 피한다.`,
  camera: `디카 렌즈 느낌. 미디엄 클로즈업. 살짝 측면. 5:5 X 썸네일. 앞좌석 사이 또는 앞좌석 옆에서 뒷좌석을 찍는 시선. direct flash + soft ambient night light. 얼굴과 눈은 또렷하게 잡고, 차 안은 적당히 어둡게 남긴다. 창밖 도심 야경 보케를 살리고, 전경 프레임은 아주 가볍게만 넣는다. 큰 헤드레스트나 넓은 회색 시트가 화면을 과하게 차지하지 않게 한다. 인물과 배경의 거리감이 느껴지게 하고, 시선은 자연스럽게 얼굴로 모이게 한다.`,
  negative: `front headrest blocking face, flat gray seat dominant background, empty dull car interior, overacting, glam pose, luxury editorial studio look, plastic skin, over-smoothed skin, heavy beauty retouching, distorted hands, extra fingers, broken fingers, unreadable text, face change, duplicated person, warped car interior, excessive blur, fast zoom, camera shake, harsh HDR, watermark, logo`,
};

const presetGroups: PresetGroup[] = [
  {
    category: '치비이미지',
    items: [
      {
        title: '볼꼬집 미니 치비',
        note: '손가락으로 볼을 살짝 꼬집는 귀여운 프사형 치비 컷',
        mood: '치비 레진돌',
        scene: '손바닥 위',
        shotSize: '상반신 샷',
        angle: '정면 시선',
        lens: '50mm 인물 렌즈',
        light: '부드러운 창가빛',
        ratio: '5:5 X 썸네일',
        motion: '작은 시선 변화',
        previewImage: '/public:presets:chibi-resin-doll.png.PNG',
        previewBadge: 'CHIBI RESIN',
        imageFit: 'contain',
      },
    ],
  },
  {
    category: '후지필름',
    items: [
      {
        title: '후지필름 감성',
        note: '차분한 필름 색감으로 실사 스냅과 청춘 애니 무드를 선택하는 프리셋',
        mood: '후지필름 감성',
        scene: '골목 산책',
        shotSize: '상반신 샷',
        angle: '살짝 측면',
        lens: '35mm 자연 시야',
        light: '노을 역광',
        ratio: '4:5 인스타샷',
        motion: '손에 들고 찍은 느낌',
        previewImage: '/publicpresetsfuji-real-snap.png',
        previewBadge: 'FUJI REAL',
        imageFit: 'cover',
      },
    ],
  },
  {
    category: '로맨스',
    items: [
      {
        title: '고백 직전 하교길',
        note: '서로 의식하지만 쉽게 다가가지 못하는 청춘 로맨스 장면',
        mood: '청춘 로맨스',
        scene: '하교길',
        shotSize: '미디엄샷',
        angle: '살짝 측면',
        lens: '50mm 인물 렌즈',
        light: '노을 역광',
        ratio: '16:9 와이드 영상',
        motion: '작은 시선 변화',
        previewImage: '/presets/confession-after-school-walk.png',
        previewBadge: 'ROMANCE',
        imageFit: 'cover',
        customPrompts: confessionAfterSchoolPrompts,
      },
      {
        title: '여름밤 정류장',
        note: '말없이 시선만 오가는 첫사랑 시네마 컷',
        mood: '여름밤 시네마',
        scene: '정류장',
        shotSize: '상반신 샷',
        angle: '정면 시선',
        lens: '50mm 인물 렌즈',
        light: '여름밤 가로등',
        ratio: '9:16 세로 영상',
        motion: '바람에 흔들림',
      },
    ],
  },
  {
    category: '디카감성',
    items: [
      {
        title: '2007 차 안 디카',
        note: '도심 야경, 디카 플래시, Y2K 기억 컷',
        mood: '2007 디카 기억',
        scene: '차 안',
        shotSize: '미디엄샷',
        angle: '전경 프레임',
        lens: '디카 렌즈 느낌',
        light: '디카 직광 플래시',
        ratio: '5:5 X 썸네일',
        motion: '손에 들고 찍은 느낌',
        previewImage: '/presets/digicam/2007-car-night-thumb.png',
        previewBadge: 'DIGICAM',
        imageFit: 'cover',
        customPrompts: digicamCarNightPrompts,
      },
      {
        title: '디카 플래시 인물샷',
        note: '살짝 흔들린 오래된 compact camera 분위기',
        mood: '2007 디카 기억',
        scene: '정류장',
        shotSize: '클로즈업',
        angle: '살짝 측면',
        lens: '디카 렌즈 느낌',
        light: '디카 직광 플래시',
        ratio: '4:5 인스타샷',
        motion: '손에 들고 찍은 느낌',
      },
    ],
  },
  {
    category: '뮤직비디오',
    items: [
      {
        title: '음악실 밴드 와이드',
        note: '단체가 흔들리지 않는 안정적인 공연 컷',
        mood: 'AI 뮤직비디오',
        scene: '음악실',
        shotSize: '와이드샷',
        angle: '정면 시선',
        lens: '35mm 자연 시야',
        light: '교실 형광등',
        ratio: '16:9 와이드 영상',
        motion: '신나게 연주',
      },
      {
        title: '보컬 클로즈업',
        note: '립싱크보다 표정과 무드를 살리는 세로 컷',
        mood: 'AI 뮤직비디오',
        scene: '음악실',
        shotSize: '클로즈업',
        angle: '살짝 측면',
        lens: '85mm 압축감',
        light: '네온 반사광',
        ratio: '9:16 세로 영상',
        motion: '느린 줌인',
      },
    ],
  },
  {
    category: '거리',
    items: [
      {
        title: '광화문 응원 와이드',
        note: '창문 반사 반복을 줄이고 현장감만 살리는 응원 장면',
        mood: '비 오는 창가',
        scene: '광화문 거리',
        shotSize: '와이드샷',
        angle: '로우앵글',
        lens: '35mm 자연 시야',
        light: '여름밤 가로등',
        ratio: '16:9 와이드 영상',
        motion: '고정샷',
      },
      {
        title: '도시 골목 인물샷',
        note: '네온 반사광과 거리 여백을 살리는 한국 감성 컷',
        mood: '여름밤 시네마',
        scene: '정류장',
        shotSize: '상반신 샷',
        angle: '전경 프레임',
        lens: '50mm 인물 렌즈',
        light: '네온 반사광',
        ratio: '4:5 인스타샷',
        motion: '작은 시선 변화',
      },
    ],
  },
  {
    category: '카메라공부',
    items: [
      {
        title: '50mm 인물 연습',
        note: '배경 정리와 인물 거리감을 배우는 세팅',
        mood: '청춘 로맨스',
        scene: '하교길',
        shotSize: '상반신 샷',
        angle: '정면 시선',
        lens: '50mm 인물 렌즈',
        light: '부드러운 창가빛',
        ratio: '4:5 인스타샷',
        motion: '고정샷',
      },
      {
        title: '85mm 압축감 연습',
        note: '배경을 눌러 보이게 만드는 렌즈 감각 연습',
        mood: '여름밤 시네마',
        scene: '정류장',
        shotSize: '클로즈업',
        angle: '살짝 측면',
        lens: '85mm 압축감',
        light: '여름밤 가로등',
        ratio: '9:16 세로 영상',
        motion: '느린 줌인',
      },
    ],
  },
];

const allPresetItems = presetGroups.flatMap((group) => group.items);

function getPresetType(category: string) {
  if (category === '치비이미지' || category === '후지필름') return 'Image Prompt';
  if (category === '뮤직비디오') return 'Video Prompt';
  return 'Scene Prompt';
}

function getPresetBestFor(category: string) {
  if (category === '치비이미지') return 'X Profile / Avatar';
  if (category === '후지필름') return 'SNS Film Snap';
  if (category === '디카감성') return 'SNS Photo';
  if (category === '로맨스') return 'Story Scene';
  if (category === '뮤직비디오') return 'Music Video';
  return 'Creator Shot';
}

export default function App() {
  const [copyStatus, setCopyStatus] = useState('');
  const [mood, setMood] = useState('2007 디카 기억');
  const [scene, setScene] = useState('차 안');
  const [shotSize, setShotSize] = useState('미디엄샷');
  const [angle, setAngle] = useState('전경 프레임');
  const [lens, setLens] = useState('디카 렌즈 느낌');
  const [light, setLight] = useState('디카 직광 플래시');
  const [ratio, setRatio] = useState('5:5 X 썸네일');
  const [motion, setMotion] = useState('손에 들고 찍은 느낌');
  const [activeCategory, setActiveCategory] = useState('치비이미지');
  const [copied, setCopied] = useState(false);

  const activePresetGroup = presetGroups.find((group) => group.category === activeCategory) ?? presetGroups[0];

  const prompts = useMemo(() => {
    const matchedCustomPreset = allPresetItems.find((preset) => (
      preset.customPrompts &&
      preset.mood === mood &&
      preset.scene === scene &&
      preset.shotSize === shotSize &&
      preset.angle === angle &&
      preset.lens === lens &&
      preset.light === light &&
      preset.ratio === ratio &&
      preset.motion === motion
    ));

    if (matchedCustomPreset?.customPrompts) {
      return matchedCustomPreset.customPrompts;
    }

    const isChibi = mood.includes('치비') || scene === '손바닥 위';
    const isFuji = mood.includes('후지필름');

    if (isChibi) {
      return {
        image: `Use the uploaded profile photo as the only identity reference. Preserve the person’s recognizable face shape, eye shape, nose, lips, hairstyle, skin tone, age impression, expression, and overall mood. Create a cute chibi resin art doll version of the person, ${ratio} composition, ${scene} scene, ${shotSize}, ${angle}, ${lens}, ${light}. The doll should feel like a polished collectible profile image, with a small rounded body, glossy resin texture, soft cheeks, clean details, and a charming but not over-beautified look.`,
        video: `For image generation first. If used for video later, keep the chibi character still and cute with ${motion}. Avoid excessive movement, face changes, blinking glitches, or unstable hands.`,
        camera: `${lens}. ${shotSize}. ${angle}. ${light}. Keep the face readable, centered, and suitable for a profile image. Prioritize identity preservation over stylization.`,
        negative: `different person, face change, over-beautified face, adult body proportions, realistic human body, extra fingers, distorted hands, melted resin, broken eyes, unreadable text, bad anatomy, duplicate face, plastic skin, creepy doll, harsh shadows`,
      };
    }

    if (isFuji) {
      return {
        image: `${ratio}. Fujifilm X100V inspired Korean street snapshot. ${scene}, ${shotSize}, ${angle}, ${lens}, ${light}. Natural skin texture, realistic face proportions, muted greens and blues, slightly faded highlights, low contrast, gentle film grain, calm everyday mood. The person should look natural, not over-beautified, and not like a studio portrait.`,
        video: `6초 영상. 실제 카메라로 찍은 거리 스냅처럼 자연스럽게 진행한다. 카메라는 ${motion}으로 움직이고, 후지필름 느낌의 차분한 색감, 낮은 대비, 은은한 필름 그레인을 유지한다. 연기, 포즈, 표정은 모두 과하지 않게 둔다.`,
        camera: `Fujifilm X100V style. ${lens}. ${shotSize}. ${angle}. ${light}. Keep realistic skin texture, soft daylight, muted colors, faded highlights, low contrast, gentle film grain.`,
        negative: `anime, illustration, manga line art, webtoon style, doll face, plastic skin, over-beautified face, oversaturated colors, excessive contrast, harsh sharpening, extra fingers, distorted hands, unreadable text, awkward pose, fake bokeh`,
      };
    }

    return {
      image: `${ratio} 비율. ${mood} 감성의 ${scene} 장면. ${shotSize} 구도, ${angle}, ${lens}, ${light}. 인물은 과하게 포즈를 취하지 않고, 자연스러운 한국 감성과 부드러운 빛을 유지한다. 영상 첫 프레임으로 쓰기 좋은 이미지.`,
      video: `6초 영상. 카메라는 ${motion}을 중심으로 움직인다. ${shotSize}에서 인물의 작은 반응을 잡고, ${angle}을 유지한다. 갑작스러운 줌, 불필요한 손동작, 과한 표정 연기는 피한다.`,
      camera: `${lens}. ${shotSize}. ${angle}. ${light}. ${ratio}. 인물과 배경의 깊이감을 살리고, 장면 안의 여백과 시선을 정리한다. 프레임 안의 텍스트나 이름표는 흔들리지 않게 한다.`,
      negative: `extra fingers, distorted hands, unreadable text, broken name tags, sudden hand holding, overacting, fast zoom, camera shake, duplicated crowd, face change, plastic skin, awkward pose`,
    };
  }, [mood, scene, shotSize, angle, lens, light, ratio, motion]);

  const fullPrompt = useMemo(() => {
    return `IMAGE PROMPT\n\n${prompts.image}\n\nVIDEO PROMPT\n\n${prompts.video}\n\nCAMERA NOTE\n\n${prompts.camera}\n\nNEGATIVE PROMPT\n\n${prompts.negative}`;
  }, [prompts]);

  async function copyPrompt() {
    await navigator.clipboard.writeText(fullPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function applyPreset(preset: PresetItem) {
    setMood(preset.mood);
    setScene(preset.scene);
    setShotSize(preset.shotSize);
    setAngle(preset.angle);
    setLens(preset.lens);
    setLight(preset.light);
    setRatio(preset.ratio);
    setMotion(preset.motion);
  }

  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent('lunakimxx1@gmail.com')}&su=${encodeURIComponent('Luna Prompt Studio 협업 문의')}`;

  return (
    <main className="page">
      <section className="heroGrid">
        <div className="heroCopy">
          <p className="badge">CREATOR TOOL · ASTRYX Y2K THEME</p>
          <h1>Luna Prompt Studio</h1>
          <p className="lead">
            프롬프트를 감으로 쓰지 말고, 무드·렌즈·조명·움직임으로 설계하세요.
            치비 프사, 디카 감성, 뮤직비디오, 로맨스 장면까지 바로 복사 가능한 프롬프트로 정리합니다.
          </p>
          <div className="heroActions">
            <a className="ghostButton" href={gmailUrl} target="_blank" rel="noreferrer">
              Gmail 문의 : lunakimxx1@gmail.com
            </a>
            <a className="xButton" href="https://x.com/checheluna3" target="_blank" rel="noreferrer">
              𝕏프로필 보기
            </a>
          </div>
        </div>

        <aside className="directorCard">
          <div className="directorText">
            <p className="bubble">LUNA PROMPT STUDIO</p>
            <h2>Luna Director</h2>
            <p>움직이는 루나가 장면을 고르고, 카메라 언어를 프롬프트로 바꿔요.</p>
            <span>Preset · Studio · Shot · Lens · Light</span>
          </div>
          <div className="videoFrame">
            <video src="/luna-main.mp4" autoPlay muted loop playsInline aria-label="Luna animated character" />
          </div>
        </aside>
      </section>

      <section className="presetPanel presetPanelPriority">
        <p className="kicker">DIRECTOR PRESETS</p>
        <h2>Preset Library</h2>
        <p className="presetHelp">처음이라면 여기서 시작하세요. 완성된 프리셋을 고르면 프롬프트가 바로 채워지고, 아래에서 직접 조합도 이어갈 수 있어요.</p>
        {activeCategory === '치비이미지' && (
          <p className="chibiNotice">
            프로필 사진을 치비 이미지로 만들기 위한 프롬프트를 생성합니다. 실제 이미지는 외부 AI 이미지 툴에서 생성하세요.
          </p>
        )}
        <div className="presetTabs">
          {presetGroups.map((group) => (
            <button
              key={group.category}
              className={group.category === activeCategory ? 'presetTab active' : 'presetTab'}
              type="button"
              onClick={() => setActiveCategory(group.category)}
            >
              {group.category}
            </button>
          ))}
        </div>

        <div className="presetList">
          {activePresetGroup.items.map((preset) => (
            <button key={preset.title} className="presetButton" type="button" onClick={() => applyPreset(preset)}>
              {preset.previewImage && (
                <div className={`presetThumb nativePresetThumb ${preset.imageFit === 'contain' ? 'contain' : 'cover'}`}>
                  <img src={preset.previewImage} alt={preset.title} loading="eager" />
                  {preset.previewBadge && <em>{preset.previewBadge}</em>}
                </div>
              )}
              <strong>{preset.title}</strong>
              <span>{preset.note}</span>
              <div className="presetMetaGrid">
                <span><b>TYPE</b>{getPresetType(activeCategory)}</span>
                <span><b>BEST FOR</b>{getPresetBestFor(activeCategory)}</span>
                <span><b>RATIO</b>{preset.ratio}</span>
              </div>
              <small>{preset.mood} · {preset.lens}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="howGrid" aria-label="How it works">
        <article className="howCard">
          <span>01</span>
          <strong>프리셋 선택</strong>
          <p>치비이미지, 후지필름, 디카감성, 로맨스, 뮤직비디오 중 원하는 장면을 먼저 고릅니다.</p>
        </article>
        <article className="howCard">
          <span>02</span>
          <strong>세부 조정</strong>
          <p>무드, 렌즈, 조명, 비율, 움직임을 원하는 스타일로 조절합니다.</p>
        </article>
        <article className="howCard">
          <span>03</span>
          <strong>프롬프트 복사</strong>
          <p>완성된 프롬프트를 ChatGPT, Midjourney, Grok, Gemini 등에 붙여넣습니다.</p>
        </article>
      </section>

      <section className="benefitSection" aria-label="Creator benefits">
        <div className="benefitHeader">
          <p className="kicker">WHY USE THIS KIT</p>
          <h2>프롬프트 작업을 더 빠르고 안정적으로</h2>
        </div>
        <div className="benefitGrid">
          <article className="benefitCard">
            <span>01</span>
            <strong>프롬프트 시간을 줄입니다</strong>
            <p>매번 처음부터 쓰지 않고, 프리셋으로 빠르게 시작한 뒤 필요한 부분만 조정합니다.</p>
          </article>
          <article className="benefitCard">
            <span>02</span>
            <strong>카메라 언어로 정리합니다</strong>
            <p>무드, 렌즈, 조명, 움직임을 나눠서 이미지와 영상 결과물을 더 안정적으로 만듭니다.</p>
          </article>
          <article className="benefitCard">
            <span>03</span>
            <strong>여러 AI 툴에 바로 씁니다</strong>
            <p>ChatGPT, Grok, Gemini, Midjourney, 이미지 생성 툴에 붙여넣기 좋은 형태로 정리합니다.</p>
          </article>
        </div>
      </section>

      <section className="mainGrid">
        <div className="builderPanel">
          <Picker title="무드" items={moods} value={mood} onChange={setMood} />
          <Picker title="장면" items={scenes} value={scene} onChange={setScene} />
          <Picker title="샷 크기" items={shotSizes} value={shotSize} onChange={setShotSize} />
          <Picker title="앵글" items={angles} value={angle} onChange={setAngle} />
          <Picker title="렌즈" items={lenses} value={lens} onChange={setLens} />
          <Picker title="조명" items={lights} value={light} onChange={setLight} />
          <Picker title="비율" items={ratios} value={ratio} onChange={setRatio} />
          <Picker title="움직임" items={motions} value={motion} onChange={setMotion} />
        </div>

        <div className="resultPanel">
          <div className="scenePreview">
            <div className="previewIcon" />
            <div>
              <p className="kicker">SCENE PREVIEW</p>
              <strong>{mood} · {scene}</strong>
              <span>{shotSize} / {angle} / {lens} / {light}</span>
            </div>
          </div>

          <div>
            <p className="kicker">OUTPUT BOARD</p>
            <h2>Prompt Output Board</h2>
            <p className="outputHelp">
              선택한 프리셋과 카메라 설정을 바탕으로 이미지용, 영상용, 카메라 노트, 네거티브 프롬프트를 한 번에 정리합니다.
            </p>
            <div className="outputPills" aria-label="Output features">
              <span>Image Prompt</span>
              <span>Video Prompt</span>
              <span>Camera Note</span>
              <span>Negative Prompt</span>
            </div>
          </div>

          <div className="promptGrid">
            <PromptCard title="IMAGE PROMPT" body={prompts.image} />
            <PromptCard title="VIDEO PROMPT" body={prompts.video} />
            <PromptCard title="CAMERA NOTE" body={prompts.camera} />
            <PromptCard title="NEGATIVE PROMPT" body={prompts.negative} />
          </div>

          <div className="actions">
            <Button label="전체 프롬프트 복사 ✨" onClick={() => { copyPrompt(); setCopyStatus('복사 완료'); window.setTimeout(() => setCopyStatus(''), 1600); }} />
            {copied && <span className="copied">복사됐어요 💫</span>}
          </div>
          {copyStatus && <p className="copyStatus">✓ 복사 완료. 원하는 AI 툴에 붙여넣으세요.</p>}

          <section className="promptGuideReal" aria-label="Prompt recipe guide">
            <div className="promptGuideTop">
              <span>GUIDE</span>
              <strong>복사 후 사용 순서</strong>
            </div>
            <div className="promptGuideSteps">
              <article>
                <b>01</b>
                <div>
                  <strong>이미지 생성</strong>
                  <p>Image Prompt를 먼저 붙여넣고, 마지막에 Negative Prompt를 추가하세요.</p>
                </div>
              </article>
              <article>
                <b>02</b>
                <div>
                  <strong>영상 생성</strong>
                  <p>Video Prompt와 Camera Note를 함께 넣으면 움직임과 렌즈가 더 안정적입니다.</p>
                </div>
              </article>
              <article>
                <b>03</b>
                <div>
                  <strong>실패 방지</strong>
                  <p>손 오류, 깨진 글자, 과한 줌은 Negative Prompt로 눌러주세요.</p>
                </div>
              </article>
            </div>
          </section>
        </div>
      </section>

      <section className="bottomGrid buildNotesBottom">
        <div className="astryxPanel">
          <p className="kicker">TOOL INFO</p>
          <h2>What this tool gives you</h2>
          <div className="specGrid">
            <div><span>Image Prompt</span><strong>Copy-ready scenes</strong></div>
            <div><span>Video Prompt</span><strong>Motion-ready notes</strong></div>
            <div><span>Camera Language</span><strong>Lens · Light · Angle</strong></div>
            <div><span>Creator Workflow</span><strong>Fast prompt planning</strong></div>
          </div>
          <div className="codeCard">
            <code>Image Prompt</code>
            <code>Video Prompt</code>
            <code>Camera Note</code>
            <code>Negative Prompt</code>
          </div>
        </div>
      </section>
    </main>
  );
}

function Picker({
  title,
  items,
  value,
  onChange,
}: {
  title: string;
  items: { label: string; emoji: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <article className="picker">
      <h2>{title}</h2>
      <div className="chips">
        {items.map((item) => (
          <button key={item.label} className={item.label === value ? 'chip active' : 'chip'} type="button" onClick={() => onChange(item.label)}>
            <span>{item.emoji}</span>
            {item.label}
          </button>
        ))}
      </div>
    </article>
  );
}

function PromptCard({ title, body }: { title: string; body: string }) {
  return (
    <article className="promptCard">
      <span>{title}</span>
      <p>{body}</p>
    </article>
  );
}
