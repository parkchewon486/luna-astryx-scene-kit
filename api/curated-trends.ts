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

  const generatedAt = '2026-07-11T11:30:00.000Z';
  const items = [
    {
      rank: 1,
      community: '더쿠 HOT',
      source_title: '"내가 만원 더 낼게"에 대한 연예인들의 논쟁',
      url: 'https://theqoo.net/square/4275836181',
      published_at: '2026-07-11T04:38:00.000Z',
      views: 62553,
      comments: 721,
      recommendations: null,
      metrics_visible: true,
      category: 'CONTENT',
      topic: '더치페이와 인간관계 논쟁',
      summary: '누가 얼마를 더 낼지를 두고 의견이 크게 갈린 게시물입니다.',
      why_trending: '조회수 6만 회와 댓글 700개를 넘기며 의견이 빠르게 갈렸어요.',
      x_angle: '친구 사이 정산에서 사람들이 가장 예민하게 보는 기준',
      x_hook: '“내가 만원 더 낼게” 이 말, 배려일까 계산일까?',
      fact_check_status: 'verified',
      fact_check_note: '게시물 페이지에서 제목, 게시 시각, 조회수와 댓글 수를 확인했습니다.',
      risk_level: 'low',
      risk_factors: [],
      related_sources: [],
      trend_score: 98.4
    },
    {
      rank: 2,
      community: '더쿠 HOT',
      source_title: '움직이다가 멈추면 땀이 더 나는 이유',
      url: 'https://theqoo.net/square/4275963599',
      published_at: '2026-07-11T07:40:00.000Z',
      views: 44058,
      comments: 246,
      recommendations: null,
      metrics_visible: true,
      category: 'LIFESTYLE',
      topic: '여름철 땀과 체온 조절',
      summary: '걷거나 움직인 뒤 멈췄을 때 땀이 더 나는 이유를 설명한 게시물입니다.',
      why_trending: '무더운 날씨와 맞물려 조회수 4만 회 이상, 댓글 200개 이상을 기록했어요.',
      x_angle: '여름철 누구나 겪는 몸의 반응을 짧고 이해하기 쉽게 소개',
      x_hook: '분명 멈췄는데 왜 땀은 그때부터 더 날까?',
      fact_check_status: 'verified',
      fact_check_note: '게시물 페이지에서 제목, 게시 시각, 조회수와 댓글 수를 확인했습니다.',
      risk_level: 'low',
      risk_factors: ['건강 정보는 원문 근거 확인 권장'],
      related_sources: [],
      trend_score: 94.2
    },
    {
      rank: 3,
      community: '더쿠 HOT',
      source_title: '한마리 통닭을 세가지 맛으로 먹고싶다는 손님',
      url: 'https://theqoo.net/hot/4275910186',
      published_at: '2026-07-11T05:05:00.000Z',
      views: 17317,
      comments: 90,
      recommendations: null,
      metrics_visible: true,
      category: 'LIFESTYLE',
      topic: '배달 주문 요청 논쟁',
      summary: '한 마리 치킨에 세 가지 맛을 요청한 주문을 두고 반응이 이어진 글입니다.',
      why_trending: '일상적인 주문 상황에 공감과 반론이 동시에 붙으며 반응이 커졌어요.',
      x_angle: '사장과 손님 사이에서 어디까지가 가능한 요청인지 질문',
      x_hook: '치킨 한 마리에 세 가지 맛 요청, 가능 범위일까 무리한 부탁일까?',
      fact_check_status: 'partial',
      fact_check_note: 'HOT 목록에서 제목과 공개 반응 수치를 확인했습니다.',
      risk_level: 'low',
      risk_factors: [],
      related_sources: [],
      trend_score: 86.8
    },
    {
      rank: 4,
      community: '더쿠 HOT',
      source_title: '2026년 올해 상반기 최고히트곡',
      url: 'https://theqoo.net/hot/4275893328',
      published_at: '2026-07-11T06:30:00.000Z',
      views: 57116,
      comments: 609,
      recommendations: null,
      metrics_visible: true,
      category: 'CONTENT',
      topic: '2026 상반기 음악 화제',
      summary: '올해 상반기 최고 히트곡을 두고 의견이 몰린 게시물입니다.',
      why_trending: '조회수 5만 회와 댓글 600개를 넘기며 음악 취향 논쟁이 커졌어요.',
      x_angle: '사람들이 체감하는 히트곡과 실제 화제성 사이의 차이',
      x_hook: '2026 상반기 최고 히트곡, 다들 같은 곡을 떠올릴까?',
      fact_check_status: 'partial',
      fact_check_note: 'HOT 목록에서 제목과 공개 반응 수치를 확인했습니다.',
      risk_level: 'low',
      risk_factors: [],
      related_sources: [],
      trend_score: 96.1
    },
    {
      rank: 5,
      community: '더쿠 HOT',
      source_title: '한국인들의 인기 여행지, 상하이',
      url: 'https://theqoo.net/hot/4275813847',
      published_at: '2026-07-11T04:03:00.000Z',
      views: 29718,
      comments: 283,
      recommendations: null,
      metrics_visible: true,
      category: 'LIFESTYLE',
      topic: '상하이 여행 인기',
      summary: '한국 여행객 사이에서 상하이가 다시 주목받는 이유를 다룬 게시물입니다.',
      why_trending: '여행 수요와 체감 물가에 대한 경험담이 이어지며 반응이 커졌어요.',
      x_angle: '요즘 한국인이 상하이를 많이 찾는 이유를 댓글 반응과 함께 정리',
      x_hook: '요즘 상하이가 한국인 여행지로 다시 뜨는 이유',
      fact_check_status: 'partial',
      fact_check_note: 'HOT 목록에서 제목과 공개 반응 수치를 확인했습니다.',
      risk_level: 'low',
      risk_factors: ['여행 정보는 출발 전 최신 확인 필요'],
      related_sources: [],
      trend_score: 89.7
    },
    {
      rank: 6,
      community: '루리웹 베스트',
      source_title: 'AI 시대 밴을 푸는 법',
      url: 'https://bbs.ruliweb.com/best/board/300143/read/75901897?m=humor_only&t=now',
      published_at: '2026-07-11T00:46:00.000Z',
      views: 3218,
      comments: 7,
      recommendations: 49,
      metrics_visible: true,
      category: 'AI_TECH',
      topic: 'AI 시대 온라인 계정 제재',
      summary: 'AI 시대의 온라인 계정 차단과 해제 방식을 소재로 한 게시물입니다.',
      why_trending: '추천 수가 빠르게 쌓이며 실시간 베스트에 진입했어요.',
      x_angle: 'AI가 계정 제재와 고객 응대에 들어올 때 생기는 황당한 장면',
      x_hook: 'AI 시대에는 밴 해제도 AI에게 부탁해야 할까?',
      fact_check_status: 'partial',
      fact_check_note: '베스트 목록에서 제목과 공개 반응 수치를 확인했습니다.',
      risk_level: 'low',
      risk_factors: [],
      related_sources: [],
      trend_score: 82.5
    }
  ];

  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400');
  res.status(200).json({
    generated_at: generatedAt,
    range_start: '2026-07-10T11:30:00.000Z',
    range_end: generatedAt,
    checked_sources: 4,
    successful_sources: 2,
    items,
    cached: true,
    build: 'curated-20260711-2030',
    mode: 'curated-scheduled',
    failed_sources: []
  });
}
