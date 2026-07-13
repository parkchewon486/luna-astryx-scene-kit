import { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';

type Prize = { amount_krw?: number; display?: string };
type ScopeKey = 'domestic' | 'overseas';
type Contest = {
  title: string;
  organizer: string;
  category: string[];
  official_url: string;
  deadline: string;
  d_day: number;
  total_prize: Prize;
  eligibility: string;
  team_allowed: boolean;
  ai_usage_status: string;
  status: string;
  summary: string;
  why_recommended: string;
  difficulty: string;
  estimated_days: string;
  beginner_friendly: boolean;
  solo_friendly: boolean;
  recommendation_score: number;
  scope?: ScopeKey;
  korean_eligible?: boolean;
};

type ContestPayload = {
  generated_at: string;
  contests: Contest[];
};

type FilterKey = 'ALL' | 'AI_REQUIRED' | 'AI_ALLOWED' | 'VIDEO' | 'DESIGN' | 'APP' | 'SOLO';
type SortKey = 'RECOMMEND' | 'DEADLINE' | 'PRIZE' | 'FAST' | 'BEGINNER';

const SCOPES: Array<{ key: ScopeKey; label: string }> = [
  { key: 'domestic', label: '국내' },
  { key: 'overseas', label: '해외' },
];

const FILTERS: Array<{ key: FilterKey; label: string }> = [
  { key: 'ALL', label: '전체' },
  { key: 'AI_REQUIRED', label: 'AI 필수' },
  { key: 'AI_ALLOWED', label: 'AI 사용 가능' },
  { key: 'VIDEO', label: '영상·숏폼' },
  { key: 'DESIGN', label: '이미지·디자인' },
  { key: 'APP', label: '앱·웹·테크' },
  { key: 'SOLO', label: '혼자 가능' },
];

const SORTS: Array<{ key: SortKey; label: string }> = [
  { key: 'RECOMMEND', label: '추천순' },
  { key: 'DEADLINE', label: '마감 임박순' },
  { key: 'PRIZE', label: '상금 높은 순' },
  { key: 'FAST', label: '빠른 제작순' },
  { key: 'BEGINNER', label: '초보 추천순' },
];

function contestScope(contest: Contest): ScopeKey {
  return contest.scope === 'overseas' ? 'overseas' : 'domestic';
}

function money(prize?: Prize) {
  if (prize?.display) return prize.display;
  if (prize?.amount_krw) return `${new Intl.NumberFormat('ko-KR').format(prize.amount_krw)}원`;
  return '원문 확인';
}

function dateText(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || '확인 중';
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul', year: 'numeric', month: 'long', day: 'numeric',
  }).format(date);
}

function matches(contest: Contest, filter: FilterKey) {
  if (filter === 'ALL') return true;
  const categories = contest.category.join(' ').toLowerCase();
  if (filter === 'AI_REQUIRED') return contest.ai_usage_status === 'required';
  if (filter === 'AI_ALLOWED') return contest.ai_usage_status !== 'prohibited';
  if (filter === 'VIDEO') return /영상|숏폼|광고|film|video/.test(categories);
  if (filter === 'DESIGN') return /이미지|디자인|뷰티|art|design/.test(categories);
  if (filter === 'APP') return /앱|웹|테크|바이브코딩|크립토|스타트업|해커톤/.test(categories);
  return contest.solo_friendly;
}

function daysEstimate(value: string) {
  const match = value?.match(/\d+/);
  return match ? Number(match[0]) : 999;
}

function toolsFor(contest: Contest) {
  const categories = contest.category.join(' ');
  if (/영상|숏폼|광고|film|video/i.test(categories)) return 'Flow · Seedance · CapCut';
  if (/앱|웹|테크|바이브코딩|스타트업|해커톤/i.test(categories)) return 'Cursor · Claude Code';
  if (/이미지|디자인|뷰티|art|design/i.test(categories)) return 'GPT Image · Photoshop';
  return '원문 안내 확인';
}

