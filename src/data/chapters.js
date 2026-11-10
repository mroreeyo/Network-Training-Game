// 챕터 순서, 이름, 물류 센터 안의 장소 이름이다. 챕터는 이 순서대로 해금된다.
// 스테이지 내용은 챕터별 data 파일에 있고, 여기에는 스테이지 수만 둔다 (PRD: 챕터마다 5개).
import { packetStages } from './packetStages.js';

export const chapters = [
  {
    id: 'packet',
    number: 1,
    name: '패킷 택배',
    place: '집하장',
    topic: '캡슐화',
    summary: '데이터에 헤더를 L4, L3, L2 순서로 붙여 목적지까지 보내요.',
    stageCount: 5,
    stages: packetStages,
  },
  {
    id: 'subnet',
    number: 2,
    name: '서브넷 퍼즐',
    place: '주소 구획실',
    topic: 'IP 주소와 네트워크 범위',
    summary: '주소 블록을 부서 크기에 맞게 나눠요.',
    stageCount: 5,
    stages: [],
  },
  {
    id: 'firewall',
    number: 3,
    name: '방화벽 디펜스',
    place: '검문소',
    topic: '포트, 프로토콜, 룰 순서',
    summary: '검문 기준표를 작성해서 공격은 막고 정상 트래픽은 통과시켜요.',
    stageCount: 5,
    stages: [],
  },
  {
    id: 'detective',
    number: 4,
    name: '장애 탐정',
    place: '사고 조사실',
    topic: '계층별 장애 진단',
    summary: '조사 도구로 단서를 모아 장애 원인과 계층을 찾아요.',
    stageCount: 5,
    stages: [],
  },
];

export function findChapter(chapterId) {
  return chapters.find((chapter) => chapter.id === chapterId);
}
