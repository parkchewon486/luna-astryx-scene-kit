import { useMemo, useState } from 'react';
import { Button } from '@astryxdesign/core/Button';
import './App.css';

const moods = [
  { label: '2007 디카 기억', emoji: '📸' },
  { label: '청춘 로맨스', emoji: '🎞️' },
  { label: '여름밤 시네마', emoji: '🌙' },
  { label: 'AI 뮤직비디오', emoji: '🎤' },
  { label: '뚱냥상사 일상', emoji: '🐾' },
  { label: '월드컵 응원', emoji: '🇰🇷' },
];

const scenes = [
  { label: '차 안', emoji: '🚗' },
  { label: '하교길', emoji: '🏫' },
  { label: '야간 복도', emoji: '🚪' },
  { label: '정류장', emoji: '🚏' },
  { label: '음악실', emoji: '🎹' },
  { label: '광화문 거리', emoji: '🇰🇷' },
  { label: '사무실', emoji: '🏢' },
  { label: '대학로 호프집', emoji: '🍻' },
];

const shotSizes = [
  { label: '클로즈업', emoji: '🔍' },
  { label: '미디엄샷', emoji: '🧍' },
  { label: '풀샷', emoji: '🖼️' },
  { label: '와이드샷', emoji: '🎬' },
  { label: '공간 설명샷', emoji: '🏙️' },
];

const angles = [
  { label: '눈높이 시점', emoji: '👁️' },
  { label: '로우앵글', emoji: '⬆️' },
  { label: '하이앵글', emoji: '⬇️' },
  { label: '어깨너머샷', emoji: '👥' },
  { label: '뒷모습 구도', emoji: '🚶' },
  { label: '전경 프레임', emoji: '🖼️' },
];

const lenses = [
  { label: '24mm 와이드', emoji: '🌐' },
  { label: '35mm 자연 시야', emoji: '🎥' },
  { label: '50mm 인물 렌즈', emoji: '📷' },
  { label: '85mm 압축감', emoji: '🔭' },
  { label: '디카 렌즈 느낌', emoji: '📸' },
];

const lightings = [
  { label: '디카 직광 플래시', emoji: '⚡' },
  { label: '골든아워', emoji: '🌅' },
  { label: '창가 자연광', emoji: '🪟' },
  { label: '네온 밤빛', emoji: '🌃' },
  { label: '차가운 청색 스포트라이트', emoji: '🔦' },
  { label: '부드러운 실내광', emoji: '💡' },
];

const movements = [
  { label: '고정샷', emoji: '📍' },
  { label: '느린 줌인', emoji: '🌀' },
  { label: '손持 카메라 느낌', emoji: '🎥' },
  { label: '트래킹샷', emoji: '👣' },
  { label: '작은 시선 변화', emoji: '👀' },
  { label: '바람에 흔들림', emoji: '🍃' },
  { label: '신나게 연주', emoji: '🥁' },
];

const ratios = [
  { label: '16:9 와이드 영상', emoji: '🎬' },
  { label: '9:16 세로 영상', emoji: '📱' },
  { label: '4:5 인스타샷', emoji: '🖼️' },
  { label: '5:5 X 썸네일', emoji: '⬜' },
];

type Preset = {
  name: string;
  mood: string;
  scene: string;
  shotSize: string;
  angle: string;
  lens: string;
  lighting: string;
  movement: string;
  ratio: string;
};

