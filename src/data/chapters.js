// 챕터 순서, 이름, 물류 센터 안의 장소 이름이다. 챕터는 이 순서대로 해금된다.
// stages에는 챕터별 스테이지 데이터가 들어간다. 아직 만들지 않은 챕터는 빈 목록이다.
// stageCount를 따로 두는 이유: 스테이지 데이터가 없어도 해금 규칙과 진행률 칸 수는
// PRD가 정한 챕터당 5개를 기준으로 계산해야 하기 때문이다.

export const chapters = [
  {
    id: 'packet',
    number: 1,
    name: '패킷 택배',
    place: '집하장',
    summary: '데이터에 헤더를 L4, L3, L2 순서로 붙여 목적지까지 보내요.',
    stageCount: 5,
    stages: [],
  },
  {
    id: 'subnet',
    number: 2,
    name: '서브넷 퍼즐',
    place: '주소 구획실',
    summary: '주소 블록을 부서 크기에 맞게 나눠요.',
    stageCount: 5,
    stages: [],
  },
  {
    id: 'firewall',
    number: 3,
    name: '방화벽 디펜스',
    place: '검문소',
    summary: '검문 기준표를 작성해서 공격은 막고 정상 트래픽은 통과시켜요.',
    stageCount: 5,
    stages: [],
  },
  {
    id: 'detective',
    number: 4,
    name: '장애 탐정',
    place: '사고 조사실',
    summary: '조사 도구로 단서를 모아 장애 원인과 계층을 찾아요.',
    stageCount: 5,
    stages: [],
  },
];

export function findChapter(chapterId) {
  return chapters.find((chapter) => chapter.id === chapterId);
}
