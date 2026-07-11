type RequestLike = { method?: string };
type ResponseLike = {
  status(code: number): ResponseLike;
  setHeader(name: string, value: string): void;
  json(body: unknown): void;
};

export default function handler(req: RequestLike, res: ResponseLike) {
  if (req.method && req.method !== 'GET') {
    res.status(405).json({ error: 'GET 요청만 지원합니다.' });
    return;
  }

  const generatedAt = '2026-07-11T12:08:00.000Z';
  const items = [
    {
      rank: 1, community: '네이트판', source_title: '밑빠진 독에 물붓기. 이혼하려 합니다.',
      url: 'https://pann.nate.com/talk/375510531', published_at: '2026-07-11T11:45:00.000Z',
      views: 25141, comments: 62, recommendations: 113, metrics_visible: true,
      category: 'SOCIETY', topic: '부부 재정과 이혼 고민',
      summary: '전문직 부부의 각자 지출과 반복되는 갈등을 다룬 게시물입니다.',
      why_trending: '조회수 2만5천 회와 추천 100개 이상이 붙으며 비용 분담을 두고 의견이 갈렸어요.',
      x_angle: '부부가 돈을 따로 관리할 때 어디서 갈등이 시작되는지 질문',
      x_hook: '각자 벌고 각자 쓰면 정말 덜 싸울까?', fact_check_status: 'verified',
      fact_check_note: '네이트판 실시간 랭킹에서 공개 반응 수치를 확인했습니다.',
      risk_level: 'low', risk_factors: ['개인 사연은 사실관계 추가 확인 필요'], related_sources: [], trend_score: 97.2
    },
    {
      rank: 2, community: '더쿠 HOT', source_title: '"내가 만원 더 낼게"에 대한 연예인들의 논쟁',
      url: 'https://theqoo.net/square/4275836181', published_at: '2026-07-11T04:38:00.000Z',
      views: 62553, comments: 721, recommendations: null, metrics_visible: true,
      category: 'CONTENT', topic: '더치페이와 인간관계 논쟁',
      summary: '누가 얼마를 더 낼지를 두고 의견이 크게 갈린 게시물입니다.',
      why_trending: '조회수 6만 회와 댓글 700개를 넘기며 의견이 빠르게 갈렸어요.',
      x_angle: '친구 사이 정산에서 사람들이 가장 예민하게 보는 기준',
      x_hook: '“내가 만원 더 낼게” 이 말, 배려일까 계산일까?', fact_check_status: 'verified',
      fact_check_note: '게시물 페이지에서 공개 반응 수치를 확인했습니다.',
      risk_level: 'low', risk_factors: [], related_sources: [], trend_score: 96.8
    },
    {
      rank: 3, community: '루리웹 베스트', source_title: '원이 저격한 PD보다 어제 나온 강사가 더 문제인 게',
      url: 'https://bbs.ruliweb.com/best/board/300143/read/75901258?m=humor', published_at: '2026-07-11T07:48:00.000Z',
      views: 15833, comments: 43, recommendations: 145, metrics_visible: true,
      category: 'CONTENT', topic: '방송 출연자 발언 논쟁',
      summary: '방송 속 인물의 발언과 태도를 두고 반응이 커진 게시물입니다.',
      why_trending: '조회수 1만5천 회와 추천 145개가 붙으며 베스트 상단에 올랐어요.',
      x_angle: '사람들이 방송 장면보다 출연자 태도에 더 민감하게 반응한 이유',
      x_hook: '논란의 중심이 PD가 아니라 강사 쪽으로 옮겨간 이유', fact_check_status: 'partial',
      fact_check_note: '루리웹 베스트 목록에서 공개 반응 수치를 확인했습니다.',
      risk_level: 'medium', risk_factors: ['인물 관련 평가는 원문 확인 필요'], related_sources: [], trend_score: 92.6
    },
    {
      rank: 4, community: '네이트판', source_title: '이런 배달진상은 좀 무섭다',
      url: 'https://pann.nate.com/talk/375510745', published_at: '2026-07-11T11:40:00.000Z',
      views: 21495, comments: 23, recommendations: 53, metrics_visible: true,
      category: 'LIFESTYLE', topic: '배달 주문 갈등',
      summary: '배달 음식 문제를 둘러싼 과격한 대응을 두고 반응이 몰린 게시물입니다.',
      why_trending: '조회수 2만 회를 넘기며 소비자와 자영업자 사이 갈등에 관심이 모였어요.',
      x_angle: '배달 분쟁에서 사람들이 가장 두려워하는 지점',
      x_hook: '배달 문제 하나가 왜 이렇게까지 커졌을까?', fact_check_status: 'verified',
      fact_check_note: '네이트판 실시간 랭킹에서 공개 반응 수치를 확인했습니다.',
      risk_level: 'medium', risk_factors: ['갈등 상황은 원문 확인 필요'], related_sources: [], trend_score: 89.8
    },
    {
      rank: 5, community: '더쿠 HOT', source_title: '움직이다가 멈추면 땀이 더 나는 이유',
      url: 'https://theqoo.net/square/4275963599', published_at: '2026-07-11T07:40:00.000Z',
      views: 44058, comments: 246, recommendations: null, metrics_visible: true,
      category: 'LIFESTYLE', topic: '여름철 땀과 체온 조절',
      summary: '움직인 뒤 멈췄을 때 땀이 더 나는 이유를 설명한 게시물입니다.',
      why_trending: '무더운 날씨와 맞물려 조회수 4만 회 이상을 기록했어요.',
      x_angle: '여름철 누구나 겪는 몸의 반응을 짧게 소개',
      x_hook: '분명 멈췄는데 왜 땀은 그때부터 더 날까?', fact_check_status: 'verified',
      fact_check_note: '게시물 페이지에서 공개 반응 수치를 확인했습니다.',
      risk_level: 'low', risk_factors: ['건강 정보는 원문 근거 확인 권장'], related_sources: [], trend_score: 88.9
    },
    {
      rank: 6, community: '루리웹 베스트', source_title: '당신 앞에 자신이 예수의 환생이라 칭하는 자 2명이 동시에 나타났다.jpg',
      url: 'https://bbs.ruliweb.com/best/board/300143/read/75901379?m=humor', published_at: '2026-07-11T08:18:00.000Z',
      views: 12494, comments: 44, recommendations: 79, metrics_visible: true,
      category: 'CONTENT', topic: '상황형 유머 밈',
      summary: '동시에 등장한 두 인물을 소재로 한 상황형 유머 게시물입니다.',
      why_trending: '조회수 1만2천 회와 댓글 44개가 붙으며 베스트 상단에 올랐어요.',
      x_angle: '한 장면만으로 댓글이 몰리는 선택형 밈 소개',
      x_hook: '둘 다 본인이 진짜라고 한다면 누구 말을 믿을까?', fact_check_status: 'partial',
      fact_check_note: '루리웹 베스트 목록에서 공개 반응 수치를 확인했습니다.',
      risk_level: 'low', risk_factors: [], related_sources: [], trend_score: 85.4
    },
    {
      rank: 7, community: '더쿠 HOT', source_title: '2026년 올해 상반기 최고히트곡',
      url: 'https://theqoo.net/hot/4275893328', published_at: '2026-07-11T06:30:00.000Z',
      views: 57116, comments: 609, recommendations: null, metrics_visible: true,
      category: 'CONTENT', topic: '2026 상반기 음악 화제',
      summary: '올해 상반기 최고 히트곡을 두고 의견이 몰린 게시물입니다.',
      why_trending: '조회수 5만 회와 댓글 600개를 넘기며 음악 취향 논쟁이 커졌어요.',
      x_angle: '사람들이 체감하는 히트곡과 화제성 사이의 차이',
      x_hook: '2026 상반기 최고 히트곡, 다들 같은 곡을 떠올릴까?', fact_check_status: 'partial',
      fact_check_note: 'HOT 목록에서 제목과 공개 반응 수치를 확인했습니다.',
      risk_level: 'low', risk_factors: [], related_sources: [], trend_score: 84.8
    },
    {
      rank: 8, community: '더쿠 HOT', source_title: '한국인들의 인기 여행지, 상하이',
      url: 'https://theqoo.net/hot/4275813847', published_at: '2026-07-11T04:03:00.000Z',
      views: 29718, comments: 283, recommendations: null, metrics_visible: true,
      category: 'LIFESTYLE', topic: '상하이 여행 인기',
      summary: '한국 여행객 사이에서 상하이가 다시 주목받는 이유를 다룬 게시물입니다.',
      why_trending: '여행 수요와 체감 물가에 대한 경험담이 이어지며 반응이 커졌어요.',
      x_angle: '요즘 한국인이 상하이를 많이 찾는 이유',
      x_hook: '요즘 상하이가 한국인 여행지로 다시 뜨는 이유', fact_check_status: 'partial',
      fact_check_note: 'HOT 목록에서 제목과 공개 반응 수치를 확인했습니다.',
      risk_level: 'low', risk_factors: ['여행 정보는 출발 전 최신 확인 필요'], related_sources: [], trend_score: 82.6
    },
    {
      rank: 9, community: '루리웹 베스트', source_title: 'AI 시대 밴을 푸는 법',
      url: 'https://bbs.ruliweb.com/best/board/300143/read/75901897?m=humor_only&t=now', published_at: '2026-07-11T00:46:00.000Z',
      views: 3218, comments: 7, recommendations: 49, metrics_visible: true,
      category: 'AI_TECH', topic: 'AI 시대 온라인 계정 제재',
      summary: 'AI 시대의 온라인 계정 차단과 해제 방식을 소재로 한 게시물입니다.',
      why_trending: '추천 수가 빠르게 쌓이며 실시간 베스트에 진입했어요.',
      x_angle: 'AI가 계정 제재와 고객 응대에 들어올 때 생기는 장면',
      x_hook: 'AI 시대에는 밴 해제도 AI에게 부탁해야 할까?', fact_check_status: 'partial',
      fact_check_note: '베스트 목록에서 제목과 공개 반응 수치를 확인했습니다.',
      risk_level: 'low', risk_factors: [], related_sources: [], trend_score: 80.9
    },
    {
      rank: 10, community: '루리웹 베스트', source_title: '메타 저커버그, 칸느 프로젝트 발각',
      url: 'https://bbs.ruliweb.com/best/board/300143/read/75901873?m=humor_only&t=now', published_at: '2026-07-11T00:40:00.000Z',
      views: 5139, comments: 28, recommendations: 91, metrics_visible: true,
      category: 'AI_TECH', topic: '메타와 AI 프로젝트 화제',
      summary: '메타와 저커버그를 둘러싼 프로젝트 이야기가 화제가 된 게시물입니다.',
      why_trending: '추천 90개 이상과 댓글 반응이 붙으며 베스트에 올랐어요.',
      x_angle: '메타의 새 프로젝트가 온라인에서 주목받은 이유',
      x_hook: '저커버그의 새 프로젝트가 갑자기 화제가 된 이유', fact_check_status: 'partial',
      fact_check_note: '베스트 목록에서 제목과 공개 반응 수치를 확인했습니다.',
      risk_level: 'medium', risk_factors: ['원문 내용 추가 확인 필요'], related_sources: [], trend_score: 79.7
    }
  ];

  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400');
  res.status(200).json({
    generated_at: generatedAt,
    range_start: '2026-07-10T12:08:00.000Z',
    range_end: generatedAt,
    checked_sources: 6,
    successful_sources: 3,
    items,
    cached: true,
    build: 'curated-20260711-2108-ten-items',
    mode: 'curated-scheduled',
    failed_sources: ['Threads: 공개 URL과 반응 수치를 안정적으로 확인하지 못해 이번 목록에서 제외']
  });
}