const presetCategories: { category: string; items: Preset[] }[] = [
  {
    category: '로맨스',
    items: [
      {
        name: '첫사랑 하교길',
        mood: '청춘 로맨스',
        scene: '하교길',
        shotSize: '와이드샷',
        angle: '눈높이 시점',
        lens: '35mm 자연 시야',
        lighting: '골든아워',
        movement: '작은 시선 변화',
        ratio: '16:9 와이드 영상',
      },
      {
        name: '야자 끝난 복도',
        mood: '청춘 로맨스',
        scene: '야간 복도',
        shotSize: '미디엄샷',
        angle: '어깨너머샷',
        lens: '50mm 인물 렌즈',
        lighting: '부드러운 실내광',
        movement: '느린 줌인',
        ratio: '16:9 와이드 영상',
      },
      {
        name: '고백 직전 정류장',
        mood: '여름밤 시네마',
        scene: '정류장',
        shotSize: '미디엄샷',
        angle: '눈높이 시점',
        lens: '50mm 인물 렌즈',
        lighting: '네온 밤빛',
        movement: '작은 시선 변화',
        ratio: '16:9 와이드 영상',
      },
      {
        name: '어깨너머 대화샷',
        mood: '청춘 로맨스',
        scene: '하교길',
        shotSize: '미디엄샷',
        angle: '어깨너머샷',
        lens: '50mm 인물 렌즈',
        lighting: '골든아워',
        movement: '고정샷',
        ratio: '16:9 와이드 영상',
      },
    ],
  },
  {
    category: '디카감성',
    items: [
      {
        name: '2007 차 안 디카',
        mood: '2007 디카 기억',
        scene: '차 안',
        shotSize: '미디엄샷',
        angle: '전경 프레임',
        lens: '디카 렌즈 느낌',
        lighting: '디카 직광 플래시',
        movement: '손持 카메라 느낌',
        ratio: '5:5 X 썸네일',
      },
      {
        name: '대학로 호프집 직광',
        mood: '2007 디카 기억',
        scene: '대학로 호프집',
        shotSize: '와이드샷',
        angle: '눈높이 시점',
        lens: '디카 렌즈 느낌',
        lighting: '디카 직광 플래시',
        movement: '손持 카메라 느낌',
        ratio: '5:5 X 썸네일',
      },
      {
        name: '전경 프레임 LCD샷',
        mood: '2007 디카 기억',
        scene: '차 안',
        shotSize: '미디엄샷',
        angle: '전경 프레임',
        lens: '디카 렌즈 느낌',
        lighting: '디카 직광 플래시',
        movement: '고정샷',
        ratio: '16:9 와이드 영상',
      },
      {
        name: 'MT 펜션 플래시',
        mood: '2007 디카 기억',
        scene: '사무실',
        shotSize: '와이드샷',
        angle: '눈높이 시점',
        lens: '디카 렌즈 느낌',
        lighting: '디카 직광 플래시',
        movement: '손持 카메라 느낌',
        ratio: '5:5 X 썸네일',
      },
    ],
  },
  {
    category: '뮤직비디오',
    items: [
      {
        name: '음악실 밴드 와이드',
        mood: 'AI 뮤직비디오',
        scene: '음악실',
        shotSize: '와이드샷',
        angle: '눈높이 시점',
        lens: '24mm 와이드',
        lighting: '골든아워',
        movement: '신나게 연주',
        ratio: '16:9 와이드 영상',
      },
      {
        name: '드럼 클로즈업',
        mood: 'AI 뮤직비디오',
        scene: '음악실',
        shotSize: '클로즈업',
        angle: '로우앵글',
        lens: '50mm 인물 렌즈',
        lighting: '차가운 청색 스포트라이트',
        movement: '신나게 연주',
        ratio: '9:16 세로 영상',
      },
      {
        name: '기타 솔로 로우앵글',
        mood: 'AI 뮤직비디오',
        scene: '음악실',
        shotSize: '미디엄샷',
        angle: '로우앵글',
        lens: '35mm 자연 시야',
        lighting: '차가운 청색 스포트라이트',
        movement: '느린 줌인',
        ratio: '9:16 세로 영상',
      },
      {
        name: '마지막 단체샷',
        mood: 'AI 뮤직비디오',
        scene: '음악실',
        shotSize: '와이드샷',
        angle: '눈높이 시점',
        lens: '24mm 와이드',
        lighting: '골든아워',
        movement: '고정샷',
        ratio: '16:9 와이드 영상',
      },
    ],
  },
  {
    category: '거리',
    items: [
      {
        name: '광화문 월드컵 응원',
        mood: '월드컵 응원',
        scene: '광화문 거리',
        shotSize: '와이드샷',
        angle: '눈높이 시점',
        lens: '35mm 자연 시야',
        lighting: '네온 밤빛',
        movement: '트래킹샷',
        ratio: '16:9 와이드 영상',
      },
      {
        name: '도시 네온 스냅',
        mood: '여름밤 시네마',
        scene: '광화문 거리',
        shotSize: '미디엄샷',
        angle: '눈높이 시점',
        lens: '85mm 압축감',
        lighting: '네온 밤빛',
        movement: '느린 줌인',
        ratio: '9:16 세로 영상',
      },
      {
        name: '정류장 밤공기',
        mood: '여름밤 시네마',
        scene: '정류장',
        shotSize: '와이드샷',
        angle: '뒷모습 구도',
        lens: '35mm 자연 시야',
        lighting: '네온 밤빛',
        movement: '바람에 흔들림',
        ratio: '16:9 와이드 영상',
      },
    ],
  },
  {
    category: '뚱냥상사',
    items: [
      {
        name: '뚱냥상사 간식타임',
        mood: '뚱냥상사 일상',
        scene: '사무실',
        shotSize: '미디엄샷',
        angle: '눈높이 시점',
        lens: '35mm 자연 시야',
        lighting: '부드러운 실내광',
        movement: '고정샷',
        ratio: '5:5 X 썸네일',
      },
      {
        name: 'TV 보는 직원들',
        mood: '뚱냥상사 일상',
        scene: '사무실',
        shotSize: '와이드샷',
        angle: '전경 프레임',
        lens: '35mm 자연 시야',
        lighting: '부드러운 실내광',
        movement: '고정샷',
        ratio: '16:9 와이드 영상',
      },
      {
        name: '퇴근 전 회의',
        mood: '뚱냥상사 일상',
        scene: '사무실',
        shotSize: '와이드샷',
        angle: '눈높이 시점',
        lens: '24mm 와이드',
        lighting: '창가 자연광',
        movement: '작은 시선 변화',
        ratio: '16:9 와이드 영상',
      },
    ],
  },
  {
    category: '카메라공부',
    items: [
      {
        name: '35mm 자연 시야 연습',
        mood: '청춘 로맨스',
        scene: '하교길',
        shotSize: '미디엄샷',
        angle: '눈높이 시점',
        lens: '35mm 자연 시야',
        lighting: '골든아워',
        movement: '고정샷',
        ratio: '16:9 와이드 영상',
      },
      {
        name: '85mm 압축감 연습',
        mood: '여름밤 시네마',
        scene: '광화문 거리',
        shotSize: '클로즈업',
        angle: '눈높이 시점',
        lens: '85mm 압축감',
        lighting: '네온 밤빛',
        movement: '느린 줌인',
        ratio: '9:16 세로 영상',
      },
      {
        name: '전경 프레임 연습',
        mood: '2007 디카 기억',
        scene: '차 안',
        shotSize: '미디엄샷',
        angle: '전경 프레임',
        lens: '35mm 자연 시야',
        lighting: '창가 자연광',
        movement: '고정샷',
        ratio: '16:9 와이드 영상',
      },
    ],
  },
];

