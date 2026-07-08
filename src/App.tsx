import { useMemo, useState } from 'react';
import { Button } from '@astryxdesign/core/Button';
import './App.css';

const moods = ['Y2K 디카', '청춘 영화', '몽글한 애니', '밤공기 시네마'];
const places = ['하교길', '차 안', '음악실', '광화문 거리'];
const cameras = ['디카 플래시', '클로즈업', '와이드샷', '천천히 줌인'];
const motions = ['머뭇거림', '시선 이동', '바람에 흔들림', '작은 미소'];

export default function App() {
  const [mood, setMood] = useState(moods[0]);
  const [place, setPlace] = useState(places[0]);
  const [camera, setCamera] = useState(cameras[0]);
  const [motion, setMotion] = useState(motions[0]);
  const [copied, setCopied] = useState(false);

  const prompt = useMemo(() => {
    return `${mood} 감성의 ${place} 장면. ${camera} 구도로 촬영하고, 인물은 과하게 포즈를 취하지 않는다. 장면 안에는 ${motion}만 아주 작게 남긴다. 자연스러운 한국 감성, 부드러운 빛, 영상 첫 프레임으로 쓰기 좋은 이미지.`;
  }, [mood, place, camera, motion]);

  async function copyPrompt() {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <main className="page">
      <section className="hero">
        <p className="badge">ASTRYX Y2K EXPERIMENT</p>

        <h1>Luna Scene Kit</h1>

        <p className="lead">
          장면 분위기, 장소, 카메라, 움직임을 골라
          AI 이미지·영상 프롬프트를 조립합니다.
        </p>
      </section>

      <section className="sceneLayout">
        <div className="panel">
          <Picker title="분위기" items={moods} value={mood} onChange={setMood} />
          <Picker title="장소" items={places} value={place} onChange={setPlace} />
          <Picker title="카메라" items={cameras} value={camera} onChange={setCamera} />
          <Picker title="움직임" items={motions} value={motion} onChange={setMotion} />
        </div>

        <div className="result">
          <div>
            <p className="kicker">GENERATED PROMPT</p>
            <h2>오늘의 장면 프롬프트</h2>
          </div>

          <p className="prompt">{prompt}</p>

          <div className="actions">
            <Button label="프롬프트 복사" onClick={copyPrompt} />
            {copied && <span className="copied">복사됐어요</span>}
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
  items: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <article className="picker">
      <h2>{title}</h2>

      <div className="chips">
        {items.map((item) => (
          <button
            key={item}
            className={item === value ? 'chip active' : 'chip'}
            type="button"
            onClick={() => onChange(item)}
          >
            {item}
          </button>
        ))}
      </div>
    </article>
  );
}