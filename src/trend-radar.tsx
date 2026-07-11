import { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';

import './trend-radar.css';

type TrendCategory = 'AI_TECH' | 'SOCIETY' | 'LIFESTYLE' | 'CONTENT';
type FactCheckStatus = 'verified' | 'partial' | 'unverified';
type RiskLevel = 'low' | 'medium' | 'high';

type TrendItem = {
  rank: number;
  community: string;
  source_title: string;
  url: string;
  published_at: string;
  views: number | null;
  comments: number | null;
  recommendations: number | null;
  metrics_visible: boolean;
  category: TrendCategory;
  topic: string;
  summary: string;
  why_trending: string;
  x_angle: string;
  x_hook: string;
  fact_check_status: FactCheckStatus;
  fact_check_note: string;
  risk_level: RiskLevel;
  risk_factors: string[];
  related_sources: string[];
  trend_score: number;
};

type TrendRadarData = {
  generated_at: string;
  range_start: string;
  range_end: string;
  checked_sources: number;
  successful_sources: number;
  items: TrendItem[];
  cached?: boolean;
};

type RadarStatus = 'loading' | 'ready' | 'error';
type FilterKey = 'ALL' | TrendCategory;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'ALL', label: '전체' },
  { key: 'AI_TECH', label: 'AI·테크' },
  { key: 'SOCIETY', label: '사회' },
  { key: 'LIFESTYLE', label: '생활' },
  { key: 'CONTENT', label: '콘텐츠' },
];

const CATEGORY_LABELS: Record<TrendCategory, string> = {
  AI_TECH: 'AI·테크',
  SOCIETY: '사회',
  LIFESTYLE: '생활',
  CONTENT: '콘텐츠',
};

const FACT_LABELS: Record<FactCheckStatus, string> = {
  verified: '확인됨',
  partial: '부분 확인',
  unverified: '미확인',
};

const RISK_LABELS: Record<RiskLevel, string> = {
  low: '위험도 낮음',
  medium: '주의 필요',
  high: '사용 보류',
};