export default function App() {
  const [mood, setMood] = useState('2007 디카 기억');
  const [scene, setScene] = useState('차 안');
  const [shotSize, setShotSize] = useState('미디엄샷');
  const [angle, setAngle] = useState('전경 프레임');
  const [lens, setLens] = useState('디카 렌즈 느낌');
  const [lighting, setLighting] = useState('디카 직광 플래시');
  const [movement, setMovement] = useState('손持 카메라 느낌');
  const [ratio, setRatio] = useState('5:5 X 썸네일');
  const [activeCategory, setActiveCategory] = useState(presetCategories[1].category);
  const [copied, setCopied] = useState(false);

  const currentPresets =
    presetCategories.find((group) => group.category === activeCategory)?.items ??
    presetCategories[0].items;

  const prompts = useMemo(() => {
    return {
      image: `${ratio} 비율. ${mood} 감성의 ${scene} 장면. ${shotSize}, ${angle}, ${lens}, ${lighting}. 인물은 과하게 포즈를 취하지 않고 자연스러운 한국 감성과 부드러운 빛을 유지한다. 영상 첫 프레임으로 쓰기 좋은 이미지.`,
      video: `6초 영상. 카메라는 ${movement}을 중심으로 움직인다. 갑작스러운 줌, 불필요한 손동작, 과한 표정 연기는 피한다. 장면은 천천히 이어지고 인물의 작은 반응과 분위기만 남긴다.`,
      camera: `${shotSize}, ${angle}, ${lens}. 조명은 ${lighting}. 화면 비율은 ${ratio}. 인물과 배경의 깊이감을 살리고, 프레임 안의 텍스트나 이름표는 흔들리지 않게 한다.`,
      negative: `extra fingers, distorted hands, unreadable text, broken name tags, sudden hand holding, overacting, fast zoom, camera shake, duplicated crowd, face change, plastic skin, awkward pose`,
    };
  }, [ratio, mood, scene, shotSize, angle, lens, lighting, movement]);

  const fullPrompt = useMemo(() => {
    return `IMAGE PROMPT
${prompts.image}

VIDEO PROMPT
${prompts.video}

CAMERA NOTE
${prompts.camera}

NEGATIVE PROMPT
${prompts.negative}`;
  }, [prompts]);

  async function copyPrompt() {
    await navigator.clipboard.writeText(fullPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function applyPreset(preset: Preset) {
    setMood(preset.mood);
    setScene(preset.scene);
    setShotSize(preset.shotSize);
    setAngle(preset.angle);
    setLens(preset.lens);
    setLighting(preset.lighting);
    setMovement(preset.movement);
    setRatio(preset.ratio);
  }

  return (
    <main className="page">
      <section className="heroGrid">
        <div className="heroCopy">
          <p className="badge">BUILT WITH META ASTRYX · Y2K THEME</p>
          <h1>Luna Director Kit</h1>
          <p className="lead">
            무드, 샷 크기, 앵글, 렌즈, 조명, 움직임, 화면 비율을 골라
            이미지용·영상용·카메라 노트·네거티브 프롬프트까지 조립합니다.
          </p>

          <div className="heroActions">
            <Button label="전체 프롬프트 복사 ✨" onClick={copyPrompt} />
            <button
              className="ghostButton"
              type="button"
              onClick={() => applyPreset(presetCategories[1].items[0])}
            >
              2007 디카 프리셋
            </button>
          </div>
        </div>

        <aside className="mascotCard">
          <div className="directorText">
            <p className="bubble">ASTRYX Y2K DIRECTOR BOARD</p>
            <h2>Luna Director</h2>
            <p>
              움직이는 루나가 장면을 고르고,
              카메라 언어를 프롬프트로 바꿔요.
            </p>
            <span>Mood · Shot · Angle · Lens · Light</span>
          </div>

          <div className="videoFrame">
            <video
              src="/luna-main.mp4"
              autoPlay
              muted
              loop
              playsInline
              aria-label="Luna animated character"
            />
          </div>
        </aside>
      </section>

      <section className="sceneLayout">
        <div className="builderPanel">
          <Picker title="무드" items={moods} value={mood} onChange={setMood} />
          <Picker title="장면" items={scenes} value={scene} onChange={setScene} />
          <Picker title="샷 크기" items={shotSizes} value={shotSize} onChange={setShotSize} />
          <Picker title="앵글" items={angles} value={angle} onChange={setAngle} />
          <Picker title="렌즈" items={lenses} value={lens} onChange={setLens} />
          <Picker title="조명" items={lightings} value={lighting} onChange={setLighting} />
          <Picker title="움직임" items={movements} value={movement} onChange={setMovement} />
          <Picker title="비율" items={ratios} value={ratio} onChange={setRatio} />
        </div>

        <div className="resultPanel">
          <div className="scenePreview">
            <div className="previewMoon" />
            <div>
              <p className="kicker">SCENE PREVIEW</p>
              <strong>{mood} · {scene}</strong>
              <span>{shotSize} / {angle} / {lens} / {ratio}</span>
            </div>
          </div>

          <div>
            <p className="kicker">PROMPT OUTPUT</p>
            <h2>디렉터 프롬프트</h2>
          </div>

          <div className="promptGrid">
            <PromptCard title="IMAGE PROMPT" body={prompts.image} />
            <PromptCard title="VIDEO PROMPT" body={prompts.video} />
            <PromptCard title="CAMERA NOTE" body={prompts.camera} />
            <PromptCard title="NEGATIVE PROMPT" body={prompts.negative} />
          </div>

          <div className="actions">
            <Button label="전체 프롬프트 복사 ✨" onClick={copyPrompt} />
            {copied && <span className="copied">복사됐어요 💫</span>}
          </div>
        </div>
      </section>

      <section className="bottomGrid">
        <div className="presetPanel">
          <div>
            <p className="kicker">DIRECTOR PRESETS</p>
            <h2>카테고리별 장면</h2>
          </div>

          <div className="presetTabs">
            {presetCategories.map((group) => (
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
            {currentPresets.map((preset) => (
              <button
                key={preset.name}
                className="presetButton"
                type="button"
                onClick={() => applyPreset(preset)}
              >
                <span>{preset.name}</span>
                <small>{preset.mood} · {preset.shotSize} · {preset.lens}</small>
              </button>
            ))}
          </div>
        </div>

        <div className="astryxPanel">
          <p className="kicker">ASTRYX BUILD SPEC</p>
          <h2>Built with Meta Astryx</h2>

          <div className="specGrid">
            <div>
              <span>Theme</span>
              <strong>Y2K</strong>
            </div>
            <div>
              <span>Component</span>
              <strong>Button</strong>
            </div>
            <div>
              <span>Stack</span>
              <strong>React + Vite</strong>
            </div>
            <div>
              <span>Purpose</span>
              <strong>AI Director Board</strong>
            </div>
          </div>

          <div className="codeCard">
            <code>npx astryx init</code>
            <code>npx astryx theme add y2k</code>
            <code>@astryxdesign/core/Button</code>
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
          <button
            key={item.label}
            className={item.label === value ? 'chip active' : 'chip'}
            type="button"
            onClick={() => onChange(item.label)}
          >
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