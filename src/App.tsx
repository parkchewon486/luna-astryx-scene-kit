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

const cameras = [
  { label: '디카 플래시', emoji: '⚡' },
  { label: '35mm 자연 시야', emoji: '🎥' },
  { label: '50mm 인물 렌즈', emoji: '📷' },
  { label: '85mm 압축감', emoji: '🔭' },
  { label: '시네마 와이드샷', emoji: '🎬' },
  { label: '전경 프레임', emoji: '🖼️' },
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
  { label: '손持 카메라 느낌', emoji: '🎥' },
  { label: '작은 시선 변화', emoji: '👀' },
  { label: '신나게 연주', emoji: '🥁' },
  { label: '바람에 흔들림', emoji: '🍃' },
];

export default function App() {
  const [mood, setMood] = useState('2007 디카 기억');
  const [scene, setScene] = useState('차 안');
  const [camera, setCamera] = useState('디카 플래시');
  const [ratio, setRatio] = useState('5:5 X 썸네일');
  const [motion, setMotion] = useState('손持 카메라 느낌');
  const [copied, setCopied] = useState(false);

  const prompts = useMemo(() => {
    return {
      image: `${ratio} 비율. ${mood} 감성의 ${scene} 장면. ${camera} 구도로 촬영한다. 인물은 과하게 포즈를 취하지 않고, 자연스러운 한국 감성과 부드러운 빛을 유지한다. 영상 첫 프레임으로 쓰기 좋은 이미지.`,
      video: `6초 영상. 카메라는 ${motion}을 중심으로 움직인다. 갑작스러운 줌, 불필요한 손동작, 과한 표정 연기는 피한다. 장면은 천천히 이어지고, 인물의 작은 반응과 분위기만 남긴다.`,
      camera: `${camera}. ${ratio}. 인물과 배경의 깊이감을 살리고, 장면 안의 여백과 시선을 정리한다. 프레임 안의 텍스트나 이름표는 흔들리지 않게 한다.`,
      negative: `extra fingers, distorted hands, unreadable text, broken name tags, sudden hand holding, overacting, fast zoom, camera shake, duplicated crowd, face change, plastic skin, awkward pose`,
    };
  }, [mood, scene, camera, ratio, motion]);

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

  function applyDicaPreset() {
    setMood('2007 디카 기억');
    setScene('차 안');
    setCamera('디카 플래시');
    setRatio('5:5 X 썸네일');
    setMotion('손持 카메라 느낌');
  }

  return (
    <main className="page">
      <section className="heroGrid">
        <div className="heroCopy">
          <p className="badge">BUILT WITH META ASTRYX · Y2K THEME</p>

          <h1>Luna Director Kit</h1>

          <p className="lead">
            무드, 장면, 카메라, 화면 비율, 움직임을 골라
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
            <span>Mood · Camera · Ratio · Motion</span>
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
          <Picker title="카메라" items={cameras} value={camera} onChange={setCamera} />
          <Picker title="비율" items={ratios} value={ratio} onChange={setRatio} />
          <Picker title="움직임" items={motions} value={motion} onChange={setMotion} />
        </div>

        <div className="resultPanel">
          <div className="scenePreview">
            <div className="previewIcon" />
            <div>
              <p className="kicker">SCENE PREVIEW</p>
              <strong>{mood} · {scene}</strong>
              <span>{camera} / {ratio} / {motion}</span>
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
          <h2>다음 단계에서 붙일 영역</h2>
          <p className="softText">
            3차에서 샷 크기·앵글·렌즈·조명 항목으로 더 전문적인 프롬프트 보드로 확장합니다.
          </p>
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