function formatMetric(value: number | null) {
  if (value === null) return '확인 불가';
  if (value >= 10000) return `${(value / 10000).toFixed(value >= 100000 ? 0 : 1)}만`;
  return new Intl.NumberFormat('ko-KR').format(value);
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '시간 확인 불가';
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function buildXMaterial(item: TrendItem) {
  return `아래 소재를 한국 X에 올릴 글로 재가공해줘.\n\n소재: ${item.source_title}\n주제: ${item.topic}\n내용: ${item.summary}\n사람들이 반응한 이유: ${item.why_trending}\n추천 각도: ${item.x_angle}\n한 줄 훅: ${item.x_hook}\n사실 확인: ${FACT_LABELS[item.fact_check_status]} · ${item.fact_check_note}\n원문: ${item.url}\n\n조건: 과장 금지, 원문 문장 복사 금지, 짧은 문장, 강한 첫 문장, 확인되지 않은 내용은 단정하지 말 것.`;
}

function TrendRadar() {
  const [status, setStatus] = useState<RadarStatus>('loading');
  const [data, setData] = useState<TrendRadarData | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterKey>('ALL');
  const [copiedKey, setCopiedKey] = useState('');

  async function loadTrends() {
    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/trends', {
        method: 'GET',
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      });

      const payload = await response.json() as TrendRadarData & { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || '핫이슈 데이터를 불러오지 못했어요.');
      }

      setData(payload);
      setStatus('ready');
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : '핫이슈 데이터를 불러오지 못했어요.');
    }
  }

  useEffect(() => {
    void loadTrends();
  }, []);

  const filteredItems = useMemo(() => {
    if (!data) return [];
    if (activeFilter === 'ALL') return data.items;
    return data.items.filter((item) => item.category === activeFilter);
  }, [activeFilter, data]);

  const featuredItems = filteredItems.slice(0, 3);
  const compactItems = filteredItems.slice(3);

  async function copyText(key: string, text: string) {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    window.setTimeout(() => setCopiedKey(''), 1600);
  }

  return (
    <section className="trendRadar" aria-labelledby="trend-radar-title">
      <div className="trendRadarGlow trendRadarGlowOne" />
      <div className="trendRadarGlow trendRadarGlowTwo" />

      <header className="trendRadarHeader">
        <div>
          <div className="trendRadarEyebrow">
            <span className="trendRadarLive"><i /> LIVE RESEARCH</span>
            <span>최근 24시간 · 한국 온라인 트렌드</span>
          </div>
          <h2 id="trend-radar-title">오늘의 핫이슈 레이더</h2>
          <p>많이 본 공개 게시물 가운데 X 글감으로 다듬기 좋은 소재만 골라 보여줘요.</p>
        </div>

        <button className="trendRadarRefresh" type="button" onClick={() => void loadTrends()} disabled={status === 'loading'}>
          <span aria-hidden="true">↻</span>
          {status === 'loading' ? '탐색 중' : '새로고침'}
        </button>
      </header>

      <div className="trendRadarVisitorBadge" aria-live="polite">
        <span className="trendRadarVisitorLive"><i /> LIVE</span>
        <span className="trendRadarVisitorText">
          <strong data-visitor-active>방문자 집계 연결 중</strong>
          <small data-visitor-today>실시간 숫자는 곧 표시돼요</small>
        </span>
      </div>

      <div className="trendRadarStatusBar">
        <div><span>LAST SCAN</span><strong>{data ? formatDate(data.generated_at) : '연결 중'}</strong></div>
        <div><span>SOURCES</span><strong>{data ? `${data.successful_sources}/${data.checked_sources}` : '—'}</strong></div>
        <div><span>WINDOW</span><strong>24H</strong></div>
        <div><span>CACHE</span><strong>30 MIN</strong></div>
      </div>

      <nav className="trendRadarFilters" aria-label="핫이슈 주제 필터">
        {FILTERS.map((filter) => (
          <button key={filter.key} type="button" className={filter.key === activeFilter ? 'active' : ''} onClick={() => setActiveFilter(filter.key)}>
            {filter.label}
          </button>
        ))}
      </nav>

      {status === 'loading' && (
        <div className="trendRadarLoading" aria-live="polite">
          <div className="trendRadarPulse"><span /><span /><span /></div>
          <strong>공개 커뮤니티의 뜨거운 글을 읽고 있어요</strong>
          <p>조회수, 반응량, 중복 여부와 위험 요소까지 함께 확인합니다.</p>
          <div className="trendRadarSkeletons"><i /><i /><i /></div>
        </div>
      )}

      {status === 'error' && (
        <div className="trendRadarError" role="alert">
          <span>RADAR OFFLINE</span>
          <strong>트렌드 탐색을 완료하지 못했어요.</strong>
          <p>{errorMessage}</p>
          <button type="button" onClick={() => void loadTrends()}>다시 시도</button>
        </div>
      )}

      {status === 'ready' && filteredItems.length === 0 && (
        <div className="trendRadarEmpty">이 주제에 해당하는 핫이슈가 아직 없어요.</div>
      )}

      {status === 'ready' && featuredItems.length > 0 && (
        <div className="trendRadarGrid">
          {featuredItems.map((item) => (
            <article className="trendRadarCard" key={`${item.community}-${item.url}`}>
              <div className="trendRadarCardTop">
                <span className="trendRadarRank">#{item.rank}</span>
                <span className={`trendRadarRisk ${item.risk_level}`}>{RISK_LABELS[item.risk_level]}</span>
              </div>
              <div className="trendRadarSource"><span>{item.community}</span><small>{CATEGORY_LABELS[item.category]}</small></div>
              <h3>{item.source_title}</h3>
              <p>{item.summary}</p>
              <div className="trendRadarMetrics">
                {item.views !== null && <span>조회 <strong>{formatMetric(item.views)}</strong></span>}
                {item.comments !== null && <span>댓글 <strong>{formatMetric(item.comments)}</strong></span>}
                {item.recommendations !== null && <span>추천 <strong>{formatMetric(item.recommendations)}</strong></span>}
              </div>
              <div className="trendRadarReason"><span>WHY</span><p>{item.why_trending}</p></div>
              <div className="trendRadarAngle"><span>X ANGLE</span><p>{item.x_angle}</p></div>
              <div className="trendRadarHook">“{item.x_hook}”</div>
              <div className="trendRadarFact"><span>{FACT_LABELS[item.fact_check_status]}</span><p>{item.fact_check_note}</p></div>
              <div className="trendRadarActions">
                <a href={item.url} target="_blank" rel="noreferrer">원문 보기 ↗</a>
                <button className="primary" type="button" onClick={() => void copyText(`featured-${item.rank}`, item.x_hook)}>
                  {copiedKey === `featured-${item.rank}` ? '복사됨' : '훅 복사'}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {status === 'ready' && compactItems.length > 0 && (
        <div className="trendRadarList">
          <div className="trendRadarSectionTitle"><span>MORE SIGNALS</span><strong>추가로 볼 만한 소재</strong></div>
          {compactItems.map((item) => (
            <article key={`${item.community}-${item.url}`}>
              <span className="trendRadarListRank">{item.rank}</span>
              <div className="trendRadarListBody"><small>{item.community} · {CATEGORY_LABELS[item.category]}</small><h3>{item.source_title}</h3><p>{item.why_trending}</p></div>
              <div className="trendRadarListMeta">
                {item.views !== null && <span>조회 {formatMetric(item.views)}</span>}
                {item.comments !== null && <span>댓글 {formatMetric(item.comments)}</span>}
                {item.recommendations !== null && <span>추천 {formatMetric(item.recommendations)}</span>}
                <a className="trendRadarOriginalLink" href={item.url} target="_blank" rel="noreferrer">원문 보기 ↗</a>
                <button type="button" onClick={() => void copyText(`compact-${item.rank}`, item.source_title)}>
                  {copiedKey === `compact-${item.rank}` ? '복사됨' : '제목 복사'}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <footer className="trendRadarFooter">
        <span>공개 원문 링크 제공</span>
        <p>게시 전에는 원문 내용과 최신 상태를 직접 확인해 주세요.</p>
      </footer>
    </section>
  );
}

function mountTrendRadar() {
  const params = new URLSearchParams(window.location.search);
  const isPreview = params.get('radar') === '1';
  const target = isPreview ? document.querySelector<HTMLElement>('#root') : document.querySelector<HTMLElement>('.showcaseSection');
  if (!target || target.querySelector('.trendRadar')) return;

  const mount = document.createElement('div');
  mount.className = 'trendRadarMount';
  if (isPreview) target.replaceChildren(mount);
  else target.insertAdjacentElement('afterend', mount);
  createRoot(mount).render(<TrendRadar />);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountTrendRadar, { once: true });
else mountTrendRadar();