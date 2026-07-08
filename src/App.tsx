
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

const presetGroups = [
  {
    category: '로맨스',
    items: [
      {
        title: '고백 직전 하교길',
        note: '서로 의식하지만 과하게 다가가지 않는 장면',
        mood: '청춘 로맨스',
        scene: '하교길',
        shotSize: '미디엄샷',
        angle: '살짝 측면',
        lens: '50mm 인물 렌즈',
        light: '노을 역광',
        ratio: '16:9 와이드 영상',
        motion: '작은 시선 변화',
      },
    ],
  },
  {
    category: '디카감성',
    items: [
      {
        title: '2007 차 안 디카',
        note: '플래시, 손持 카메라, Y2K 기억 느낌',
        mood: '2007 디카 기억',
        scene: '차 안',
        shotSize: '미디엄샷',
        angle: '전경 프레임',
        lens: '디카 렌즈 느낌',
        light: '디카 직광 플래시',
        ratio: '5:5 X 썸네일',
        motion: '손에 들고 찍은 느낌',
      },
    ],
  },
  {
    category: '뮤직비디오',
    items: [
      {
        title: '음악실 밴드샷',
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
    ],
  },
  {
    category: '거리',
    items: [
      {
        title: '광화문 응원 와이드',
        note: '군중 반복을 줄이고 현장감만 살리는 장면',
        mood: '월드컵 응원',
        scene: '광화문 거리',
        shotSize: '와이드샷',
        angle: '로우앵글',
        lens: '35mm 자연 시야',
        light: '여름밤 가로등',
        ratio: '16:9 와이드 영상',
        motion: '고정샷',
      },
    ],
  },
  {
    category: '뚱냥상사',
    items: [
      {
        title: '오후 간식 회의',
        note: '회사 직원 캐릭터들의 귀여운 일상 컷',
        mood: '뚱냥상사 일상',
        scene: '음악실',
        shotSize: '와이드샷',
        angle: '정면 시선',
        lens: '35mm 자연 시야',
        light: '부드러운 창가빛',
        ratio: '5:5 X 썸네일',
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
    ],
  },
];



export default function App() {

  const [mood, setMood] = useState('2007 디카 기억');

  const [scene, setScene] = useState('차 안');

  const [shotSize, setShotSize] = useState('미디엄샷');

  const [angle, setAngle] = useState('전경 프레임');

  const [lens, setLens] = useState('디카 렌즈 느낌');

  const [light, setLight] = useState('디카 직광 플래시');

  const [ratio, setRatio] = useState('5:5 X 썸네일');

  const [motion, setMotion] = useState('손에 들고 찍은 느낌');
  const [activeCategory, setActiveCategory] = useState('로맨스');

  const [copied, setCopied] = useState(false);

  const activePresetGroup =
    presetGroups.find((group) => group.category === activeCategory) ?? presetGroups[0];



  const prompts = useMemo(() => {

    return {

      image: `${ratio} 비율. ${mood} 감성의 ${scene} 장면. ${shotSize} 구도, ${angle}, ${lens}, ${light}. 인물은 과하게 포즈를 취하지 않고, 자연스러운 한국 감성과 부드러운 빛을 유지한다. 영상 첫 프레임으로 쓰기 좋은 이미지.`,

      video: `6초 영상. 카메라는 ${motion}을 중심으로 움직인다. ${shotSize}에서 인물의 작은 반응을 잡고, ${angle}을 유지한다. 갑작스러운 줌, 불필요한 손동작, 과한 표정 연기는 피한다.`,

      camera: `${lens}. ${shotSize}. ${angle}. ${light}. ${ratio}. 인물과 배경의 깊이감을 살리고, 장면 안의 여백과 시선을 정리한다. 프레임 안의 텍스트나 이름표는 흔들리지 않게 한다.`,

      negative: `extra fingers, distorted hands, unreadable text, broken name tags, sudden hand holding, overacting, fast zoom, camera shake, duplicated crowd, face change, plastic skin, awkward pose`,

    };

  }, [mood, scene, shotSize, angle, lens, light, ratio, motion]);



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



  function applyPreset(preset: (typeof presetGroups)[number]['items'][number]) {
    setMood(preset.mood);
    setScene(preset.scene);
    setShotSize(preset.shotSize);
    setAngle(preset.angle);
    setLens(preset.lens);
    setLight(preset.light);
    setRatio(preset.ratio);
    setMotion(preset.motion);
  }

  function applyDicaPreset() {
    applyPreset(presetGroups[1].items[0]);
    setActiveCategory('디카감성');
  }



  return (

    <main className="page">

      <section className="heroGrid">

        <div className="heroCopy">

          <p className="badge">BUILT WITH META ASTRYX · Y2K THEME</p>



          <h1>Luna Director Kit</h1>



          <p className="lead">

            무드, 장면, 샷 크기, 앵글, 렌즈, 조명, 화면 비율, 움직임을 골라

            이미지용·영상용·카메라 노트·네거티브 프롬프트까지 조립합니다.

          </p>



          <div className="heroActions">

            <Button label="전체 프롬프트 복사 ✨" onClick={copyPrompt} />

            <button className="ghostButton" type="button" onClick={applyDicaPreset}>

              2007 디카 프리셋

            </button>

          </div>

        </div>



        <aside className="directorCard">

          <div className="directorText">

            <p className="bubble">ASTRYX Y2K DIRECTOR BOARD</p>

            <h2>Luna Director</h2>

            <p>

              움직이는 루나가 장면을 고르고,

              카메라 언어를 프롬프트로 바꿔요.

            </p>

            <span>Preset · Shot · Angle · Lens · Light</span>

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
          <p className="kicker">DIRECTOR PRESETS</p>
          <h2>프리셋 탭</h2>

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
              <button
                key={preset.title}
                className="presetButton"
                type="button"
                onClick={() => applyPreset(preset)}
              >
                <strong>{preset.title}</strong>
                <span>{preset.note}</span>
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




