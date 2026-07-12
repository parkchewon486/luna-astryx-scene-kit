import { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';

type Prize = { amount_krw?: number; display?: string };
type Contest = {
  title: string;
  organizer: string;
  category: string[];
  official_url: string;
  source_url: string;
  deadline: string;
  d_day: number;
  total_prize: Prize;
  top_prize: Prize;
  eligibility: string;
  team_allowed: boolean;
  submission_format: string;
  ai_usage_status: string;
  ai_usage_note: string;
  status: string;
  summary: string;
  why_recommended: string;
  difficulty: string;
  estimated_days: string;
  beginner_friendly: boolean;
  solo_friendly: boolean;
  recommendation_score: number;
  fact_check_status: string;
  risk_factors: string[];
  last_verified_at: string;
};

type ContestPayload = {
  generated_at: string;
  default_filters?: { hide_closed?: boolean };
  contests: Contest[];
};

type FilterKey = 'ALL' | 'AI' | 'VIDEO' | 'DESIGN' | 'APP' | 'SOLO';

const FILTERS: Array<{ key: FilterKey; label: string }> = [
  { key: 'ALL', label: '전체' },
  { key: 'AI', label: 'AI 활용' },
  { key: 'VIDEO', label: '영상·숏폼' },
  { key: 'DESIGN', label: '이미지·디자인' },
  { key: 'APP', label: '앱·웹·테크' },
  { key: 'SOLO', label: '혼자 가능' },
];

function money(prize?: Prize) {
  if (prize?.display) return prize.display;
  if (prize?.amount_krw) return `${new Intl.NumberFormat('ko-KR').format(prize.amount_krw)}원`;
  return '공식 페이지 확인';
}

function dateText(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || '확인 중';
  return new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', year: 'numeric', month: 'long', day: 'numeric' }).format(date);
}

function matches(contest: Contest, filter: FilterKey) {
  if (filter === 'ALL') return true;
  const categories = contest.category.join(' ').toLowerCase();
  if (filter === 'AI') return contest.ai_usage_status !== 'prohibited';
  if (filter === 'VIDEO') return /영상|숏폼|광고/.test(categories);
  if (filter === 'DESIGN') return /이미지|디자인|뷰티/.test(categories);
  if (filter === 'APP') return /앱|웹|테크|바이브코딩|크립토/.test(categories);
  return contest.solo_friendly;
}

function ContestRadar() {
  const [payload, setPayload] = useState<ContestPayload | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [filter, setFilter] = useState<FilterKey>('ALL');
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

  const contests = useMemo(() => {
    if (!payload) return [];
    return payload.contests
      .filter((contest) => contest.status !== 'closed')
      .filter((contest) => matches(contest, filter))
      .sort((a, b) => b.recommendation_score - a.recommendation_score);
  }, [payload, filter]);

  return (
    <section className="contestRadar" aria-labelledby="contest-radar-title">
      <style>{`
        .lunaContestRadarRoot{width:min(1120px,calc(100% - 32px));margin:24px auto 42px}.contestRadar{position:relative;overflow:hidden;border:1px solid rgba(130,112,197,.22);border-radius:30px;padding:32px;background:linear-gradient(145deg,#fff 0%,#faf8ff 55%,#f2fbff 100%);box-shadow:0 22px 64px rgba(50,41,92,.1);color:#17182a}.contestRadarHeader{display:flex;justify-content:space-between;align-items:flex-end;gap:22px}.contestRadarEyebrow{display:flex;gap:9px;align-items:center;margin-bottom:12px;color:#7a7395;font-size:11px;font-weight:900;letter-spacing:.11em}.contestRadarLive{padding:7px 10px;border-radius:999px;background:#211d35;color:#fff}.contestRadar h2{margin:0;font-size:clamp(34px,5vw,58px);line-height:.95;letter-spacing:-.065em}.contestRadarHeader p{max-width:660px;margin:14px 0 0;color:#68647c;font-size:14px;line-height:1.7}.contestRadarRefresh{min-height:46px;padding:0 17px;border:1px solid rgba(60,52,91,.14);border-radius:14px;background:#fff;color:#252039;font-weight:900;cursor:pointer}.contestRadarFilters{display:flex;gap:8px;flex-wrap:wrap;margin:24px 0 18px}.contestRadarFilters button{padding:10px 14px;border:1px solid rgba(90,77,139,.16);border-radius:999px;background:rgba(255,255,255,.8);color:#68617e;font-weight:850;cursor:pointer}.contestRadarFilters button.active{background:#211d35;color:#fff;border-color:#211d35}.contestRadarMeta{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:18px;color:#746d89;font-size:12px}.contestRadarMeta strong{color:#28233d}.contestRadarGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.contestCard{display:flex;flex-direction:column;min-width:0;padding:22px;border:1px solid rgba(102,87,155,.18);border-radius:23px;background:rgba(255,255,255,.88);box-shadow:0 12px 30px rgba(48,39,86,.07)}.contestCardTop{display:flex;justify-content:space-between;gap:12px;align-items:center}.contestScore{padding:7px 10px;border-radius:999px;background:#211d35;color:#fff;font-size:11px;font-weight:900}.contestDday{color:#7a3f90;font-size:14px;font-weight:950}.contestCard h3{margin:16px 0 0;font-size:21px;line-height:1.35;letter-spacing:-.035em}.contestOrganizer{margin:7px 0 0;color:#79728d;font-size:12px}.contestTags{display:flex;flex-wrap:wrap;gap:6px;margin-top:14px}.contestTags span{padding:6px 9px;border-radius:999px;background:#f0edf8;color:#645a7b;font-size:10px;font-weight:900}.contestSummary{margin:15px 0 0;color:#5e596f;font-size:13px;line-height:1.68}.contestFacts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:16px}.contestFacts div{padding:12px;border-radius:14px;background:#f7f5fb}.contestFacts span{display:block;color:#8a839b;font-size:9px;font-weight:900;letter-spacing:.1em}.contestFacts strong{display:block;margin-top:5px;color:#2e2940;font-size:12px;line-height:1.45}.contestRecommend{margin-top:16px;padding:14px;border-radius:15px;background:linear-gradient(135deg,#f3efff,#eefaff)}.contestRecommend span{color:#7e759a;font-size:9px;font-weight:900;letter-spacing:.12em}.contestRecommend p{margin:6px 0 0;color:#4b465d;font-size:12px;line-height:1.6}.contestActions{display:flex;gap:9px;margin-top:auto;padding-top:18px}.contestActions a{flex:1;padding:11px 12px;border-radius:12px;text-align:center;text-decoration:none;font-size:12px;font-weight:900}.contestActions a:first-child{background:#211d35;color:#fff}.contestActions a:last-child{border:1px solid rgba(75,63,117,.17);background:#fff;color:#544b6a}.contestRadarState{display:grid;place-items:center;min-height:220px;border:1px dashed rgba(95,80,145,.22);border-radius:22px;background:rgba(255,255,255,.6);text-align:center;color:#6f6882}.contestRadarState strong{display:block;color:#28233d;font-size:20px}.contestRadarState button{margin-top:14px;padding:10px 14px;border:0;border-radius:11px;background:#211d35;color:#fff;font-weight:900}.contestRadarFooter{margin-top:16px;color:#817a92;font-size:11px;line-height:1.6}@media(max-width:760px){.lunaContestRadarRoot{width:min(100% - 16px,1120px);margin-top:18px}.contestRadar{padding:20px 15px;border-radius:24px}.contestRadarHeader{display:block}.contestRadar h2{font-size:39px}.contestRadarRefresh{width:100%;margin-top:16px}.contestRadarFilters{overflow-x:auto;flex-wrap:nowrap;padding-bottom:4px}.contestRadarFilters button{flex:0 0 auto}.contestRadarGrid{grid-template-columns:1fr}.contestFacts{grid-template-columns:1fr 1fr}.contestCard{padding:18px}}
      `}</style>

      <header className="contestRadarHeader">
        <div>
          <div className="contestRadarEyebrow"><span className="contestRadarLive">LIVE OPPORTUNITY</span><span>공식 출처 확인 기반</span></div>
          <h2 id="contest-radar-title">공모전 레이더</h2>
          <p>AI로 만들기 좋고, 혼자 도전할 수 있는 공모전을 먼저 보여줘요. 상금과 마감일, AI 사용 가능 여부까지 한눈에 확인할 수 있어요.</p>
        </div>
        <button className="contestRadarRefresh" type="button" onClick={() => void load()} disabled={status === 'loading'}>{status === 'loading' ? '확인 중' : '새로고침'}</button>
      </header>

      <nav className="contestRadarFilters" aria-label="공모전 필터">
        {FILTERS.map((item) => <button key={item.key} type="button" className={filter === item.key ? 'active' : ''} onClick={() => setFilter(item.key)}>{item.label}</button>)}
      </nav>

      <div className="contestRadarMeta">
        <span>공개 공모전 <strong>{payload?.contests.filter((item) => item.status !== 'closed').length ?? '—'}개</strong></span>
        <span>마지막 확인 <strong>{payload ? dateText(payload.generated_at) : '연결 중'}</strong></span>
      </div>

      {status === 'loading' && <div className="contestRadarState"><div><strong>새로운 기회를 찾고 있어요</strong><p>공식 모집 페이지와 현재 접수 상태를 확인합니다.</p></div></div>}
      {status === 'error' && <div className="contestRadarState"><div><strong>공모전 데이터를 불러오지 못했어요</strong><p>{error}</p><button type="button" onClick={() => void load()}>다시 시도</button></div></div>}
      {status === 'ready' && contests.length === 0 && <div className="contestRadarState"><div><strong>이 조건에 맞는 공모전이 아직 없어요</strong><p>필터를 바꾸거나 다음 업데이트를 기다려 주세요.</p></div></div>}

      {status === 'ready' && contests.length > 0 && <div className="contestRadarGrid">
        {contests.map((contest) => (
          <article className="contestCard" key={`${contest.organizer}-${contest.title}`}>
            <div className="contestCardTop"><span className="contestScore">추천 {contest.recommendation_score}점</span><span className="contestDday">D-{Math.max(0, contest.d_day)}</span></div>
            <h3>{contest.title}</h3>
            <p className="contestOrganizer">{contest.organizer}</p>
            <div className="contestTags">{contest.category.map((tag) => <span key={tag}>{tag}</span>)}{contest.solo_friendly && <span>혼자 가능</span>}{contest.beginner_friendly && <span>초보 가능</span>}</div>
            <p className="contestSummary">{contest.summary}</p>
            <div className="contestFacts">
              <div><span>총상금</span><strong>{money(contest.total_prize)}</strong></div>
              <div><span>마감</span><strong>{dateText(contest.deadline)}</strong></div>
              <div><span>AI 사용</span><strong>{contest.ai_usage_status === 'prohibited' ? '사용 불가' : '사용 가능'}</strong></div>
              <div><span>예상 제작</span><strong>{contest.estimated_days || '공식 페이지 확인'}</strong></div>
            </div>
            <div className="contestRecommend"><span>WHY PICK</span><p>{contest.why_recommended}</p></div>
            <div className="contestActions"><a href={contest.official_url} target="_blank" rel="noreferrer">공식 페이지 ↗</a><a href={contest.source_url} target="_blank" rel="noreferrer">모집 정보 ↗</a></div>
          </article>
        ))}
      </div>}

      <footer className="contestRadarFooter">접수 전에는 주최기관 공식 페이지에서 마감 시각과 제출 조건을 다시 확인해 주세요.</footer>
    </section>
  );
}

const ROOT_ID = 'luna-contest-radar-root';

function mountContestRadar() {
  if (document.getElementById(ROOT_ID)) return true;
  const page = document.querySelector<HTMLElement>('main.page');
  if (!page) return false;

  const host = document.createElement('div');
  host.id = ROOT_ID;
  host.className = 'lunaContestRadarRoot';

  const trendRoot = document.getElementById('luna-trend-radar-root');
  if (trendRoot?.parentElement) trendRoot.insertAdjacentElement('afterend', host);
  else {
    const buildNotes = page.querySelector<HTMLElement>('.bottomGrid.buildNotesBottom');
    if (buildNotes) page.insertBefore(host, buildNotes);
    else page.appendChild(host);
  }

  createRoot(host).render(<ContestRadar />);
  return true;
}

if (!mountContestRadar()) {
  const observer = new MutationObserver(() => {
    if (!mountContestRadar()) return;
    observer.disconnect();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
}