function aiLabel(status: string) {
  if (status === 'required') return 'AI 필수';
  if (status === 'prohibited') return '사용 불가';
  return '사용 가능';
}

function scoreDetails(contest: Contest) {
  return [
    contest.solo_friendly ? '혼자 참가 가능' : '팀 또는 스타트업 참가',
    contest.beginner_friendly ? '초보 접근 가능' : '경험자 추천',
    `제작 난이도 ${contest.difficulty || '확인 중'}`,
    `예상 준비 ${contest.estimated_days || '확인 중'}`,
    contest.eligibility ? `참가 대상: ${contest.eligibility}` : '',
  ].filter(Boolean);
}

function ContestRadar() {
  const [payload, setPayload] = useState<ContestPayload | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [scope, setScope] = useState<ScopeKey>('domestic');
  const [filter, setFilter] = useState<FilterKey>('ALL');
  const [sort, setSort] = useState<SortKey>('RECOMMEND');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [error, setError] = useState('');

  async function load() {
    setStatus('loading');
    setError('');
    try {
      const response = await fetch(`/data/contests.json?ts=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) throw new Error('공모전 데이터를 불러오지 못했어요.');
      const data = await response.json() as ContestPayload;
      if (!Array.isArray(data.contests)) throw new Error('공모전 데이터 형식을 확인해 주세요.');
      setPayload(data);
      setStatus('ready');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '공모전 데이터를 불러오지 못했어요.');
      setStatus('error');
    }
  }

  useEffect(() => { void load(); }, []);

  const scopeCounts = useMemo(() => {
    const open = payload?.contests.filter((contest) => contest.status !== 'closed') ?? [];
    return {
      domestic: open.filter((contest) => contestScope(contest) === 'domestic').length,
      overseas: open.filter((contest) => contestScope(contest) === 'overseas').length,
    };
  }, [payload]);

  const contests = useMemo(() => {
    if (!payload) return [];
    const result = payload.contests
      .filter((contest) => contest.status !== 'closed')
      .filter((contest) => contestScope(contest) === scope)
      .filter((contest) => matches(contest, filter));

    return [...result].sort((a, b) => {
      if (sort === 'DEADLINE') return a.d_day - b.d_day;
      if (sort === 'PRIZE') return (b.total_prize?.amount_krw ?? 0) - (a.total_prize?.amount_krw ?? 0);
      if (sort === 'FAST') return daysEstimate(a.estimated_days) - daysEstimate(b.estimated_days);
      if (sort === 'BEGINNER') return Number(b.beginner_friendly) - Number(a.beginner_friendly) || b.recommendation_score - a.recommendation_score;
      return b.recommendation_score - a.recommendation_score;
    });
  }, [payload, scope, filter, sort]);

  function changeScope(next: ScopeKey) {
    setScope(next);
    setFilter('ALL');
    setExpanded(null);
  }

  return (
    <section className="contestRadar" aria-labelledby="contest-radar-title">
      <style>{`
        .contestRadarRoot{width:min(1120px,calc(100% - 32px));margin:24px auto 42px}.contestRadar{position:relative;overflow:hidden;border:1px solid rgba(116,101,180,.2);border-radius:32px;padding:34px;background:linear-gradient(145deg,#fff 0%,#fbf9ff 54%,#f0fbff 100%);box-shadow:0 24px 68px rgba(45,38,83,.11);color:#17182a}.contestRadar:before{content:"";position:absolute;inset:0;pointer-events:none;background-image:linear-gradient(rgba(75,62,120,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(75,62,120,.035) 1px,transparent 1px);background-size:24px 24px;mask-image:linear-gradient(to bottom,rgba(0,0,0,.75),transparent 62%)}.contestRadarHeader{position:relative;display:flex;justify-content:space-between;align-items:flex-end;gap:22px}.contestRadarEyebrow{display:flex;gap:9px;align-items:center;margin-bottom:13px;color:#766f8b;font-size:11px;font-weight:900;letter-spacing:.12em}.contestRadarLive{padding:7px 10px;border-radius:999px;background:#201c34;color:#fff}.contestRadarTitleWrap{display:flex;align-items:flex-end;gap:13px;flex-wrap:wrap}.contestRadarKicker{margin:0 0 4px;font-size:14px;font-weight:850;color:#7d748e}.contestRadar h2{margin:0;font-family:ui-serif,Georgia,"Times New Roman",serif;font-size:clamp(42px,6vw,72px);font-weight:700;line-height:.9;letter-spacing:-.07em}.contestRadarWord{position:relative;display:inline-block}.contestRadarWord:after{content:"";position:absolute;left:2%;right:2%;bottom:-8px;height:5px;border-radius:999px;background:linear-gradient(90deg,#755fd4,#68b7d7)}.contestRadarEnglish{padding-bottom:6px;font-size:13px;font-weight:950;letter-spacing:.18em;color:#7f7597}.contestRadarHeader p{max-width:650px;margin:21px 0 0;color:#666176;font-size:14px;line-height:1.72}.contestRadarRefresh{min-height:46px;padding:0 17px;border:1px solid rgba(60,52,91,.14);border-radius:14px;background:#fff;color:#252039;font-weight:900;cursor:pointer}.contestScopeTabs{position:relative;display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:28px 0 14px;padding:6px;border:1px solid rgba(90,77,139,.14);border-radius:18px;background:rgba(255,255,255,.72)}.contestScopeTabs button{display:flex;justify-content:center;align-items:center;gap:8px;min-height:44px;border:0;border-radius:13px;background:transparent;color:#6b647f;font-size:14px;font-weight:950;cursor:pointer}.contestScopeTabs button.active{background:#211d35;color:#fff;box-shadow:0 9px 20px rgba(39,31,69,.16)}.contestScopeTabs small{display:inline-grid;place-items:center;min-width:22px;height:22px;padding:0 6px;border-radius:999px;background:rgba(126,113,163,.12);font-size:10px}.contestScopeTabs button.active small{background:rgba(255,255,255,.18)}.contestControls{position:relative;display:flex;justify-content:space-between;gap:16px;align-items:flex-start;margin:14px 0 18px}.contestRadarFilters{display:flex;gap:8px;flex-wrap:wrap}.contestRadarFilters button{padding:10px 14px;border:1px solid rgba(90,77,139,.16);border-radius:999px;background:rgba(255,255,255,.82);color:#68617e;font-weight:850;cursor:pointer;white-space:nowrap}.contestRadarFilters button.active{background:#211d35;color:#fff;border-color:#211d35}.contestSort{min-height:42px;border:1px solid rgba(90,77,139,.16);border-radius:13px;background:#fff;padding:0 13px;color:#3c3650;font-weight:850}.contestRadarMeta{position:relative;display:flex;gap:14px;flex-wrap:wrap;margin-bottom:18px;color:#746d89;font-size:12px}.contestRadarMeta strong{color:#28233d}.contestRadarGrid{position:relative;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.contestCard{display:flex;flex-direction:column;min-width:0;padding:22px;border:1px solid rgba(102,87,155,.17);border-radius:24px;background:rgba(255,255,255,.9);box-shadow:0 12px 30px rgba(48,39,86,.07)}.contestCardTop{display:flex;justify-content:space-between;gap:12px;align-items:center}.contestScore{padding:7px 10px;border-radius:999px;background:#211d35;color:#fff;font-size:11px;font-weight:900}.contestDday{color:#764289;font-size:14px;font-weight:950}.contestCard h3{margin:16px 0 0;font-size:21px;line-height:1.35;letter-spacing:-.035em}.contestOrganizer{margin:7px 0 0;color:#79728d;font-size:12px}.contestTags{display:flex;flex-wrap:wrap;gap:6px;margin-top:14px}.contestTags span{padding:6px 9px;border-radius:999px;background:#f0edf8;color:#645a7b;font-size:10px;font-weight:900}.contestTags .contestKoreaTag{background:#e8fff3;color:#16734a}.contestSummary{margin:15px 0 0;color:#5e596f;font-size:13px;line-height:1.68}.contestFacts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:16px}.contestFacts div{padding:12px;border-radius:14px;background:#f7f5fb}.contestFacts span{display:block;color:#8a839b;font-size:9px;font-weight:900;letter-spacing:.1em}.contestFacts strong{display:block;margin-top:5px;color:#2e2940;font-size:12px;line-height:1.45}.contestRecommend{margin-top:16px;padding:14px;border-radius:15px;background:linear-gradient(135deg,#f3efff,#eefaff)}.contestRecommend span{color:#7e759a;font-size:9px;font-weight:900;letter-spacing:.12em}.contestRecommend p{margin:6px 0 0;color:#4b465d;font-size:12px;line-height:1.6}.contestExpand{margin-top:12px;border:0;background:transparent;padding:0;color:#5a4d7c;font-size:12px;font-weight:900;text-align:left;cursor:pointer}.contestScoreDetails{margin-top:12px;padding:13px;border-radius:14px;background:#f8f6fc}.contestScoreDetails ul{margin:0;padding-left:18px;color:#5d566e;font-size:12px;line-height:1.7}.contestActions{display:flex;margin-top:auto;padding-top:18px}.contestActions a{width:100%;padding:12px;border-radius:12px;background:#211d35;color:#fff;text-align:center;text-decoration:none;font-size:12px;font-weight:900}.contestRadarState{position:relative;display:grid;place-items:center;min-height:220px;border:1px dashed rgba(95,80,145,.22);border-radius:22px;background:rgba(255,255,255,.6);text-align:center;color:#6f6882}.contestRadarState strong{display:block;color:#28233d;font-size:20px}.contestRadarState button{margin-top:14px;padding:10px 14px;border:0;border-radius:11px;background:#211d35;color:#fff;font-weight:900}.contestRadarFooter{position:relative;margin-top:16px;color:#817a92;font-size:11px;line-height:1.6}@media(max-width:760px){.contestRadarRoot{width:min(100% - 16px,1120px);margin-top:18px}.contestRadar{padding:22px 15px;border-radius:25px}.contestRadarHeader{display:block}.contestRadar h2{font-size:49px}.contestRadarTitleWrap{gap:9px}.contestRadarEnglish{font-size:11px}.contestRadarRefresh{width:100%;margin-top:18px}.contestControls{display:block}.contestRadarFilters{overflow-x:auto;flex-wrap:nowrap;padding-bottom:6px}.contestSort{width:100%;margin-top:10px}.contestRadarGrid{grid-template-columns:1fr}.contestFacts{grid-template-columns:1fr 1fr}.contestCard{padding:18px}}
      `}</style>

      <header className="contestRadarHeader">
        <div>
          <div className="contestRadarEyebrow"><span className="contestRadarLive">LIVE OPPORTUNITY</span><span>공식 출처 확인 기반</span></div>
          <p className="contestRadarKicker">이번에는 어디에 도전할까?</p>
          <div className="contestRadarTitleWrap"><h2 id="contest-radar-title"><span className="contestRadarWord">공모전</span></h2><span className="contestRadarEnglish">RADAR</span></div>
          <p>국내와 해외 AI 공모전을 나눠 보고, 소개·상금·마감일을 비교해 도전할 기회를 골라보세요.</p>
        </div>
        <button className="contestRadarRefresh" type="button" onClick={() => void load()} disabled={status === 'loading'}>{status === 'loading' ? '확인 중' : '새로고침'}</button>
      </header>

      <nav className="contestScopeTabs" aria-label="공모전 지역" role="tablist">
        {SCOPES.map((item) => (
          <button key={item.key} type="button" role="tab" aria-selected={scope === item.key} className={scope === item.key ? 'active' : ''} onClick={() => changeScope(item.key)}>
            <span>{item.label}</span><small>{scopeCounts[item.key]}</small>
          </button>
        ))}
      </nav>

      <div className="contestControls">
        <nav className="contestRadarFilters" aria-label="공모전 필터">
          {FILTERS.map((item) => <button key={item.key} type="button" className={filter === item.key ? 'active' : ''} onClick={() => setFilter(item.key)}>{item.label}</button>)}
        </nav>
        <select className="contestSort" value={sort} onChange={(event: { target: { value: string } }) => setSort(event.target.value as SortKey)} aria-label="공모전 정렬">
          {SORTS.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}
        </select>
      </div>

      <div className="contestRadarMeta">
        <span>{scope === 'domestic' ? '국내' : '해외'} 공개 공모전 <strong>{contests.length}개</strong></span>
        <span>마지막 확인 <strong>{payload ? dateText(payload.generated_at) : '연결 중'}</strong></span>
      </div>

      {status === 'loading' && <div className="contestRadarState"><div><strong>새로운 기회를 찾고 있어요</strong><p>공식 모집 페이지와 현재 접수 상태를 확인합니다.</p></div></div>}
      {status === 'error' && <div className="contestRadarState"><div><strong>공모전 데이터를 불러오지 못했어요</strong><p>{error}</p><button type="button" onClick={() => void load()}>다시 시도</button></div></div>}
      {status === 'ready' && contests.length === 0 && <div className="contestRadarState"><div><strong>이 조건에 맞는 공모전이 아직 없어요</strong><p>필터를 바꾸거나 다음 업데이트를 기다려 주세요.</p></div></div>}

      {status === 'ready' && contests.length > 0 && <div className="contestRadarGrid">
        {contests.map((contest) => {
          const key = `${contest.organizer}-${contest.title}`;
          const isExpanded = expanded === key;
          return (
            <article className="contestCard" key={key}>
              <div className="contestCardTop"><span className="contestScore">추천 점수 {contest.recommendation_score}</span><span className="contestDday">D-{Math.max(0, contest.d_day)}</span></div>
              <h3>{contest.title}</h3>
              <p className="contestOrganizer">{contest.organizer}</p>
              <div className="contestTags">
                {contest.category.map((tag) => <span key={tag}>{tag}</span>)}
                {contest.scope === 'overseas' && contest.korean_eligible && <span className="contestKoreaTag">한국 참가 가능</span>}
                {contest.solo_friendly && <span>혼자 가능</span>}
                {contest.beginner_friendly && <span>초보 가능</span>}
              </div>
              <p className="contestSummary">{contest.summary}</p>
              <div className="contestFacts">
                <div><span>상금·혜택</span><strong>{money(contest.total_prize)}</strong></div>
                <div><span>마감</span><strong>{dateText(contest.deadline)}</strong></div>
                <div><span>AI 사용</span><strong>{aiLabel(contest.ai_usage_status)}</strong></div>
                <div><span>추천 도구</span><strong>{toolsFor(contest)}</strong></div>
              </div>
              <div className="contestRecommend"><span>어떤 공모전?</span><p>{contest.why_recommended}</p></div>
              <button className="contestExpand" type="button" onClick={() => setExpanded(isExpanded ? null : key)}>{isExpanded ? '참가 정보 닫기' : '참가 정보 보기'}</button>
              {isExpanded && <div className="contestScoreDetails"><ul>{scoreDetails(contest).map((item) => <li key={item}>{item}</li>)}</ul></div>}
              <div className="contestActions"><a href={contest.official_url} target="_blank" rel="noreferrer">원문 보기 ↗</a></div>
            </article>
          );
        })}
      </div>}

      <footer className="contestRadarFooter">접수 전에는 원문에서 참가 자격, 마감 시각과 제출 규격을 다시 확인해 주세요.</footer>
    </section>
  );
}

function mountContestRadar() {
  if (document.getElementById('contest-radar-root')) return;
  const host = document.createElement('div');
  host.id = 'contest-radar-root';
  host.className = 'contestRadarRoot';
  const anchor = document.getElementById('luna-trend-radar-root') ?? document.querySelector('.bottomGrid.buildNotesBottom');
  if (anchor?.parentElement) anchor.insertAdjacentElement('afterend', host);
  else document.querySelector('main.page')?.appendChild(host);
  createRoot(host).render(<ContestRadar />);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountContestRadar, { once: true });
else mountContestRadar();
