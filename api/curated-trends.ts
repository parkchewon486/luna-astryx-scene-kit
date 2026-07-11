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

  const generatedAt = '2026-07-11T15:00:00.000Z';
  const items = [
    {
      rank: 1, community: '더쿠 HOT', source_title: '움직이다가 멈추면 땀이 더 나는 이유',
      url: 'https://theqoo.net/square/4275963599', published_at: '2026-07-11T07:40:00.000Z',
      views: 26050, comments: 194, recommendations: null, metrics_visible: true,
      category: 'LIFESTYLE', topic: '여름철 땀과 체온 조절',
      summary: '걷거나 움직인 뒤 멈췄을 때 땀이 더 쏟아지는 현상을 다룬 게시물입니다.',
      why_trending: '무더위와 겹치며 조회수 2만6천 회, 댓글 194개를 기록했어요.',
      x_angle: '여름마다 겪지만 이유는 잘 몰랐던 몸의 반응을 짧게 풀기',
      x_hook: '분명 멈췄는데 왜 땀은 그때부터 더 날까?', fact_check_status: 'verified',
      fact_check_note: '게시물 본문에서 게시 시각과 조회수, 댓글 수를 직접 확인했습니다.',
      risk_level: 'low', risk_factors: ['건강 정보는 원문 근거 확인 권장'], related_sources: [], trend_score: 97.4
    },
    {
      rank: 2, community: '디시인사이드 실시간 베스트', source_title: '“시뮬레이션 우주론” 같은 말도 안 되는 우주론이 나온 이유',
      url: 'https://gall.dcinside.com/board/view/?_dcbest=1&id=dcbest&no=444679&page=1', published_at: '2026-07-11T06:20:00.000Z',
      views: 22651, comments: 497, recommendations: 147, metrics_visible: true,
      category: 'AI_TECH', topic: '시뮬레이션 우주론',
      summary: '우주가 거대한 시뮬레이션일 수 있다는 가설이 왜 등장했는지 소개한 게시물입니다.',
      why_trending: '조회수 2만2천 회와 댓글 497개가 붙으며 과학과 철학 논쟁이 커졌어요.',
      x_angle: 'AI 시대에 다시 떠오르는 시뮬레이션 우주 가설',
      x_hook: '우리가 사는 세계가 시뮬레이션일 가능성, 왜 자꾸 다시 나올까?', fact_check_status: 'verified',
      fact_check_note: '실시간 베스트 목록에서 게시 시각과 조회수, 댓글 수, 추천 수를 확인했습니다.',
      risk_level: 'low', risk_factors: ['가설과 과학적 사실을 구분해 소개해야 함'], related_sources: [], trend_score: 95.8
    },
    {
      rank: 3, community: '네이트판', source_title: '밑빠진 독에 물붓기. 이혼하려 합니다.',
      url: 'https://pann.nate.com/talk/375510531', published_at: '2026-07-11T11:45:00.000Z',
      views: 22347, comments: 55, recommendations: 107, metrics_visible: true,
      category: 'SOCIETY', topic: '부부 재정과 이혼 고민',
      summary: '각자 돈을 관리해 온 전문직 부부가 반복되는 지출 갈등으로 이혼을 고민하는 사연입니다.',
      why_trending: '조회수 2만2천 회와 추천 107개가 붙으며 부부 재정 분담을 두고 의견이 갈렸어요.',
      x_angle: '부부가 돈을 따로 관리할 때 갈등이 생기는 순간 묻기',
      x_hook: '각자 벌고 각자 쓰면 정말 덜 싸울까?', fact_check_status: 'verified',
      fact_check_note: '네이트판 실시간 랭킹에서 조회수, 댓글 수, 추천 수를 확인했습니다.',
      risk_level: 'low', risk_factors: ['개인 사연은 사실관계 추가 확인 필요'], related_sources: [], trend_score: 93.9
    },
    {
      rank: 4, community: '더쿠 HOT', source_title: "구글이 '극단적 고온 경보' 발표한 지역",
      url: 'https://theqoo.net/square/4276201962', published_at: '2026-07-11T11:30:00.000Z',
      views: 18231, comments: 181, recommendations: null, metrics_visible: true,
      category: 'LIFESTYLE', topic: '폭염 체감과 고온 경보',
      summary: '프랑스의 고온 경보 기준과 대구의 체감 날씨를 비교한 게시물입니다.',
      why_trending: '조회수 1만8천 회와 댓글 181개가 붙으며 한국 폭염 기준을 두고 반응이 몰렸어요.',
      x_angle: '같은 36도라도 나라별 경보 체감이 다른 이유 묻기',
      x_hook: '프랑스는 36도에 극단적 경보, 대구는 왜 조용할까?', fact_check_status: 'verified',
      fact_check_note: '게시물 본문에서 게시 시각과 조회수, 댓글 수를 직접 확인했습니다.',
      risk_level: 'medium', risk_factors: ['국가별 경보 기준은 공식 자료로 다시 확인 권장'], related_sources: [], trend_score: 91.6
    },
    {
      rank: 5, community: '디시인사이드 실시간 베스트', source_title: '세계 최초 첫 상업용 탄소 정제소 탄생',
      url: 'https://gall.dcinside.com/board/view/?_dcbest=1&id=dcbest&no=444735&page=1', published_at: '2026-07-11T11:00:00.000Z',
      views: 13744, comments: 115, recommendations: 90, metrics_visible: true,
      category: 'AI_TECH', topic: '탄소 포집과 상업용 정제 기술',
      summary: '대기 중 탄소를 포집하고 정제하는 상업 시설 소식을 다룬 게시물입니다.',
      why_trending: '조회수 1만3천 회와 댓글 115개가 붙으며 기술 실효성과 비용 논쟁이 이어졌어요.',
      x_angle: '탄소 포집 기술이 실험실을 벗어나 사업이 되는 순간',
      x_hook: '공기에서 탄소를 뽑아 파는 시대가 진짜 시작된 걸까?', fact_check_status: 'verified',
      fact_check_note: '실시간 베스트 목록에서 게시 시각과 조회수, 댓글 수, 추천 수를 확인했습니다.',
      risk_level: 'medium', risk_factors: ['시설 명칭과 상업 운영 범위는 원문 출처 확인 권장'], related_sources: [], trend_score: 89.7
    },
    {
      rank: 6, community: '네이트판', source_title: '예비 시댁에서 무리한 요구가 와서 파혼 얘기가 나왔어요',
      url: 'https://pann.nate.com/talk/375510643', published_at: '2026-07-11T11:50:00.000Z',
      views: 19212, comments: 73, recommendations: 1, metrics_visible: true,
      category: 'SOCIETY', topic: '결혼 준비와 시댁 갈등',
      summary: '결혼 준비 중 예비 시댁의 요구로 파혼 이야기까지 나온 사연입니다.',
      why_trending: '조회수 1만9천 회와 댓글 73개가 붙으며 결혼 비용과 가족 경계선을 두고 반응이 갈렸어요.',
      x_angle: '결혼 준비에서 양가 요구를 어디까지 받아들일지 묻기',
      x_hook: '결혼 전부터 무리한 요구가 시작되면 어디서 멈춰야 할까?', fact_check_status: 'verified',
      fact_check_note: '네이트판 실시간 랭킹에서 조회수, 댓글 수, 추천 수를 확인했습니다.',
      risk_level: 'low', risk_factors: ['개인 사연은 사실관계 추가 확인 필요'], related_sources: [], trend_score: 87.5
    }
  ];

  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400');
  res.status(200).json({
    generated_at: generatedAt,
    range_start: '2026-07-10T15:00:00.000Z',
    range_end: generatedAt,
    checked_sources: 11,
    successful_sources: 3,
    items,
    cached: true,
    build: 'curated-20260712-0000-six-items',
    mode: 'curated-scheduled-preview',
    failed_sources: [
      'Threads: 공개 URL과 반응 수치를 직접 확인하지 못해 제외',
      '에펨코리아·뽐뿌·클리앙·인스티즈·MLB파크·웃긴대학: 접근 제한 또는 반응 수치 확인 실패',
      '루리웹: 이번 확인 시점에 게시 시각과 반응 수치를 함께 검증한 후보가 부족해 제외'
    ]
  });
}
