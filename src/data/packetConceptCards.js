// 챕터 1 개념 카드. 학습자가 그대로 외우는 문장이라서 네트워크 사실과 맞는지 확인한 내용만 적는다.
export const packetConceptCards = [
  {
    id: 'packet-1',
    chapterId: 'packet',
    stageNumber: 1,
    title: '캡슐화',
    lines: [
      '데이터에 L4, L3, L2 순서로 헤더를 붙이는 것을 캡슐화라고 해요.',
      'L4 헤더는 포트 번호로 받을 프로그램을, L3 헤더는 IP 주소로 최종 목적지를, L2 헤더는 MAC 주소로 같은 구간의 다음 장비를 알려 줘요.',
      '나중에 붙인 헤더일수록 바깥에 있어요.',
    ],
  },
];
